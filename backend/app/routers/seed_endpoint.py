"""
Endpoint to seed database for deployed backend
Visit: https://your-backend-url.onrender.com/seed-db
"""

from fastapi import APIRouter, HTTPException
from app.database import SessionLocal, Base, engine
from app.models import User, Hotel, Room, Booking
from app.utils import hash_password
import json
from pathlib import Path

router = APIRouter()


@router.api_route("/fix-images", methods=["GET", "POST"])
async def fix_images_endpoint():
    """Fix existing broken image URLs in the database"""
    db = SessionLocal()
    try:
        hotels = db.query(Hotel).all()
        hotel_count = 0
        UNSPLASH_PARAMS = "?w=800&auto=format&fit=crop&q=80"

        def fix_url(url: str) -> str:
            if not url:
                return url
            for prefix in [
                "http://localhost:3000",
                "https://localhost:3000",
                "http://127.0.0.1:3000",
            ]:
                if url.startswith(prefix):
                    return url[len(prefix) :]
            if "images.unsplash.com" in url and "?" not in url:
                return url + UNSPLASH_PARAMS
            return url

        def fix_list(images: list) -> list:
            if not images:
                return images
            return [fix_url(u) for u in images]

        for hotel in hotels:
            if hotel.images:
                fixed = fix_list(hotel.images)
                if fixed != hotel.images:
                    hotel.images = fixed
                    hotel_count += 1

        rooms = db.query(Room).all()
        room_count = 0
        for room in rooms:
            if room.images:
                fixed = fix_list(room.images)
                if fixed != room.images:
                    room.images = fixed
                    room_count += 1

        db.commit()
        return {
            "status": "success",
            "fixed_hotels": hotel_count,
            "fixed_rooms": room_count,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.api_route("/update-all-images", methods=["GET", "POST"])
async def update_all_images_endpoint():
    """Update all hotels with correct default images based on city"""
    db = SessionLocal()
    try:
        beach_cities = [
            "Nha Trang",
            "Vũng Tàu",
            "Phan Thiết",
            "Mũi Né",
            "Quy Nhơn",
            "Vung Tau",
            "Phan Thiet",
            "Mui Ne",
            "Quy Nhon",
        ]
        island_cities = ["Phú Quốc", "Côn Đảo", "Phu Quoc", "Con Dao"]
        mountain_cities = ["Sa Pa", "Sapa", "Sapa"]
        heritage_cities = ["Hội An", "Huế", "Hoi An", "Hue"]
        bay_cities = ["Hạ Long", "Ha Long", "Halong"]
        highland_cities = ["Đà Lạt", "Da Lat", "Dalat"]
        riverside_cities = ["Đà Nẵng", "Da Nang", "Danang", "Cần Thơ", "Can Tho"]
        city_cities = [
            "Hà Nội",
            "Ha Noi",
            "Hanoi",
            "TP. Hồ Chí Minh",
            "Hồ Chí Minh",
            "Ho Chi Minh",
            "HCM",
        ]

        updated_count = 0

        def map_city_to_image(city: str) -> str:
            if not city:
                return "/hotels/hotel_city_luxury.png"
            for c in beach_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_beach_resort.png"
            for c in island_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_island_villa.png"
            for c in mountain_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_mountain_resort.png"
            for c in heritage_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_heritage.png"
            for c in bay_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_bay_view.png"
            for c in highland_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_dalat_french.png"
            for c in riverside_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_riverside.png"
            for c in city_cities:
                if c.lower() in city.lower():
                    return "/hotels/hotel_city_luxury.png"
            return "/hotels/hotel_city_luxury.png"

        hotels = db.query(Hotel).all()
        for hotel in hotels:
            new_img = map_city_to_image(hotel.city)
            hotel.images = [new_img]
            updated_count += 1

        rooms = db.query(Room).all()
        for room in rooms:
            if "Suite" in room.room_type or "Suite" in room.name:
                room.images = ["/rooms/suite_room.png"]
            elif "Deluxe" in room.room_type or "Deluxe" in room.name:
                room.images = ["/rooms/deluxe_room.png"]
            elif "Superior" in room.room_type or "Superior" in room.name:
                room.images = ["/rooms/superior_room.png"]
            else:
                room.images = ["/rooms/standard_room.png"]

        db.commit()
        return {
            "status": "success",
            "message": f"Updated {updated_count} hotels and {len(rooms)} rooms with default internal images.",
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


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

        def get_hotel_image(city_name: str) -> str:
            city_l = city_name.lower()
            if any(
                c in city_l
                for c in [
                    "nha trang",
                    "vũng tàu",
                    "vung tau",
                    "phan thiết",
                    "phan thiet",
                    "mũi né",
                    "mui ne",
                    "quy nhơn",
                    "quy nhon",
                ]
            ):
                return "/hotels/hotel_beach_resort.png"
            elif any(
                c in city_l for c in ["phú quốc", "phu quoc", "côn đảo", "con dao"]
            ):
                return "/hotels/hotel_island_villa.png"
            elif any(c in city_l for c in ["sa pa", "sapa"]):
                return "/hotels/hotel_mountain_resort.png"
            elif any(c in city_l for c in ["hội an", "hoi an", "huế", "hue"]):
                return "/hotels/hotel_heritage.png"
            elif any(c in city_l for c in ["hạ long", "ha long"]):
                return "/hotels/hotel_bay_view.png"
            elif any(c in city_l for c in ["đà lạt", "da lat"]):
                return "/hotels/hotel_dalat_french.png"
            elif any(c in city_l for c in ["đà nẵng", "da nang", "cần thơ", "can tho"]):
                return "/hotels/hotel_riverside.png"
            else:
                return "/hotels/hotel_city_luxury.png"

        room_image_map = {
            "Standard": "/rooms/standard_room.png",
            "Superior": "/rooms/superior_room.png",
            "Deluxe": "/rooms/deluxe_room.png",
            "Suite": "/rooms/suite_room.png",
        }

        for dest in data["destinations"]:
            city_name = dest["name"]
            hotels_in_city = dest["hotels"]

            for h_data in hotels_in_city:
                # Create Hotel
                hotel_img = get_hotel_image(city_name)
                images_list = [hotel_img]

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
                        images=[room_image_map.get(room_info["type"], hotel_img)],
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
