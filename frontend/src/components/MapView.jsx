import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Layers, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';
import { getMapLocations } from '../services/api';

const DEFAULT_NODES = [
  { name: "Hyderabad", country: "India", latitude: 17.3850, longitude: 78.4867, temperature_c: 32.9, pm25: 26.2, risk_score: 36.0, risk_level: "MODERATE", color_code: "#f59e0b", confidence_score: 94.0 },
  { name: "Bengaluru", country: "India", latitude: 12.9716, longitude: 77.5946, temperature_c: 28.4, pm25: 22.0, risk_score: 24.0, risk_level: "LOW", color_code: "#10b981", confidence_score: 96.0 },
  { name: "Delhi", country: "India", latitude: 28.6139, longitude: 77.2090, temperature_c: 34.2, pm25: 88.0, risk_score: 68.0, risk_level: "HIGH", color_code: "#f97316", confidence_score: 88.0 },
  { name: "Mumbai", country: "India", latitude: 19.0760, longitude: 72.8777, temperature_c: 31.5, pm25: 38.0, risk_score: 42.0, risk_level: "MODERATE", color_code: "#f59e0b", confidence_score: 91.0 },
  { name: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707, temperature_c: 33.1, pm25: 31.0, risk_score: 38.0, risk_level: "MODERATE", color_code: "#f59e0b", confidence_score: 93.0 },
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, temperature_c: 16.5, pm25: 11.0, risk_score: 15.0, risk_level: "LOW", color_code: "#10b981", confidence_score: 98.0 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.0060, temperature_c: 19.2, pm25: 14.5, risk_score: 18.0, risk_level: "LOW", color_code: "#10b981", confidence_score: 97.0 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503, temperature_c: 21.0, pm25: 18.0, risk_score: 20.0, risk_level: "LOW", color_code: "#10b981", confidence_score: 96.0 },
  { name: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198, temperature_c: 30.2, pm25: 20.0, risk_score: 26.0, risk_level: "MODERATE", color_code: "#f59e0b", confidence_score: 95.0 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, temperature_c: 22.8, pm25: 9.0, risk_score: 12.0, risk_level: "LOW", color_code: "#10b981", confidence_score: 98.0 }
];

export default function MapView({ currentLocation, onSelectLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [nodes, setNodes] = useState(DEFAULT_NODES);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    // 1. Initialize Leaflet Map
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const initialLat = currentLocation?.latitude || 17.3850;
      const initialLon = currentLocation?.longitude || 78.4867;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([initialLat, initialLon], 5);

      // OpenStreetMap with Dark Tile Filter (100% reliable worldwide)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'map-tiles-dark'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Force recalculate map geometry once DOM renders
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    // 2. Fetch live station nodes from API
    async function loadNodes() {
      try {
        const data = await getMapLocations();
        if (data && data.length > 0) {
          setNodes(data);
        }
      } catch (err) {
        console.error('Map location fetch fallback:', err);
      }
    }
    loadNodes();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Recenter and invalidate when location changes
  useEffect(() => {
    if (mapInstanceRef.current && currentLocation) {
      const lat = currentLocation.latitude ?? currentLocation.lat;
      const lon = currentLocation.longitude ?? currentLocation.lon;

      if (typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
        mapInstanceRef.current.setView([lat, lon], 6, {
          animate: true
        });
      }
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }
  }, [currentLocation]);

  // Render station markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    nodes.forEach((node) => {
      const markerColor = node.color_code || '#10b981';

      // Custom pulsing HTML marker
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background-color: ${markerColor}; 
            border: 2px solid #ffffff; 
            border-radius: 50%; 
            box-shadow: 0 0 14px ${markerColor};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([node.latitude, node.longitude], { icon: customIcon });

      marker.on('click', () => {
        setSelectedNode(node);
      });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 6px; min-width: 190px;">
          <div style="font-weight: 800; font-size: 14px; color: #f8fafc; margin-bottom: 2px;">
            ${node.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            ${node.country || 'Global Station'}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: #94a3b8;">Temperature:</span>
            <strong style="color: #f8fafc;">${node.temperature_c ?? 'N/A'}°C</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: #94a3b8;">Air Quality:</span>
            <strong style="color: #34d399;">${node.pm25 ?? 'N/A'} µg/m³</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="color: #94a3b8;">Risk Score:</span>
            <strong style="color: ${markerColor};">${node.risk_score?.toFixed(0)} (${node.risk_level})</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
            <span style="color: #94a3b8;">Confidence:</span>
            <strong style="color: #38bdf8;">${node.confidence_score?.toFixed(0)}%</strong>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current.addLayer(marker);
    });

    // Invalidate map geometry to ensure full rendering
    mapInstanceRef.current.invalidateSize();
  }, [nodes]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Global Environmental Monitoring Mesh
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time geospatial tracking with multi-source consistency and risk categorization.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Low Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Critical</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Node Detail Overlay Card (when clicked) */}
        {selectedNode && (
          <div className="absolute bottom-5 left-5 z-20 max-w-sm bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-base">{selectedNode.name}</h4>
                <p className="text-xs text-slate-400">{selectedNode.country}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Temperature</span>
                <span className="font-bold text-white font-mono">{selectedNode.temperature_c}°C</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Air Quality (PM2.5)</span>
                <span className="font-bold text-emerald-400 font-mono">{selectedNode.pm25} µg/m³</span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Risk Score</span>
                <span className="font-bold font-mono" style={{ color: selectedNode.color_code }}>
                  {selectedNode.risk_score?.toFixed(0)} ({selectedNode.risk_level})
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Data Confidence</span>
                <span className="font-bold text-cyan-400 font-mono">{selectedNode.confidence_score?.toFixed(0)}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectLocation({
                  name: selectedNode.name,
                  latitude: selectedNode.latitude,
                  longitude: selectedNode.longitude
                });
              }}
              className="mt-3 w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              Monitor This Station in Dashboard
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
