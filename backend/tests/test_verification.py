import pytest
from datetime import datetime, timezone
from backend.app.schemas.weather import NormalizedObservation
from backend.app.services.verification_service import VerificationEngine
from backend.app.services.risk_service import RiskEngine
from backend.app.ml.anomaly_model import anomaly_detector

def test_verification_high_consistency():
    """Verify that concordant sources generate high confidence score."""
    obs1 = NormalizedObservation(
        location="Hyderabad", latitude=17.385, longitude=78.4867,
        source="Source A", timestamp=datetime.now(timezone.utc).isoformat(),
        temperature_c=29.2, humidity_pct=65.0, wind_speed_kmh=12.0, pressure_hpa=1013.0,
        pm25=35.0, pm10=60.0
    )
    obs2 = NormalizedObservation(
        location="Hyderabad", latitude=17.385, longitude=78.4867,
        source="Source B", timestamp=datetime.now(timezone.utc).isoformat(),
        temperature_c=29.4, humidity_pct=64.0, wind_speed_kmh=12.5, pressure_hpa=1012.8,
        pm25=36.0, pm10=62.0
    )
    obs3 = NormalizedObservation(
        location="Hyderabad", latitude=17.385, longitude=78.4867,
        source="Source C", timestamp=datetime.now(timezone.utc).isoformat(),
        temperature_c=29.1, humidity_pct=66.0, wind_speed_kmh=11.8, pressure_hpa=1013.2,
        pm25=34.0, pm10=59.0
    )

    report = VerificationEngine.verify_all_sources([obs1, obs2, obs3])
    assert report.overall_confidence_score >= 85.0
    assert report.verification_status == "VERIFIED"
    assert len(report.potential_outliers) == 0

def test_verification_outlier_detection():
    """Verify that an outlier source is flagged as potential outlier without claiming absolute wrongness."""
    obs1 = NormalizedObservation(
        location="Hyderabad", latitude=17.385, longitude=78.4867,
        source="Source A", timestamp=datetime.now(timezone.utc).isoformat(),
        temperature_c=29.2, humidity_pct=65.0, wind_speed_kmh=12.0, pressure_hpa=1013.0,
        pm25=35.0, pm10=60.0
    )
    obs2 = NormalizedObservation(
        location="Hyderabad", latitude=17.385, longitude=78.4867,
        source="Source B", timestamp=datetime.now(timezone.utc).isoformat(),
        temperature_c=29.5, humidity_pct=66.0, wind_speed_kmh=12.0, pressure_hpa=1013.0,
        pm25=36.0, pm10=61.0
    )
    obs3 = NormalizedObservation(
        location="Hyderabad", latitude=17.385, longitude=78.4867,
        source="Source C (Outlier)", timestamp=datetime.now(timezone.utc).isoformat(),
        temperature_c=39.8, humidity_pct=65.0, wind_speed_kmh=12.0, pressure_hpa=1013.0,
        pm25=35.0, pm10=60.0
    )

    report = VerificationEngine.verify_all_sources([obs1, obs2, obs3])
    assert "Source C (Outlier)" in report.potential_outliers
    assert report.parameters["temperature_c"].consistency_level in ["LOW", "INCONSISTENT"]

def test_risk_scoring():
    """Test multi-factor risk calculation."""
    # Safe conditions
    safe_risk = RiskEngine.calculate_environmental_risk(
        temperature_c=24.0, humidity_pct=50.0, wind_speed_kmh=10.0,
        uv_index=3.0, rain_prob_pct=5.0, pm25=12.0, pm10=25.0
    )
    assert safe_risk.risk_score <= 25.0
    assert safe_risk.risk_level == "LOW"

    # Hazardous conditions
    danger_risk = RiskEngine.calculate_environmental_risk(
        temperature_c=43.5, humidity_pct=75.0, wind_speed_kmh=45.0,
        uv_index=11.5, rain_prob_pct=40.0, pm25=180.0, pm10=300.0
    )
    assert danger_risk.risk_score >= 70.0
    assert danger_risk.risk_level in ["HIGH", "CRITICAL"]
    assert any(f.factor == "pm25" for f in danger_risk.main_contributing_factors)

def test_ml_anomaly_detection():
    """Test Isolation Forest climatological anomaly detection."""
    # Normal climate point
    normal_res = anomaly_detector.evaluate({
        "temperature_c": 27.0, "humidity_pct": 60.0, "pressure_hpa": 1013.0,
        "wind_speed_kmh": 12.0, "pm25": 30.0, "pm10": 55.0, "uv_index": 5.0, "rain_prob_pct": 20.0
    })
    assert normal_res.is_anomaly is False

    # Extreme climatological anomaly (e.g. 49°C temperature, extreme PM2.5)
    extreme_res = anomaly_detector.evaluate({
        "temperature_c": 49.5, "humidity_pct": 95.0, "pressure_hpa": 970.0,
        "wind_speed_kmh": 65.0, "pm25": 320.0, "pm10": 480.0, "uv_index": 12.0, "rain_prob_pct": 90.0
    })
    assert extreme_res.is_anomaly is True
    assert extreme_res.severity in ["ANOMALY_DETECTED", "EXTREME_OUTLIER"]
