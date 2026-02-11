"""
Endpoint to seed database for deployed backend
Visit: https://your-backend-url.onrender.com/seed-db
"""

from fastapi import APIRouter, HTTPException
from app.database import SessionLocal, Base, engine
from app.models import User, Hotel, Room
from app.utils import hash_password
import json
from pathlib import Path

router = APIRouter()


@router.api_route("/seed-db", methods=["GET", "POST"])
async def seed_database_endpoint():
    """
    Seed database with FULL DATA for production
    This endpoint will CLEAR existing data and reload from vietnam_hotels.json
    """
    db = SessionLocal()

    try:
        # Check if data file exists
        # Navigate from app/routers/seed_endpoint.py back to root backend/data/
        # app/routers/ -> app/ -> backend/ -> data/
        base_dir = Path(__file__).resolve().parent.parent.parent
        json_path = base_dir / "data" / "vietnam_hotels.json"

        if not json_path.exists():
            # Fallback path try
            json_path = Path("data/vietnam_hotels.json")

        if not json_path.exists():
            raise HTTPException(
                status_code=404, detail=f"Data file not found at {json_path}"
            )

        # Clear existing data
        db.query(Booking).delete()
        db.query(Room).delete()
        db.query(Hotel).delete()
        # Do not delete users to preserve admin access if needed, or delete if full reset requested.
        # For this request, let's keep users if they exist, or just recreate them.
        # User requested "load full data", implying a reset.
        db.query(User).delete()

        db.commit()

        # Create tables
        Base.metadata.create_all(bind=engine)

        # Create admin user
        admin = User(
            email="admin@aibooking.com",
            full_name="Admin User",
            phone="+84901234567",
            hashed_password=hash_password("admin123"),
            role="admin",
            email_verified=True,
        )
        db.add(admin)

        # Create regular user
        user = User(
            email="user@example.com",
            full_name="John Doe",
            phone="+84912345678",
            hashed_password=hash_password("user123"),
            role="user",
            email_verified=True,
        )
        db.add(user)
        db.flush()

        # Load JSON data
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        total_hotels = 0
        total_rooms = 0

        # Room types check
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
                        f"Khach san {h_data.get('star_rating', 4)} sao tai {city_name}",
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
                        images=images_list,  # Use hotel image for room temporarily
                    )
                    db.add(new_room)
                    total_rooms += 1

                db.commit()

        return {
            "status": "success",
            "message": "Full database seeded successfully from JSON!",
            "data": {
                "destinations": len(data["destinations"]),
                "hotels": total_hotels,
                "rooms": total_rooms,
                "users": 2,
            },
            "credentials": {
                "admin": "admin@aibooking.com / admin123",
                "user": "user@example.com / user123",
            },
        }

    except Exception as e:
        db.rollback()
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")
    finally:
        db.close()
