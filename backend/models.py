# File: backend/models.py
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# 1. Bảng Người dùng
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(100))
    role = Column(String(20), default="user") # 'user' hoặc 'admin'
    
    # Quan hệ: Một người có thể có nhiều đơn đặt phòng
    bookings = relationship("Booking", back_populates="user")
    reviews = relationship("Review", back_populates="user")

# 2. Bảng Phòng (Homestay/Khách sạn)
class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True) # Tên phòng (VD: Ocean View Suite)
    description = Column(Text) # Mô tả chi tiết (Dùng cho AI học)
    price = Column(Float) # Giá mỗi đêm
    location = Column(String(100)) # Địa điểm (Vũng Tàu, Đà Lạt...)
    image_url = Column(String(255)) # Link ảnh
    amenities = Column(String(255)) # Tiện ích (Wifi, Pool, AC...)
    is_available = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="room")
    reviews = relationship("Review", back_populates="room")

# 3. Bảng Đặt phòng (Booking)
class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    
    check_in_date = Column(DateTime)
    check_out_date = Column(DateTime)
    total_price = Column(Float)
    status = Column(String(20), default="confirmed") # confirmed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")

# 4. Bảng Đánh giá (Review - Dữ liệu này rất quan trọng để train AI)
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    rating = Column(Integer) # 1 đến 5 sao
    comment = Column(Text)
    
    user = relationship("User", back_populates="reviews")
    room = relationship("Room", back_populates="reviews")
