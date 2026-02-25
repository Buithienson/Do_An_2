"""
Deployment-ready startup script for AI-Booking Backend
Supports dynamic PORT configuration from environment variables
"""

import os
import uvicorn


# Auto-create tables on startup (safe for PostgreSQL)
def init_db():
    """Initialize database tables if they don't exist"""
    try:
        from app.database import engine, Base
        from app import models  # Import models to register them

        print("🔄 Checking database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables ready!")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")
        # Don't crash the app, just log the warning


if __name__ == "__main__":
    # Initialize database first
    init_db()

    # Get PORT from environment variable, default to 8000 for local development
    port = int(os.environ.get("PORT", 8000))

    # Get host from environment variable, default to 0.0.0.0 for deployment
    # (0.0.0.0 allows external connections, required for cloud platforms)
    host = os.environ.get("HOST", "0.0.0.0")

    print(f"🚀 Starting AI-Booking Backend on {host}:{port}")
    print(f"📝 Environment: {'PRODUCTION' if port != 8000 else 'DEVELOPMENT'}")

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production for better performance
    )
