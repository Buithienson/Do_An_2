"""
Script de cap nhat hinh anh khach san
Chay: python update_hotel_images.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel
import json


def update_hotel_images():
    """
    Cap nhat hinh anh moi cho cac khach san
    """
    db = SessionLocal()

    try:
        # Mapping hotel name to new image path
        hotel_images = {
            "JW Marriott Phu Quoc": ["/hotels/jw_marriott_phuquoc.png"],
            "Sheraton Saigon": ["/hotels/sheraton_saigon.png"],
            "Renaissance": ["/hotels/renaissance_danang.png"],
            "Vinpearl": ["/hotels/vinpearl_nhatrang.png"],
        }

        # Get all hotels
        hotels = db.query(Hotel).all()

        updated_count = 0
        for hotel in hotels:
            for keyword, new_images in hotel_images.items():
                if keyword.lower() in hotel.name.lower():
                    hotel.images = new_images
                    print(f"Updated: {hotel.name} -> {new_images}")
                    updated_count += 1
                    break

        db.commit()
        print(f"\n[OK] Updated {updated_count} hotels successfully!")

    except Exception as e:
        print(f"[ERROR] Error updating hotel images: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_hotel_images()
