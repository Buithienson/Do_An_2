"""Bulk assign a different image URL for every hotel.

Run:
    python update_all_hotel_images.py
"""

import re
import sys
from pathlib import Path
from collections import Counter

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel


def _slugify(text: str) -> str:
    if not text:
        return "hotel"
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "hotel"


def _build_unique_image_url(hotel: Hotel) -> str:
    """Create a deterministic unique URL per hotel using Picsum seed."""
    city_seed = _slugify(hotel.city or "vietnam")
    name_seed = _slugify(hotel.name or f"hotel-{hotel.id}")
    seed = f"{hotel.id}-{city_seed}-{name_seed}"
    return f"https://picsum.photos/seed/{seed}/1200/800"


def update_all_hotel_images() -> None:
    db = SessionLocal()

    try:
        hotels = db.query(Hotel).order_by(Hotel.id.asc()).all()

        if not hotels:
            print("[INFO] No hotels found.")
            return

        print(f"Found {len(hotels)} hotels in database")
        print("-" * 70)

        for hotel in hotels:
            new_image = _build_unique_image_url(hotel)
            hotel.images = [new_image]
            print(f"Updated #{hotel.id}: {hotel.name} -> {new_image}")

        db.commit()

        # Verify uniqueness after update
        first_images = [h.images[0] for h in hotels if h.images and len(h.images) > 0]
        duplicate_counts = Counter(first_images)
        duplicates = [img for img, count in duplicate_counts.items() if count > 1]

        print("-" * 70)
        print(f"[OK] Updated {len(hotels)} hotels.")
        print(f"[OK] Unique image URLs: {len(set(first_images))}/{len(first_images)}")
        if duplicates:
            print(f"[WARN] Duplicate URLs still found: {len(duplicates)}")
        else:
            print("[OK] No duplicate image URL found.")

    except Exception as e:
        print(f"[ERROR] Error updating hotel images: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_all_hotel_images()
