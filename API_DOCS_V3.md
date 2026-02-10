# AI-Booking API Documentation v3.0

## 🎉 Phase 1 Complete: Enhanced Database Models

### **What's New in v3.0**
- ✅ **Hotel Model** - Tách riêng khỏi Room với đầy đủ thông tin (address, city, country, coordinates, star_rating)
- ✅ **Enhanced Room Model** - Thêm hotel_id, room_type, max_guests, size, bed_type
- ✅ **Enhanced Booking Model** - Thêm hotel_id, guests, payment_status, payment_method, special_requests
- ✅ **Payment Model** - Quản lý thanh toán riêng biệt
- ✅ **Wishlist Model** - Lưu khách sạn yêu thích
- ✅ **Enhanced Review Model** - Rating breakdown (location, cleanliness, service, etc.)
- ✅ **JSON Fields** - Flexible data structure (images[], amenities[], policies{})

---

## 📡 API Endpoints

### **Base URL:** `http://localhost:8000/api`

---

## 🏨 Hotels API

### 1. Get All Hotels (with Filters)
```http
GET /api/hotels/
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `city` | string | Filter by city name |
| `country` | string | Filter by country |
| `star_rating` | integer (1-5) | Filter by star rating |
| `min_price` | float | Minimum room price |
| `max_price` | float | Maximum room price |
| `search` | string | Search in name/address/city |
| `skip` | integer | Pagination offset (default: 0) |
| `limit` | integer | Max results (default: 50, max: 100) |

**Example Request:**
```bash
GET /api/hotels/?city=Phú Quốc&star_rating=5
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "JW Marriott Phu Quoc Emerald Bay Resort & Spa",
    "description": "Khu nghỉ dưỡng 5 sao...",
    "address": "Bãi Khem, An Thới",
    "city": "Phú Quốc",
    "country": "Vietnam",
    "latitude": 10.1632,
    "longitude": 103.9742,
    "star_rating": 5,
    "images": [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
    ],
    "amenities": ["Private Beach", "Spa", "Fine Dining", "Infinity Pool"],
    "policies": {
      "check_in": "14:00",
      "check_out": "12:00",
      "cancellation": "Free cancellation up to 24 hours before check-in"
    },
    "created_at": "2026-01-15T10:00:00",
    "updated_at": "2026-01-15T10:00:00"
  }
]
```

---

### 2. Get Hotel by ID
```http
GET /api/hotels/{hotel_id}
```

**Example:**
```bash
GET /api/hotels/1
```

---

### 3. Get Hotel Rooms
```http
GET /api/hotels/{hotel_id}/rooms
```

**Query Parameters:**
- `available_from` (YYYY-MM-DD) - Check-in date
- `available_to` (YYYY-MM-DD) - Check-out date

**Example:**
```bash
GET /api/hotels/1/rooms?available_from=2026-02-01&available_to=2026-02-05
```

**Response:**
```json
[
  {
    "id": 1,
    "hotel_id": 1,
    "name": "Deluxe Room Ocean View",
    "description": "Phòng Deluxe tại JW Marriott...",
    "room_type": "Deluxe",
    "max_guests": 2,
    "size": 45.0,
    "bed_type": "King",
    "base_price": 5500000.0,
    "images": [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"
    ],
    "amenities": ["Ocean View", "Balcony", "Mini Bar"],
    "created_at": "2026-01-15T10:00:00",
    "updated_at": "2026-01-15T10:00:00"
  }
]
```

---

### 4. Get Hotel Reviews
```http
GET /api/hotels/{hotel_id}/reviews
```

**Query Parameters:**
- `skip` (default: 0)
- `limit` (default: 20, max: 100)

---

### 5. Get Hotel Average Rating
```http
GET /api/hotels/{hotel_id}/average-rating
```

**Response:**
```json
{
  "hotel_id": 1,
  "average_rating": 9.2,
  "total_reviews": 156
}
```

---

### 6. Create Hotel (Admin Only)
```http
POST /api/hotels/
```

**Request Body:**
```json
{
  "name": "New Hotel Name",
  "description": "Hotel description",
  "address": "123 Main Street",
  "city": "Hanoi",
  "country": "Vietnam",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "star_rating": 4,
  "images": ["url1", "url2"],
  "amenities": ["WiFi", "Pool", "Gym"],
  "policies": {
    "check_in": "14:00",
    "check_out": "12:00"
  }
}
```

---

### 7. Update Hotel (Admin Only)
```http
PUT /api/hotels/{hotel_id}
```

---

### 8. Delete Hotel (Admin Only)
```http
DELETE /api/hotels/{hotel_id}
```

---

## 🚪 Rooms API

### 1. Get All Rooms (with Filters)
```http
GET /api/rooms/
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `hotel_id` | integer | Filter by hotel |
| `room_type` | string | Filter by room type (Deluxe, Suite, etc.) |
| `min_price` | float | Minimum price |
| `max_price` | float | Maximum price |
| `max_guests` | integer | Minimum guest capacity |
| `skip` | integer | Pagination offset |
| `limit` | integer | Max results |

**Example:**
```bash
GET /api/rooms/?hotel_id=1&room_type=Suite&max_guests=4
```

---

### 2. Get Room by ID (with Hotel Info)
```http
GET /api/rooms/{room_id}
```

**Response:**
```json
{
  "id": 2,
  "hotel_id": 1,
  "name": "Ocean Suite",
  "room_type": "Suite",
  "max_guests": 4,
  "size": 85.0,
  "bed_type": "King + Sofa Bed",
  "base_price": 12000000.0,
  "images": ["..."],
  "amenities": ["Ocean View", "Living Room", "Bathtub"],
  "hotel": {
    "id": 1,
    "name": "JW Marriott Phu Quoc...",
    "city": "Phú Quốc",
    "star_rating": 5
  }
}
```

---

### 3. Create/Update/Delete Room (Admin Only)
```http
POST /api/rooms/
PUT /api/rooms/{room_id}
DELETE /api/rooms/{room_id}
```

---

## 📅 Bookings API

### 1. Create Booking
```http
POST /api/bookings/
```

**Request Body:**
```json
{
  "hotel_id": 1,
  "room_id": 1,
  "check_in_date": "2026-02-15T14:00:00",
  "check_out_date": "2026-02-18T12:00:00",
  "guests": 2,
  "special_requests": "Late check-in, high floor"
}
```

**Features:**
- ✅ Validates check-in/check-out dates
- ✅ Checks room availability (no overlapping bookings)
- ✅ Validates guest count vs room capacity
- ✅ Auto-calculates total price
- ✅ Sets status to "pending" (changes to "confirmed" after payment)

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "hotel_id": 1,
  "room_id": 1,
  "check_in_date": "2026-02-15T14:00:00",
  "check_out_date": "2026-02-18T12:00:00",
  "guests": 2,
  "total_price": 16500000.0,
  "status": "pending",
  "payment_status": "pending",
  "special_requests": "Late check-in, high floor",
  "created_at": "2026-01-15T10:00:00"
}
```

---

### 2. Get User Bookings
```http
GET /api/bookings/
```

---

### 3. Get Booking by ID
```http
GET /api/bookings/{booking_id}
```

---

### 4. Cancel Booking
```http
PATCH /api/bookings/{booking_id}/cancel
```

---

## 👤 Users API

### 1. Register User
```http
POST /api/users/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "full_name": "John Doe",
  "phone": "+84912345678",
  "password": "securepass123"
}
```

---

### 2. Get Current User
```http
GET /api/users/me
```

---

## 🗃️ Database Schema

### Users Table
```sql
- id (PK)
- email (unique)
- hashed_password
- full_name
- phone
- avatar
- role (user/admin)
- email_verified
- preferences (JSON)
- created_at, updated_at
```

### Hotels Table
```sql
- id (PK)
- name, description, address
- city, country
- latitude, longitude
- star_rating (1-5)
- images (JSON array)
- amenities (JSON array)
- policies (JSON object)
- created_at, updated_at
```

### Rooms Table
```sql
- id (PK)
- hotel_id (FK)
- name, description
- room_type
- max_guests, size, bed_type
- base_price
- images (JSON array)
- amenities (JSON array)
- created_at, updated_at
```

### Bookings Table
```sql
- id (PK)
- user_id (FK), hotel_id (FK), room_id (FK)
- check_in_date, check_out_date
- guests, total_price
- status (pending/confirmed/cancelled/completed)
- payment_status (pending/paid/refunded)
- payment_method
- special_requests
- created_at, updated_at
```

### Payments Table
```sql
- id (PK)
- booking_id (FK)
- amount, currency
- payment_method (stripe/vnpay/paypal)
- transaction_id
- status (pending/completed/failed/refunded)
- payment_metadata (JSON)
- created_at
```

### Reviews Table
```sql
- id (PK)
- user_id (FK), hotel_id (FK), booking_id (FK)
- overall_rating (1-10)
- ratings (JSON: {cleanliness, location, service, value, ...})
- comment
- created_at
```

### Wishlists Table
```sql
- id (PK)
- user_id (FK), hotel_id (FK)
- created_at
```

---

## 🧪 Test Commands

```bash
# Start backend server
cd backend
uvicorn app.main:app --reload --port 8000

# Access API docs
http://localhost:8000/docs

# Test hotels endpoint
curl http://localhost:8000/api/hotels/

# Test search
curl "http://localhost:8000/api/hotels/?city=Phú Quốc&star_rating=5"

# Test hotel rooms
curl http://localhost:8000/api/hotels/1/rooms
```

---

## 🚀 Next Steps (Phase 2)

### JWT Authentication & Authorization
- [ ] Login/Logout endpoints
- [ ] JWT token generation & validation
- [ ] Password reset flow
- [ ] OAuth (Google/Facebook)
- [ ] Protected routes with role-based access
- [ ] Refresh token mechanism

**Stay tuned for Phase 2!** 🎯
