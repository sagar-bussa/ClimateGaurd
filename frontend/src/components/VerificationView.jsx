import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart2, 
  HelpCircle, 
  Layers, 
  ExternalLink,
  Sliders,
  Scale
} from 'lucide-react';

export default function VerificationView({ data }) {
  if (!data) return null;
  const { verification: verif, sources = [], location } = data;
  const params = verif?.parameters || {};

  const getConsistencyPill = (level) => {
    switch (level) {
      case 'VERY_HIGH':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'HIGH':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'MODERATE':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'LOW':
      case 'INCONSISTENT':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Multi-Source Sensor Cross-Verification Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Location: <span className="text-white font-medium">{location?.name}</span> • Inter-provider concordance, statistical spread, and outlier discrimination.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Estimated Confidence</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {verif?.overall_confidence_score?.toFixed(1)}%
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Verification Status</div>
              <div className={`text-xs font-bold px-2 py-0.5 rounded border uppercase mt-1 ${
                verif?.verification_status === 'VERIFIED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {verif?.verification_status}
              </div>
            </div>
          </div>
        </div>

        {/* Warning if inconsistency detected */}
        {verif?.potential_outliers && verif?.potential_outliers.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-amber-950/30 border border-amber-800/80 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                Warning: Sensor Inconsistency Detected
              </div>
              <p className="text-xs text-amber-300/90 mt-0.5">
                The verification engine identified high inter-provider divergence. 
                Potential outlier source(s): <span className="font-bold underline">{verif.potential_outliers.join(', ')}</span>.
                Consensus values have been trimmed to maintain data integrity.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Ingested Provider Nodes */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Independent Reporting Nodes Ingested ({sources.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sources.map((src, i) => (
            <div 
              key={i}
              className={`p-4 rounded-xl border transition ${
                verif?.potential_outliers?.includes(src.source)
                  ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{src.source}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  src.source_status === 'ONLINE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {src.source_status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Temperature</span>
                  <span className="font-mono font-semibold text-white">
                    {src.temperature_c !== null ? `${src.temperature_c}°C` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Relative Humidity</span>
                  <span className="font-mono font-semibold text-white">
                    {src.humidity_pct !== null ? `${src.humidity_pct}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Wind Velocity</span>
                  <span className="font-mono font-semibold text-white">
                    {src.wind_speed_kmh !== null ? `${src.wind_speed_kmh} km/h` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Barometric Pressure</span>
                  <span className="font-mono font-semibold text-white">
                    {src.pressure_hpa !== null ? `${src.pressure_hpa} hPa` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">PM2.5 Particulate</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {src.pm25 !== null ? `${src.pm25} µg/m³` : 'N/A'}
                  </span>
                </div>
              </div>

              {verif?.potential_outliers?.includes(src.source) && (
                <div className="mt-3 pt-2 border-t border-rose-800/60 text-[11px] text-rose-300 font-medium">
                  ⚠️ Flagged as potential outlier for this interval
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parameter-by-Parameter Cross Verification Table */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Parameter Variance & Consensus Analysis
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3 px-3">Parameter</th>
                <th className="py-3 px-3">Consensus Value</th>
                <th className="py-3 px-3">Min / Max</th>
                <th className="py-3 px-3">Spread (Delta)</th>
                <th className="py-3 px-3">Agreement Level</th>
                <th className="py-3 px-3">Confidence Score</th>
                <th className="py-3 px-3">Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.keys(params).map((key) => {
                const p = params[key];
                return (
                  <tr key={key} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-semibold text-white">
                      {p.display_name}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {p.consensus_value} {p.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {p.min_value} - {p.max_value} {p.unit}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-300">
                      ±{p.difference} {p.unit}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getConsistencyPill(p.consistency_level)}`}>
                        {p.consistency_level}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {p.confidence_score?.toFixed(0)}%
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {p.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Transparency Card */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Scientific Verification Methodology (IEEE Presentation Notes)</span>
        </div>
        <p>
          ClimateGuard AI avoids naïve averaging. Discrepancies between environmental sensors are analyzed using 
          <strong> Median Absolute Deviation (MAD)</strong> and empirical standard error bounds for each atmospheric variable.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="font-bold text-slate-300 block mb-1">1. Consensus Clustering</span>
            Identifies central concordant clusters. Prevents extreme physical outliers from distorting verified averages.
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="font-bold text-slate-300 block mb-1">2. Confidence Metric</span>
            Scales between 0–100%. Confidence is presented as an estimated consistency indicator, not an assertion of absolute certainty.
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <span className="font-bold text-slate-300 block mb-1">3. Non-Defamatory Labeling</span>
            Deviating feeds are designated strictly as "potential outlier" or "requires verification" to respect data provider integrity.
          </div>
        </div>
      </div>

    </div>
  );
}
