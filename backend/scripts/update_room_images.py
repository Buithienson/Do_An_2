"""
Update ALL room images to use unique generated images based on room type
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Room


def update_all_room_images():
    """Update room images based on room type"""
    db = SessionLocal()

    try:
        # Mapping room types to image files
        type_to_image = {
            "Deluxe": "/rooms/deluxe_ocean_view_1769786499296.png",
            "Suite": "/rooms/ocean_suite_1769786517001.png",
            "Superior": "/rooms/superior_city_view_1769786533906.png",
            "Executive": "/rooms/executive_suite_1769786549773.png",
            "Family": "/rooms/family_room_1769786596501.png",
            "Villa": "/rooms/beach_villa_1769786630195.png",
        }

        # Get all rooms
        rooms = db.query(Room).all()
        updated_count = 0

        print(f"\n[*] Found {len(rooms)} rooms in database\n")

        # Update each room based on its type
        for room in rooms:
            # Determine which image to use based on room type
            new_image = None

            # Check room type
            if "Deluxe" in room.room_type or "Deluxe" in room.name:
                if "Garden" in room.name:
                    new_image = "/rooms/deluxe_garden_view_1769786613988.png"
                elif "River" in room.name:
                    new_image = "/rooms/deluxe_river_view_1769786577151.png"
                elif "Ocean" in room.name:
                    new_image = "/rooms/deluxe_ocean_view_1769786499296.png"
                else:
                    new_image = type_to_image.get("Deluxe")
            elif "Suite" in room.room_type or "Suite" in room.name:
                if "Executive" in room.name:
                    new_image = "/rooms/executive_suite_1769786549773.png"
                elif "Ocean" in room.name:
                    new_image = "/rooms/ocean_suite_1769786517001.png"
                else:
                    new_image = type_to_image.get("Suite")
            elif "Villa" in room.room_type or "Villa" in room.name:
                new_image = "/rooms/beach_villa_1769786630195.png"
            elif "Family" in room.room_type or "Family" in room.name:
                new_image = "/rooms/family_room_1769786596501.png"
            elif "Superior" in room.room_type or "Superior" in room.name:
                new_image = "/rooms/superior_city_view_1769786533906.png"
            else:
                # Default image for other types
                new_image = "/rooms/deluxe_ocean_view_1769786499296.png"

            # Update the room
            if new_image:
                old_image = room.images[0] if room.images else "None"
                room.images = [new_image]
                updated_count += 1

                if updated_count <= 10:  # Show first 10 updates
                    print(
                        f"[+] Updated Room #{room.id}: {room.name} ({room.room_type})"
                    )
                    print(f"    Old: {old_image[:50]}...")
                    print(f"    New: {new_image}\n")

        # Commit all changes
        db.commit()
        print(f"\n[OK] Successfully updated {updated_count} room images!")
        print(f"[*] All rooms now use unique, locally-hosted images\n")

    except Exception as e:
        print(f"[ERROR] Error updating images: {e}")
        import traceback

        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_all_room_images()
