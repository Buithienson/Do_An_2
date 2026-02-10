from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models 

# Dòng này sẽ tự động chạy sang MySQL và tạo bảng 'users' nếu chưa có
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Cấu hình để Frontend (Next.js) gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Đã kết nối MySQL thành công!"}

# API lấy danh sách phòng
@app.get("/rooms/")
def get_rooms(db: Session = Depends(get_db)):
    return db.query(models.Room).all()

# API lấy chi tiết 1 phòng (để làm trang Detail)
@app.get("/rooms/{room_id}")
def get_room_detail(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
