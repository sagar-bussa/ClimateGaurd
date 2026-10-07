import React from 'react';
import { 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Layers, 
  CheckCircle2, 
  BarChart, 
  Award,
  Database
} from 'lucide-react';

export default function MethodologyView() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Overview Banner */}
      <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <Award className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            ClimateGuard AI – Technical Architecture & Methodology
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Prepared for IEEE Hackathon Evaluation. Pure software architecture with multi-source sensor consensus, 
          Isolation Forest anomaly detection, and transparent environmental risk modeling.
        </p>
      </div>

      {/* 3 Core Innovations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Multi-Source Verification</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Eliminates single-provider bias by cross-validating Open-Meteo (ECMWF/GFS), OpenWeatherMap, 
            and Google Air Quality API. Computes spread, robust median consensus, and confidence metrics.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">2. AI Anomaly Detection</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Unsupervised Isolation Forest combined with climatological multivariate Z-Score boundaries. 
            Strictly distinguishes real-world extreme environmental events from sensor hardware discrepancies.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">3. Environmental Risk Index</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            A unified 0–100 index integrating PM2.5 (30%), Temperature (25%), Solar UV (15%), 
            Wind velocity (10%), Rain probability (10%), and coarse dust PM10 (10%) with WHO guidelines.
          </p>
        </div>
      </div>

      {/* Pipeline Flowchart Description */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          End-to-End Processing Pipeline
        </h3>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-400 shrink-0">STEP 1</span>
            <div>
              <strong className="text-white">Geospatial Resolution:</strong> User inputs location string (e.g., "Hyderabad"). Resolved via Google Geocoding or OpenStreetMap Nominatim into precise geographic coordinates (lat, lon).
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-400 shrink-0">STEP 2</span>
            <div>
              <strong className="text-white">Parallel Ingestion & Normalization:</strong> Fast asynchronous HTTP (FastAPI + httpx) queries external endpoints concurrently. Normalizes diverse JSON payloads into a strict unified schema.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-400 shrink-0">STEP 3</span>
            <div>
              <strong className="text-white">Consensus & Outlier Discrimination:</strong> Calculates spread ($\Delta$) and Median Absolute Deviation (MAD). When a provider deviates significantly beyond physical tolerances, it is tagged as a "potential outlier" without claiming absolute wrongness.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-400 shrink-0">STEP 4</span>
            <div>
              <strong className="text-white">Machine Learning Evaluation:</strong> Feeds normalized 8-dimensional atmospheric vectors to the Isolation Forest model to isolate statistical extremes (e.g., severe heatwaves, smog inversions).
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
            <span className="font-mono font-bold text-emerald-400 shrink-0">STEP 5</span>
            <div>
              <strong className="text-white">Persistence & Presentation:</strong> Results are persisted to a secure telemetry ledger and streamed to the React dashboard with sub-second latency.
            </div>
          </div>
        </div>
      </div>

      {/* Security & GitHub Compliance */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          Security & Production Standards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <strong className="text-white block mb-1">Zero Secret Frontend Leakage</strong>
            The browser client only interacts with the FastAPI backend. Private API keys, database URLs, and service keys are held strictly in server-side environment variables.
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <strong className="text-white block mb-1">GitHub Friendly Monorepo</strong>
            Rigorous <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">.gitignore</code> ensures that zero <code className="text-slate-400">.env</code> files, credentials, or service account files can ever be tracked or committed.
          </div>
        </div>
      </div>

    </div>
  );
}
