# ClimateGuard AI – Setup & Deployment Guide

This guide details local development setup, credentials configuration, Supabase database setup, and deployment options.

---

## 1. Prerequisites
- **Python**: Version 3.10+ (tested with Python 3.14)
- **Node.js**: Version 18+ (tested with Node v25)
- **Git**
- *(Optional)* Docker & Docker Compose

---

## 2. Environment Configuration

1. Copy the template `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate your private API keys in `.env`:
   ```bash
   OPENWEATHER_API_KEY=your_key
   GOOGLE_MAPS_API_KEY=your_key
   GEMINI_API_KEY=your_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=postgresql://...
   DEMO_MODE=false
   ```
   > **Security Note:** The `.gitignore` ensures that `.env` is never committed to GitHub.

---

## 3. Backend Setup

```bash
# Navigate to project root
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend server
uvicorn backend.app.main:app --reload --port 8000
```
Backend will be accessible at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

---

## 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`.

---

## 5. Supabase Database Migration

1. Log into your [Supabase Dashboard](https://supabase.com/).
2. Select your project and open the **SQL Editor**.
3. Copy and execute the contents of [`docs/database_schema.sql`](file:///c:/ClimateGuard/docs/database_schema.sql).
4. The tables (`locations`, `environmental_observations`, `verification_results`, `anomalies`, `alerts`) and Row Level Security policies will be created automatically.

---

## 6. Docker Setup (Optional)

```bash
docker-compose up --build
```
This runs the backend on port `8000` and frontend on port `5173`.
