import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Sun, 
  CloudRain, 
  Cloud, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  ShieldAlert, 
  ArrowUpRight, 
  Activity, 
  Flame,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardView({ data, onNavigateTab, onSelectLocation }) {
  if (!data) return null;

  const {
    location,
    current_conditions: curr,
    air_quality: aq,
    verification: verif,
    risk,
    anomaly,
    sources = [],
    forecast = [],
    alerts = []
  } = data;

  // Color mapping for Risk
  const getRiskBadge = (level) => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'MODERATE':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  // Color mapping for Confidence Score
  const getConfidenceColor = (score) => {
    if (score >= 95) return 'text-emerald-400';
    if (score >= 85) return 'text-teal-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6">
      
      {/* Location Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {location?.name}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {location?.latitude?.toFixed(2)}°N, {location?.longitude?.toFixed(2)}°E
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Monitoring Node
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time consensus synthesized from {sources.length} atmospheric providers.
          </p>
        </div>

        {/* Quick Location Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 hidden lg:inline">Quick Benchmarks:</span>
          {[
            { name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, lat: 17.3850, lon: 78.4867 },
            { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, lat: 12.9716, lon: 77.5946 },
            { name: 'Delhi', latitude: 28.6139, longitude: 77.2090, lat: 28.6139, lon: 77.2090 },
            { name: 'London', latitude: 51.5074, longitude: -0.1278, lat: 51.5074, lon: -0.1278 },
            { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, lat: 35.6762, lon: 139.6503 }
          ].map((bench) => (
            <button
              key={bench.name}
              onClick={() => onSelectLocation(bench)}
              className={`text-xs px-2.5 py-1 rounded-md transition ${
                location?.name === bench.name
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {bench.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Alerts Banner if any */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-3.5 rounded-lg border flex items-start gap-3 transition ${
                al.severity === 'CRITICAL'
                  ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                  : al.severity === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                  : 'bg-cyan-950/30 border-cyan-800 text-cyan-200'
              }`}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold tracking-wide uppercase text-[11px]">{al.title}</span>
                  <span className="text-[10px] text-slate-400">{al.timestamp}</span>
                </div>
                <p className="mt-0.5 text-slate-300">{al.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Primary Triad: Verification Consensus | Risk Score | ML Anomaly Detector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Multi-Source Verification Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Data Verification
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                verif?.verification_status === 'VERIFIED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {verif?.verification_status}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${getConfidenceColor(verif?.overall_confidence_score)}`}>
                {verif?.overall_confidence_score?.toFixed(0)}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {verif?.confidence_label}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-300 line-clamp-2">
              {verif?.summary_statement}
            </p>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{verif?.sources_responding} of {verif?.sources_queried} providers reporting</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('verification')}
            className="mt-4 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>Inspect Inter-Source Spread</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        {/* 2. Environmental Risk Analysis Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Environmental Risk
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${getRiskBadge(risk?.risk_level)}`}>
                {risk?.risk_level} Risk
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                {risk?.risk_score?.toFixed(0)}
              </span>
              <span className="text-xs text-slate-400">/ 100 Index</span>
            </div>

            <div className="mt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Top Contributing Stressors:
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {risk?.main_contributing_factors?.map((f, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
                  >
                    {f.name}: {f.value} {f.unit}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-300 line-clamp-2">
              {risk?.health_advisory}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('risk')}
            className="mt-4 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>View Full Risk Matrix</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* 3. AI Isolation Forest Anomaly Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                ML Anomaly Engine
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                anomaly?.is_anomaly
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {anomaly?.severity}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-cyan-400 tracking-tight">
                {anomaly?.anomaly_score?.toFixed(0)}
              </span>
              <span className="text-xs text-slate-400">/ 100 Isolation Score</span>
            </div>

            <p className="mt-2 text-xs text-slate-300 line-clamp-3">
              {anomaly?.explanation}
            </p>

            <div className="mt-2 text-[10px] text-slate-400 font-mono">
              Algorithm: {anomaly?.detection_method}
            </div>
          </div>

          <div className="mt-4 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model: {anomaly?.model_version}</span>
            <span className="text-emerald-400 font-semibold">Active & Scored</span>
          </div>
        </div>

      </div>

      {/* Atmospheric Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Temperature', val: `${curr?.temperature_c}°C`, sub: `Feels ${curr?.feels_like_c}°C`, icon: Thermometer, color: 'text-amber-400' },
          { label: 'Humidity', val: `${curr?.humidity_pct}%`, sub: 'Dew Point Eq', icon: Droplets, color: 'text-cyan-400' },
          { label: 'Wind Speed', val: `${curr?.wind_speed_kmh} km/h`, sub: 'Surface 10m', icon: Wind, color: 'text-teal-400' },
          { label: 'Pressure', val: `${curr?.pressure_hpa} hPa`, sub: 'Barometric', icon: Gauge, color: 'text-indigo-400' },
          { label: 'Solar UV', val: curr?.uv_index ?? 'N/A', sub: 'Index (WHO)', icon: Sun, color: 'text-yellow-400' },
          { label: 'Rain Prob', val: `${curr?.rain_prob_pct}%`, sub: 'Precipitation', icon: CloudRain, color: 'text-blue-400' },
          { label: 'Cloud Cover', val: `${curr?.cloud_cover_pct}%`, sub: 'Sky Coverage', icon: Cloud, color: 'text-slate-400' },
          { label: 'PM2.5 Conc', val: `${aq?.pm25} µg/m³`, sub: 'Fine Particulate', icon: Flame, color: 'text-rose-400' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400 font-medium">{item.label}</span>
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-white">
                {item.val}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {item.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Air Quality Pollutants Matrix */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Air Quality & Atmospheric Pollutants
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            WHO Guidelines (2021) Concordance
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { code: 'PM2.5', name: 'Fine Particulates', val: aq?.pm25, unit: 'µg/m³', limit: '15 µg/m³' },
            { code: 'PM10', name: 'Coarse Dust', val: aq?.pm10, unit: 'µg/m³', limit: '45 µg/m³' },
            { code: 'CO', name: 'Carbon Monoxide', val: aq?.co, unit: 'µg/m³', limit: '4000 µg/m³' },
            { code: 'NO2', name: 'Nitrogen Dioxide', val: aq?.no2, unit: 'µg/m³', limit: '25 µg/m³' },
            { code: 'SO2', name: 'Sulfur Dioxide', val: aq?.so2, unit: 'µg/m³', limit: '40 µg/m³' },
            { code: 'O3', name: 'Surface Ozone', val: aq?.o3, unit: 'µg/m³', limit: '100 µg/m³' }
          ].map((pol) => {
            const isElevated = pol.val !== null && pol.val !== undefined && (
              (pol.code === 'PM2.5' && pol.val > 35) ||
              (pol.code === 'PM10' && pol.val > 50) ||
              (pol.code === 'NO2' && pol.val > 40)
            );
            return (
              <div
                key={pol.code}
                className={`p-3 rounded-lg border transition ${
                  isElevated
                    ? 'bg-amber-950/20 border-amber-800/60'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{pol.code}</span>
                  <span className="text-[9px] text-slate-400">WHO: {pol.limit}</span>
                </div>
                <div className="mt-2 text-base font-bold font-mono text-emerald-400">
                  {pol.val !== null && pol.val !== undefined ? `${pol.val} ${pol.unit}` : <span className="text-slate-500 text-xs">Data unavailable</span>}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {pol.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24-Hour Atmospheric Trajectory Chart */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              24-Hour Temperature & Humidity Trajectory
            </h3>
            <p className="text-xs text-slate-400">
              Cross-verified forecast and diurnal atmospheric curve for {location?.name}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Humidity (%)
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: 260, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={forecast.map(f => ({
                label: f.period_label,
                temp: f.temperature_c,
                humidity: f.humidity_pct
              }))}
              margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="humGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
              />
              <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGlow)" />
              <Area type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#humGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Forecast Trend */}
      {forecast && forecast.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Atmospheric Trajectory Forecast (24h - 36h)
            </h3>
            <span className="text-[11px] text-slate-400">
              Open-Meteo High-Resolution Model
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecast.map((f, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-medium block">{f.period_label}</span>
                <span className="text-base font-bold font-mono text-white mt-1 block">{f.temperature_c}°C</span>
                <span className="text-[10px] text-emerald-400 font-medium mt-0.5 block">{f.condition}</span>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <CloudRain className="w-3 h-3 text-cyan-400" />
                  <span>{f.rain_prob_pct}% Rain</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
