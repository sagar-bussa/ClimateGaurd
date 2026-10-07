const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchEnvironmentSummary(lat = 17.3850, lon = 78.4867, name = "Hyderabad") {
  const url = `${API_BASE}/api/environment/summary?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch environmental summary (${res.status})`);
  }
  return await res.json();
}

export async function searchLocations(query) {
  if (!query || !query.trim()) return [];
  const url = `${API_BASE}/api/location/search?q=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Location search failed (${res.status})`);
  }
  return await res.json();
}

export async function getPresetLocations() {
  const url = `${API_BASE}/api/location/presets`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return await res.json();
}

export async function getEnvironmentHistory(name = "Hyderabad", range = "24h") {
  const url = `${API_BASE}/api/environment/history?name=${encodeURIComponent(name)}&range=${range}`;
  const res = await fetch(url);
  if (!res.ok) return { location: name, range, data_points: [] };
  return await res.json();
}

export async function getMapLocations() {
  const url = `${API_BASE}/api/map/locations`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return await res.json();
}

export async function askClimateAssistant(message, contextData) {
  const url = `${API_BASE}/api/assistant/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context_data: contextData })
  });
  if (!res.ok) {
    throw new Error(`Assistant query failed (${res.status})`);
  }
  return await res.json();
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) return { status: "degraded" };
    return await res.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
}
