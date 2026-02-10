"""Add cancellation fields to bookings

Revision ID: add_cancellation_fields
Revises:
Create Date: 2026-01-26

"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    # Add cancellation tracking fields to bookings table
    op.add_column(
        "bookings", sa.Column("cancellation_date", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "bookings", sa.Column("refund_amount", sa.Float(), nullable=True, default=0.0)
    )
    op.add_column(
        "bookings", sa.Column("cancellation_reason", sa.Text(), nullable=True)
    )


def downgrade():
    # Remove cancellation fields
    op.drop_column("bookings", "cancellation_reason")
    op.drop_column("bookings", "refund_amount")
    op.drop_column("bookings", "cancellation_date")
