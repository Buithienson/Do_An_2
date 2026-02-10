# Backend Maintenance Scripts

This directory contains utility scripts for database maintenance and updates.

## Scripts

### update_room_images.py

Updates all room records in the database with unique image paths based on room type and name.

**Usage:**

```bash
cd backend
python scripts/update_room_images.py
```

**What it does:**

- Scans all rooms in the database
- Matches rooms to appropriate images based on type (Deluxe, Suite, Villa, etc.)
- Updates the `images` field in the `rooms` table
- Provides feedback on number of rooms updated

### update_db_schema.py

Database schema migration script for adding new fields or modifying existing tables.

**Usage:**

```bash
cd backend
python scripts/update_db_schema.py
```

**What it does:**

- Adds new columns to existing tables
- Migrates data when schema changes

### add_cancellation_fields.py

Migration script to add cancellation-related fields to the bookings table.

**Usage:**

```bash
cd backend
python scripts/add_cancellation_fields.py
```

**What it does:**

- Adds `cancellation_date`, `refund_amount`, and `cancellation_reason` fields
- Safe to run multiple times (checks if columns exist first)

## Notes

- Run these scripts from the `backend` directory to ensure proper module imports
- Always backup your database before running migration scripts
- Check the script output for any errors or warnings
- Migration scripts are safe to run multiple times
