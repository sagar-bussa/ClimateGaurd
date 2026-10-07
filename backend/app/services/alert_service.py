from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from ..schemas.weather import AlertItem, VerificationReport, EnvironmentalRiskReport, AnomalyDetectionReport

class AlertService:
    @staticmethod
    def generate_alerts(
        consensus_data: Dict[str, Any],
        verification: VerificationReport,
        risk: EnvironmentalRiskReport,
        anomaly: AnomalyDetectionReport
    ) -> List[AlertItem]:
        alerts: List[AlertItem] = []
        now_str = datetime.now(timezone.utc).strftime("%H:%M UTC")

        # 1. Verification Inconsistency Alert
        if verification.verification_status in ["CAUTION_INCONSISTENCY", "LOW_CONFIDENCE"]:
            outlier_text = f" Potential outlier source(s): {', '.join(verification.potential_outliers)}." if verification.potential_outliers else ""
            alerts.append(AlertItem(
                id="alert-verif-inconsistency",
                type="INCONSISTENCY",
                severity="WARNING",
                title="Data Inconsistency Detected",
                message=f"Inter-provider divergence detected across reporting stations (Overall Confidence: {verification.overall_confidence_score:.0f}%).{outlier_text}",
                current_value=f"{verification.overall_confidence_score:.0f}% Confidence",
                threshold="< 70% Confidence",
                timestamp=now_str
            ))

        # 2. Air Quality Alerts
        pm25 = consensus_data.get("pm25")
        if pm25 is not None:
            if pm25 >= 55.0:
                alerts.append(AlertItem(
                    id="alert-pm25-unhealthy",
                    type="AIR_QUALITY",
                    severity="CRITICAL" if pm25 > 150.0 else "WARNING",
                    title="Elevated PM2.5 Particulate Concentration",
                    message=f"Fine particulate matter is currently {pm25:.1f} µg/m³. Respiratory vulnerability hazard.",
                    current_value=f"{pm25:.1f} µg/m³",
                    threshold="> 35.0 µg/m³ (WHO/EPA)",
                    timestamp=now_str
                ))

        # 3. Thermal Extreme Alert
        temp = consensus_data.get("temperature_c")
        if temp is not None:
            if temp >= 38.0:
                alerts.append(AlertItem(
                    id="alert-heat-extreme",
                    type="HEAT",
                    severity="CRITICAL" if temp >= 42.0 else "WARNING",
                    title="Elevated Heat Stress Warning",
                    message=f"Ambient temperature is {temp:.1f}°C. Sustained outdoor physical exertion risks thermal exhaustion.",
                    current_value=f"{temp:.1f}°C",
                    threshold="> 38.0°C",
                    timestamp=now_str
                ))
            elif temp <= 5.0:
                alerts.append(AlertItem(
                    id="alert-cold-extreme",
                    type="HEAT",
                    severity="WARNING",
                    title="Low Ambient Temperature",
                    message=f"Temperature has dropped to {temp:.1f}°C. Hypothermia risk for prolonged exposure.",
                    current_value=f"{temp:.1f}°C",
                    threshold="< 5.0°C",
                    timestamp=now_str
                ))

        # 4. Solar UV Alert
        uv = consensus_data.get("uv_index")
        if uv is not None and uv >= 8.0:
            alerts.append(AlertItem(
                id="alert-uv-high",
                type="UV",
                severity="WARNING",
                title="Very High UV Radiation Index",
                message=f"Solar UV index is {uv:.1f}. Rapid erythema and cellular UV damage possible without sun block.",
                current_value=f"UV {uv:.1f}",
                threshold="> 8.0 (WHO)",
                timestamp=now_str
            ))

        # 5. Precipitation Alert
        rain_prob = consensus_data.get("rain_prob_pct")
        if rain_prob is not None and rain_prob >= 70.0:
            alerts.append(AlertItem(
                id="alert-rain-high",
                type="STORM",
                severity="INFO",
                title="High Precipitation Likelihood",
                message=f"Rain probability is {rain_prob:.0f}%. Localized rainfall expected.",
                current_value=f"{rain_prob:.0f}%",
                threshold="> 70%",
                timestamp=now_str
            ))

        # 6. Environmental Anomaly Alert
        if anomaly.is_anomaly:
            alerts.append(AlertItem(
                id="alert-anomaly",
                type="ANOMALY",
                severity="WARNING",
                title="Climatological Anomaly Flagged by ML",
                message=anomaly.explanation,
                current_value=f"Anomaly Score: {anomaly.anomaly_score:.1f}/100",
                threshold="Isolation Forest Threshold > 50",
                timestamp=now_str
            ))

        return alerts
