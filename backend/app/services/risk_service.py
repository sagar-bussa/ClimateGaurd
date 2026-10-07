import logging
from typing import List, Dict, Any, Optional
from ..schemas.weather import EnvironmentalRiskReport, ContributingFactor

logger = logging.getLogger(__name__)

class RiskEngine:
    @classmethod
    def calculate_environmental_risk(
        cls,
        temperature_c: Optional[float],
        humidity_pct: Optional[float],
        wind_speed_kmh: Optional[float],
        uv_index: Optional[float],
        rain_prob_pct: Optional[float],
        pm25: Optional[float],
        pm10: Optional[float]
    ) -> EnvironmentalRiskReport:
        factors: List[ContributingFactor] = []

        # 1. PM2.5 Air Pollution Subscore (Weight: 30%)
        pm25_sub = 10.0
        pm25_sev = "SAFE"
        pm25_desc = "Clean air quality within WHO standard guideline (<15 µg/m³)."
        if pm25 is not None:
            if pm25 > 150.0:
                pm25_sub = 95.0
                pm25_sev = "CRITICAL"
                pm25_desc = f"Extremely hazardous PM2.5 particulate concentration ({pm25:.1f} µg/m³). Avoid outdoor exposure."
            elif pm25 > 55.0:
                pm25_sub = 80.0
                pm25_sev = "HIGH"
                pm25_desc = f"Unhealthy PM2.5 particulate concentration ({pm25:.1f} µg/m³). Sensitive groups should stay indoors."
            elif pm25 > 35.0:
                pm25_sub = 55.0
                pm25_sev = "ELEVATED"
                pm25_desc = f"Moderate/Elevated PM2.5 level ({pm25:.1f} µg/m³). Respiratory protection recommended."
            elif pm25 > 15.0:
                pm25_sub = 30.0
                pm25_sev = "SAFE"
                pm25_desc = f"Acceptable PM2.5 level ({pm25:.1f} µg/m³)."
        factors.append(ContributingFactor(
            factor="pm25",
            name="Air Quality (PM2.5)",
            value=pm25,
            unit="µg/m³",
            weight=0.30,
            subscore=pm25_sub,
            severity=pm25_sev,
            description=pm25_desc
        ))

        # 2. Thermal Stress / Temperature (Weight: 25%)
        temp_sub = 15.0
        temp_sev = "SAFE"
        temp_desc = "Comfortable thermal equilibrium."
        if temperature_c is not None:
            if temperature_c >= 42.0:
                temp_sub = 95.0
                temp_sev = "CRITICAL"
                temp_desc = f"Severe extreme heat hazard ({temperature_c:.1f}°C). Extreme risk of heatstroke."
            elif temperature_c >= 37.0:
                temp_sub = 75.0
                temp_sev = "HIGH"
                temp_desc = f"Very high thermal heat stress ({temperature_c:.1f}°C). Prolonged outdoor exertion hazardous."
            elif temperature_c >= 32.0:
                temp_sub = 50.0
                temp_sev = "ELEVATED"
                temp_desc = f"Elevated temperature ({temperature_c:.1f}°C). Hydration and shade necessary."
            elif temperature_c <= 2.0:
                temp_sub = 75.0
                temp_sev = "HIGH"
                temp_desc = f"Severe hypothermic cold hazard ({temperature_c:.1f}°C)."
            elif temperature_c <= 10.0:
                temp_sub = 45.0
                temp_sev = "ELEVATED"
                temp_desc = f"Low ambient temperature ({temperature_c:.1f}°C). Winter thermal attire required."
            else:
                temp_sub = 10.0
                temp_sev = "SAFE"
                temp_desc = f"Mild and comfortable ambient temperature ({temperature_c:.1f}°C)."
        factors.append(ContributingFactor(
            factor="temperature",
            name="Thermal Stress (Temperature)",
            value=temperature_c,
            unit="°C",
            weight=0.25,
            subscore=temp_sub,
            severity=temp_sev,
            description=temp_desc
        ))

        # 3. Solar UV Radiation (Weight: 15%)
        uv_sub = 10.0
        uv_sev = "SAFE"
        uv_desc = "Low solar ultraviolet intensity."
        if uv_index is not None:
            if uv_index >= 11.0:
                uv_sub = 95.0
                uv_sev = "CRITICAL"
                uv_desc = f"Extreme UV index ({uv_index:.1f}). Rapid skin and ocular damage upon exposure."
            elif uv_index >= 8.0:
                uv_sub = 78.0
                uv_sev = "HIGH"
                uv_desc = f"Very high UV radiation ({uv_index:.1f}). Sunscreen SPF50+ and eye protection required."
            elif uv_index >= 6.0:
                uv_sub = 55.0
                uv_sev = "ELEVATED"
                uv_desc = f"High UV radiation ({uv_index:.1f}). Seek shade during peak solar noon."
            elif uv_index >= 3.0:
                uv_sub = 30.0
                uv_sev = "SAFE"
                uv_desc = f"Moderate solar UV ({uv_index:.1f}). Normal protection recommended."
        factors.append(ContributingFactor(
            factor="uv_index",
            name="Solar UV Radiation",
            value=uv_index,
            unit="UV Index",
            weight=0.15,
            subscore=uv_sub,
            severity=uv_sev,
            description=uv_desc
        ))

        # 4. Wind & Gust Hazard (Weight: 10%)
        wind_sub = 10.0
        wind_sev = "SAFE"
        wind_desc = "Gentle/moderate airflow."
        if wind_speed_kmh is not None:
            if wind_speed_kmh >= 65.0:
                wind_sub = 90.0
                wind_sev = "CRITICAL"
                wind_desc = f"Gale/storm force winds ({wind_speed_kmh:.1f} km/h). Structural and debris hazard."
            elif wind_speed_kmh >= 45.0:
                wind_sub = 65.0
                wind_sev = "HIGH"
                wind_desc = f"Strong turbulent winds ({wind_speed_kmh:.1f} km/h). High profile vehicles at risk."
            elif wind_speed_kmh >= 28.0:
                wind_sub = 35.0
                wind_sev = "ELEVATED"
                wind_desc = f"Breezy conditions ({wind_speed_kmh:.1f} km/h)."
        factors.append(ContributingFactor(
            factor="wind_speed",
            name="Wind Velocity",
            value=wind_speed_kmh,
            unit="km/h",
            weight=0.10,
            subscore=wind_sub,
            severity=wind_sev,
            description=wind_desc
        ))

        # 5. Precipitation & Thunderstorm Probability (Weight: 10%)
        rain_sub = 10.0
        rain_sev = "SAFE"
        rain_desc = "Low probability of precipitation."
        if rain_prob_pct is not None:
            if rain_prob_pct >= 80.0:
                rain_sub = 75.0
                rain_sev = "HIGH"
                rain_desc = f"High precipitation likelihood ({rain_prob_pct:.0f}%). Potential localized waterlogging."
            elif rain_prob_pct >= 50.0:
                rain_sub = 45.0
                rain_sev = "ELEVATED"
                rain_desc = f"Moderate rain probability ({rain_prob_pct:.0f}%). Rainwear advisable."
            elif rain_prob_pct >= 25.0:
                rain_sub = 25.0
                rain_sev = "SAFE"
                rain_desc = f"Scattered showers possible ({rain_prob_pct:.0f}%)."
        factors.append(ContributingFactor(
            factor="rain_prob",
            name="Precipitation Probability",
            value=rain_prob_pct,
            unit="%",
            weight=0.10,
            subscore=rain_sub,
            severity=rain_sev,
            description=rain_desc
        ))

        # 6. PM10 Coarse Particulate / Dust (Weight: 10%)
        pm10_sub = 10.0
        pm10_sev = "SAFE"
        pm10_desc = "Acceptable coarse dust concentration."
        if pm10 is not None:
            if pm10 >= 250.0:
                pm10_sub = 90.0
                pm10_sev = "CRITICAL"
                pm10_desc = f"Severe dust/particulate storm ({pm10:.1f} µg/m³)."
            elif pm10 >= 100.0:
                pm10_sub = 65.0
                pm10_sev = "HIGH"
                pm10_desc = f"Elevated PM10 dust level ({pm10:.1f} µg/m³)."
            elif pm10 >= 50.0:
                pm10_sub = 35.0
                pm10_sev = "ELEVATED"
                pm10_desc = f"Moderate PM10 level ({pm10:.1f} µg/m³)."
        factors.append(ContributingFactor(
            factor="pm10",
            name="Coarse Particulate (PM10)",
            value=pm10,
            unit="µg/m³",
            weight=0.10,
            subscore=pm10_sub,
            severity=pm10_sev,
            description=pm10_desc
        ))

        # Total weighted score
        total_risk = sum(f.subscore * f.weight for f in factors)
        total_risk = round(min(100.0, max(0.0, total_risk)), 1)

        # Level determination
        if total_risk <= 25.0:
            level = "LOW"
            color = "#10b981"  # Emerald green
            advisory = "Environmental conditions are optimal. Safe for all outdoor activities and exercise."
            recommendations = [
                "Ideal time for outdoor sports and outdoor recreation.",
                "Natural indoor ventilation is recommended.",
                "Standard UV sun protection if outside during noon."
            ]
        elif total_risk <= 50.0:
            level = "MODERATE"
            color = "#f59e0b"  # Amber yellow
            advisory = "Moderate environmental stressors present. Generally acceptable for healthy individuals."
            recommendations = [
                "Sensitive individuals (asthma, cardiovascular) should monitor symptoms.",
                "Stay hydrated and avoid prolonged midday direct sun.",
                "Check air quality before rigorous endurance workouts."
            ]
        elif total_risk <= 75.0:
            level = "HIGH"
            color = "#f97316"  # Orange
            advisory = "High environmental risk. Air pollutants or thermal stress may cause adverse health effects."
            recommendations = [
                "Sensitive groups should limit outdoor exertion.",
                "Wear an N95/FFP2 mask if particulate levels remain elevated.",
                "Utilize indoor air purifiers and close external windows."
            ]
        else:
            level = "CRITICAL"
            color = "#ef4444"  # Red
            advisory = "CRITICAL environmental warning! Extreme atmospheric conditions or hazardous pollution."
            recommendations = [
                "Avoid all unnecessary outdoor exposure.",
                "Keep windows tightly sealed and run HEPA air filtration.",
                "Follow official local civil defense and health alerts."
            ]

        # Sort factors by impact (subscore * weight)
        sorted_factors = sorted(factors, key=lambda x: x.subscore * x.weight, reverse=True)

        return EnvironmentalRiskReport(
            risk_score=total_risk,
            risk_level=level,
            color_code=color,
            main_contributing_factors=sorted_factors[:3],  # Top 3 drivers
            health_advisory=advisory,
            activity_recommendations=recommendations,
            methodology="Multi-factor atmospheric indexing based on WHO Air Quality Guidelines (2021) and NOAA Heat/UV index matrices."
        )
