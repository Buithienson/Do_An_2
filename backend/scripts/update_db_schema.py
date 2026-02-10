from app.database import engine
from sqlalchemy import text


def add_cancellation_columns():
    with engine.connect() as conn:
        try:
            # Check if columns exist first (to make it idempotent)
            conn.execute(
                text("ALTER TABLE bookings ADD COLUMN cancellation_date DATETIME NULL")
            )
            print("Added cancellation_date column")
        except Exception as e:
            print(f"cancellation_date might exist: {e}")

        try:
            conn.execute(
                text("ALTER TABLE bookings ADD COLUMN refund_amount FLOAT DEFAULT 0.0")
            )
            print("Added refund_amount column")
        except Exception as e:
            print(f"refund_amount might exist: {e}")

        try:
            conn.execute(
                text("ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT NULL")
            )
            print("Added cancellation_reason column")
        except Exception as e:
            print(f"cancellation_reason might exist: {e}")

        conn.commit()
        print("Database schema updated successfully!")


if __name__ == "__main__":
    add_cancellation_columns()
