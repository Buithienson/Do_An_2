from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL database URL - Kết nối tới phpMyAdmin
# Format: mysql+pymysql://user:password@host:port/database
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root@localhost:3306/booking_ai_db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True  # Để debug SQL queries
)

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
