"""
Admin API Router
All routes require admin role via require_admin dependency.
Prefix: /api/admin
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app import models
from app.dependencies import require_admin
from app.schemas import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─────────────────────────────────────────────
# Schemas nội bộ cho admin
# ─────────────────────────────────────────────

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_users: int
    total_bookings: int
    total_hotels: int
    total_revenue: float
    pending_bookings: int
    confirmed_bookings: int


class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminBookingResponse(BaseModel):
    id: int
    user_id: int
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    hotel_id: int
    hotel_name: Optional[str] = None
    room_id: int
    room_name: Optional[str] = None
    check_in_date: datetime
    check_out_date: datetime
    guests: int
    total_price: float
    status: str
    payment_status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────────


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """
    Trả về thống kê tổng quan cho trang Admin Dashboard
    """
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_bookings = db.query(func.count(models.Booking.id)).scalar() or 0
    total_hotels = db.query(func.count(models.Hotel.id)).scalar() or 0

    total_revenue = (
        db.query(func.sum(models.Booking.total_price))
        .filter(models.Booking.status != "cancelled")
        .scalar()
        or 0.0
    )

    pending_bookings = (
        db.query(func.count(models.Booking.id))
        .filter(models.Booking.status == "pending")
        .scalar()
        or 0
    )
    confirmed_bookings = (
        db.query(func.count(models.Booking.id))
        .filter(models.Booking.status == "confirmed")
        .scalar()
        or 0
    )

    return DashboardStats(
        total_users=total_users,
        total_bookings=total_bookings,
        total_hotels=total_hotels,
        total_revenue=float(total_revenue),
        pending_bookings=pending_bookings,
        confirmed_bookings=confirmed_bookings,
    )


# ─────────────────────────────────────────────
# Quản lý User
# ─────────────────────────────────────────────


@router.get("/users", response_model=List[AdminUserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """
    Lấy danh sách tất cả users (có phân trang)
    """
    users = (
        db.query(models.User)
        .order_by(models.User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return users


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Xóa user theo ID. Không thể tự xóa chính mình.
    """
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account",
        )

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )

    db.delete(user)
    db.commit()


# ─────────────────────────────────────────────
# Quản lý Booking
# ─────────────────────────────────────────────


@router.get("/bookings", response_model=List[AdminBookingResponse])
def list_bookings(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """
    Lấy danh sách tất cả bookings (kèm thông tin user, hotel, room)
    """
    bookings = (
        db.query(models.Booking)
        .order_by(models.Booking.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for b in bookings:
        user = db.query(models.User).filter(models.User.id == b.user_id).first()
        hotel = db.query(models.Hotel).filter(models.Hotel.id == b.hotel_id).first()
        room = db.query(models.Room).filter(models.Room.id == b.room_id).first()

        result.append(
            AdminBookingResponse(
                id=b.id,
                user_id=b.user_id,
                user_email=user.email if user else None,
                user_name=user.full_name if user else None,
                hotel_id=b.hotel_id,
                hotel_name=hotel.name if hotel else None,
                room_id=b.room_id,
                room_name=room.name if room else None,
                check_in_date=b.check_in_date,
                check_out_date=b.check_out_date,
                guests=b.guests,
                total_price=b.total_price,
                status=b.status,
                payment_status=b.payment_status,
                created_at=b.created_at,
            )
        )

    return result


@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """
    Xóa booking theo ID
    """
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking {booking_id} not found",
        )

    db.delete(booking)
    db.commit()


# ─────────────────────────────────────────────
# Cập nhật role user
# ─────────────────────────────────────────────


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """
    Thay đổi role của user (admin/user)
    """
    if role not in ("admin", "user"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'admin' or 'user'",
        )

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found",
        )

    user.role = role
    db.commit()
    db.refresh(user)

    return {
        "message": f"User {user.email} role updated to '{role}'",
        "user_id": user.id,
        "role": user.role,
    }
