from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from app.database import Base, engine 
from app.models import User, Hotel, Room, Booking, Review, Wishlist, AILog, Payment

def clear_data():
    meta = MetaData()
    meta.reflect(bind=engine)
    
    # Drop all tables in reverse order of dependencies
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    # Recreate all tables
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Database cleared successfully!")

if __name__ == "__main__":
    clear_data()
