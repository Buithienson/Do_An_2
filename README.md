# AI-Booking - Hotel Booking System

Hệ thống đặt phòng khách sạn với khả năng tích hợp AI.

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- Tailwind CSS
- Shadcn/UI Components
- TypeScript

### Backend
- Python FastAPI
- SQLAlchemy ORM
- SQLite Database

## Cấu trúc dự án

```
AI-Booking/
├── frontend/          # Next.js application
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   └── lib/          # Utilities
├── backend/          # FastAPI application
│   ├── app/          # Application code
│   ├── models/       # Database models
│   └── routers/      # API routes
└── README.md
```

## Yêu cầu hệ thống

- Node.js 18+ và npm
- Python 3.10+
- pip

## Hướng dẫn cài đặt

### 1. Cài đặt Backend

```bash
cd backend
pip install -r requirements.txt
```

### 2. Cài đặt Frontend

```bash
cd frontend
npm install
```

## Chạy ứng dụng

### Chạy Backend (Terminal 1)

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Backend sẽ chạy tại: http://localhost:8000
API Docs: http://localhost:8000/docs

### Chạy Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## API Endpoints

### Giai đoạn 1 - Setup
- `GET /api/hello` - Hello World endpoint

### Giai đoạn 2 - Database & API ✅
- `POST /api/users/register` - Đăng ký người dùng
- `GET /api/rooms` - Lấy danh sách phòng (filter: location, max_price)
- `GET /api/rooms/{id}` - Chi tiết phòng
- `POST /api/bookings` - Đặt phòng (có logic check trùng lịch)
- `GET /api/bookings` - Danh sách booking
- `PATCH /api/bookings/{id}/cancel` - Hủy booking

**📚 Chi tiết:** Xem [API_DOCS.md](API_DOCS.md)

## Dữ liệu mẫu

**Chạy seed script:**
```bash
cd backend
python seed.py
```

**Admin account:**
- Email: admin@aibooking.com
- Password: admin123

**5 phòng mẫu** tại: Nha Trang, Hà Nội, Đà Lạt, TP.HCM, Phú Quốc

## Tính năng đã hoàn thành

- [x] Setup Frontend (Next.js 15) & Backend (FastAPI)
- [x] Database models: User, Room, Booking, Review
- [x] API quản lý phòng với filter
- [x] Hệ thống đặt phòng với logic check trùng lịch
- [x] User registration với password hashing
- [x] Seed data script

## Tính năng sắp tới

- [ ] JWT Authentication & Authorization
- [ ] Frontend UI cho đặt phòng
- [ ] Review system
- [ ] Tích hợp AI cho gợi ý
- [ ] Payment integration
- [ ] Email notifications
