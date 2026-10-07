import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import VerificationView from './components/VerificationView';
import RiskAnalysisView from './components/RiskAnalysisView';
import TrendsView from './components/TrendsView';
import MapView from './components/MapView';
import MethodologyView from './components/MethodologyView';
import ClimateAssistantModal from './components/ClimateAssistantModal';
import { fetchEnvironmentSummary, checkBackendHealth } from './services/api';
import { ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentLocation, setCurrentLocation] = useState({
    name: 'Hyderabad',
    latitude: 17.3850,
    longitude: 78.4867,
    country: 'India'
  });
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  // Fetch telemetry when location changes
  const loadData = async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEnvironmentSummary(loc.latitude, loc.longitude, loc.name);
      setSummaryData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to retrieve environmental data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentLocation);
    // Background health check
    checkBackendHealth().then(setHealthStatus).catch(() => {});
  }, [currentLocation]);

  const handleSelectLocation = (loc) => {
    if (!loc) return;
    const lat = loc.latitude ?? loc.lat ?? 17.3850;
    const lon = loc.longitude ?? loc.lon ?? 78.4867;
    setCurrentLocation({
      name: loc.name || 'Selected Area',
      latitude: Number(lat),
      longitude: Number(lon),
      country: loc.country || ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Navigation Header */}
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemoMode={summaryData?.is_demo_mode}
        verificationStatus={summaryData?.verification?.verification_status}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {loading && !summaryData && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin"></div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Aggregating Atmospheric Telemetry</h3>
              <p className="text-xs text-slate-400 mt-1">
                Cross-querying Open-Meteo, OpenWeather, and Google Air Quality nodes for {currentLocation.name}...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 my-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">Environmental Telemetry Error</h3>
              <p className="text-xs text-rose-300 mt-1">{error}</p>
              <button
                onClick={() => loadData(currentLocation)}
                className="mt-3 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Query</span>
              </button>
            </div>
          </div>
        )}

        {summaryData && (
          <div>
            {activeTab === 'dashboard' && (
              <DashboardView 
                data={summaryData} 
                onNavigateTab={setActiveTab}
                onSelectLocation={handleSelectLocation}
              />
            )}
            {activeTab === 'verification' && (
              <VerificationView data={summaryData} />
            )}
            {activeTab === 'risk' && (
              <RiskAnalysisView data={summaryData} />
            )}
            {activeTab === 'trends' && (
              <TrendsView 
                locationName={currentLocation.name} 
                currentSummary={summaryData}
              />
            )}
            {activeTab === 'map' && (
              <MapView 
                currentLocation={currentLocation} 
                onSelectLocation={handleSelectLocation}
              />
            )}
            {activeTab === 'about' && (
              <MethodologyView />
            )}
          </div>
        )}
      </main>

      {/* Floating AI Climate Assistant Modal */}
      <ClimateAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        contextData={summaryData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-5 h-5 rounded-md object-cover object-left border border-emerald-500/30" />
            <span className="font-semibold text-slate-300">ClimateGuard AI</span>
            <span>• IEEE Hackathon Production Build</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI Backend Active</span>
            <span>•</span>
            <span>Isolation Forest Anomaly ML</span>
            <span>•</span>
            <span>Secure Telemetry Ledger</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
