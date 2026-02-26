from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    users,
    rooms,
    bookings,
    hotels,
    auth,
    ai,
    seed_endpoint,
    admin as admin_router,
)
from app.cache import search_cache, availability_cache

# Create all database tables (handled via seed endpoint or startup)
Base.metadata.create_all(bind=engine)

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app):
    # Startup: auto-create tables so backend doesn't crash on fresh DB
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AI-Booking API",
    version="3.0.0",
    description="Hotel Booking System with Full Features - Agoda-like Platform",
    lifespan=lifespan,
)

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Log validation errors (422) for debugging
    """
    logging.error(f"Validation error for {request.url}: {exc.errors()}")
    # Return JSON with details - CORS middleware will catch this response
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Log generic errors (500) for debugging
    """
    logging.error(f"Global error for {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
    )


# Configure CORS
# Support both local development and production deployment
import os
import re

# Get frontend URL from environment, default to local development
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Allowed origins: production URL + local development URLs
allowed_origins = [
    FRONTEND_URL,
    "https://do-an-2-1-xt7p.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

# Remove duplicates
allowed_origins = list(set(allowed_origins))


# Custom CORS origin validation to support Render's dynamic subdomains
def cors_allow_all_render_origins(origin: str) -> bool:
    """
    Allow all *.onrender.com origins plus explicitly listed origins
    """
    if origin in allowed_origins:
        return True
    # Allow all onrender.com subdomains
    if re.match(r"https://.*\.onrender\.com$", origin):
        return True
    return False


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.onrender\.com",  # Allow all Render subdomains
    allow_origins=allowed_origins,  # Specific allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers to the frontend
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(hotels.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(seed_endpoint.router, prefix="/api")  # Database seeding endpoint
app.include_router(admin_router.router, prefix="/api")  # Admin management endpoints


@app.get("/")
async def root():
    return {
        "message": "Welcome to AI-Booking API",
        "version": "3.0.0",
        "docs": "/docs",
        "features": [
            "Hotel & Room Management",
            "Booking with Double-Booking Prevention",
            "Search Caching (10 min)",
            "Availability Caching (5 min)",
            "Dynamic Pricing with Discounts",
            "AI Suggestions",
            "User Management with JWT Auth",
        ],
    }


@app.get("/api/hello")
async def hello_world():
    return {
        "message": "Hello from FastAPI Backend!",
        "status": "success",
        "project": "AI-Booking Hotel System",
        "integration": "FastAPI + Next.js + PostgreSQL",
    }


@app.post("/api/admin/cache/clear")
async def clear_all_cache():
    """
    Clear all caches (Admin endpoint)
    """
    search_cache.clear()
    availability_cache.clear()
    return {
        "status": "success",
        "message": "All caches cleared",
        "timestamp": str(__import__("datetime").datetime.now()),
    }


@app.get("/api/admin/cache/stats")
async def cache_stats():
    """
    Get cache statistics (Admin endpoint)
    """
    search_cache.cleanup_expired()
    availability_cache.cleanup_expired()

    return {
        "search_cache": {"entries": len(search_cache.cache), "ttl": search_cache.ttl},
        "availability_cache": {
            "entries": len(availability_cache.cache),
            "ttl": availability_cache.ttl,
        },
    }
