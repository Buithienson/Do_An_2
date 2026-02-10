"""
Script để cập nhật hình ảnh cho tất cả khách sạn theo thành phố
Chạy: python update_hotel_images_full.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel


def update_hotel_images():
    """
    Cập nhật hình ảnh cho tất cả khách sạn dựa trên thành phố
    """
    db = SessionLocal()

    try:
        # Mapping cities to appropriate hotel images
        # Beach destinations
        beach_cities = ["Nha Trang", "Vũng Tàu", "Phan Thiết", "Mũi Né", "Quy Nhơn"]
        # Island destinations
        island_cities = ["Phú Quốc", "Côn Đảo"]
        # Mountain destinations
        mountain_cities = ["Sa Pa", "Sapa"]
        # Heritage/cultural destinations
        heritage_cities = ["Hội An", "Huế"]
        # Bay destinations
        bay_cities = ["Hạ Long", "Ha Long"]
        # Highland destinations
        highland_cities = ["Đà Lạt", "Da Lat"]
        # Riverside destinations
        riverside_cities = ["Đà Nẵng", "Da Nang", "Cần Thơ"]
        # City destinations
        city_cities = [
            "Hà Nội",
            "Ha Noi",
            "TP. Hồ Chí Minh",
            "Hồ Chí Minh",
            "Ninh Bình",
        ]

        print("[*] Updating hotel images...")

        updated_count = 0

        # Update beach hotels
        for city in beach_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_beach_resort.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> beach_resort")
                updated_count += result

        # Update island hotels
        for city in island_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_island_villa.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> island_villa")
                updated_count += result

        # Update mountain hotels
        for city in mountain_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_mountain_resort.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> mountain_resort")
                updated_count += result

        # Update heritage hotels
        for city in heritage_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_heritage.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> heritage")
                updated_count += result

        # Update bay hotels
        for city in bay_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_bay_view.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> bay_view")
                updated_count += result

        # Update highland hotels
        for city in highland_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_dalat_french.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> dalat_french")
                updated_count += result

        # Update riverside hotels
        for city in riverside_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_riverside.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> riverside")
                updated_count += result

        # Update city hotels
        for city in city_cities:
            result = (
                db.query(Hotel)
                .filter(Hotel.city == city)
                .update({"images": ["/hotels/hotel_city_luxury.png"]})
            )
            if result > 0:
                print(f"  [+] {city}: {result} hotels -> city_luxury")
                updated_count += result

        db.commit()

        # Check for any hotels without images
        remaining = (
            db.query(Hotel)
            .filter(
                (Hotel.images == None)
                | (Hotel.images == [])
                | (Hotel.images.like("%unsplash%"))
            )
            .all()
        )

        if remaining:
            print(
                f"\n[*] Updating {len(remaining)} remaining hotels with default image..."
            )
            for hotel in remaining:
                hotel.images = ["/hotels/hotel_city_luxury.png"]
                updated_count += 1
            db.commit()

        print(f"\n[SUCCESS] Updated {updated_count} hotels with images!")

        # Verify
        print("\n[*] Sample verification:")
        sample_hotels = db.query(Hotel).limit(5).all()
        for hotel in sample_hotels:
            print(f"  {hotel.name} ({hotel.city}): {hotel.images}")

    except Exception as e:
        print(f"[ERROR] Error updating hotel images: {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_hotel_images()
