# 📚 AI-Booking API Documentation - Giai đoạn 2

## ✅ Hoàn thành

Đã thiết kế và triển khai đầy đủ Database & API cho hệ thống AI-Booking.

## 🗄️ Database Schema

### Bảng đã tạo:

1. **Users** - Quản lý người dùng
   - `id`: Primary key
   - `email`: Email (unique)
   - `hashed_password`: Mật khẩu đã mã hóa
   - `full_name`: Họ tên
   - `role`: Vai trò (user/admin)
   - `created_at`: Thời gian tạo

2. **Rooms** - Quản lý phòng
   - `id`: Primary key
   - `name`: Tên phòng
   - `description`: Mô tả
   - `price_per_night`: Giá mỗi đêm
   - `location`: Địa điểm
   - `image_url`: URL hình ảnh
   - `amenities`: Tiện ích (comma-separated)
   - `created_at`: Thời gian tạo

3. **Bookings** - Quản lý đặt phòng
   - `id`: Primary key
   - `user_id`: Foreign key → Users
   - `room_id`: Foreign key → Rooms
   - `check_in_date`: Ngày nhận phòng
   - `check_out_date`: Ngày trả phòng
   - `total_price`: Tổng giá
   - `status`: Trạng thái (confirmed/cancelled)
   - `created_at`: Thời gian tạo

4. **Reviews** - Đánh giá phòng
   - `id`: Primary key
   - `user_id`: Foreign key → Users
   - `room_id`: Foreign key → Rooms
   - `rating`: Điểm đánh giá (1-5)
   - `comment`: Bình luận
   - `created_at`: Thời gian tạo

## 🔌 API Endpoints

### 📝 Users

#### POST /api/users/register
Đăng ký người dùng mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "Nguyễn Văn A"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "Nguyễn Văn A",
  "role": "user",
  "created_at": "2026-01-13T10:30:00"
}
```

#### GET /api/users/me
Lấy thông tin user hiện tại (placeholder)

---

### 🏨 Rooms

#### GET /api/rooms
Lấy danh sách phòng (có lọc)

**Query Parameters:**
- `location` (optional): Lọc theo địa điểm
- `max_price` (optional): Giá tối đa mỗi đêm

**Example:**
```
GET /api/rooms?location=Nha Trang&max_price=3000000
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Deluxe Ocean View Suite",
    "description": "Phòng cao cấp nhìn ra biển...",
    "price_per_night": 2500000,
    "location": "Nha Trang",
    "image_url": "https://...",
    "amenities": "WiFi,TV,Air Conditioning,Mini Bar,Ocean View,Balcony",
    "created_at": "2026-01-13T10:00:00"
  }
]
```

#### GET /api/rooms/{room_id}
Lấy thông tin chi tiết một phòng

#### POST /api/rooms
Tạo phòng mới (Admin only)

---

### 📅 Bookings

#### POST /api/bookings
Tạo booking mới

**⚠️ LOGIC QUAN TRỌNG:**
- Tự động kiểm tra phòng có bị trùng lịch không
- Nếu trùng → Trả về lỗi 400 "Room already booked"
- Tự động tính `total_price` = số đêm × giá phòng

**Request Body:**
```json
{
  "room_id": 1,
  "check_in_date": "2026-02-01T14:00:00",
  "check_out_date": "2026-02-05T12:00:00"
}
```

**Response (201) - Success:**
```json
{
  "id": 1,
  "user_id": 1,
  "room_id": 1,
  "check_in_date": "2026-02-01T14:00:00",
  "check_out_date": "2026-02-05T12:00:00",
  "total_price": 10000000,
  "status": "confirmed",
  "created_at": "2026-01-13T10:30:00",
  "room": {
    "id": 1,
    "name": "Deluxe Ocean View Suite",
    ...
  }
}
```

**Response (400) - Conflict:**
```json
{
  "detail": "Room already booked for the selected dates"
}
```

#### GET /api/bookings
Lấy danh sách booking của user

#### GET /api/bookings/{booking_id}
Lấy chi tiết một booking

#### PATCH /api/bookings/{booking_id}/cancel
Hủy booking

---

## 🌱 Dữ liệu mẫu

### Chạy Seed Script

```bash
cd backend
python seed.py
```

### Dữ liệu đã seed:

**1 Admin User:**
- Email: `admin@aibooking.com`
- Password: `admin123`
- Role: `admin`

**5 Phòng mẫu:**

1. **Deluxe Ocean View Suite** (Nha Trang) - 2,500,000 VNĐ/đêm
   - Phòng cao cấp nhìn ra biển với ban công riêng

2. **Executive Business Room** (Hà Nội) - 1,500,000 VNĐ/đêm
   - Phòng doanh nhân với bàn làm việc rộng rãi

3. **Cozy Garden Bungalow** (Đà Lạt) - 1,200,000 VNĐ/đêm
   - Bungalow ấm cúng giữa vườn xanh

4. **Modern City Center Apartment** (TP.HCM) - 1,800,000 VNĐ/đêm
   - Căn hộ hiện đại ngay trung tâm

5. **Beachfront Villa** (Phú Quốc) - 5,000,000 VNĐ/đêm
   - Villa sang trọng với hồ bơi riêng

---

## 🧪 Test API

### 1. Sử dụng Swagger UI

Truy cập: http://localhost:8000/docs

### 2. Test bằng curl

**Lấy danh sách phòng:**
```bash
curl http://localhost:8000/api/rooms
```

**Lấy phòng theo địa điểm:**
```bash
curl "http://localhost:8000/api/rooms?location=Nha Trang"
```

**Đăng ký user:**
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

**Tạo booking:**
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "check_in_date": "2026-02-01T14:00:00",
    "check_out_date": "2026-02-05T12:00:00"
  }'
```

**Test trùng lịch (sẽ trả về lỗi 400):**
```bash
# Chạy lại lệnh tạo booking với cùng phòng và thời gian
curl -X POST http://localhost:8000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "check_in_date": "2026-02-01T14:00:00",
    "check_out_date": "2026-02-05T12:00:00"
  }'
```

---

## 📁 Cấu trúc code

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app với routers
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── utils.py             # Utility functions (password hashing)
│   └── routers/
│       ├── __init__.py
│       ├── users.py         # User endpoints
│       ├── rooms.py         # Room endpoints
│       └── bookings.py      # Booking endpoints (có logic check trùng)
├── seed.py                  # Seed script
├── requirements.txt
└── ai_booking.db           # SQLite database (auto-created)
```

---

## 🔐 Security Notes

**Hiện tại:**
- Password được hash bằng bcrypt
- Email validation với pydantic EmailStr
- Chưa có authentication/authorization

**Cần thêm (Giai đoạn tiếp theo):**
- JWT authentication
- Role-based access control
- API rate limiting
- Input sanitization

---

## 🚀 Next Steps

1. **Authentication & Authorization**
   - Implement JWT tokens
   - Add login/logout endpoints
   - Protect endpoints với middleware

2. **Frontend Integration**
   - Tạo UI để hiển thị danh sách phòng
   - Form đặt phòng với date picker
   - User dashboard

3. **Advanced Features**
   - Review system
   - Payment integration
   - Email notifications
   - AI recommendations

---

## 📊 Database File

Database được lưu tại: `backend/ai_booking.db`

**Tools để xem database:**
- DB Browser for SQLite: https://sqlitebrowser.org/
- VS Code extension: SQLite Viewer

---

## ✅ Checklist Hoàn thành

- [x] Tạo 4 models: User, Room, Booking, Review
- [x] Tạo Pydantic schemas cho request/response
- [x] API GET /rooms với filter location & max_price
- [x] API POST /bookings với logic check trùng lịch
- [x] API POST /users/register với password hashing
- [x] Seed script với 5 phòng và 1 admin
- [x] Documentation đầy đủ

🎉 **Giai đoạn 2 hoàn thành!**
