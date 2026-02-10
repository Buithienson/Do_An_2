from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import json

router = APIRouter(prefix="/ai", tags=["AI Assistance"])

class AISuggestRequest(BaseModel):
    location: str
    check_in_date: str
    check_out_date: str
    guests: int
    budget_per_night: Optional[float] = None
    preferences: Optional[str] = None

class AISuggestResponse(BaseModel):
    suggestion: str
    recommended_rooms: List[int]

@router.post("/suggest", response_model=AISuggestResponse)
def suggest_booking(
    request: AISuggestRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI gợi ý phòng dựa trên tiêu chí.
    Lưu log AI vào DB.
    """
    # 1. Simulate AI Logic (Simple Filter)
    # Tìm khách sạn ở location
    hotels_query = db.query(models.Hotel).filter(models.Hotel.city.ilike(f"%{request.location}%"))
    hotels = hotels_query.all()
    
    hotel_ids = [h.id for h in hotels]
    
    if not hotel_ids:
        response_text = f"Xin lỗi, tôi không tìm thấy khách sạn nào tại {request.location}."
        room_ids = []
    else:
        # Tìm phòng phù hợp guests và budget
        rooms_query = db.query(models.Room).filter(
            models.Room.hotel_id.in_(hotel_ids),
            models.Room.max_guests >= request.guests
        )
        
        if request.budget_per_night:
            rooms_query = rooms_query.filter(models.Room.base_price <= request.budget_per_night)
            
        recommended_rooms = rooms_query.limit(3).all()
        room_ids = [r.id for r in recommended_rooms]
        
        if room_ids:
            response_text = f"Tôi tìm thấy {len(room_ids)} phòng phù hợp tại {request.location} với ngân sách của bạn."
        else:
            response_text = f"Có khách sạn tại {request.location}, nhưng không có phòng nào phù hợp với số lượng khách hoặc ngân sách này."

    # 2. Log AI Interaction
    ai_log = models.AILog(
        user_id=current_user.id,
        prompt=json.dumps(request.dict()),
        response=response_text,
        action_type="suggest"
    )
    db.add(ai_log)
    db.commit()
    
    return {
        "suggestion": response_text,
        "recommended_rooms": room_ids
    }
