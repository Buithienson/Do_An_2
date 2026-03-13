import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Lấy DATABASE_URL từ biến môi trường (Render cung cấp tự động)
# Nếu không có, mặc định dùng MySQL local
SQLALCHEMY_DATABASE_URL = os.environ.get(
    "DATABASE_URL", "mysql+pymysql://root@localhost:3306/booking_ai_db"
)

# SQLAlchemy yêu cầu 'postgresql://' thay vì 'postgres://' (Render thường cấp postgres://)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

# Create engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)  # Tắt echo trên production

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
