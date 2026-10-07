-- ==============================================================================
-- ClimateGuard AI - PostgreSQL / Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    region VARCHAR(150),
    country VARCHAR(150),
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_coords ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);

-- 3. Unified Environmental Observations (Summary table for fast dashboard timeseries)
CREATE TABLE IF NOT EXISTS environmental_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_name VARCHAR(150) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    temperature_c NUMERIC(5, 2),
    humidity_pct NUMERIC(5, 2),
    pm25 NUMERIC(6, 2),
    pm10 NUMERIC(6, 2),
    risk_score NUMERIC(5, 2),
    risk_level VARCHAR(50),
    confidence_score NUMERIC(5, 2),
    verification_status VARCHAR(50),
    is_anomaly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observations_loc_time ON environmental_observations(location_name, created_at DESC);

-- 4. Individual Provider Source Readings (Raw ingested data points)
CREATE TABLE IF NOT EXISTS source_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID REFERENCES environmental_observations(id) ON DELETE CASCADE,
    source_name VARCHAR(100) NOT NULL,
    temperature_c NUMERIC(5, 2),
    humidity_pct NUMERIC(5, 2),
    wind_speed_kmh NUMERIC(5, 2),
    pressure_hpa NUMERIC(6, 2),
    pm25 NUMERIC(6, 2),
    pm10 NUMERIC(6, 2),
    co NUMERIC(7, 2),
    no2 NUMERIC(6, 2),
    so2 NUMERIC(6, 2),
    o3 NUMERIC(6, 2),
    is_simulated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_readings_source ON source_readings(source_name);

-- 5. Verification Results Table (Consensus & statistical metrics)
CREATE TABLE IF NOT EXISTS verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID REFERENCES environmental_observations(id) ON DELETE CASCADE,
    overall_confidence_score NUMERIC(5, 2) NOT NULL,
    confidence_label VARCHAR(50) NOT NULL,
    verification_status VARCHAR(50) NOT NULL,
    sources_queried INT NOT NULL,
    sources_responding INT NOT NULL,
    potential_outliers JSONB,
    parameter_verifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Anomalies Table (Flagged by Isolation Forest)
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_name VARCHAR(150) NOT NULL,
    anomaly_score NUMERIC(5, 2) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    anomalous_features JSONB,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    current_value VARCHAR(100),
    threshold VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row-Level Security (RLS) Settings
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to environmental data for dashboard clients
CREATE POLICY "Public read environmental observations" ON environmental_observations FOR SELECT USING (true);
CREATE POLICY "Public read verification results" ON verification_results FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
