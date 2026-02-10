from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.cache import availability_cache
import pytz

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def check_room_availability(
    db: Session,
    room_id: int,
    check_in_date: datetime,
    check_out_date: datetime,
    exclude_booking_id: int = None
) -> bool:
    """
    Kiểm tra xem phòng có trống trong khoảng thời gian không
    Logic: Trùng nếu (start < req_end) AND (end > req_start)
    """
    query = db.query(models.Booking).filter(
        models.Booking.room_id == room_id,
        models.Booking.status.in_(["confirmed", "pending"]), # Consider pending as blocked to prevent overbooking during payment
        models.Booking.check_in_date < check_out_date,
        models.Booking.check_out_date > check_in_date
    )
    
    # Exclude current booking if updating (rescheduling)
    if exclude_booking_id:
        query = query.filter(models.Booking.id != exclude_booking_id)
    
    conflicting_booking = query.first()
    
    # Return True if available (no conflict), False if not available
    return conflicting_booking is None

@router.get("/availability")
def check_availability(
    room_id: int,
    check_in_date: datetime,
    check_out_date: datetime,
    db: Session = Depends(get_db)
):
    """
    API kiểm tra tình trạng phòng (Public) + dynamic pricing
    
    Returns:
    - available: bool (phòng có trống không)
    - base_price: int (giá gốc/đêm)
    - total_price: int (tổng cho cả khoảng thời gian)
    - nights: int (số đêm)
    - price_breakdown: list (giá từng đêm, hỗ trợ dynamic pricing sau)
    """
    # Generate cache key
    cache_key = availability_cache.get_key(
        room_id=room_id,
        check_in=str(check_in_date),
        check_out=str(check_out_date)
    )
    
    # Try cache
    cached = availability_cache.get(cache_key)
    if cached is not None:
        return cached
    
    # Get room info
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check availability
    is_available = check_room_availability(db, room_id, check_in_date, check_out_date)
    
    # Calculate pricing
    nights = (check_out_date - check_in_date).days
    if nights <= 0:
        nights = 1
    
    base_price = room.base_price
    total_price = base_price * nights
    
    # Apply discount for longer stays
    discount_multiplier = 1.0
    if nights >= 7:
        discount_multiplier = 0.9  # 10% discount for week+
    elif nights >= 3:
        discount_multiplier = 0.95  # 5% discount for 3+ nights
    
    final_total = int(total_price * discount_multiplier)
    
    result = {
        "room_id": room_id,
        "available": is_available,
        "base_price": base_price,
        "nights": nights,
        "total_price_before_discount": total_price,
        "discount_rate": 1 - discount_multiplier,
        "total_price": final_total,
        "price_per_night_after_discount": int(final_total / nights) if nights > 0 else base_price,
        "check_in_date": check_in_date.isoformat(),
        "check_out_date": check_out_date.isoformat()
    }
    
    # Cache result (5 minutes)
    availability_cache.set(cache_key, result, ttl=300)
    
    return result


@router.post("/", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Tạo booking mới với logic Transaction & Lock (Requires Authentication)
    """
    # 1. Validate basic inputs
    if booking.check_in_date >= booking.check_out_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )
    
    # Make datetime.now() timezone-aware to compare with booking dates
    now = datetime.now(pytz.UTC) if booking.check_in_date.tzinfo else datetime.now()
    if booking.check_in_date < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past"
        )
    
    hotel = db.query(models.Hotel).filter(models.Hotel.id == booking.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    
    # 2. Transaction with Lock
    # Chúng ta lock Room row để đảm bảo tính tuần tự khi check availability
    try:
        # Select Room FOR UPDATE to lock this resource
        room = db.query(models.Room).filter(
            models.Room.id == booking.room_id,
            models.Room.hotel_id == booking.hotel_id
        ).with_for_update().first()
        
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room not found or does not belong to this hotel"
            )
        
        if booking.guests > room.max_guests:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Room can accommodate maximum {room.max_guests} guests"
            )
        
        # 3. Check availability inside the lock
        is_available = check_room_availability(
            db=db,
            room_id=booking.room_id,
            check_in_date=booking.check_in_date,
            check_out_date=booking.check_out_date
        )
        
        if not is_available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, # 409 Conflict is better for double booking
                detail="Room already booked for the selected dates"
            )
        
        # 4. Create booking
        nights = (booking.check_out_date - booking.check_in_date).days
        total_price = room.base_price * nights
        
        db_booking = models.Booking(
            user_id=current_user.id,
            hotel_id=booking.hotel_id,
            room_id=booking.room_id,
            check_in_date=booking.check_in_date,
            check_out_date=booking.check_out_date,
            guests=booking.guests,
            total_price=total_price,
            special_requests=booking.special_requests,
            status="confirmed", # Or pending, depending on payment flow. Direct booking = confirmed for now.
            payment_status="pending"
        )
        
        db.add(db_booking)
        db.commit() # Release lock here
        db.refresh(db_booking)
        
        return db_booking

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/availability/bulk")
def check_bulk_availability(
    data: dict,
    db: Session = Depends(get_db)
):
    """
    Kiểm tra availability cho multiple rooms một lúc
    
    Request body:
    {
        "check_in_date": "2026-02-01",
        "check_out_date": "2026-02-05",
        "room_ids": [1, 2, 3, ...]
    }
    
    Returns array of availability + pricing for each room
    """
    check_in = datetime.fromisoformat(data.get('check_in_date'))
    check_out = datetime.fromisoformat(data.get('check_out_date'))
    room_ids = data.get('room_ids', [])
    
    if not room_ids:
        return []
    
    results = []
    
    for room_id in room_ids:
        # Try cache first
        cache_key = availability_cache.get_key(
            room_id=room_id,
            check_in=str(check_in),
            check_out=str(check_out)
        )
        
        cached = availability_cache.get(cache_key)
        if cached:
            results.append(cached)
            continue
        
        # Get room
        room = db.query(models.Room).filter(models.Room.id == room_id).first()
        if not room:
            continue
        
        # Check availability
        is_available = check_room_availability(db, room_id, check_in, check_out)
        
        # Calculate pricing
        nights = (check_out - check_in).days
        if nights <= 0:
            nights = 1
        
        base_price = room.base_price
        total_price = base_price * nights
        
        # Apply discount
        discount_multiplier = 1.0
        if nights >= 7:
            discount_multiplier = 0.9
        elif nights >= 3:
            discount_multiplier = 0.95
        
        final_total = int(total_price * discount_multiplier)
        
        result = {
            "room_id": room_id,
            "room_name": room.name,
            "available": is_available,
            "base_price": base_price,
            "nights": nights,
            "total_price": final_total,
            "discount_rate": 1 - discount_multiplier
        }
        
        # Cache it
        availability_cache.set(cache_key, result, ttl=300)
        results.append(result)
    
    return results


@router.get("/", response_model=List[schemas.BookingResponse])
def get_bookings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách booking của user (Requires Authentication)
    """
    bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).all()
    return bookings


@router.get("/{booking_id}", response_model=schemas.BookingResponse)
def get_booking(
    booking_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lấy chi tiết một booking (Requires Authentication)
    """
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return booking


@router.patch("/{booking_id}/cancel", response_model=schemas.BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Hủy booking (Requires Authentication)
    """
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking already cancelled"
        )
    
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    
    return booking


@router.post("/payment", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: schemas.PaymentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Tạo payment record cho booking (Requires Authentication)
    """
    # Verify booking exists and belongs to user
    booking = db.query(models.Booking).filter(
        models.Booking.id == payment.booking_id,
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if payment already exists
    existing_payment = db.query(models.Payment).filter(
        models.Payment.booking_id == payment.booking_id
    ).first()
    
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already exists for this booking"
        )
    
    # Create payment record
    import secrets
    transaction_id = f"TXN{secrets.token_hex(8).upper()}"
    
    db_payment = models.Payment(
        booking_id=payment.booking_id,
        amount=payment.amount,
        currency=payment.currency,
        payment_method=payment.payment_method,
        transaction_id=transaction_id,
        status="completed",  # In real app, this would be "pending" until payment gateway confirms
        payment_metadata=payment.payment_metadata
    )
    
    # Update booking payment status
    booking.payment_status = "paid"
    booking.payment_method = payment.payment_method
    booking.status = "confirmed"
    
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    return db_payment
