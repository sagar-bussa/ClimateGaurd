# ClimateGuard AI – REST API Documentation

Base URL: `http://localhost:8000` (or reverse-proxied at `/api`)

Interactive Swagger UI: `http://localhost:8000/docs`
Redoc Documentation: `http://localhost:8000/redoc`

---

## 1. Health & Status

### `GET /api/health`
Returns backend service health, provider connectivity status, and demo mode flags.

**Response:**
```json
{
  "status": "healthy",
  "service": "ClimateGuard AI Core",
  "timestamp": "2026-10-07T12:00:00Z",
  "demo_mode": false,
  "providers": {
    "open_meteo": "ONLINE (Keyless Global Provider)",
    "openweather": "ONLINE",
    "google_maps_airquality": "ONLINE",
    "gemini_assistant": "ONLINE"
  },
  "database": {
    "supabase": "CONNECTED"
  }
}
```

---

## 2. Environmental Telemetry & Verification

### `GET /api/environment/summary`
Master endpoint retrieving verified multi-source weather, air quality, confidence metrics, risk index, and ML anomalies.

**Parameters:**
- `lat` (float, required): Latitude (e.g. `17.3850`)
- `lon` (float, required): Longitude (e.g. `78.4867`)
- `name` (string, required): Location name (e.g. `Hyderabad`)

**Key Response Fields:**
- `location`: Resolved geographic information
- `current_conditions`: Consensus temperature, humidity, wind, pressure, UV index
- `air_quality`: PM2.5, PM10, CO, NO2, SO2, O3 concentrations
- `verification`:
  - `overall_confidence_score`: Float between 0 and 100
  - `confidence_label`: e.g. "High Confidence"
  - `verification_status`: "VERIFIED" | "CAUTION_INCONSISTENCY" | "LOW_CONFIDENCE"
  - `potential_outliers`: Array of provider names flagged for divergence
  - `parameters`: Detailed breakdown by parameter
- `risk`:
  - `risk_score`: Composite index (0 - 100)
  - `risk_level`: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
  - `main_contributing_factors`: Top 3 driving pollutants or meteorological stressors
  - `health_advisory`: Plain-language medical guidance
- `anomaly`:
  - `is_anomaly`: Boolean
  - `anomaly_score`: Isolation Forest score (0 - 100)
  - `severity`: "NORMAL" | "WATCH" | "ANOMALY_DETECTED" | "EXTREME_OUTLIER"

---

### `GET /api/environment/verification`
Dedicated endpoint returning inter-source statistical variance, min/max bounds, and consensus levels.

---

### `GET /api/environment/risk`
Returns the multi-factor environmental risk calculation and population advisory.

---

### `GET /api/environment/anomalies`
Returns the Isolation Forest anomaly detection classification.

---

### `GET /api/environment/history`
Returns historical timeseries observations from the Supabase ledger.

**Parameters:**
- `name` (string): City name
- `range` (string): `24h` | `7d` | `30d`

---

## 3. Location Geocoding

### `GET /api/location/search`
Queries location names using Google Geocoding or OpenStreetMap Nominatim.

**Parameters:**
- `q` (string, required): City name or query string (e.g. `Bengaluru`)

---

### `GET /api/map/locations`
Returns array of benchmark stations for the interactive Leaflet map view with pre-computed risk and confidence levels.

---

## 4. AI Climate Assistant

### `POST /api/assistant/chat`
Answers conversational questions grounded strictly in live verified telemetry.

**Request Payload:**
```json
{
  "message": "Is it safe for outdoor exercise?",
  "context_data": { ... }
}
```

**Response:**
```json
{
  "reply": "Yes, outdoor activities are safe. The current risk score in Hyderabad is 22/100 (LOW)...",
  "sources_cited": ["ClimateGuard Risk Engine", "Open-Meteo"],
  "data_backed": true
}
```
