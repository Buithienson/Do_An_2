"""
Script để seed dữ liệu mẫu vào database
Chạy: python seed.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.models import User, Hotel, Room, Booking
from app.utils import hash_password
from datetime import datetime, timedelta


def seed_database():
    """
    Seed database với dữ liệu mẫu đầy đủ cho Agoda-like system:
    - Admin & Regular users
    - Hotels với rooms
    - Sample bookings
    """

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("[!] Database already has data. Skipping seed...")
            return

        print("[*] Starting database seeding...")

        # ============= Seed Users =============
        admin_user = User(
            email="admin@aibooking.com",
            full_name="Admin User",
            phone="+84901234567",
            hashed_password=hash_password("admin123"),
            role="admin",
            email_verified=True,
        )
        db.add(admin_user)

        regular_user = User(
            email="user@example.com",
            full_name="John Doe",
            phone="+84912345678",
            hashed_password=hash_password("user123"),
            role="user",
            email_verified=True,
        )
        db.add(regular_user)
        db.flush()  # Get IDs

        print(" Created 2 users (admin & regular)")

        # ============= Seed Hotels =============
        hotels_data = [
            {
                "name": "JW Marriott Phu Quoc Emerald Bay Resort & Spa",
                "description": "Khu nghỉ dưỡng 5 sao sang trọng bên bãi Khem tuyệt đẹp với kiến trúc Pháp cổ điển độc đáo. Trải nghiệm đẳng cấp thế giới tại thiên đường nhiệt đới.",
                "address": "Bãi Khem, An Thới",
                "city": "Phú Quốc",
                "country": "Vietnam",
                "latitude": 10.1632,
                "longitude": 103.9742,
                "star_rating": 5,
                "images": [
                    "/hotels/jw_marriott_phuquoc.png",
                ],
                "amenities": [
                    "Private Beach",
                    "Spa",
                    "Fine Dining",
                    "Infinity Pool",
                    "Kids Club",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 24 hours before check-in",
                },
            },
            {
                "name": "Sheraton Saigon Grand Opera Hotel",
                "description": "Khách sạn hạng sang tại trung tâm Quận 1, gần Nhà hát Thành phố. View toàn cảnh Sài Gòn về đêm từ rooftop bar.",
                "address": "26 Lê Thánh Tôn, Quận 1",
                "city": "Hồ Chí Minh",
                "country": "Vietnam",
                "latitude": 10.7769,
                "longitude": 106.7009,
                "star_rating": 5,
                "images": [
                    "/hotels/sheraton_saigon.png",
                ],
                "amenities": [
                    "Rooftop Bar",
                    "Pool",
                    "Gym",
                    "Business Center",
                    "Restaurant",
                ],
                "policies": {
                    "check_in": "15:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 48 hours before check-in",
                },
            },
            {
                "name": "Renaissance Riverside Hotel Da Nang",
                "description": "Khách sạn 4 sao bên bờ sông Hàn thơ mộng, gần biển Mỹ Khê và các điểm du lịch nổi tiếng.",
                "address": "182 Bạch Đằng, Hải Châu",
                "city": "Đà Nẵng",
                "country": "Vietnam",
                "latitude": 16.0544,
                "longitude": 108.2272,
                "star_rating": 4,
                "images": [
                    "/hotels/renaissance_danang.png",
                ],
                "amenities": ["River View", "Pool", "Restaurant", "Free WiFi"],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "11:00",
                    "cancellation": "Non-refundable",
                },
            },
            {
                "name": "Vinpearl Resort Nha Trang",
                "description": "Resort 5 sao trên đảo Hòn Tre với bãi biển riêng, công viên nước VinWonders và cáp treo vượt biển.",
                "address": "Hòn Tre Island",
                "city": "Nha Trang",
                "country": "Vietnam",
                "latitude": 12.2163,
                "longitude": 109.1857,
                "star_rating": 5,
                "images": [
                    "/hotels/vinpearl_nhatrang.png",
                ],
                "amenities": [
                    "Private Beach",
                    "Water Park",
                    "Spa",
                    "All-Inclusive",
                    "Cable Car",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 72 hours before check-in",
                },
            },
            {
                "name": "Sofitel Legend Metropole Hanoi",
                "description": "Khach san huyen thoai 5 sao voi kien truc Phap co dien tu nam 1901. Trai nghiem lich su va sang trong tai pho co Ha Noi.",
                "address": "15 Ngo Quyen, Hoan Kiem",
                "city": "Ha Noi",
                "country": "Vietnam",
                "latitude": 21.0245,
                "longitude": 105.8544,
                "star_rating": 5,
                "images": [
                    "/hotels/hotel_hanoi.png",
                ],
                "amenities": [
                    "Historic Building",
                    "Spa",
                    "Fine Dining",
                    "Pool",
                    "Garden",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 24 hours before check-in",
                },
            },
            {
                "name": "Anantara Hoi An Resort",
                "description": "Resort boutique 5 sao ben song Thu Bon, mang dam net van hoa pho co Hoi An voi den long lung linh.",
                "address": "1 Pham Hong Thai, Cam Chau",
                "city": "Hoi An",
                "country": "Vietnam",
                "latitude": 15.8794,
                "longitude": 108.3350,
                "star_rating": 5,
                "images": [
                    "/hotels/hotel_hoian.png",
                ],
                "amenities": [
                    "River View",
                    "Spa",
                    "Cooking Class",
                    "Bicycle",
                    "Restaurant",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 48 hours before check-in",
                },
            },
            {
                "name": "Dalat Palace Heritage Hotel",
                "description": "Khach san kieu Phap co dien tren doi thong, view ho Xuan Huong. Kien truc chateau lang man giua thanh pho nghin hoa.",
                "address": "2 Tran Phu, Phuong 3",
                "city": "Da Lat",
                "country": "Vietnam",
                "latitude": 11.9406,
                "longitude": 108.4370,
                "star_rating": 5,
                "images": [
                    "/hotels/hotel_dalat.png",
                ],
                "amenities": [
                    "Lake View",
                    "Garden",
                    "Golf Course",
                    "Spa",
                    "Fine Dining",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 24 hours before check-in",
                },
            },
            {
                "name": "Hotel de la Coupole MGallery Sapa",
                "description": "Khach san 5 sao voi kien truc French Indochine, view ruong bac thang va dinh Fansipan hung vi.",
                "address": "Hoang Lien, Sapa Town",
                "city": "Sapa",
                "country": "Vietnam",
                "latitude": 22.3363,
                "longitude": 103.8438,
                "star_rating": 5,
                "images": [
                    "/hotels/hotel_sapa.png",
                ],
                "amenities": [
                    "Mountain View",
                    "Infinity Pool",
                    "Spa",
                    "Trekking Tour",
                    "Restaurant",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 48 hours before check-in",
                },
            },
            {
                "name": "Vinpearl Resort Ha Long",
                "description": "Resort 5 sao view vinh Ha Long - Di san UNESCO. Ho boi vo cuc nhin ra hang ngan dao da voi hung vi.",
                "address": "Reu Island, Ha Long Bay",
                "city": "Ha Long",
                "country": "Vietnam",
                "latitude": 20.9101,
                "longitude": 107.1839,
                "star_rating": 5,
                "images": [
                    "/hotels/hotel_halong.png",
                ],
                "amenities": [
                    "Bay View",
                    "Private Beach",
                    "Infinity Pool",
                    "Water Sports",
                    "Cruise Tour",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 72 hours before check-in",
                },
            },
        ]

        hotels = []
        for hotel_data in hotels_data:
            hotel = Hotel(**hotel_data)
            db.add(hotel)
            hotels.append(hotel)

        db.flush()  # Get hotel IDs
        print(f"[+] Created {len(hotels)} hotels")

        # ============= Seed Rooms =============
        rooms_data = [
            # JW Marriott Phu Quoc Rooms
            {
                "hotel": hotels[0],
                "name": "Deluxe Room Ocean View",
                "room_type": "Deluxe",
                "max_guests": 2,
                "size": 45,
                "bed_type": "King",
                "base_price": 5500000,
                "images": ["/rooms/deluxe_ocean_view_1769786499296.png"],
                "amenities": ["Ocean View", "Balcony", "Mini Bar"],
            },
            {
                "hotel": hotels[0],
                "name": "Ocean Suite",
                "room_type": "Suite",
                "max_guests": 4,
                "size": 85,
                "bed_type": "King + Sofa Bed",
                "base_price": 12000000,
                "images": ["/rooms/ocean_suite_1769786517001.png"],
                "amenities": ["Ocean View", "Living Room", "Bathtub"],
            },
            # Sheraton Saigon Rooms
            {
                "hotel": hotels[1],
                "name": "Superior City View",
                "room_type": "Superior",
                "max_guests": 2,
                "size": 32,
                "bed_type": "Queen",
                "base_price": 2800000,
                "images": ["/rooms/superior_city_view_1769786533906.png"],
                "amenities": ["City View", "Work Desk", "Free WiFi"],
            },
            {
                "hotel": hotels[1],
                "name": "Executive Suite",
                "room_type": "Suite",
                "max_guests": 3,
                "size": 65,
                "bed_type": "King",
                "base_price": 5500000,
                "images": ["/rooms/executive_suite_1769786549773.png"],
                "amenities": ["Lounge Access", "City View", "Separate Living Room"],
            },
            # Renaissance Da Nang Rooms
            {
                "hotel": hotels[2],
                "name": "Deluxe River View",
                "room_type": "Deluxe",
                "max_guests": 2,
                "size": 38,
                "bed_type": "King",
                "base_price": 1800000,
                "images": ["/rooms/deluxe_river_view_1769786577151.png"],
                "amenities": ["River View", "Balcony", "Rainfall Shower"],
            },
            {
                "hotel": hotels[2],
                "name": "Family Room",
                "room_type": "Family",
                "max_guests": 4,
                "size": 55,
                "bed_type": "2 Queens",
                "base_price": 2900000,
                "images": ["/rooms/family_room_1769786596501.png"],
                "amenities": ["Connecting Rooms", "2 Bathrooms"],
            },
            # Vinpearl Nha Trang Rooms
            {
                "hotel": hotels[3],
                "name": "Deluxe Garden View",
                "room_type": "Deluxe",
                "max_guests": 2,
                "size": 42,
                "bed_type": "King",
                "base_price": 3200000,
                "images": ["/rooms/deluxe_garden_view_1769786613988.png"],
                "amenities": ["Garden View", "Balcony", "Bathtub"],
            },
            {
                "hotel": hotels[3],
                "name": "Beach Villa",
                "room_type": "Villa",
                "max_guests": 6,
                "size": 120,
                "bed_type": "2 Kings",
                "base_price": 15000000,
                "images": ["/rooms/beach_villa_1769786630195.png"],
                "amenities": [
                    "Private Pool",
                    "Beach Access",
                    "Butler Service",
                    "2 Bedrooms",
                ],
            },
        ]

        rooms = []
        for room_data in rooms_data:
            room = Room(
                hotel_id=room_data["hotel"].id,
                name=room_data["name"],
                description=f"Phòng {room_data['room_type']} tại {room_data['hotel'].name}",
                room_type=room_data["room_type"],
                max_guests=room_data["max_guests"],
                size=room_data["size"],
                bed_type=room_data["bed_type"],
                base_price=room_data["base_price"],
                images=room_data["images"],
                amenities=room_data["amenities"],
            )
            db.add(room)
            rooms.append(room)

        db.flush()
        print(f"[+] Created {len(rooms)} rooms")

        # ============= Seed Sample Bookings =============
        bookings_data = [
            {
                "user_id": regular_user.id,
                "hotel_id": hotels[0].id,
                "room_id": rooms[0].id,
                "check_in_date": datetime.now() + timedelta(days=30),
                "check_out_date": datetime.now() + timedelta(days=33),
                "guests": 2,
                "total_price": rooms[0].base_price * 3,
                "status": "confirmed",
                "payment_status": "paid",
                "payment_method": "credit_card",
            }
        ]

        for booking_data in bookings_data:
            booking = Booking(**booking_data)
            db.add(booking)

        print(f"[+] Created {len(bookings_data)} sample bookings")

        # Commit all changes
        db.commit()

        print("\n[OK] Database seeded successfully!")
        print("\n Summary:")
        print(f"   - Users: {db.query(User).count()}")
        print(f"   - Hotels: {db.query(Hotel).count()}")
        print(f"   - Rooms: {db.query(Room).count()}")
        print(f"   - Bookings: {db.query(Booking).count()}")

        print("\n Login Credentials:")
        print("   Admin - Email: admin@aibooking.com | Password: admin123")
        print("   User  - Email: user@example.com | Password: user123")
        print("\n API Docs: http://localhost:8000/docs")

    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
