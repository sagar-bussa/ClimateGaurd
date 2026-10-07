import httpx
import logging
import json
from typing import Dict, Any, List, Optional
from ..config import settings
from ..schemas.weather import ChatQueryResponse

logger = logging.getLogger(__name__)

class ClimateAssistantService:
    @classmethod
    async def answer_query(
        cls,
        user_message: str,
        context_data: Optional[Dict[str, Any]] = None
    ) -> ChatQueryResponse:
        # Check if context data is available
        if not context_data:
            return ChatQueryResponse(
                reply="I don't have enough current environmental data loaded to answer that reliably. Please search or select a location first.",
                sources_cited=[],
                data_backed=False
            )

        loc = context_data.get("location", {})
        city = loc.get("name", "the selected area")
        curr = context_data.get("current_conditions", {})
        aq = context_data.get("air_quality", {})
        risk = context_data.get("risk", {})
        verif = context_data.get("verification", {})
        anomaly = context_data.get("anomaly", {})

        temp = curr.get("temperature_c")
        hum = curr.get("humidity_pct")
        wind = curr.get("wind_speed_kmh")
        uv = curr.get("uv_index")
        pm25 = aq.get("pm25")
        pm10 = aq.get("pm10")
        risk_score = risk.get("risk_score")
        risk_level = risk.get("risk_level")
        conf_score = verif.get("overall_confidence_score")
        verif_status = verif.get("verification_status")

        # 1. Try Gemini API if key is available and valid
        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("your_"):
            try:
                system_prompt = (
                    "You are ClimateGuard AI Assistant, an environmental scientist in an IEEE hackathon platform. "
                    "CRITICAL INSTRUCTIONS:\n"
                    "1. Answer user queries strictly using the provided ground-truth environmental readings.\n"
                    "2. NEVER invent, hallucinate, or estimate environmental readings that are not provided.\n"
                    "3. If requested data is missing, explicitly say: 'I don't have enough current data to answer that reliably.'\n"
                    "4. Always cite verified numbers (e.g. Temperature, PM2.5, Risk Score, Verification Confidence).\n"
                    "5. Keep responses concise, objective, and scientifically professional."
                )

                context_summary = f"""
Current Location: {city}
Temperature: {temp}°C (Feels like: {curr.get('feels_like_c')}°C)
Humidity: {hum}%
Wind Speed: {wind} km/h
UV Index: {uv}
PM2.5: {pm25} µg/m³
PM10: {pm10} µg/m³
Environmental Risk Score: {risk_score}/100 ({risk_level})
Verification Confidence: {conf_score}% (Status: {verif_status})
Anomaly Flagged: {anomaly.get('is_anomaly', False)} ({anomaly.get('severity', 'NORMAL')})
Top Contributing Risk Factors: {[f.get('name') for f in risk.get('main_contributing_factors', [])]}
"""

                async with httpx.AsyncClient(timeout=8.0) as client:
                    # Support Google AI Studio Gemini API endpoint
                    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                    payload = {
                        "contents": [
                            {"role": "user", "parts": [{"text": f"{system_prompt}\n\nDATA CONTEXT:\n{context_summary}\n\nUSER QUESTION:\n{user_message}"}]}
                        ],
                        "generationConfig": {
                            "temperature": 0.2,
                            "maxOutputTokens": 350
                        }
                    }
                    resp = await client.post(gemini_url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if text:
                                return ChatQueryResponse(
                                    reply=text.strip(),
                                    sources_cited=["Open-Meteo", "OpenWeather", "Google Air Quality", "ClimateGuard Consensus Engine"],
                                    data_backed=True
                                )
                    else:
                        logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Falling back to structured response.")

        # 2. Resilient Rule-Based Ground-Truth Assistant (100% data-backed, zero hallucination)
        msg_lower = user_message.lower()

        # Query: Outdoor safety / sports
        if any(w in msg_lower for w in ["safe", "outdoor", "exercise", "walk", "activity", "run"]):
            if risk_score is None:
                return ChatQueryResponse(reply="I don't have enough current data to answer that reliably.", data_backed=False)

            if risk_score <= 25.0:
                reply = f"Yes, the outdoor environment in {city} is safe. Current Risk Score is {risk_score:.0f}/100 (LOW). Temperature is {temp}°C, PM2.5 is {pm25} µg/m³, and UV index is {uv}. Conditions are ideal for outdoor activities."
            elif risk_score <= 50.0:
                reply = f"Conditions in {city} are moderately safe (Risk Score: {risk_score:.0f}/100 - MODERATE). Temperature is {temp}°C and PM2.5 is {pm25} µg/m³. Healthy individuals can proceed normally, while sensitive groups should monitor respiratory comfort."
            else:
                top_risk = risk.get('main_contributing_factors', [{}])[0].get('name', 'elevated environmental stressors')
                reply = f"Caution is advised for outdoor exertion in {city}. The Environmental Risk Score is {risk_score:.0f}/100 ({risk_level}), primarily due to {top_risk}. PM2.5 is currently {pm25} µg/m³ and Temperature is {temp}°C. Sensitive groups should remain indoors."
            return ChatQueryResponse(reply=reply, sources_cited=["ClimateGuard Risk Engine", "Open-Meteo"], data_backed=True)

        # Query: Why is risk high / what factor is causing risk
        if any(w in msg_lower for w in ["why", "factor", "cause", "causing", "risk high", "risk"]):
            factors = risk.get("main_contributing_factors", [])
            if not factors:
                return ChatQueryResponse(reply=f"In {city}, the current risk score is {risk_score}/100 ({risk_level}).", data_backed=True)

            factor_strs = [f"{f.get('name')} ({f.get('value')}{f.get('unit')} - severity: {f.get('severity')})" for f in factors]
            reply = f"The environmental risk in {city} is currently {risk_score:.0f}/100 ({risk_level}). The primary contributing factors are: " + "; ".join(factor_strs) + f". {risk.get('health_advisory', '')}"
            return ChatQueryResponse(reply=reply, sources_cited=["Risk Scoring Engine"], data_backed=True)

        # Query: Verification / confidence / data consistency
        if any(w in msg_lower for w in ["verify", "verification", "confidence", "consistency", "outlier", "reliable"]):
            outliers = verif.get("potential_outliers", [])
            outlier_msg = f" Potential outlier identified: {', '.join(outliers)}." if outliers else " All active reporting sources are in close agreement."
            reply = f"In {city}, multi-source verification yields an estimated data confidence of {conf_score:.1f}% ({verif.get('confidence_label')}). Status: {verif_status}.{outlier_msg} {verif.get('summary_statement', '')}"
            return ChatQueryResponse(reply=reply, sources_cited=["Multi-Source Verification Engine"], data_backed=True)

        # Query: Air quality improving / status
        if any(w in msg_lower for w in ["air quality", "pm2.5", "pm25", "pollution", "air"]):
            if pm25 is None and pm10 is None:
                return ChatQueryResponse(reply="I don't have enough current air quality data to answer that reliably.", data_backed=False)
            reply = f"Current air quality metrics in {city}: PM2.5 is {pm25} µg/m³, PM10 is {pm10} µg/m³, Ozone (O3) is {aq.get('o3')} µg/m³, and NO2 is {aq.get('no2')} µg/m³. Overall particulate safety rating: {'Acceptable' if (pm25 or 0) < 35 else 'Elevated/Unhealthy'}."
            return ChatQueryResponse(reply=reply, sources_cited=["Google Air Quality / Open-Meteo AQ"], data_backed=True)

        # Generic / fallback
        reply = (
            f"ClimateGuard AI status for {city}:\n"
            f"• Temperature: {temp}°C (Humidity: {hum}%, Wind: {wind} km/h)\n"
            f"• Air Quality: PM2.5 = {pm25} µg/m³, PM10 = {pm10} µg/m³\n"
            f"• Environmental Risk: {risk_score:.0f}/100 ({risk_level})\n"
            f"• Multi-Source Data Confidence: {conf_score:.1f}% ({verif_status})\n"
            f"You can ask me about outdoor safety, risk factors, sensor consistency, or specific pollutant levels."
        )
        return ChatQueryResponse(reply=reply, sources_cited=["Multi-Source Consensus Engine"], data_backed=True)
