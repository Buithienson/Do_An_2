"""
Endpoint to seed database for deployed backend
Visit: https://your-backend-url.onrender.com/seed-db
"""

import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status
from app.database import SessionLocal, Base, engine
from app.models import User, Hotel, Room, Booking, Review
from app.utils import hash_password
import json
from pathlib import Path

router = APIRouter()


def _is_production_env() -> bool:
    env = os.environ.get("ENVIRONMENT", os.environ.get("ENV", "")).lower()
    return bool(os.environ.get("RENDER")) or env in {"prod", "production"}


def _authorize_seed_endpoint(token: Optional[str]) -> None:
    expected = os.environ.get("SEED_ADMIN_TOKEN", "")

    if _is_production_env() and not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SEED_ADMIN_TOKEN is not configured",
        )

    if expected and token != expected:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


@router.api_route("/fix-images", methods=["GET", "POST"])
async def fix_images_endpoint(
    x_seed_token: Optional[str] = Header(default=None, alias="X-Seed-Token")
):
    """Fix existing broken image URLs in the database"""
    _authorize_seed_endpoint(x_seed_token)

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
async def update_all_images_endpoint(
    x_seed_token: Optional[str] = Header(default=None, alias="X-Seed-Token")
):
    """Update all hotels with correct default images based on city"""
    _authorize_seed_endpoint(x_seed_token)

    db = SessionLocal()
    try:
        HOTEL_IMAGES = [
            "/hotels/hotel_bay_view.png",
            "/hotels/hotel_beach_resort.png",
            "/hotels/hotel_city_luxury.png",
            "/hotels/hotel_dalat.png",
            "/hotels/hotel_dalat_french.png",
            "/hotels/hotel_halong.png",
            "/hotels/hotel_hanoi.png",
            "/hotels/hotel_heritage.png",
            "/hotels/hotel_hoian.png",
            "/hotels/hotel_island_villa.png",
            "/hotels/hotel_mountain_resort.png",
            "/hotels/hotel_phuquoc.png",
            "/hotels/hotel_riverside.png",
            "/hotels/hotel_sapa.png",
            "/hotels/jw_marriott_phuquoc.png",
            "/hotels/renaissance_danang.png",
            "/hotels/sheraton_saigon.png",
            "/hotels/vinpearl_nhatrang.png"
        ]

        ROOM_IMAGES = [
            "/rooms/beach_villa_1769786630195.png",
            "/rooms/deluxe_garden_view_1769786613988.png",
            "/rooms/deluxe_ocean_view_1769786499296.png",
            "/rooms/deluxe_river_view_1769786577151.png",
            "/rooms/deluxe_room.png",
            "/rooms/executive_suite_1769786549773.png",
            "/rooms/family_room_1769786596501.png",
            "/rooms/hanoi_colonial_suite.png",
            "/rooms/hanoi_deluxe_garden.png",
            "/rooms/hoian_riverside_suite.png",
            "/rooms/ocean_suite_1769786517001.png",
            "/rooms/standard_room.png",
            "/rooms/suite_room.png",
            "/rooms/superior_city_view_1769786533906.png",
            "/rooms/superior_room.png"
        ]

        # Use an index that we increment to ensure non-duplication instead of hotel.id which might gap
        updated_count = 0

        hotels = db.query(Hotel).all()
        for idx, hotel in enumerate(hotels):
            new_img = HOTEL_IMAGES[idx % len(HOTEL_IMAGES)]
            hotel.images = [new_img]
            updated_count += 1

        rooms = db.query(Room).all()
        for idx, room in enumerate(rooms):
            new_img = ROOM_IMAGES[idx % len(ROOM_IMAGES)]
            room.images = [new_img]

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
async def seed_database_endpoint(
    x_seed_token: Optional[str] = Header(default=None, alias="X-Seed-Token")
):
    """
    Seed database with FULL DATA for production
    This endpoint will CLEAR existing data and reload from vietnam_hotels.json
    """
    _authorize_seed_endpoint(x_seed_token)

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

        HOTEL_IMAGES = [
            "/hotels/hotel_bay_view.png",
            "/hotels/hotel_beach_resort.png",
            "/hotels/hotel_city_luxury.png",
            "/hotels/hotel_dalat.png",
            "/hotels/hotel_dalat_french.png",
            "/hotels/hotel_halong.png",
            "/hotels/hotel_hanoi.png",
            "/hotels/hotel_heritage.png",
            "/hotels/hotel_hoian.png",
            "/hotels/hotel_island_villa.png",
            "/hotels/hotel_mountain_resort.png",
            "/hotels/hotel_phuquoc.png",
            "/hotels/hotel_riverside.png",
            "/hotels/hotel_sapa.png",
            "/hotels/jw_marriott_phuquoc.png",
            "/hotels/renaissance_danang.png",
            "/hotels/sheraton_saigon.png",
            "/hotels/vinpearl_nhatrang.png"
        ]

        ROOM_IMAGES = [
            "/rooms/beach_villa_1769786630195.png",
            "/rooms/deluxe_garden_view_1769786613988.png",
            "/rooms/deluxe_ocean_view_1769786499296.png",
            "/rooms/deluxe_river_view_1769786577151.png",
            "/rooms/deluxe_room.png",
            "/rooms/executive_suite_1769786549773.png",
            "/rooms/family_room_1769786596501.png",
            "/rooms/hanoi_colonial_suite.png",
            "/rooms/hanoi_deluxe_garden.png",
            "/rooms/hoian_riverside_suite.png",
            "/rooms/ocean_suite_1769786517001.png",
            "/rooms/standard_room.png",
            "/rooms/suite_room.png",
            "/rooms/superior_city_view_1769786533906.png",
            "/rooms/superior_room.png"
        ]

        for dest in data["destinations"]:
            city_name = dest["name"]
            hotels_in_city = dest["hotels"]

            for h_data in hotels_in_city:
                # Create Hotel
                hotel_img = HOTEL_IMAGES[total_hotels % len(HOTEL_IMAGES)]
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
                        images=[ROOM_IMAGES[total_rooms % len(ROOM_IMAGES)]],
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


# ── Seed Reviews ──────────────────────────────────────────────────────────────

SEED_REVIEWS = [
    # --- Tích cực ---
    (8.5, "Phòng sạch sẽ, nhân viên rất thân thiện và chu đáo. Vị trí trung tâm rất tiện lợi."),
    (9.0, "Khách sạn tuyệt vời! View đẹp, bữa sáng ngon. Sẽ quay lại lần sau."),
    (8.0, "Nhân viên nhiệt tình, phòng rộng và sạch. Tiện nghi đầy đủ, rất hài lòng."),
    (9.5, "Xuất sắc! Phục vụ chuyên nghiệp, phòng sang trọng và hiện đại. Đáng đồng tiền."),
    (7.5, "Vị trí gần biển, ăn sáng ngon. Tôi khá hài lòng với chuyến đi này."),
    (8.5, "Phòng ấm cúng, view đẹp nhìn ra phố. Nhân viên thân thiện và biết nói tiếng Anh."),
    (8.0, "Thoải mái, sạch sẽ, giá hợp lý. Bữa sáng đa dạng và ngon."),
    (9.0, "Khách sạn sang trọng, dịch vụ xuất sắc. Hồ bơi đẹp, nhà hàng ngon."),
    (7.0, "Phòng ổn, nhân viên thân thiện. Vị trí tốt gần trung tâm mua sắm."),
    (8.5, "Rất thích! Phòng sạch, view đẹp, tiện nghi tốt. Nhân viên chu đáo hết mức."),
    (9.0, "Phòng rộng, sạch, view biển cực đẹp. Dịch vụ tuyệt vời, nhân viên thân thiện."),
    (7.5, "Khách sạn hiện đại, thoải mái. Bữa sáng phong phú. Vị trí tiện lợi."),
    (8.0, "Phòng sạch sẽ, có đầy đủ tiện nghi. Nhân viên nhiệt tình giúp đỡ."),
    (9.5, "Tuyệt vời! Phòng Suite rộng, view đẹp. Bữa sáng ngon nhất từ trước đến nay."),
    (8.0, "Yên tĩnh, thoải mái. Vị trí gần biển. Nhân viên rất chu đáo và thân thiện."),
    # --- Trung hòa / Phàn nàn nhỏ ---
    (6.5, "Phòng sạch nhưng hơi nhỏ. Wifi thỉnh thoảng chập chờn. Nhân viên ổn."),
    (6.0, "Vị trí tốt nhưng phòng hơi cũ. Tiếng ồn từ ngoài đường vào hơi lớn."),
    (5.5, "Không hài lòng lắm. Wifi yếu, phòng nhỏ. Cần cải thiện thêm."),
    (7.0, "Khách sạn ổn, nhưng hơi đắt so với chất lượng. Ăn sáng bình thường."),
    (6.5, "Nhân viên thân thiện nhưng phòng chưa thực sự sạch sẽ. Sẽ cân nhắc lần sau."),
    (6.0, "Tiện nghi cơ bản, phòng hơi chật. Cách âm kém, ngủ không được vì tiếng ồn."),
    (5.0, "Thất vọng với dịch vụ. Wifi yếu, điều hòa không lạnh. Giá cao không xứng."),
    (7.0, "Vị trí trung tâm, nhưng phòng hơi cũ kỹ. Bữa sáng khá ổn."),
    (6.5, "Nhân viên nhiệt tình nhưng phòng nhỏ hơn ảnh. Tổng thể ổn."),
    (7.5, "Hài lòng với dịch vụ. Vị trí tốt, nhưng bãi đỗ xe hơi khó."),
]

import random


@router.api_route("/seed/reviews", methods=["GET", "POST"])
async def seed_reviews_endpoint(
    x_seed_token: Optional[str] = Header(default=None, alias="X-Seed-Token")
):
    """
    Seed fake reviews cho tất cả khách sạn trong DB.
    Idempotent: bỏ qua nếu đã có review từ seed user.
    """
    _authorize_seed_endpoint(x_seed_token)

    db = SessionLocal()
    try:
        # Tạo / tìm seed user
        seed_email = "seed.reviewer@aibooking.com"
        seed_user = db.query(User).filter(User.email == seed_email).first()
        if not seed_user:
            seed_user = User(
                email=seed_email,
                full_name="Khách Du Lịch",
                hashed_password=hash_password("seedpass123"),
                role="user",
                email_verified=True,
            )
            db.add(seed_user)
            db.flush()

        hotels = db.query(Hotel).all()
        if not hotels:
            return {"status": "skipped", "message": "Không có khách sạn nào. Hãy seed hotels trước."}

        # Tạo thêm các fake user để reviews trông đa dạng hơn
        fake_users = []
        fake_names = [
            "Minh Tuấn", "Thu Hương", "Quốc Huy", "Lan Anh", "Đức Khải",
            "Phương Linh", "Văn Nam", "Bảo Châu", "Thế Anh", "Mỹ Linh",
        ]
        for name in fake_names:
            email = f"{name.lower().replace(' ', '.')}@gmail.com"
            fu = db.query(User).filter(User.email == email).first()
            if not fu:
                fu = User(
                    email=email,
                    full_name=name,
                    hashed_password=hash_password("fakepass123"),
                    role="user",
                    email_verified=True,
                )
                db.add(fu)
                db.flush()
            fake_users.append(fu)

        reviews_created = 0
        reviews_skipped = 0

        for hotel in hotels:
            # Kiểm tra đã có review chưa (idempotent)
            existing_count = db.query(Review).filter(Review.hotel_id == hotel.id).count()
            if existing_count >= 10:
                reviews_skipped += existing_count
                continue

            # Seed 15 reviews đa dạng từ nhiều user khác nhau
            selected = random.sample(SEED_REVIEWS, min(15, len(SEED_REVIEWS)))
            for i, (rating, comment) in enumerate(selected):
                reviewer = fake_users[i % len(fake_users)]
                # Tránh duplicate (cùng user + cùng hotel)
                dup = db.query(Review).filter(
                    Review.hotel_id == hotel.id,
                    Review.user_id == reviewer.id,
                ).first()
                if dup:
                    continue
                db_review = Review(
                    user_id=reviewer.id,
                    hotel_id=hotel.id,
                    overall_rating=rating,
                    comment=comment,
                    ratings={"cleanliness": rating - 0.5, "service": rating, "location": rating + 0.3},
                )
                db.add(db_review)
                reviews_created += 1

        db.commit()
        return {
            "status": "success",
            "reviews_created": reviews_created,
            "reviews_skipped": reviews_skipped,
            "hotels_processed": len(hotels),
        }
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Seed reviews failed: {str(e)}")
    finally:
        db.close()
