from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
    JSON,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(500), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar = Column(String(500), nullable=True)
    role = Column(String(50), default="user")  # user or admin
    email_verified = Column(Boolean, default=False)
    preferences = Column(
        JSON, nullable=True
    )  # User preferences (language, currency, etc.)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    wishlists = relationship("Wishlist", back_populates="user")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    star_rating = Column(Integer, default=3)  # 1-5 stars
    images = Column(JSON, nullable=True)  # Array of image URLs
    amenities = Column(JSON, nullable=True)  # Hotel-level amenities
    policies = Column(JSON, nullable=True)  # Check-in time, cancellation policy, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="hotel")
    wishlists = relationship("Wishlist", back_populates="hotel")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    room_type = Column(String(100), nullable=False)  # Deluxe, Suite, Standard, etc.
    max_guests = Column(Integer, nullable=False, default=2)
    size = Column(Float, nullable=True)  # Room size in sqm
    bed_type = Column(String(50), nullable=True)  # King, Queen, Twin, etc.
    base_price = Column(Float, nullable=False)  # Price per night
    images = Column(JSON, nullable=True)  # Array of room image URLs
    amenities = Column(JSON, nullable=True)  # Room-specific amenities
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    hotel = relationship("Hotel", back_populates="rooms")
    bookings = relationship("Booking", back_populates="room")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    check_in_date = Column(DateTime, nullable=False, index=True)
    check_out_date = Column(DateTime, nullable=False, index=True)
    guests = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    status = Column(
        String(50), default="pending"
    )  # pending, confirmed, cancelled, completed
    payment_status = Column(String(50), default="pending")  # pending, paid, refunded
    payment_method = Column(
        String(50), nullable=True
    )  # credit_card, paypal, vnpay, etc.
    special_requests = Column(Text, nullable=True)
    cancellation_date = Column(DateTime, nullable=True)
    refund_amount = Column(Float, nullable=True, default=0.0)
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="VND")
    payment_method = Column(String(50), nullable=False)  # stripe, vnpay, paypal
    transaction_id = Column(String(255), unique=True, nullable=True)
    status = Column(
        String(50), default="pending"
    )  # pending, completed, failed, refunded
    payment_metadata = Column(
        JSON, nullable=True
    )  # Additional payment info (renamed from metadata)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    booking = relationship("Booking", back_populates="payment")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    overall_rating = Column(Float, nullable=False)  # Overall score (1-10)
    ratings = Column(
        JSON, nullable=True
    )  # Breakdown: cleanliness, location, service, etc.
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reviews")
    hotel = relationship("Hotel", back_populates="reviews")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="wishlists")
    hotel = relationship("Hotel", back_populates="wishlists")


class AILog(Base):
    __tablename__ = "ai_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be anonymous
    booking_id = Column(
        Integer, ForeignKey("bookings.id"), nullable=True
    )  # If booking resulted
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    action_type = Column(String(50), nullable=False)  # suggest, support, predict
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")
    booking = relationship("Booking")
