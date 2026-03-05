from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import re

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
    db: Session = Depends(get_db),
):
    """
    AI gợi ý phòng dựa trên tiêu chí.
    Lưu log AI vào DB.
    """
    # 1. Simulate AI Logic (Simple Filter)
    # Tìm khách sạn ở location
    hotels_query = db.query(models.Hotel).filter(
        models.Hotel.city.ilike(f"%{request.location}%")
    )
    hotels = hotels_query.all()

    hotel_ids = [h.id for h in hotels]

    if not hotel_ids:
        response_text = (
            f"Xin lỗi, tôi không tìm thấy khách sạn nào tại {request.location}."
        )
        room_ids = []
    else:
        # Tìm phòng phù hợp guests và budget
        rooms_query = db.query(models.Room).filter(
            models.Room.hotel_id.in_(hotel_ids),
            models.Room.max_guests >= request.guests,
        )

        if request.budget_per_night:
            rooms_query = rooms_query.filter(
                models.Room.base_price <= request.budget_per_night
            )

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
        action_type="suggest",
    )
    db.add(ai_log)
    db.commit()

    return {"suggestion": response_text, "recommended_rooms": room_ids}


# ─── Multi-turn Chat Endpoint ─────────────────────────────────────────────────


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    session_history: Optional[List[ChatMessage]] = []


class RoomSuggestion(BaseModel):
    id: int
    name: str
    hotel_name: str
    city: str
    price: float
    image_url: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[RoomSuggestion]] = None
    step: str  # "greeting" | "dest" | "date" | "guests" | "budget" | "result"


def _extract_location(text: str) -> Optional[str]:
    """Tìm tên địa điểm trong câu nói của user."""
    destinations = [
        "hà nội",
        "ha noi",
        "hanoi",
        "hồ chí minh",
        "ho chi minh",
        "saigon",
        "sài gòn",
        "hcm",
        "đà nẵng",
        "da nang",
        "hội an",
        "hoi an",
        "nha trang",
        "phú quốc",
        "phu quoc",
        "đà lạt",
        "da lat",
        "dalat",
        "hạ long",
        "ha long",
        "halong",
        "sapa",
        "sa pa",
        "huế",
        "hue",
        "vũng tàu",
        "vung tau",
        "quy nhon",
        "quy nhơn",
        "phan thiet",
        "phan thiết",
        "can tho",
        "cần thơ",
    ]
    text_lower = text.lower()
    for dest in destinations:
        if dest in text_lower:
            # Capitalise for DB query
            return dest.title()
    return None


def _extract_guests(text: str) -> Optional[int]:
    """Tìm số người trong tin nhắn."""
    match = re.search(r"(\d+)\s*(người|person|guest|khách|adult)", text.lower())
    if match:
        return int(match.group(1))
    # single digit alone
    match = re.search(r"\b([1-9])\b", text)
    if match:
        return int(match.group(1))
    return None


def _extract_budget(text: str) -> Optional[float]:
    """Tìm ngân sách trong tin nhắn (VNĐ nghìn)."""
    text_lower = text.lower().replace(",", "").replace(".", "")
    match = re.search(r"(\d+)\s*(triệu|trieu|tr\b)", text_lower)
    if match:
        return float(match.group(1)) * 1_000_000
    match = re.search(r"(\d+)\s*(nghìn|nghin|k\b)", text_lower)
    if match:
        return float(match.group(1)) * 1_000
    match = re.search(r"(\d{4,})", text_lower)
    if match:
        return float(match.group(1))
    return None


def _build_context(history: List[ChatMessage]) -> Dict[str, Any]:
    """Trích xuất context từ lịch sử hội thoại."""
    ctx: Dict[str, Any] = {
        "location": None,
        "guests": None,
        "budget": None,
    }
    for msg in history:
        if msg.role == "user":
            if not ctx["location"]:
                ctx["location"] = _extract_location(msg.content)
            if not ctx["guests"]:
                ctx["guests"] = _extract_guests(msg.content)
            if not ctx["budget"]:
                ctx["budget"] = _extract_budget(msg.content)
    return ctx


GREETINGS = ["xin chào", "hello", "hi", "chào", "hey", "hia", "helo"]


@router.post("/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Multi-turn conversational AI endpoint (no auth required).
    Progressively collects travel info and suggests matching rooms.
    """
    msg = request.message.strip()
    history = list(request.session_history or [])

    # Add current user message to history for context building
    full_history = history + [ChatMessage(role="user", content=msg)]
    ctx = _build_context(full_history)

    msg_lower = msg.lower()

    # ── 1. Greeting ───────────────────────────────────────────────────────────
    if any(g in msg_lower for g in GREETINGS) and not ctx["location"]:
        return ChatResponse(
            reply=(
                "Xin chào! Tôi là **BookingAI Assistant** 🤖\n\n"
                "Tôi có thể giúp bạn tìm phòng khách sạn hoàn hảo tại Việt Nam! "
                "Bạn muốn đi du lịch ở đâu? "
                "(Ví dụ: Đà Nẵng, Phú Quốc, Hội An, Sapa...)"
            ),
            step="greeting",
        )

    # ── 2. Need location ──────────────────────────────────────────────────────
    if not ctx["location"]:
        return ChatResponse(
            reply=(
                "Tôi muốn giúp bạn tìm phòng tốt nhất! 🌟\n\n"
                "Bạn dự định đi **điểm đến** nào? "
                "(Hà Nội, Đà Nẵng, Phú Quốc, Nha Trang, Hội An, Sapa...)"
            ),
            step="dest",
        )

    # ── 3. Need guests ────────────────────────────────────────────────────────
    if not ctx["guests"]:
        return ChatResponse(
            reply=(
                f"Tuyệt vời! **{ctx['location']}** là lựa chọn tuyệt vời 😍\n\n"
                "Chuyến đi có bao nhiêu **người**?"
            ),
            step="guests",
        )

    # ── 4. Need budget ────────────────────────────────────────────────────────
    if not ctx["budget"]:
        return ChatResponse(
            reply=(
                f"Được rồi, {ctx['guests']} người nhé! 👍\n\n"
                "**Ngân sách** dự kiến mỗi đêm của bạn là bao nhiêu? "
                "(Ví dụ: 1 triệu, 2.5 triệu, 500k...)"
            ),
            step="budget",
        )

    # ── 5. All info collected → search DB ────────────────────────────────────
    location = ctx["location"]
    guests = ctx["guests"]
    budget = ctx["budget"]

    # Search hotels in location
    hotels = (
        db.query(models.Hotel).filter(models.Hotel.city.ilike(f"%{location}%")).all()
    )

    suggestions = []
    if hotels:
        hotel_ids = [h.id for h in hotels]
        rooms_query = (
            db.query(models.Room)
            .filter(
                models.Room.hotel_id.in_(hotel_ids),
                models.Room.max_guests >= guests,
                models.Room.base_price <= budget,
            )
            .limit(3)
            .all()
        )

        hotel_map = {h.id: h for h in hotels}
        for room in rooms_query:
            hotel = hotel_map.get(room.hotel_id)
            suggestions.append(
                RoomSuggestion(
                    id=room.id,
                    name=room.name,
                    hotel_name=hotel.name if hotel else "",
                    city=hotel.city if hotel else location,
                    price=float(room.base_price),
                    image_url=(room.images[0] if room.images else None),
                )
            )

    if suggestions:
        reply = (
            f"🎉 Tìm thấy **{len(suggestions)} phòng** phù hợp tại {location} "
            f"cho {guests} người với ngân sách {budget/1_000_000:.1f} triệu/đêm:\n\n"
            "Hãy chọn phòng bạn thích để xem chi tiết và đặt ngay!"
        )
    else:
        reply = (
            f"😔 Tiếc quá, tôi không tìm được phòng nào tại **{location}** "
            f"cho {guests} người trong ngân sách **{budget/1_000_000:.1f} triệu/đêm**.\n\n"
            "Bạn có muốn thử tăng ngân sách một chút hoặc chọn điểm đến khác không?"
        )

    return ChatResponse(
        reply=reply,
        suggestions=suggestions if suggestions else None,
        step="result",
    )
