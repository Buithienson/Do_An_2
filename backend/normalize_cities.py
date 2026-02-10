"""
Script to normalize city names in the database
Fixes inconsistencies like 'Ha Long' vs 'Hạ Long', 'Ha Noi' vs 'Hà Nội'
"""
from app.database import SessionLocal
from app import models

# City name mappings
CITY_MAPPINGS = {
    "Ha Long": "Hạ Long",
    "Ha Noi": "Hà Nội",
    "Da Lat": "Đà Lạt",
    "Hoi An": "Hội An",
}

def normalize_cities():
    db = SessionLocal()
    try:
        print("Starting city normalization...")
        
        # Get all unique cities
        hotels = db.query(models.Hotel).all()
        updated_count = 0
        
        for hotel in hotels:
            old_city = hotel.city
            
            # Check if city needs to be normalized
            if old_city in CITY_MAPPINGS:
                new_city = CITY_MAPPINGS[old_city]
                hotel.city = new_city
                updated_count += 1
                print(f"  Updated: '{old_city}' -> '{new_city}' for hotel: {hotel.name}")
        
        # Commit changes
        db.commit()
        
        print(f"\n✓ Successfully normalized {updated_count} hotel cities")
        
        # Show updated city list
        print("\n=== Updated City List ===")
        cities = db.query(models.Hotel.city).distinct().order_by(models.Hotel.city).all()
        for city in cities:
            count = db.query(models.Hotel).filter(models.Hotel.city == city[0]).count()
            print(f"  - {city[0]}: {count} hotels")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    normalize_cities()
