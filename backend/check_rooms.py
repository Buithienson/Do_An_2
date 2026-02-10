"""Script to check rooms data"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel, Room

db = SessionLocal()

# Count totals
hotels_count = db.query(Hotel).count()
rooms_count = db.query(Room).count()
cities = db.query(Hotel.city).distinct().all()

print("=" * 50)
print("DATABASE SUMMARY")
print("=" * 50)
print(f"Total Hotels: {hotels_count}")
print(f"Total Rooms: {rooms_count}")
print(f"Total Destinations: {len(cities)}")
print(f"Average Hotels per Destination: {hotels_count / len(cities):.1f}")
print(f"Rooms per Hotel: {rooms_count / hotels_count:.1f}")
print()

# Show sample hotel with rooms
print("=" * 50)
print("SAMPLE: First Hotel with Rooms")
print("=" * 50)
hotel = db.query(Hotel).first()
if hotel:
    print(f"Hotel: {hotel.name}")
    print(f"City: {hotel.city}")
    print(f"Star Rating: {hotel.star_rating}")
    print(f"\nRooms:")
    rooms = db.query(Room).filter(Room.hotel_id == hotel.id).all()
    for room in rooms:
        print(f"  - {room.name} ({room.room_type})")
        print(f"    Price: {room.base_price:,.0f} VND/night")
        print(f"    Size: {room.size} sqm | Max Guests: {room.max_guests}")
        print(f"    Bed: {room.bed_type}")
        print()

db.close()
