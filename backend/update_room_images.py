"""Update all room images with deterministic unique URLs.

Run:
    python update_room_images.py
"""

import re
import sys
from collections import Counter
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Room


def _slugify(text: str) -> str:
    if not text:
        return "room"
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "room"


def _build_unique_room_image_url(room: Room) -> str:
    """Create a deterministic unique image URL for each room record."""
    room_type_seed = _slugify(room.room_type or "standard")
    room_name_seed = _slugify(room.name or f"room-{room.id}")
    seed = f"{room.id}-{room.hotel_id}-{room_type_seed}-{room_name_seed}"
    return f"https://picsum.photos/seed/{seed}/1200/800"


def update_room_images() -> None:
    db = SessionLocal()

    try:
        rooms = db.query(Room).order_by(Room.id.asc()).all()

        if not rooms:
            print("[INFO] No rooms found.")
            return

        print(f"[*] Updating images for {len(rooms)} rooms...")

        for room in rooms:
            new_image = _build_unique_room_image_url(room)
            room.images = [new_image]

        db.commit()

        first_images = [r.images[0] for r in rooms if r.images and len(r.images) > 0]
        duplicate_counts = Counter(first_images)
        duplicates = [img for img, count in duplicate_counts.items() if count > 1]

        print(f"[SUCCESS] Updated {len(rooms)} rooms with unique images.")
        print(f"[SUCCESS] Unique image URLs: {len(set(first_images))}/{len(first_images)}")
        if duplicates:
            print(f"[WARN] Duplicate image URLs found: {len(duplicates)}")
        else:
            print("[SUCCESS] No duplicate room image URL found.")

    except Exception as e:
        print(f"[ERROR] Error updating room images: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_room_images()
