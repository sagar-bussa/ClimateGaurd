# ClimateGuard AI – Climate Data Verification & Environmental Monitoring Platform

<p align="center">
  <img src="docs/climateguard-banner.jpg" alt="ClimateGuard AI – AI-Driven Climate Intelligence" width="100%" />
</p>

> **IEEE Hackathon Production Software Platform**  
> Purely software-based web application. Zero hardware, ESP32, or IoT dependencies.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Isolation%20Forest-F7931E.svg)](https://scikit-learn.org/)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)

---

## Overview

**ClimateGuard AI** is an intelligent climate and environmental monitoring platform that aggregates environmental data across multiple external providers, cross-verifies observations using statistical consensus modeling, detects climatological anomalies using machine learning, calculates multi-factor environmental risk, and presents the intelligence through a modern dashboard.

---

## Problem

**"Environmental data is fragmented and difficult to verify."**

Most climate portals rely on a single weather API or uncalibrated ground stations. If a single provider suffers an outage, calibration drift, or sensor degradation, users receive inaccurate or misleading data. Furthermore, users lack any indication of data reliability or consistency across independent atmospheric models.

---

## Solution

ClimateGuard AI solves this with a **Tri-Pillar Verification Architecture**:
1. **Multi-Source Data Ingestion & Consensus Verification:** Ingests live data concurrently from Open-Meteo (ECMWF/GFS physics models), OpenWeatherMap, and Google Air Quality API.
2. **AI-Based Climatological Anomaly Detection:** An unsupervised **Isolation Forest** model flags atypical atmospheric patterns while distinguishing genuine weather extremes from sensor inconsistency.
3. **Multi-Factor Environmental Risk Scoring:** Computes a transparent $0 - 100$ risk score adhering to WHO Air Quality Guidelines (2021) and NOAA heat stress matrices.

---

## Key Features

- **Consensus Verification Engine:** Computes spread ($\Delta$), Median Absolute Deviation (MAD), and an estimated **Data Confidence Score (0–100%)**.
- **Outlier Discrimination:** Flags potential outlier providers non-defamatorily without claiming absolute ground-truth failure.
- **AI Anomaly Detection:** Isolation Forest algorithm identifying multi-dimensional atmospheric extremes (heat domes, inversions, squalls).
- **Composite Environmental Risk Index:** Transparent index with top driving stressors (PM2.5, UV, Thermal, Wind, Rain).
- **Interactive Geospatial Mesh:** Leaflet interactive dark-mode map with color-coded risk markers (Green, Yellow, Orange, Red).
- **Data-Grounded AI Climate Assistant:** Conversational assistant grounded strictly in verified readings—zero hallucinated metrics.
- **Supabase PostgreSQL Ledger:** Continuous timeseries persistence for 24h, 7d, and 30d trend analysis.
- **Resilient Fallback & DEMO Mode:** Works seamlessly even if external keys are pending, using live open-access providers or safe demo simulations.

---

## Architecture

```
User Search / Coordinates
           │
           ▼
[FastAPI Asynchronous Gateway]
     ├── Open-Meteo API (ECMWF/GFS Model)
     ├── OpenWeatherMap API
     └── Google Air Quality API
           │
           ▼
[Normalization & Verification Engine] ──► Outlier Detection (MAD) & Confidence Score
           │
     ┌─────┴─────────────────────────────────────┐
     ▼                                           ▼
[Isolation Forest ML Engine]         [Environmental Risk Engine]
(8-dim Anomaly Detection)            (WHO / NOAA Indexed Risk)
     │                                           │
     └───────────────────┬───────────────────────┘
                         ▼
           [Supabase PostgreSQL Ledger]
                         │
                         ▼
        [React + Vite + Tailwind Dashboard]
```

---

## Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet.
- **Backend:** Python 3.10+, FastAPI, Pydantic, HTTPX, NumPy, Pandas.
- **Machine Learning:** Scikit-Learn (`IsolationForest`), SciPy.
- **Database:** Supabase (PostgreSQL with Row Level Security).
- **External Providers:** Open-Meteo API, OpenWeatherMap API, Google Air Quality & Geocoding API.

---

## Data Sources

| Source | Role | Auth Required? | Cost |
| :--- | :--- | :--- | :--- |
| **Open-Meteo** | Primary meteorological & AQ model | **No** (Open-access) | Free |
| **OpenWeatherMap** | Secondary peer weather feed | API Key | Free Tier |
| **Google Air Quality API** | High-resolution pollutant concentrations | API Key | Free Tier ($200 credit) |
| **OpenStreetMap Nominatim** | Geocoding & coordinate resolution | None | Free |

---

## AI/ML Approach

- **Model:** `sklearn.ensemble.IsolationForest`
- **Features (8D Vector):** Temperature, Relative Humidity, Barometric Pressure, Wind Velocity, PM2.5, PM10, UV Index, Precipitation Probability.
- **Methodology:** Unsupervised tree isolation measuring the average path length required to separate a sample point. Samples with short path lengths represent atmospheric outliers.
- **Distinction:**
  - *Environmental Anomaly:* Genuine real-world extreme observed consistently across providers.
  - *Data Inconsistency:* Divergence where one sensor deviates from consensus.

---

## Data Verification Method

For each atmospheric parameter $x$, given readings from $N$ providers:
$$\text{Median} = \text{median}(x_1, \dots, x_N)$$
$$\Delta = \max(x) - \min(x)$$
$$\text{MAD} = \text{median}(|x_i - \text{Median}|)$$

If $\Delta$ exceeds physical discrepancy thresholds and a single provider deviates disproportionately from the median, it is tagged as a **"potential outlier"**. The consensus value is calculated as the trimmed mean of non-outlier sources.

Confidence scoring scales from $0\%$ to $100\%$:
- **95–100%:** Very High Confidence (Consensus verified)
- **85–94%:** High Confidence (Minor variance)
- **70–84%:** Moderate Confidence (Acceptable spread)
- **50–69%:** Low Confidence (Requires verification)
- **< 50%:** Very Low Confidence (Severe discordance)

---

## Environmental Risk Method

The composite risk score ($0 - 100$) evaluates:
- **PM2.5 Particulate (30% weight):** Calibrated to WHO 2021 air quality targets ($15\,\mu\text{g/m}^3$).
- **Thermal Stress (25% weight):** Extreme heat ($>38^\circ\text{C}$) or severe cold ($<5^\circ\text{C}$).
- **Solar UV Radiation (15% weight):** WHO UV Index ($>8$ high risk).
- **Wind Velocity (10% weight):** Gale/storm force wind ($>45\,\text{km/h}$).
- **Precipitation (10% weight):** Heavy rainfall probability.
- **PM10 Coarse Dust (10% weight):** Inhalable dust concentration.

---

## Project Structure

```
ClimateGuard-AI/
├── frontend/
│   ├── src/
│   │   ├── components/        # Dashboard, Verification, Risk, Trends, Map, Assistant
│   │   ├── services/          # API communication client
│   │   ├── App.jsx            # Main application layout
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point & CORS
│   │   ├── config.py          # Environment settings loader
│   │   ├── routes/            # Environment, Location, Assistant API routes
│   │   ├── services/          # Weather, Verification, Risk, Alert, Database services
│   │   ├── ml/                # Isolation Forest anomaly model
│   │   └── schemas/           # Pydantic data schemas
│   ├── tests/                 # Pytest test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── docs/
│   ├── architecture.md        # Technical architecture document
│   ├── api-documentation.md   # Complete REST endpoint specifications
│   ├── setup.md               # Setup and deployment guide
│   └── database_schema.sql    # Supabase PostgreSQL DDL & RLS policies
│
├── docker-compose.yml
├── .gitignore
├── .env.example
├── LICENSE
└── README.md
```

---

## Required API Keys and Credentials

| Credential | Required? | Used For | Where to Store It | Safe for Frontend? |
| :--- | :--- | :--- | :--- | :--- |
| `GOOGLE_MAPS_API_KEY` | Recommended | Google Air Quality API & Geocoding | `backend/.env` | ❌ No |
| `OPENWEATHER_API_KEY` | Recommended | OpenWeatherMap comparison | `backend/.env` | ❌ No |
| `GEMINI_API_KEY` | Optional | AI Assistant generation | `backend/.env` | ❌ No |
| `SUPABASE_URL` | Required | Supabase database connection | `backend/.env` & `frontend/.env` | ✅ Yes |
| `SUPABASE_ANON_KEY` | Required | Supabase client reads | `backend/.env` & `frontend/.env` | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Server-side observation persistence | `backend/.env` | ❌ No |
| `DATABASE_URL` | Optional | Direct PostgreSQL URI | `backend/.env` | ❌ No |

---

## Local Development

### 1. Backend Setup
```bash
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com/).
2. Open the **SQL Editor** tab.
3. Paste and run [`docs/database_schema.sql`](docs/database_schema.sql).

---

## Running Tests

Run the backend verification and ML test suite:
```bash
.\.venv\Scripts\python.exe -m pytest backend/tests
```

---

## Security

- **Strict Git Protection:** `.gitignore` excludes all `.env`, `.env.*`, `service_account.json`, and credentials.
- **Frontend Isolation:** Client code never touches private API keys or database service roles.
- **Row Level Security (RLS):** Supabase tables are secured with explicit SELECT policies for public telemetry and write restrictions for the backend.

---

## Hackathon Demonstration Flow (3–5 Minutes)

1. **Open Dashboard:** Displays verified telemetry for Hyderabad with real-time temperature, PM2.5, and UV.
2. **Review Triad:** Show Confidence Score (97%), Verification Status (VERIFIED), and Risk Index.
3. **Inspect Verification Tab:** Show side-by-side Open-Meteo, OpenWeather, and Google nodes, spread calculations, and outlier detection logic.
4. **Inspect Risk Tab:** Walk through the weighted factor matrix (PM2.5, Thermal, UV) and activity advisories.
5. **Interactive Map:** Pan around global benchmark stations, click nodes, and switch active monitoring with 1 click.
6. **AI Assistant:** Click "AI Climate Assistant" and ask: *"Is the weather safe for outdoor activities?"* to demonstrate 100% data-grounded responses without hallucination.

---

## Team

- **IEEE Hackathon Team – ClimateGuard AI**

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
