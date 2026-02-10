from app.database import SessionLocal
from app import models
from urllib.parse import unquote

db = SessionLocal()

# Test various search queries
test_queries = [
    "Hạ Long",
    "Ha Long",
    "H%E1%BA%A1 Long",
    unquote("H%E1%BA%A1 Long"),
    unquote("H%E1%BA%A1+Long")
]

print("Testing search queries:")
for query in test_queries:
    print(f"\n=== Query: '{query}' ===")
    hotels = db.query(models.Hotel).filter(models.Hotel.city.ilike(f"%{query}%")).all()
    print(f"Found {len(hotels)} hotels")
    for hotel in hotels:
        print(f"  - {hotel.name} in {hotel.city}")

print("\n\n=== All cities in database ===")
cities = db.query(models.Hotel.city).distinct().all()
for city in cities:
    print(f"  - {city[0]}")

db.close()
