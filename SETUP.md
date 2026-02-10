# 🚀 Hướng dẫn cài đặt và chạy dự án AI-Booking

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

1. **Node.js** phiên bản 18 trở lên
   - Tải tại: https://nodejs.org/
   - Kiểm tra: `node --version` và `npm --version`

2. **Python** phiên bản 3.10 trở lên
   - Tải tại: https://www.python.org/downloads/
   - Kiểm tra: `python --version` hoặc `python3 --version`

3. **pip** (thường đi kèm với Python)
   - Kiểm tra: `pip --version`

---

## 📦 Bước 1: Cài đặt Dependencies

### Backend (FastAPI)

Mở Terminal/PowerShell và chạy:

```bash
cd backend
pip install -r requirements.txt
```

Hoặc nếu bạn muốn dùng virtual environment (khuyến nghị):

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Frontend (Next.js)

Mở Terminal/PowerShell mới và chạy:

```bash
cd frontend
npm install
```

---

## ▶️ Bước 2: Chạy ứng dụng

### Chạy Backend (Terminal 1)

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Backend sẽ chạy tại:**
- API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- Alternative Docs (ReDoc): http://localhost:8000/redoc

Bạn sẽ thấy thông báo:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Chạy Frontend (Terminal 2)

Mở Terminal/PowerShell mới:

```bash
cd frontend
npm run dev
```

**Frontend sẽ chạy tại:**
- Website: http://localhost:3000

Bạn sẽ thấy thông báo:
```
  ▲ Next.js 15.1.5
  - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 2.5s
```

---

## ✅ Bước 3: Kiểm tra kết nối

1. Mở trình duyệt và truy cập: http://localhost:3000

2. Bạn sẽ thấy trang chủ với:
   - ✅ **Kết nối thành công!** - Nếu Frontend kết nối được với Backend
   - ❌ **Lỗi kết nối** - Nếu Backend chưa chạy

3. Kiểm tra API trực tiếp:
   - Truy cập: http://localhost:8000/api/hello
   - Bạn sẽ thấy JSON response:
     ```json
     {
       "message": "Hello from FastAPI Backend!",
       "status": "success",
       "project": "AI-Booking Hotel System"
     }
     ```

---

## 🐛 Xử lý sự cố

### Lỗi: "npm: The term 'npm' is not recognized"
- **Nguyên nhân**: Node.js chưa được cài đặt hoặc chưa được thêm vào PATH
- **Giải pháp**: 
  1. Tải và cài đặt Node.js từ https://nodejs.org/
  2. Khởi động lại Terminal/PowerShell
  3. Kiểm tra: `node --version`

### Lỗi: "python: The term 'python' is not recognized"
- **Nguyên nhân**: Python chưa được cài đặt hoặc chưa được thêm vào PATH
- **Giải pháp**:
  1. Tải và cài đặt Python từ https://www.python.org/downloads/
  2. Tick vào "Add Python to PATH" khi cài đặt
  3. Khởi động lại Terminal/PowerShell
  4. Thử `python` hoặc `python3`

### Lỗi: "Port 3000 is already in use"
- **Giải pháp**: 
  - Dừng process đang dùng port 3000
  - Hoặc chạy Next.js trên port khác: `npm run dev -- -p 3001`

### Lỗi: "Port 8000 is already in use"
- **Giải pháp**:
  - Dừng process đang dùng port 8000
  - Hoặc chạy FastAPI trên port khác: `uvicorn app.main:app --reload --port 8001`

### Lỗi CORS khi gọi API
- **Kiểm tra**: Backend đang chạy tại đúng port 8000
- **Kiểm tra**: CORS đã được cấu hình trong `backend/app/main.py`

---

## 📁 Cấu trúc dự án

```
AI-Booking/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py            # Main API application
│   ├── requirements.txt       # Python dependencies
│   └── .gitignore
│
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── package.json           # Node dependencies
│   ├── tsconfig.json          # TypeScript config
│   ├── tailwind.config.ts     # Tailwind config
│   ├── next.config.js         # Next.js config
│   └── .gitignore
│
├── .github/
│   └── copilot-instructions.md
└── README.md
```

---

## 🎯 Các API Endpoints hiện có

### GET /api/hello
- **Mô tả**: Test endpoint để kiểm tra kết nối
- **Response**:
  ```json
  {
    "message": "Hello from FastAPI Backend!",
    "status": "success",
    "project": "AI-Booking Hotel System"
  }
  ```

---

## 🔄 Development Workflow

1. **Backend Development**:
   - Chỉnh sửa code trong `backend/app/`
   - FastAPI tự động reload khi có thay đổi (nhờ flag `--reload`)
   - Kiểm tra API tại http://localhost:8000/docs

2. **Frontend Development**:
   - Chỉnh sửa code trong `frontend/app/`
   - Next.js tự động reload và hot refresh
   - Xem thay đổi ngay tại http://localhost:3000

3. **Testing Connection**:
   - Frontend tự động gọi Backend API khi load trang
   - Kiểm tra Console của trình duyệt (F12) để xem logs

---

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SQLAlchemy](https://docs.sqlalchemy.org/)

---

## 🎉 Chúc mừng!

Bạn đã thiết lập thành công dự án AI-Booking! 🚀

Tiếp theo, bạn có thể:
- Thiết kế database schema cho rooms, bookings, users
- Thêm các API endpoints mới
- Xây dựng UI components với Shadcn/UI
- Tích hợp AI features
