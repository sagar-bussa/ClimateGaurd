import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  Info, 
  Compass, 
  BarChart3, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { searchLocations, getPresetLocations } from '../services/api';

export default function Navbar({ 
  currentLocation, 
  onSelectLocation, 
  activeTab, 
  setActiveTab,
  isDemoMode,
  verificationStatus,
  onOpenAssistant
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const results = await searchLocations(val);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    } else if (val.trim().length === 0) {
      try {
        const presets = await getPresetLocations();
        setSearchResults(presets);
        setShowDropdown(true);
      } catch (err) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'verification', label: 'Data Verification', icon: CheckCircle2 },
    { id: 'risk', label: 'Environmental Risk', icon: AlertTriangle },
    { id: 'trends', label: 'Climate Trends', icon: BarChart3 },
    { id: 'map', label: 'Live Map', icon: Compass },
    { id: 'about', label: 'Methodology', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-emerald-500/40 shadow-lg shadow-emerald-500/25 shrink-0 bg-slate-950 p-0.5 flex items-center justify-center">
              <img 
                src="/logo.jpg" 
                alt="ClimateGuard AI Logo" 
                className="w-full h-full object-cover object-left rounded-[10px]" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  ClimateGuard AI
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  IEEE Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI-Driven Climate Intelligence
              </p>
            </div>
          </div>

          {/* Search bar with Autocomplete */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={async () => {
                  if (!searchQuery) {
                    const presets = await getPresetLocations();
                    setSearchResults(presets);
                  }
                  setShowDropdown(true);
                }}
                placeholder={`Search city or location (e.g. ${currentLocation?.name || 'Hyderabad'})...`}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <span>Suggested Monitoring Stations</span>
                  <span className="text-slate-500">Live Geocoding</span>
                </div>
                {searchResults.map((loc, idx) => (
                  <button
                    key={`${loc.name}-${loc.latitude}-${idx}`}
                    onClick={() => handleSelect(loc)}
                    className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-800/80 flex items-center justify-between transition border-b border-slate-800/40 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium text-slate-100">{loc.name}</span>
                      {loc.country && <span className="text-[11px] text-slate-400">({loc.country})</span>}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action: AI Climate Assistant & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isDemoMode && (
              <span className="text-[10px] font-medium px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Demo Data Mode
              </span>
            )}
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">AI Climate Assistant</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
