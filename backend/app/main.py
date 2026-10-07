import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from .config import settings
from .routes import environment, location, assistant
from .services.database_service import DatabaseService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ClimateGuard")

app = FastAPI(
    title="ClimateGuard AI API",
    description="Multi-Source Environmental Data Verification, Risk Analysis & ML Anomaly Detection Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(environment.router)
app.include_router(location.router)
app.include_router(assistant.router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting ClimateGuard AI backend service...")
    # Attempt lazy connection to Supabase
    try:
        DatabaseService.get_client()
    except Exception as e:
        logger.warning(f"Database startup check note: {e}")

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health status and provider availability check."""
    return {
        "status": "healthy",
        "service": "ClimateGuard AI Core",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "demo_mode": settings.DEMO_MODE,
        "providers": {
            "open_meteo": "ONLINE (Keyless Global Provider)",
            "openweather": "ONLINE" if (settings.OPENWEATHER_API_KEY and not settings.OPENWEATHER_API_KEY.startswith("your_")) else "NOT_CONFIGURED",
            "google_maps_airquality": "ONLINE" if (settings.GOOGLE_MAPS_API_KEY and not settings.GOOGLE_MAPS_API_KEY.startswith("your_")) else "NOT_CONFIGURED",
            "gemini_assistant": "ONLINE" if (settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_")) else "RULE_BASED_FALLBACK"
        },
        "database": {
            "supabase": "CONNECTED" if DatabaseService.get_client() else "IN_MEMORY_BUFFER"
        }
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": "ClimateGuard AI",
        "version": "1.0.0",
        "description": "Multi-Source Climate Data Verification & Environmental Monitoring Platform",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
