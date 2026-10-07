import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Heart, 
  Activity, 
  CheckCircle, 
  Flame, 
  Thermometer, 
  Sun, 
  Wind, 
  CloudRain,
  Info
} from 'lucide-react';

export default function RiskAnalysisView({ data }) {
  if (!data) return null;
  const { risk, location, current_conditions: curr, air_quality: aq } = data;

  const factors = risk?.main_contributing_factors || [];

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-emerald-400';
      case 'MODERATE': return 'text-amber-400';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'SAFE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ELEVATED': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Risk Score Hero Card */}
      <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Comprehensive Environmental Risk Index
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Multi-factor health and atmospheric safety index for <span className="text-white font-medium">{location?.name}</span>.
            </p>
            <p className="text-xs text-slate-300 mt-3 max-w-2xl bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {risk?.health_advisory}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shrink-0 w-full md:w-56 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Composite Risk</span>
            <div className={`text-5xl font-extrabold font-mono my-1 tracking-tight ${getRiskColor(risk?.risk_level)}`}>
              {risk?.risk_score?.toFixed(0)}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Scale: 0 - 100</span>
            <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full border uppercase ${getSeverityBadge(risk?.risk_level)}`}>
              {risk?.risk_level} Hazard
            </div>
          </div>
        </div>
      </div>

      {/* Main Contributing Stressors Breakdown */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Contributing Environmental Stressors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {factors.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{f.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(f.severity)}`}>
                    {f.severity}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    {f.value !== null ? `${f.value} ${f.unit}` : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Weight: {(f.weight * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Subscore Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Subscore Impact</span>
                    <span className="font-mono">{f.subscore?.toFixed(0)} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.subscore > 75 ? 'bg-rose-500' : f.subscore > 50 ? 'bg-orange-500' : f.subscore > 25 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, f.subscore)}%` }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Recommendations Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Recommended Actions */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Activity & Health Guidance
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {risk?.activity_recommendations?.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Population Vulnerability Guide */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Vulnerable Population Advisories
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-0.5">Asthma & Respiratory Patients</span>
              <span className="text-slate-400">
                {aq?.pm25 > 35 ? 'Elevated fine particulates. Keep inhalers accessible and wear particulate respirators.' : 'Air particulate within acceptable thresholds.'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-0.5">Endurance Runners & Athletes</span>
              <span className="text-slate-400">
                {curr?.temperature_c > 33 || aq?.pm25 > 50 ? 'Reschedule outdoor intense cardio to early morning hours.' : 'Safe conditions for outdoor endurance training.'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="font-bold text-slate-200 block mb-0.5">Children & Senior Citizens</span>
              <span className="text-slate-400">
                {risk?.risk_score > 50 ? 'Limit prolonged direct afternoon outdoor exposure.' : 'Outdoor recreation safe with normal sun protection.'}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
