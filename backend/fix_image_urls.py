"""
Script để fix broken image URLs trong database.

Chạy: python fix_image_urls.py

- Chuyển URLs dạng "http://localhost:3000/hotels/..." thành "/hotels/..."
- Chuyển URLs Unsplash thiếu params thành có params đầy đủ
"""

import sys
import os
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel, Room

UNSPLASH_PARAMS = "?w=800&auto=format&fit=crop&q=80"


def fix_image_url(url: str) -> str:
    if not url:
        return url

    # Chuyển localhost URL thành relative path
    for prefix in ["http://localhost:3000", "https://localhost:3000"]:
        if url.startswith(prefix):
            return url[len(prefix) :]

    # Thêm params cho Unsplash URL nếu thiếu
    if "images.unsplash.com" in url and "?" not in url:
        return url + UNSPLASH_PARAMS

    return url


def fix_images_list(images) -> list:
    if not images:
        return images
    return [fix_image_url(u) for u in images]


def main():
    db = SessionLocal()
    try:
        hotels = db.query(Hotel).all()
        hotel_count = 0

        for hotel in hotels:
            if hotel.images:
                fixed = fix_images_list(hotel.images)
                if fixed != hotel.images:
                    hotel.images = fixed
                    hotel_count += 1

        rooms = db.query(Room).all()
        room_count = 0

        for room in rooms:
            if room.images:
                fixed = fix_images_list(room.images)
                if fixed != room.images:
                    room.images = fixed
                    room_count += 1

        db.commit()
        print(f"✅ Đã fix images cho {hotel_count} khách sạn và {room_count} phòng.")
        print("   Hãy chạy lại frontend để kiểm tra kết quả.")

    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
