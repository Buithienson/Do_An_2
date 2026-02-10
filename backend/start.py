"""
Deployment-ready startup script for AI-Booking Backend
Supports dynamic PORT configuration from environment variables
"""

import os
import uvicorn

if __name__ == "__main__":
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
