from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user

router = APIRouter(prefix="/wishlists", tags=["Wishlists"])


@router.get("/", response_model=List[schemas.WishlistResponse])
def get_my_wishlists(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lấy danh sách khách sạn yêu thích của user hiện tại.
    """
    wishlists = (
        db.query(models.Wishlist)
        .filter(models.Wishlist.user_id == current_user.id)
        .all()
    )
    return wishlists


@router.get("/check/{hotel_id}")
def check_wishlist(
    hotel_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Kiểm tra user đã yêu thích khách sạn này chưa.
    """
    entry = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id,
        models.Wishlist.hotel_id == hotel_id,
    ).first()
    return {"is_wishlisted": entry is not None}


@router.post("/", response_model=schemas.WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_wishlist(
    wishlist: schemas.WishlistCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Thêm khách sạn vào danh sách yêu thích.
    """
    # Kiểm tra khách sạn tồn tại
    hotel = db.query(models.Hotel).filter(models.Hotel.id == wishlist.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")

    # Kiểm tra đã yêu thích chưa
    existing = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id,
        models.Wishlist.hotel_id == wishlist.hotel_id,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Khách sạn đã có trong danh sách yêu thích",
        )

    db_wishlist = models.Wishlist(
        user_id=current_user.id,
        hotel_id=wishlist.hotel_id,
    )
    db.add(db_wishlist)
    db.commit()
    db.refresh(db_wishlist)
    return db_wishlist


@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist(
    hotel_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Bỏ yêu thích khách sạn.
    """
    entry = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == current_user.id,
        models.Wishlist.hotel_id == hotel_id,
    ).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy trong danh sách yêu thích",
        )
    db.delete(entry)
    db.commit()
    return None
