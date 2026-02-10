"""
Script de them phong cho cac khach san moi
Chay: python add_hotel_rooms.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel, Room


def add_hotel_rooms():
    """
    Them phong cho cac khach san moi chua co phong
    """
    db = SessionLocal()

    try:
        # Get hotels by city
        hotels = {
            "Ha Noi": db.query(Hotel).filter(Hotel.city == "Ha Noi").first(),
            "Hoi An": db.query(Hotel).filter(Hotel.city == "Hoi An").first(),
            "Da Lat": db.query(Hotel).filter(Hotel.city == "Da Lat").first(),
            "Sapa": db.query(Hotel).filter(Hotel.city == "Sapa").first(),
            "Ha Long": db.query(Hotel).filter(Hotel.city == "Ha Long").first(),
            "Phu Quoc IC": db.query(Hotel)
            .filter(Hotel.name.like("%InterContinental%"))
            .first(),
        }

        # Rooms data for each hotel
        rooms_to_add = []

        # Hà Nội - Sofitel Metropole
        if hotels["Ha Noi"]:
            rooms_to_add.extend(
                [
                    {
                        "hotel_id": hotels["Ha Noi"].id,
                        "name": "Colonial Heritage Suite",
                        "description": "Phong suite sang trong voi kien truc thuc dan Phap co dien",
                        "room_type": "Suite",
                        "max_guests": 2,
                        "size": 55,
                        "bed_type": "King",
                        "base_price": 4500000,
                        "images": ["/rooms/hanoi_colonial_suite.png"],
                        "amenities": [
                            "Historic Room",
                            "Garden View",
                            "Bathtub",
                            "Mini Bar",
                        ],
                    },
                    {
                        "hotel_id": hotels["Ha Noi"].id,
                        "name": "Deluxe Garden Room",
                        "description": "Phong deluxe view vuon nhiet doi",
                        "room_type": "Deluxe",
                        "max_guests": 2,
                        "size": 42,
                        "bed_type": "King",
                        "base_price": 3200000,
                        "images": ["/rooms/hanoi_deluxe_garden.png"],
                        "amenities": ["Garden View", "Balcony", "Work Desk"],
                    },
                ]
            )

        # Hội An - Anantara
        if hotels["Hoi An"]:
            rooms_to_add.extend(
                [
                    {
                        "hotel_id": hotels["Hoi An"].id,
                        "name": "Riverside Suite with Lanterns",
                        "description": "Suite view song Thu Bon voi den long truyen thong",
                        "room_type": "Suite",
                        "max_guests": 3,
                        "size": 65,
                        "bed_type": "King",
                        "base_price": 4200000,
                        "images": ["/rooms/hoian_riverside_suite.png"],
                        "amenities": [
                            "River View",
                            "Balcony",
                            "Living Room",
                            "Traditional Decor",
                        ],
                    },
                    {
                        "hotel_id": hotels["Hoi An"].id,
                        "name": "Deluxe River View",
                        "description": "Phong deluxe huong song",
                        "room_type": "Deluxe",
                        "max_guests": 2,
                        "size": 40,
                        "bed_type": "King",
                        "base_price": 2800000,
                        "images": ["/rooms/deluxe_river_view_1769786577151.png"],
                        "amenities": ["River View", "Balcony", "Free WiFi"],
                    },
                ]
            )

        # Đà Lạt - Dalat Palace
        if hotels["Da Lat"]:
            rooms_to_add.extend(
                [
                    {
                        "hotel_id": hotels["Da Lat"].id,
                        "name": "Palace Heritage Suite",
                        "description": "Suite kieu chateau Phap, view ho Xuan Huong",
                        "room_type": "Suite",
                        "max_guests": 2,
                        "size": 70,
                        "bed_type": "King",
                        "base_price": 3800000,
                        "images": ["/rooms/executive_suite_1769786549773.png"],
                        "amenities": [
                            "Lake View",
                            "Living Room",
                            "Bathtub",
                            "Fireplace",
                        ],
                    },
                    {
                        "hotel_id": hotels["Da Lat"].id,
                        "name": "Deluxe Lake View",
                        "description": "Phong deluxe view ho trong vuon hoa",
                        "room_type": "Deluxe",
                        "max_guests": 2,
                        "size": 38,
                        "bed_type": "Queen",
                        "base_price": 2500000,
                        "images": ["/rooms/superior_city_view_1769786533906.png"],
                        "amenities": ["Lake View", "Garden", "Balcony"],
                    },
                ]
            )

        # Sapa - Hotel de la Coupole
        if hotels["Sapa"]:
            rooms_to_add.extend(
                [
                    {
                        "hotel_id": hotels["Sapa"].id,
                        "name": "Mountain View Suite",
                        "description": "Suite view ruong bac thang va dinh Fansipan",
                        "room_type": "Suite",
                        "max_guests": 3,
                        "size": 60,
                        "bed_type": "King",
                        "base_price": 3500000,
                        "images": ["/rooms/deluxe_garden_view_1769786613988.png"],
                        "amenities": [
                            "Mountain View",
                            "Infinity Pool Access",
                            "Bathtub",
                        ],
                    },
                    {
                        "hotel_id": hotels["Sapa"].id,
                        "name": "Deluxe Terrace Room",
                        "description": "Phong deluxe voi san hien nhin ra doi thong",
                        "room_type": "Deluxe",
                        "max_guests": 2,
                        "size": 45,
                        "bed_type": "King",
                        "base_price": 2600000,
                        "images": ["/rooms/family_room_1769786596501.png"],
                        "amenities": ["Terrace", "Mountain View", "Fireplace"],
                    },
                ]
            )

        # Hạ Long - Vinpearl Ha Long
        if hotels["Ha Long"]:
            rooms_to_add.extend(
                [
                    {
                        "hotel_id": hotels["Ha Long"].id,
                        "name": "Bay View Suite",
                        "description": "Suite view vinh Ha Long hung vi",
                        "room_type": "Suite",
                        "max_guests": 3,
                        "size": 75,
                        "bed_type": "King + Sofa Bed",
                        "base_price": 5200000,
                        "images": ["/rooms/ocean_suite_1769786517001.png"],
                        "amenities": ["Bay View", "Living Room", "Balcony", "Bathtub"],
                    },
                    {
                        "hotel_id": hotels["Ha Long"].id,
                        "name": "Island Villa with Pool",
                        "description": "Villa ho boi rieng view vinh",
                        "room_type": "Villa",
                        "max_guests": 4,
                        "size": 120,
                        "bed_type": "2 Kings",
                        "base_price": 12000000,
                        "images": ["/rooms/beach_villa_1769786630195.png"],
                        "amenities": [
                            "Private Pool",
                            "Bay View",
                            "2 Bedrooms",
                            "Butler Service",
                        ],
                    },
                ]
            )

        # Phú Quốc - InterContinental
        if hotels["Phu Quoc IC"]:
            rooms_to_add.extend(
                [
                    {
                        "hotel_id": hotels["Phu Quoc IC"].id,
                        "name": "Beach Villa with Pool",
                        "description": "Villa bien voi ho boi rieng va hoang hon tuyet dep",
                        "room_type": "Villa",
                        "max_guests": 4,
                        "size": 110,
                        "bed_type": "King",
                        "base_price": 11500000,
                        "images": ["/rooms/beach_villa_1769786630195.png"],
                        "amenities": [
                            "Private Pool",
                            "Beach Access",
                            "Ocean View",
                            "Outdoor Shower",
                        ],
                    },
                    {
                        "hotel_id": hotels["Phu Quoc IC"].id,
                        "name": "Ocean Pool Suite",
                        "description": "Suite ho boi huong bien",
                        "room_type": "Suite",
                        "max_guests": 3,
                        "size": 85,
                        "bed_type": "King",
                        "base_price": 7800000,
                        "images": ["/rooms/deluxe_ocean_view_1769786499296.png"],
                        "amenities": [
                            "Ocean View",
                            "Pool Access",
                            "Living Room",
                            "Balcony",
                        ],
                    },
                ]
            )

        # Add all rooms
        added_count = 0
        for room_data in rooms_to_add:
            room = Room(**room_data)
            db.add(room)
            added_count += 1
            hotel_name = (
                db.query(Hotel).filter(Hotel.id == room_data["hotel_id"]).first().name
            )
            print(f"Added: {room_data['name']} at {hotel_name}")

        db.commit()
        print(f"\n[OK] Added {added_count} rooms successfully!")

        # Show summary
        all_hotels = db.query(Hotel).all()
        print("\n=== Hotels and Room Count ===")
        for hotel in all_hotels:
            room_count = db.query(Room).filter(Room.hotel_id == hotel.id).count()
            print(f"{hotel.name} ({hotel.city}): {room_count} rooms")

    except Exception as e:
        print(f"[ERROR] Error adding rooms: {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    add_hotel_rooms()
