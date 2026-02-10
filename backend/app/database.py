import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Lấy DATABASE_URL từ biến môi trường (Render sẽ tự động cung cấp nếu dùng PostgreSQL)
# Nếu không có, mặc định dùng SQLite để chạy được ngay (lưu ý: data sẽ mất khi deploy lại trên Render free tier)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/ai_booking.db")

# Fix lỗi tương thích với Render (PostgreSQL bắt đầu bằng postgres:// nhưng SQLAlchemy cần postgresql://)
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

# Cấu hình engine
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # SQLite cần connect_args đặc biệt
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # MySQL / PostgreSQL
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
