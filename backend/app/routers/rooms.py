from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("/", response_model=List[schemas.RoomWithHotel])
def get_rooms(
    hotel_id: Optional[int] = Query(None, description="Lọc theo khách sạn"),
    location: Optional[str] = Query(None, description="Địa điểm (City/Country)"),
    room_type: Optional[str] = Query(None, description="Loại phòng"),
    min_price: Optional[float] = Query(None, ge=0, description="Giá tối thiểu"),
    max_price: Optional[float] = Query(None, ge=0, description="Giá tối đa"),
    max_guests: Optional[int] = Query(None, ge=1, description="Số khách tối đa"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách phòng với các bộ lọc
    """
    query = db.query(models.Room)
    
    # Filter by location (Hotel city/country)
    if location:
        query = query.join(models.Hotel).filter(
            or_(
                models.Hotel.city.ilike(f"%{location}%"),
                models.Hotel.country.ilike(f"%{location}%"),
                models.Hotel.name.ilike(f"%{location}%")
            )
        )

    # Filter by hotel
    if hotel_id:
        query = query.filter(models.Room.hotel_id == hotel_id)
    
    # Filter by room type
    if room_type:
        query = query.filter(models.Room.room_type.ilike(f"%{room_type}%"))
    
    # Filter by price range
    if min_price is not None:
        query = query.filter(models.Room.base_price >= min_price)
    if max_price is not None:
        query = query.filter(models.Room.base_price <= max_price)
    
    # Filter by max guests
    if max_guests:
        query = query.filter(models.Room.max_guests >= max_guests)
    
    rooms = query.options(joinedload(models.Room.hotel)).offset(skip).limit(limit).all()
    return rooms


@router.get("/{room_id}", response_model=schemas.RoomWithHotel)
def get_room(room_id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết một phòng
    """
    room = db.query(models.Room).options(joinedload(models.Room.hotel)).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room


@router.post("/", response_model=schemas.RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room: schemas.RoomCreate,
    db: Session = Depends(get_db)
):
    """
    Tạo phòng mới (Admin only - TODO: Add authentication)
    """
    # Check if hotel exists
    hotel = db.query(models.Hotel).filter(models.Hotel.id == room.hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    
    db_room = models.Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


@router.put("/{room_id}", response_model=schemas.RoomResponse)
def update_room(
    room_id: int,
    room: schemas.RoomUpdate,
    db: Session = Depends(get_db)
):
    """
    Cập nhật thông tin phòng (Admin only - TODO: Add authentication)
    """
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not db_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Update fields
    update_data = room.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_room, field, value)
    
    db.commit()
    db.refresh(db_room)
    return db_room


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    """
    Xóa phòng (Admin only - TODO: Add authentication)
    """
    db_room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not db_room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    db.delete(db_room)
    db.commit()
    return None
