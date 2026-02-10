"""
Script để seed đầy đủ dữ liệu khách sạn và 4 hạng phòng cho mỗi khách sạn
Chạy: python seed_full_hotels.py
"""

import json
import sys
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.models import User, Hotel, Room, Booking
from app.utils import hash_password
from datetime import datetime


def seed_full_hotels():
    """
    Seed database với dữ liệu đầy đủ:
    - 6-7 khách sạn mỗi địa điểm
    - 4 hạng phòng mỗi khách sạn (Standard, Superior, Deluxe, Suite)
    """

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Clear existing data
        print("[*] Clearing existing data...")
        db.query(Booking).delete()
        db.query(Room).delete()
        db.query(Hotel).delete()
        db.commit()
        print("[OK] Cleared existing hotels and rooms")

        # Load JSON data
        json_path = Path(__file__).parent / "data" / "vietnam_hotels.json"
        if not json_path.exists():
            print(f"[ERROR] Data file not found at {json_path}")
            return

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        print(f"[*] Loaded {len(data['destinations'])} destinations from JSON")

        total_hotels = 0
        total_rooms = 0

        # Room types with price multipliers and details
        room_types = [
            {
                "type": "Standard",
                "price_mult": 1.0,
                "size": 28,
                "max_guests": 2,
                "bed_type": "Queen",
                "amenities": ["Wifi", "AC", "TV", "Minibar"],
                "description_template": "Phong Standard thoai mai voi day du tien nghi co ban",
            },
            {
                "type": "Superior",
                "price_mult": 1.3,
                "size": 35,
                "max_guests": 2,
                "bed_type": "King",
                "amenities": ["Wifi", "AC", "TV", "Minibar", "Safe", "Work Desk"],
                "description_template": "Phong Superior rong rai voi tien nghi nang cap",
            },
            {
                "type": "Deluxe",
                "price_mult": 1.6,
                "size": 45,
                "max_guests": 3,
                "bed_type": "King",
                "amenities": [
                    "Wifi",
                    "AC",
                    "TV",
                    "Minibar",
                    "Safe",
                    "Work Desk",
                    "Bathtub",
                    "City/Sea View",
                ],
                "description_template": "Phong Deluxe sang trong voi view dep va bon tam",
            },
            {
                "type": "Suite",
                "price_mult": 2.2,
                "size": 65,
                "max_guests": 4,
                "bed_type": "King + Sofa Bed",
                "amenities": [
                    "Wifi",
                    "AC",
                    "TV",
                    "Minibar",
                    "Safe",
                    "Work Desk",
                    "Bathtub",
                    "Living Room",
                    "Premium View",
                    "Lounge Access",
                ],
                "description_template": "Suite cao cap voi phong khach rieng va dac quyen lounge",
            },
        ]

        for dest in data["destinations"]:
            city_name = dest["name"]
            hotels_in_city = dest["hotels"]

            print(f"\n[*] Processing {city_name} ({len(hotels_in_city)} hotels)...")

            for h_data in hotels_in_city:
                # Create Hotel
                images_list = [h_data.get("image", "/hotels/default.png")]

                new_hotel = Hotel(
                    name=h_data["name"],
                    address=h_data["address"],
                    city=city_name,
                    country="Vietnam",
                    description=h_data.get(
                        "description",
                        f"Khach san {h_data['star_rating']} sao tai {city_name}",
                    ),
                    latitude=h_data.get("latitude", 0),
                    longitude=h_data.get("longitude", 0),
                    star_rating=h_data.get("star_rating", 4),
                    amenities=h_data.get("amenities", []),
                    images=images_list,
                    policies={
                        "check_in": "14:00",
                        "check_out": "12:00",
                        "cancellation": "Free cancellation up to 24 hours before check-in",
                    },
                )
                db.add(new_hotel)
                db.flush()  # Get hotel ID
                total_hotels += 1

                # Create 4 room types for this hotel
                base_price = h_data.get("price", 2000000)

                for room_info in room_types:
                    room_name = f"{room_info['type']} Room"
                    if room_info["type"] == "Suite":
                        room_name = f"{h_data['name'].split()[0]} Suite"
                    elif room_info["type"] == "Deluxe":
                        room_name = f"Deluxe {city_name} View"

                    new_room = Room(
                        hotel_id=new_hotel.id,
                        name=room_name,
                        description=f"{room_info['description_template']} tai {h_data['name']}",
                        room_type=room_info["type"],
                        base_price=int(base_price * room_info["price_mult"]),
                        max_guests=room_info["max_guests"],
                        size=float(room_info["size"]),
                        bed_type=room_info["bed_type"],
                        amenities=room_info["amenities"],
                        images=images_list,
                    )
                    db.add(new_room)
                    total_rooms += 1

                print(f"  [+] {h_data['name']}: 4 room types created")

            db.commit()
            print(f"[OK] {city_name}: {len(hotels_in_city)} hotels seeded")

        # Final commit
        db.commit()

        print(f"\n{'='*50}")
        print(f"[SUCCESS] Database seeded successfully!")
        print(f"{'='*50}")
        print(f"  Total Hotels: {total_hotels}")
        print(f"  Total Rooms: {total_rooms}")
        print(f"  Destinations: {len(data['destinations'])}")
        print(
            f"  Avg Hotels/Destination: {total_hotels / len(data['destinations']):.1f}"
        )
        print(f"  Rooms per Hotel: 4")

    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_full_hotels()
