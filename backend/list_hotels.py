"""
Script de lay danh sach khach san
"""

import sys

sys.stdout.reconfigure(encoding="utf-8")

from app.database import SessionLocal
from app.models import Hotel

db = SessionLocal()
hotels = db.query(Hotel).all()
print(f"Total hotels: {len(hotels)}")
print("-" * 50)
for h in hotels:
    print(f"{h.id}: {h.name} - {h.city}")
db.close()
