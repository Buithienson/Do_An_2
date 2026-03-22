"""
Endpoint to seed database for deployed backend
Visit: https://your-backend-url.onrender.com/seed-db
"""

import os
import random
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Header, Query, status
from app.database import SessionLocal, Base, engine
from app.models import User, Hotel, Room, Booking, Review
from app.utils import hash_password
import json
from pathlib import Path

router = APIRouter()


VIRTUAL_REVIEWER_NAMES = [
    "Nguyen Minh Anh",
    "Tran Quoc Bao",
    "Le Thu Ha",
    "Pham Gia Huy",
    "Doan Ngoc Lan",
    "Vu Tien Dat",
    "Bui Thanh Nhan",
    "Hoang Kim Oanh",
    "Dang Phuong Linh",
    "Duong Hoai Nam",
    "Ngo Thu Trang",
    "Ly Quang Vinh",
    "Trinh Bao Chau",
    "Nguyen Huu Phuc",
    "Phan Nhat Minh",
    "Cao Thao Vy",
    "Vo Duc Manh",
    "Mai My Duyen",
    "Ta Thanh Tung",
    "Huynh An Nhi",
    "Nguyen Bao Khang",
    "Tran Thu Quynh",
    "Le Trung Kien",
    "Pham Anh Thu",
    "Dang Quoc Viet",
    "Do Thi Yen",
    "Vu Quynh Hoa",
    "Bui Minh Tri",
    "Hoang Thanh Tam",
    "Ngo Xuan Bac",
]

POSITIVE_REVIEW_SNIPPETS = [
    "Nhan vien than thien, ho tro rat nhiet tinh.",
    "Phong sach se, tien nghi day du va hien dai.",
    "Vi tri tot, di chuyen ra trung tam rat tien.",
    "Bua sang ngon, thuc don da dang.",
    "View dep, khong gian yen tinh de nghi duong.",
    "Gia hop ly so voi chat luong dich vu.",
]

MIXED_REVIEW_SNIPPETS = [
    "Phong kha on, vi tri tien loi nhung cach am chua tot.",
    "Nhan vien lich su, tuy nhien wifi doi luc yeu.",
    "Do an ngon nhung phong hoi nho vao gio cao diem.",
    "Tong the hai long, co mot vai thiet bi hoi cu.",
]

NEGATIVE_REVIEW_SNIPPETS = [
    "Phong hoi cu, co mui nhe va can cai thien ve sinh.",
    "Wifi yeu va khong on dinh vao buoi toi.",
    "Cach am kem, de bi on vao ban dem.",
    "Gia hoi cao so voi trai nghiem nhan duoc.",
]


def _build_virtual_comment(bucket: str, hotel_name: str, city: str) -> str:
    if bucket == "positive":
        pick = random.sample(POSITIVE_REVIEW_SNIPPETS, k=2)
    elif bucket == "mixed":
        pick = random.sample(MIXED_REVIEW_SNIPPETS, k=1) + random.sample(
            POSITIVE_REVIEW_SNIPPETS, k=1
        )
    else:
        pick = random.sample(NEGATIVE_REVIEW_SNIPPETS, k=2)

    return f"Khach san {hotel_name} tai {city}. " + " ".join(pick)


def _build_rating_breakdown(overall: float) -> dict:
    def _clamp(score: float) -> float:
        return max(1.0, min(10.0, round(score, 1)))

    return {
        "cleanliness": _clamp(overall + random.uniform(-1.0, 0.8)),
        "location": _clamp(overall + random.uniform(-0.8, 1.0)),
        "service": _clamp(overall + random.uniform(-0.8, 1.0)),
        "value": _clamp(overall + random.uniform(-1.2, 0.8)),
    }


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


@router.api_route("/seed/reviews", methods=["GET", "POST"])
async def seed_virtual_reviews_endpoint(
    reviewers_per_hotel: int = Query(30, ge=1, le=100),
    reset_existing: bool = Query(False),
    x_seed_token: Optional[str] = Header(default=None, alias="X-Seed-Token"),
):
    """
    Seed danh gia ao cho tat ca khach san.

    - Tao toi da `reviewers_per_hotel` user ao (mac dinh: 30)
    - Moi user ao se review moi khach san toi da 1 lan
    - Co phan bo review tich cuc / trung lap / tieu cuc de AI tom tat du du lieu khen-che
    - Idempotent: goi lai se khong tao trung cap (tru khi reset_existing=true)
    """
    _authorize_seed_endpoint(x_seed_token)

    db = SessionLocal()
    try:
        hotels = db.query(Hotel).all()
        if not hotels:
            raise HTTPException(status_code=404, detail="No hotels found")

        reviewers_per_hotel = min(reviewers_per_hotel, len(VIRTUAL_REVIEWER_NAMES))

        emails = [
            f"virtual.reviewer.{idx + 1:03d}@aibooking.local"
            for idx in range(reviewers_per_hotel)
        ]

        existing_virtual_users = (
            db.query(User).filter(User.email.in_(emails)).all()
        )
        user_by_email = {u.email: u for u in existing_virtual_users}

        created_users = 0
        default_password_hash = hash_password("virtual123")

        for idx, email in enumerate(emails):
            if email in user_by_email:
                continue

            user = User(
                email=email,
                full_name=VIRTUAL_REVIEWER_NAMES[idx],
                phone=None,
                hashed_password=default_password_hash,
                role="user",
                email_verified=True,
            )
            db.add(user)
            user_by_email[email] = user
            created_users += 1

        if created_users > 0:
            db.flush()

        virtual_users = [user_by_email[email] for email in emails]
        virtual_user_ids = [u.id for u in virtual_users]

        deleted_reviews = 0
        if reset_existing and virtual_user_ids:
            deleted_reviews = (
                db.query(Review)
                .filter(Review.user_id.in_(virtual_user_ids))
                .delete(synchronize_session=False)
            )
            db.flush()

        existing_pairs = set()
        if virtual_user_ids:
            rows = (
                db.query(Review.hotel_id, Review.user_id)
                .filter(Review.user_id.in_(virtual_user_ids))
                .all()
            )
            existing_pairs = {(hotel_id, user_id) for hotel_id, user_id in rows}

        created_reviews = 0
        now = datetime.utcnow()

        for hotel in hotels:
            for idx, user in enumerate(virtual_users):
                pair = (hotel.id, user.id)
                if pair in existing_pairs:
                    continue

                bucket_idx = idx % 10
                if bucket_idx <= 1:
                    bucket = "negative"
                    overall = round(random.uniform(3.5, 5.9), 1)
                elif bucket_idx <= 3:
                    bucket = "mixed"
                    overall = round(random.uniform(6.0, 7.7), 1)
                else:
                    bucket = "positive"
                    overall = round(random.uniform(8.0, 9.8), 1)

                review = Review(
                    user_id=user.id,
                    hotel_id=hotel.id,
                    booking_id=None,
                    overall_rating=overall,
                    ratings=_build_rating_breakdown(overall),
                    comment=_build_virtual_comment(bucket, hotel.name, hotel.city),
                    created_at=now - timedelta(days=random.randint(1, 240)),
                )
                db.add(review)
                created_reviews += 1

        db.commit()

        total_reviews = db.query(Review).count()
        return {
            "status": "success",
            "message": "Virtual reviews seeded successfully",
            "reviewers_per_hotel": reviewers_per_hotel,
            "hotels": len(hotels),
            "virtual_users_created": created_users,
            "virtual_users_total_used": len(virtual_users),
            "reviews_created": created_reviews,
            "reviews_deleted": deleted_reviews,
            "total_reviews_in_db": total_reviews,
            "note": "Call with reset_existing=true to regenerate all virtual reviews.",
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


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
