import sys
import os
sys.path.insert(0, 'd:/VScode/Do_An_2/backend')

# Fix Windows console encoding
if os.name == 'nt':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

from app.database import SessionLocal
from app import models
from urllib.parse import unquote
from sqlalchemy import or_
import unicodedata

def normalize_text(text: str) -> str:
    """Normalize text for flexible matching - removes diacritics"""
    if not text:
        return text
    # Normalize unicode to decomposed form then remove diacritics
    nfd = unicodedata.normalize('NFD', text)
    return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn')

db = SessionLocal()

try:
    # Test 1: Get all hotels (this was failing)
    print("Test 1: Get all hotels")
    hotels = db.query(models.Hotel).limit(3).all()
    print(f"  Success! Got {len(hotels)} hotels")
    for h in hotels:
        print(f"    - {h.name} in {h.city}")
    
    # Test 2: Search with Vietnamese characters
    print("\nTest 2: Search for 'Hạ Long'")
    city = "Hạ Long"
    city_decoded = unquote(city)
    city_normalized = normalize_text(city_decoded)
    print(f"  Decoded: {city_decoded}")
    print(f"  Normalized: {city_normalized}")
    
    query = db.query(models.Hotel).filter(
        or_(
            models.Hotel.city.ilike(f"%{city_decoded}%"),
            models.Hotel.city.ilike(f"%{city_normalized}%")
        )
    )
    hotels = query.all()
    print(f"  Found {len(hotels)} hotels")
    for h in hotels[:3]:
        print(f"    - {h.name} in {h.city}")
    
    # Test 3: Check for any issues with hotel data
    print("\nTest 3: Check for data issues")
    all_hotels = db.query(models.Hotel).all()
    for hotel in all_hotels:
        try:
            # Try to access all fields
            _ = hotel.id
            _ = hotel.name
            _ = hotel.city
            _ = hotel.images
            _ = hotel.amenities
        except Exception as e:
            print(f"  ERROR with hotel {hotel.id}: {e}")
    print(f"  Checked {len(all_hotels)} hotels - no data issues")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
