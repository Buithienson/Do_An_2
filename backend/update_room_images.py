"""
Script để cập nhật hình ảnh cho tất cả các phòng theo hạng phòng
Chạy: python update_room_images.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Room


def update_room_images():
    """
    Cập nhật hình ảnh cho tất cả các phòng dựa trên room_type
    """
    db = SessionLocal()

    try:
        # Mapping room types to images
        room_type_images = {
            "Standard": ["/rooms/standard_room.png"],
            "Superior": ["/rooms/superior_room.png"],
            "Deluxe": ["/rooms/deluxe_room.png"],
            "Suite": ["/rooms/suite_room.png"],
        }

        print("[*] Updating room images...")

        updated_count = 0
        for room_type, images in room_type_images.items():
            # Update all rooms of this type
            result = (
                db.query(Room)
                .filter(Room.room_type == room_type)
                .update({"images": images})
            )
            updated_count += result
            print(f"  [+] Updated {result} {room_type} rooms")

        db.commit()

        print(f"\n[SUCCESS] Updated {updated_count} rooms with images!")

        # Verify
        print("\n[*] Verification:")
        for room_type in room_type_images.keys():
            sample = db.query(Room).filter(Room.room_type == room_type).first()
            if sample:
                print(f"  {room_type}: {sample.images}")

    except Exception as e:
        print(f"[ERROR] Error updating room images: {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_room_images()
