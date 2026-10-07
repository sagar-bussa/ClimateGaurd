from fastapi import APIRouter, Query
from typing import List, Dict, Any
from ..services.location_service import LocationService, PRESET_LOCATIONS
from ..schemas.weather import LocationInfo

router = APIRouter(prefix="/api/location", tags=["Location"])

@router.get("/search", response_model=List[LocationInfo])
async def search_locations(q: str = Query(..., min_length=1, description="City or location query")):
    """Search for cities and return geocoded coordinates."""
    return await LocationService.search_locations(q)

@router.get("/presets", response_model=List[LocationInfo])
async def get_presets():
    """Return top default benchmark cities."""
    return PRESET_LOCATIONS
