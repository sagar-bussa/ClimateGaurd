import httpx
import logging
from typing import List, Optional
from ..config import settings
from ..schemas.weather import LocationInfo

logger = logging.getLogger(__name__)

# Common fallback / preset cities for instant lookup
PRESET_LOCATIONS = [
    LocationInfo(name="Hyderabad", region="Telangana", country="India", latitude=17.3850, longitude=78.4867, timezone="Asia/Kolkata"),
    LocationInfo(name="Bengaluru", region="Karnataka", country="India", latitude=12.9716, longitude=77.5946, timezone="Asia/Kolkata"),
    LocationInfo(name="Delhi", region="Delhi", country="India", latitude=28.6139, longitude=77.2090, timezone="Asia/Kolkata"),
    LocationInfo(name="Mumbai", region="Maharashtra", country="India", latitude=19.0760, longitude=72.8777, timezone="Asia/Kolkata"),
    LocationInfo(name="Chennai", region="Tamil Nadu", country="India", latitude=13.0827, longitude=80.2707, timezone="Asia/Kolkata"),
    LocationInfo(name="London", region="England", country="United Kingdom", latitude=51.5074, longitude=-0.1278, timezone="Europe/London"),
    LocationInfo(name="New York", region="New York", country="United States", latitude=40.7128, longitude=-74.0060, timezone="America/New_York"),
    LocationInfo(name="Tokyo", region="Tokyo", country="Japan", latitude=35.6762, longitude=139.6503, timezone="Asia/Tokyo"),
    LocationInfo(name="Singapore", region=None, country="Singapore", latitude=1.3521, longitude=103.8198, timezone="Asia/Singapore"),
    LocationInfo(name="Sydney", region="New South Wales", country="Australia", latitude=-33.8688, longitude=151.2093, timezone="Australia/Sydney"),
]

class LocationService:
    @staticmethod
    async def search_locations(query: str, limit: int = 5) -> List[LocationInfo]:
        query = query.strip()
        if not query:
            return PRESET_LOCATIONS[:limit]

        # 1. Check exact/substring matches in presets first for instant response
        matched_presets = [
            loc for loc in PRESET_LOCATIONS
            if query.lower() in loc.name.lower() or (loc.country and query.lower() in loc.country.lower())
        ]
        if matched_presets and len(matched_presets) >= limit:
            return matched_presets[:limit]

        results: List[LocationInfo] = []

        # 2. Try Google Geocoding API if key configured
        if settings.GOOGLE_MAPS_API_KEY and not settings.GOOGLE_MAPS_API_KEY.startswith("your_"):
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    resp = await client.get(
                        "https://maps.googleapis.com/maps/api/geocode/json",
                        params={"address": query, "key": settings.GOOGLE_MAPS_API_KEY}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("status") == "OK" and data.get("results"):
                            for item in data["results"][:limit]:
                                loc = item["geometry"]["location"]
                                formatted_name = item.get("formatted_address", query)
                                parts = formatted_name.split(",")
                                city_name = parts[0].strip()
                                country_name = parts[-1].strip() if len(parts) > 1 else None
                                region_name = parts[1].strip() if len(parts) > 2 else None
                                results.append(LocationInfo(
                                    name=city_name,
                                    region=region_name,
                                    country=country_name,
                                    latitude=loc["lat"],
                                    longitude=loc["lng"]
                                ))
                            if results:
                                return results
            except Exception as e:
                logger.warning(f"Google Geocoding error: {e}. Falling back to OpenStreetMap Nominatim.")

        # 3. Fallback: OpenStreetMap Nominatim Geocoding (Free, open-source, global)
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                headers = {"User-Agent": "ClimateGuard-AI-Platform/1.0 (Hackathon Verification Engine)"}
                resp = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={"q": query, "format": "json", "limit": limit, "addressdetails": 1},
                    headers=headers
                )
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data:
                        addr = item.get("address", {})
                        city = addr.get("city") or addr.get("town") or addr.get("village") or addr.get("county") or item.get("display_name", "").split(",")[0]
                        country = addr.get("country")
                        state = addr.get("state")
                        results.append(LocationInfo(
                            name=city,
                            region=state,
                            country=country,
                            latitude=float(item["lat"]),
                            longitude=float(item["lon"])
                        ))
                    if results:
                        return results
        except Exception as e:
            logger.warning(f"Nominatim geocoding error: {e}")

        # 4. Fallback to matched presets or default to Hyderabad
        return matched_presets if matched_presets else [PRESET_LOCATIONS[0]]

    @staticmethod
    async def resolve_coordinates(lat: float, lon: float) -> LocationInfo:
        # Reverse geocoding fallback
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                headers = {"User-Agent": "ClimateGuard-AI-Platform/1.0"}
                resp = await client.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={"lat": lat, "lon": lon, "format": "json"},
                    headers=headers
                )
                if resp.status_code == 200:
                    data = resp.json()
                    addr = data.get("address", {})
                    city = addr.get("city") or addr.get("town") or addr.get("village") or "Custom Coordinates"
                    country = addr.get("country")
                    return LocationInfo(
                        name=city,
                        country=country,
                        latitude=lat,
                        longitude=lon
                    )
        except Exception:
            pass

        return LocationInfo(
            name=f"Coord ({lat:.2f}, {lon:.2f})",
            latitude=lat,
            longitude=lon
        )
