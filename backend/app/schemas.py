from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============= Auth Schemas =============

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str  # User ID
    exp: datetime  # Expiration time
    type: str  # access or refresh

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]  # User info as dict to avoid forward reference

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)


# ============= User Schemas =============

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserResponse(UserBase):
    id: int
    role: str
    avatar: Optional[str] = None
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Hotel Schemas =============

class HotelBase(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    city: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    star_rating: int = Field(default=3, ge=1, le=5)

class HotelCreate(HotelBase):
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    policies: Optional[Dict[str, Any]] = None

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    star_rating: Optional[int] = Field(None, ge=1, le=5)
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    policies: Optional[Dict[str, Any]] = None

class HotelResponse(HotelBase):
    id: int
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    policies: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Room Schemas =============

class RoomBase(BaseModel):
    hotel_id: int
    name: str
    description: Optional[str] = None
    room_type: str
    max_guests: int = Field(default=2, ge=1)
    size: Optional[float] = None
    bed_type: Optional[str] = None
    base_price: float = Field(..., gt=0)

class RoomCreate(RoomBase):
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    room_type: Optional[str] = None
    max_guests: Optional[int] = Field(None, ge=1)
    size: Optional[float] = None
    bed_type: Optional[str] = None
    base_price: Optional[float] = Field(None, gt=0)
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None

class RoomResponse(RoomBase):
    id: int
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoomWithHotel(RoomResponse):
    hotel: Optional[HotelResponse] = None


# ============= Booking Schemas =============

class BookingBase(BaseModel):
    hotel_id: int
    room_id: int
    check_in_date: datetime
    check_out_date: datetime
    guests: int = Field(default=1, ge=1)

class BookingCreate(BookingBase):
    special_requests: Optional[str] = None

class BookingUpdate(BaseModel):
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None
    guests: Optional[int] = Field(None, ge=1)
    special_requests: Optional[str] = None
    status: Optional[str] = None

class BookingResponse(BookingBase):
    id: int
    user_id: int
    total_price: float
    status: str
    payment_status: str
    payment_method: Optional[str] = None
    special_requests: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Nested relationships
    room: Optional[RoomResponse] = None

    class Config:
        from_attributes = True


# ============= Payment Schemas =============

class PaymentBase(BaseModel):
    booking_id: int
    amount: float = Field(..., gt=0)
    currency: str = "VND"
    payment_method: str

class PaymentCreate(PaymentBase):
    payment_metadata: Optional[Dict[str, Any]] = None

class PaymentResponse(PaymentBase):
    id: int
    transaction_id: Optional[str] = None
    status: str
    payment_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Review Schemas =============

class ReviewBase(BaseModel):
    hotel_id: int
    overall_rating: float = Field(..., ge=1, le=10)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    booking_id: Optional[int] = None
    ratings: Optional[Dict[str, float]] = None  # cleanliness, location, service, etc.

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    booking_id: Optional[int] = None
    ratings: Optional[Dict[str, float]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewWithUser(ReviewResponse):
    user: Optional[UserResponse] = None


# ============= Wishlist Schemas =============

class WishlistCreate(BaseModel):
    hotel_id: int

class WishlistResponse(BaseModel):
    id: int
    user_id: int
    hotel_id: int
    created_at: datetime
    hotel: Optional[HotelResponse] = None

    class Config:
        from_attributes = True


# ============= Availability Schemas =============

class RoomAvailability(BaseModel):
    room_id: int
    available: bool
    base_price: int
    nights: int
    total_price_before_discount: Optional[int] = None
    discount_rate: float = 0.0
    total_price: int
    price_per_night_after_discount: int
    check_in_date: str
    check_out_date: str

class BulkAvailabilityResponse(BaseModel):
    room_id: int
    room_name: str
    available: bool
    base_price: int
    nights: int
    total_price: int
    discount_rate: float = 0.0


    status: str = "success"
