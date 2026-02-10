"""Quick verification of room images"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Room

db = SessionLocal()

print("=" * 50)
print("ROOM IMAGES VERIFICATION")
print("=" * 50)

room_types = ["Standard", "Superior", "Deluxe", "Suite"]
for rt in room_types:
    count = db.query(Room).filter(Room.room_type == rt).count()
    sample = db.query(Room).filter(Room.room_type == rt).first()
    if sample:
        print(f"\n{rt} Rooms: {count}")
        print(f"  Image: {sample.images}")

db.close()
