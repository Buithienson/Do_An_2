from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from datetime import datetime
from urllib.parse import unquote
from app.database import get_db
from app import models, schemas
from app.cache import search_cache, availability_cache
import unicodedata

router = APIRouter(prefix="/hotels", tags=["Hotels"])


def normalize_text(text: str) -> str:
    """Normalize text for flexible matching - removes diacritics"""
    if not text:
        return text
    # Normalize unicode to decomposed form then remove diacritics
    nfd = unicodedata.normalize('NFD', text)
    return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn')


@router.get("/cities", response_model=List[str])
def get_cities(db: Session = Depends(get_db)):
    """
    Lấy danh sách tất cả các thành phố có khách sạn
    """
    try:
        cities = db.query(models.Hotel.city)\
            .filter(models.Hotel.city.isnot(None))\
            .distinct()\
            .order_by(models.Hotel.city)\
            .all()
        
        # Extract city names from tuples and return as list
        city_list = [city[0] for city in cities if city[0]]
        return city_list
    
    except Exception as e:
        print(f"Error in get_cities: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching cities: {str(e)}"
        )


@router.get("/", response_model=List[schemas.HotelResponse])
def get_hotels(
    city: Optional[str] = Query(None, description="Lọc theo thành phố"),
    country: Optional[str] = Query(None, description="Lọc theo quốc gia"),
    star_rating: Optional[int] = Query(None, ge=1, le=5, description="Lọc theo số sao"),
    min_price: Optional[float] = Query(None, ge=0, description="Giá tối thiểu"),
    max_price: Optional[float] = Query(None, ge=0, description="Giá tối đa"),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên hoặc địa điểm"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách khách sạn với filter và search
    """
    try:
        query = db.query(models.Hotel)
        
        # Search by name or address
        if search:
            # Decode URL encoding if present
            search_decoded = unquote(search)
            search_filter = f"%{search_decoded}%"
            search_normalized = normalize_text(search_decoded)
            
            query = query.filter(
                or_(
                    models.Hotel.name.ilike(search_filter),
                    models.Hotel.address.ilike(search_filter),
                    models.Hotel.city.ilike(search_filter),
                    # Also try normalized search
                    models.Hotel.city.ilike(f"%{search_normalized}%")
                )
            )
        
        # Filter by city
        if city:
            # Decode URL encoding if present
            city_decoded = unquote(city)
            city_normalized = normalize_text(city_decoded)
            
            query = query.filter(
                or_(
                    models.Hotel.city.ilike(f"%{city_decoded}%"),
                    models.Hotel.city.ilike(f"%{city_normalized}%")
                )
            )
        
        # Filter by country
        if country:
            country_decoded = unquote(country)
            query = query.filter(models.Hotel.country.ilike(f"%{country_decoded}%"))
        
        # Filter by star rating
        if star_rating:
            query = query.filter(models.Hotel.star_rating == star_rating)
        
        # Filter by price (based on minimum room price)
        if min_price is not None or max_price is not None:
            # Join with rooms to filter by price
            query = query.join(models.Room)
            if min_price is not None:
                query = query.filter(models.Room.base_price >= min_price)
            if max_price is not None:
                query = query.filter(models.Room.base_price <= max_price)
            query = query.distinct()
        
        hotels = query.offset(skip).limit(limit).all()
        return hotels
    
    except Exception as e:
        print(f"Error in get_hotels: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching hotels: {str(e)}"
        )


@router.get("/{hotel_id}", response_model=schemas.HotelResponse)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết một khách sạn
    """
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    return hotel


@router.get("/search/advanced", response_model=List[schemas.HotelResponse])
def search_hotels_advanced(
    city: Optional[str] = Query(None, description="Thành phố"),
    check_in: Optional[str] = Query(None, description="Ngày nhận (YYYY-MM-DD)"),
    check_out: Optional[str] = Query(None, description="Ngày trả (YYYY-MM-DD)"),
    guests: Optional[int] = Query(None, ge=1, description="Số khách"),
    min_price: Optional[float] = Query(None, ge=0, description="Giá tối thiểu/đêm"),
    max_price: Optional[float] = Query(None, ge=0, description="Giá tối đa/đêm"),
    star_rating: Optional[int] = Query(None, ge=1, le=5, description="Số sao"),
    db: Session = Depends(get_db)
):
    """
    Search hotels nâng cao với caching
    - Filter theo city, dates, price, guests, rating
    - Trả về hotels + min price for period
    - Cache results 10 minutes
    """
    # Generate cache key
    cache_key = search_cache.get_key(
        city=city,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        star_rating=star_rating
    )
    
    # Try cache
    cached_result = search_cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    # Build query
    query = db.query(models.Hotel)
    
    if city:
        query = query.filter(models.Hotel.city.ilike(f"%{city}%"))
    
    if star_rating:
        query = query.filter(models.Hotel.star_rating >= star_rating)
    
    # Filter by price if specified
    if min_price is not None or max_price is not None:
        query = query.join(models.Room)
        if min_price is not None:
            query = query.filter(models.Room.base_price >= min_price)
        if max_price is not None:
            query = query.filter(models.Room.base_price <= max_price)
        query = query.distinct()
    
    # Filter by guest count if specified
    if guests:
        query = query.join(models.Room)
        query = query.filter(models.Room.max_guests >= guests)
        query = query.distinct()
    
    hotels = query.limit(100).all()
    
    # Cache result
    search_cache.set(cache_key, hotels)
    
    return hotels


@router.get("/{hotel_id}/rooms", response_model=List[schemas.RoomResponse])
def get_hotel_rooms(
    hotel_id: int,
    available_from: Optional[str] = Query(None, description="Check-in date (YYYY-MM-DD)"),
    available_to: Optional[str] = Query(None, description="Check-out date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách phòng của một khách sạn
    """
    # Check if hotel exists
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    
    rooms = db.query(models.Room).filter(models.Room.hotel_id == hotel_id).all()
    
    # TODO: Filter by availability if dates are provided
    
    return rooms


@router.get("/{hotel_id}/reviews", response_model=List[schemas.ReviewWithUser])
def get_hotel_reviews(
    hotel_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách đánh giá của khách sạn
    """
    # Check if hotel exists
    hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    
    reviews = db.query(models.Review)\
        .filter(models.Review.hotel_id == hotel_id)\
        .order_by(models.Review.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return reviews


@router.get("/{hotel_id}/average-rating")
def get_hotel_average_rating(hotel_id: int, db: Session = Depends(get_db)):
    """
    Lấy rating trung bình của khách sạn
    """
    result = db.query(
        func.avg(models.Review.overall_rating).label("average_rating"),
        func.count(models.Review.id).label("total_reviews")
    ).filter(models.Review.hotel_id == hotel_id).first()
    
    return {
        "hotel_id": hotel_id,
        "average_rating": round(result.average_rating, 1) if result.average_rating else None,
        "total_reviews": result.total_reviews
    }


@router.post("/", response_model=schemas.HotelResponse, status_code=status.HTTP_201_CREATED)
def create_hotel(
    hotel: schemas.HotelCreate,
    db: Session = Depends(get_db)
):
    """
    Tạo khách sạn mới (Admin only - TODO: Add authentication)
    """
    db_hotel = models.Hotel(**hotel.dict())
    db.add(db_hotel)
    db.commit()
    db.refresh(db_hotel)
    return db_hotel


@router.put("/{hotel_id}", response_model=schemas.HotelResponse)
def update_hotel(
    hotel_id: int,
    hotel: schemas.HotelUpdate,
    db: Session = Depends(get_db)
):
    """
    Cập nhật thông tin khách sạn (Admin only - TODO: Add authentication)
    """
    db_hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not db_hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    
    # Update fields
    update_data = hotel.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_hotel, field, value)
    
    db.commit()
    db.refresh(db_hotel)
    return db_hotel


@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel(hotel_id: int, db: Session = Depends(get_db)):
    """
    Xóa khách sạn (Admin only - TODO: Add authentication)
    """
    db_hotel = db.query(models.Hotel).filter(models.Hotel.id == hotel_id).first()
    if not db_hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    
    db.delete(db_hotel)
    db.commit()
    return None
