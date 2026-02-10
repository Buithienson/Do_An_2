"""
Script de them khach san moi vao database
Chay: python add_new_hotels.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.models import Hotel


def add_new_hotels():
    """
    Them cac khach san moi cho cac thanh pho con thieu
    """
    db = SessionLocal()

    try:
        # Danh sach khach san moi
        new_hotels = [
            {
                "name": "Sofitel Legend Metropole Hanoi",
                "description": "Khach san huyen thoai 5 sao voi kien truc Phap co dien tu nam 1901. Trai nghiem lich su va sang trong tai pho co Ha Noi.",
                "address": "15 Ngo Quyen, Hoan Kiem",
                "city": "Ha Noi",
                "country": "Vietnam",
                "latitude": 21.0245,
                "longitude": 105.8544,
                "star_rating": 5,
                "images": ["/hotels/hotel_hanoi.png"],
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
                "images": ["/hotels/hotel_hoian.png"],
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
                "images": ["/hotels/hotel_dalat.png"],
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
                "images": ["/hotels/hotel_sapa.png"],
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
                "images": ["/hotels/hotel_halong.png"],
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
            {
                "name": "InterContinental Phu Quoc Long Beach Resort",
                "description": "Resort 5 sao voi ho boi vo cuc huong bien, villa sang trong va hoang hon tuyet dep.",
                "address": "Long Beach, Duong To",
                "city": "Phu Quoc",
                "country": "Vietnam",
                "latitude": 10.2899,
                "longitude": 103.8570,
                "star_rating": 5,
                "images": ["/hotels/hotel_phuquoc.png"],
                "amenities": [
                    "Private Beach",
                    "Infinity Pool",
                    "Spa",
                    "Water Sports",
                    "Fine Dining",
                ],
                "policies": {
                    "check_in": "14:00",
                    "check_out": "12:00",
                    "cancellation": "Free cancellation up to 48 hours before check-in",
                },
            },
        ]

        added_count = 0
        for hotel_data in new_hotels:
            # Check if hotel already exists
            existing = db.query(Hotel).filter(Hotel.name == hotel_data["name"]).first()
            if not existing:
                hotel = Hotel(**hotel_data)
                db.add(hotel)
                print(f"Added: {hotel_data['name']} ({hotel_data['city']})")
                added_count += 1
            else:
                print(f"Exists: {hotel_data['name']}")

        db.commit()
        print(f"\n[OK] Added {added_count} new hotels!")

        # Show total hotels
        total = db.query(Hotel).count()
        print(f"Total hotels in database: {total}")

    except Exception as e:
        print(f"[ERROR] Error adding hotels: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    add_new_hotels()
