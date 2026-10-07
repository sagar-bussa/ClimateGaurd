# ClimateGuard AI – System Architecture

ClimateGuard AI is an intelligent climate data verification and environmental monitoring platform designed to eliminate single-provider bias, detect climatological anomalies, and calculate comprehensive environmental risk.

```
                              User Search / Map Selection
                                           │
                                           ▼
                                 [FastAPI Backend Core]
                                           │
              ┌────────────────────────────┼───────────────────────────┐
              ▼                            ▼                           ▼
    [Open-Meteo API]              [OpenWeatherMap API]        [Google Air Quality API]
 (ECMWF/GFS Physics Model)        (Ground Weather Feed)       (High-Res Atmospheric Pollutants)
              │                            │                           │
              └────────────────────────────┼───────────────────────────┘
                                           │
                                           ▼
                           [Data Normalization Engine]
                                           │
                                           ▼
                        [Statistical Consensus & Verification]
                           • Median Absolute Deviation (MAD)
                           • Inter-Provider Spread (Δ)
                           • Outlier Identification
                           • Estimated Confidence Score (0-100%)
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
       [ML Anomaly Detection Engine]               [Environmental Risk Scoring Engine]
         • Scikit-Learn Isolation Forest             • PM2.5 (30%) & PM10 (10%)
         • Multivariate Climatological Z-Score       • Temperature Stress (25%)
         • Physics Extremes Discrimination           • Solar UV (15%)
                                                     • Wind (10%) & Precipitation (10%)
                     └─────────────────────┬─────────────────────┘
                                           │
                                           ▼
                            [Supabase PostgreSQL Ledger]
                             • Continuous Observation History
                             • Anomaly & Outlier Logs
                                           │
                                           ▼
                             [React + Vite + Tailwind Dashboard]
                               • Live Verification Inspector
                               • Risk Matrix & Activity Advisories
                               • Interactive Leaflet Map
                               • Data-Grounded AI Climate Assistant
```

## Core Architectural Layers

### 1. Ingestion & Normalization Layer
- Asynchronously queries diverse third-party APIs using HTTPX connection pools.
- Standardizes diverse metric representations into a strict `NormalizedObservation` schema:
  - Temperatures in Celsius (°C)
  - Pressures in Hectopascals (hPa)
  - Velocities in km/h
  - Particulates in µg/m³

### 2. Multi-Source Verification Engine
- Avoids naive averaging by applying Median Absolute Deviation (MAD) and parameter tolerance thresholds.
- When an outlier deviates significantly from peer consensus, it is flagged as a "potential outlier" without claiming absolute ground-truth failure.
- Computes a transparent, weighted confidence score ($0 - 100\%$).

### 3. Machine Learning Anomaly Engine
- Employs an Isolation Forest unsupervised model trained on representative global climatological feature distributions.
- Isolates multi-dimensional atmospheric extremes (heat dome inversions, severe dust fronts, cyclone depressions).
- Distinguishes **Environmental Anomalies** (real atmospheric extremes) from **Data Inconsistencies** (sensor divergence).

### 4. Environmental Risk Index
- Synthesizes WHO Air Quality Guidelines (2021) and NOAA Heat/UV matrices into a unified composite index ($0 - 100$).
- Generates categorized health advisories for general populations, endurance athletes, and vulnerable respiratory demographics.
