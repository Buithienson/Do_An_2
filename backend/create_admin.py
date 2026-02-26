"""
Script để tạo tài khoản admin trong database.

Cách dùng:
  cd backend
  python create_admin.py --email admin@hotel.com --password SecurePass123

Hoặc dùng psql trực tiếp:
  UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
"""

import argparse
import sys
import os

# Đảm bảo import đúng từ thư mục backend/app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from app.utils import hash_password


def create_admin(email: str, password: str, full_name: str = "Admin"):
    db = SessionLocal()
    try:
        # Kiểm tra email đã tồn tại chưa
        existing = db.query(models.User).filter(models.User.email == email).first()

        if existing:
            # Nếu đã tồn tại → nâng cấp lên admin
            existing.role = "admin"
            db.commit()
            db.refresh(existing)
            print(
                f"✅ User '{email}' đã được nâng cấp lên role 'admin' (id={existing.id})"
            )
            return

        # Tạo mới
        admin_user = models.User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            role="admin",
            email_verified=True,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"✅ Đã tạo tài khoản admin:")
        print(f"   Email    : {admin_user.email}")
        print(f"   Full name: {admin_user.full_name}")
        print(f"   Role     : {admin_user.role}")
        print(f"   ID       : {admin_user.id}")

    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tạo tài khoản admin")
    parser.add_argument("--email", required=True, help="Email của admin")
    parser.add_argument("--password", required=True, help="Mật khẩu của admin")
    parser.add_argument(
        "--name", default="Admin", help="Tên hiển thị (mặc định: Admin)"
    )
    args = parser.parse_args()

    create_admin(email=args.email, password=args.password, full_name=args.name)
