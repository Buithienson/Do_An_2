import json
import sys
import os
from pathlib import Path

# Add backend directory to path so we can import app modules
# Assuming this script is located at backend/seed_locations.py or similar
# If running from root: python backend/seed_locations.py
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Hotel, Room

def seed_from_json():
    db = SessionLocal()
    
    json_path = Path(__file__).parent / "data" / "vietnam_hotels.json"
    if not json_path.exists():
        print(f"Error: Data file not found at {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data['destinations'])} destinations.")

    for dest in data["destinations"]:
        city_name = dest["name"]
        print(f"Processing {city_name}...")
        
        for h_data in dest["hotels"]:
            # Check if hotel exists to avoid duplicates
            existing = db.query(Hotel).filter(Hotel.name == h_data["name"]).first()
            if existing:
                print(f"  Skipping {h_data['name']} (already exists)")
                continue
            
            # Create Hotel
            # Note: image in JSON is single string, model expects JSON list
            # We'll duplicate the image to simulate a gallery
            images_list = [h_data["image"]] * 3 
            
            new_hotel = Hotel(
                name=h_data["name"],
                address=h_data["address"],
                city=city_name,
                country="Vietnam",
                description=h_data["description"],
                latitude=h_data["latitude"],
                longitude=h_data["longitude"],
                star_rating=h_data["star_rating"],
                amenities=h_data["amenities"],
                images=images_list,
                policies=["Check-in: 14:00", "Check-out: 12:00", "No pets allowed"]
            )
            db.add(new_hotel)
            db.flush() # Get ID
            
            # Create a representative Room
            # Use price from JSON
            new_room = Room(
                hotel_id=new_hotel.id,
                name="Standard Room",
                description=f"Comfortable room at {h_data['name']}",
                room_type="Standard",
                base_price=h_data["price"],
                max_guests=2,
                size=30.0,
                bed_type="Queen",
                amenities=["Wifi", "AC", "TV", "Minibar"],
                images=images_list
            )
            db.add(new_room)
            
            # Add a deluxe option
            new_room_deluxe = Room(
                hotel_id=new_hotel.id,
                name="Deluxe Ocean/City View",
                description=f"Premium room with better view at {h_data['name']}",
                room_type="Deluxe",
                base_price=h_data["price"] * 1.5,
                max_guests=2,
                size=45.0,
                bed_type="King",
                amenities=["Wifi", "AC", "TV", "Minibar", "Bathtub"],
                images=images_list
            )
            db.add(new_room_deluxe)
            
        db.commit()
    
    db.close()
    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_from_json()
