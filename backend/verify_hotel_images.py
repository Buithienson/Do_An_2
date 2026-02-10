"""Verify hotel images"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel

db = SessionLocal()

print("=" * 60)
print("HOTEL IMAGES BY CITY")
print("=" * 60)

cities = db.query(Hotel.city).distinct().all()
for (city,) in cities:
    hotel = db.query(Hotel).filter(Hotel.city == city).first()
    count = db.query(Hotel).filter(Hotel.city == city).count()
    if hotel:
        print(f"{city} ({count} hotels): {hotel.images}")

print("\n" + "=" * 60)
print(f"Total cities: {len(cities)}")
print(f"Total hotels: {db.query(Hotel).count()}")

db.close()
