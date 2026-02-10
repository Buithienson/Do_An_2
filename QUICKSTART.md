# 🚀 Quick Start - Giai đoạn 2

## ⚡ Chạy Backend với Database

### 1. Seed dữ liệu mẫu (chỉ chạy 1 lần)

```bash
cd backend
python seed.py
```

✅ Sẽ tạo: 1 admin user + 5 phòng mẫu

### 2. Khởi động Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Backend chạy tại: http://localhost:8000  
API Docs: http://localhost:8000/docs

### 3. Khởi động Frontend

Mở terminal mới:

```bash
cd frontend
npm run dev
```

Frontend chạy tại: http://localhost:3000

---

## 🧪 Test API nhanh

### 1. Lấy danh sách phòng

**Tất cả phòng:**
```bash
curl http://localhost:8000/api/rooms
```

**Filter theo địa điểm:**
```bash
curl "http://localhost:8000/api/rooms?location=Nha%20Trang"
```

**Filter theo giá:**
```bash
curl "http://localhost:8000/api/rooms?max_price=2000000"
```

### 2. Đăng ký user mới

```bash
curl -X POST http://localhost:8000/api/users/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"full_name\":\"Test User\"}"
```

### 3. Đặt phòng

```bash
curl -X POST http://localhost:8000/api/bookings ^
  -H "Content-Type: application/json" ^
  -d "{\"room_id\":1,\"check_in_date\":\"2026-02-01T14:00:00\",\"check_out_date\":\"2026-02-05T12:00:00\"}"
```

### 4. Test trùng lịch (sẽ trả lỗi)

Chạy lại lệnh đặt phòng trên → Sẽ nhận được lỗi:
```json
{"detail": "Room already booked for the selected dates"}
```

---

## 📊 Xem Database

File database: `backend/ai_booking.db`

**Dùng DB Browser for SQLite:**
1. Tải: https://sqlitebrowser.org/
2. Mở file `ai_booking.db`
3. Xem bảng Users, Rooms, Bookings

**Hoặc dùng VS Code extension:**
- Tên: SQLite Viewer
- ID: `qwtel.sqlite-viewer`

---

## 🔑 Tài khoản Admin

- **Email:** admin@aibooking.com
- **Password:** admin123
- **Role:** admin

---

## 🏨 Phòng mẫu có sẵn

| ID | Tên | Địa điểm | Giá/đêm |
|----|-----|----------|---------|
| 1 | Deluxe Ocean View Suite | Nha Trang | 2,500,000 VNĐ |
| 2 | Executive Business Room | Hà Nội | 1,500,000 VNĐ |
| 3 | Cozy Garden Bungalow | Đà Lạt | 1,200,000 VNĐ |
| 4 | Modern City Center Apartment | TP.HCM | 1,800,000 VNĐ |
| 5 | Beachfront Villa | Phú Quốc | 5,000,000 VNĐ |

---

## 📚 Documentation

- **API Docs:** [API_DOCS.md](API_DOCS.md)
- **Setup Guide:** [SETUP.md](SETUP.md)
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## ✅ Checklist

- [ ] Đã chạy `seed.py`
- [ ] Backend đang chạy trên port 8000
- [ ] Frontend đang chạy trên port 3000
- [ ] Test API GET /api/rooms thành công
- [ ] Test API POST /api/bookings thành công
- [ ] Test logic trùng lịch hoạt động

---

## 🐛 Troubleshooting

**Lỗi: "no such table"**
→ Chưa chạy seed.py hoặc database bị lỗi. Xóa file `ai_booking.db` và chạy lại seed.py

**Lỗi: "Room already booked"**
→ Đây là lỗi mong muốn khi test logic check trùng lịch. Đổi ngày hoặc room_id khác.

**Backend không khởi động**
→ Kiểm tra port 8000 có bị chiếm không. Đổi sang port khác: `--port 8001`
