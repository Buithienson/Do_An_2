"""
Script de cap nhat hinh anh cho tat ca khach san
Chay: python update_all_hotel_images.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel


def update_all_hotel_images():
    """
    Cap nhat hinh anh moi cho tat ca cac khach san
    """
    db = SessionLocal()

    try:
        # Mapping hotel name keyword to new image path
        hotel_images = {
            "JW Marriott": ["/hotels/jw_marriott_phuquoc.png"],
            "Sheraton": ["/hotels/sheraton_saigon.png"],
            "Renaissance": ["/hotels/renaissance_danang.png"],
            "Vinpearl Resort Nha Trang": ["/hotels/vinpearl_nhatrang.png"],
            "Sofitel": ["/hotels/hotel_hanoi.png"],
            "Anantara": ["/hotels/hotel_hoian.png"],
            "Dalat Palace": ["/hotels/hotel_dalat.png"],
            "Coupole": ["/hotels/hotel_sapa.png"],
            "Vinpearl Resort Ha Long": ["/hotels/hotel_halong.png"],
            "InterContinental": ["/hotels/hotel_phuquoc.png"],
        }

        # Get all hotels
        hotels = db.query(Hotel).all()

        print(f"Found {len(hotels)} hotels in database")
        print("-" * 50)

        updated_count = 0
        for hotel in hotels:
            for keyword, new_images in hotel_images.items():
                if keyword.lower() in hotel.name.lower():
                    hotel.images = new_images
                    print(f"Updated: {hotel.name} -> {new_images[0]}")
                    updated_count += 1
                    break

        db.commit()
        print("-" * 50)
        print(f"[OK] Updated {updated_count} hotels successfully!")

    except Exception as e:
        print(f"[ERROR] Error updating hotel images: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_all_hotel_images()
