import numpy as np
import logging
from typing import Dict, Any, List, Optional
from sklearn.ensemble import IsolationForest
from ..schemas.weather import AnomalyDetectionReport, AnomalyFeature

logger = logging.getLogger(__name__)

# Typical climatological baseline distributions (mean, std, min_plausible, max_plausible)
CLIMATE_BASELINES = {
    "temperature_c": {"name": "Temperature", "mean": 26.5, "std": 6.8, "min": -10.0, "max": 45.0, "unit": "°C"},
    "humidity_pct": {"name": "Relative Humidity", "mean": 62.0, "std": 18.0, "min": 10.0, "max": 100.0, "unit": "%"},
    "pressure_hpa": {"name": "Barometric Pressure", "mean": 1013.2, "std": 6.5, "min": 980.0, "max": 1040.0, "unit": "hPa"},
    "wind_speed_kmh": {"name": "Wind Speed", "mean": 14.0, "std": 8.5, "min": 0.0, "max": 50.0, "unit": "km/h"},
    "pm25": {"name": "PM2.5 Particulate", "mean": 35.0, "std": 25.0, "min": 0.0, "max": 150.0, "unit": "µg/m³"},
    "pm10": {"name": "PM10 Particulate", "mean": 65.0, "std": 40.0, "min": 0.0, "max": 250.0, "unit": "µg/m³"},
    "uv_index": {"name": "UV Index", "mean": 5.5, "std": 2.8, "min": 0.0, "max": 11.0, "unit": "index"},
    "rain_prob_pct": {"name": "Rain Probability", "mean": 25.0, "std": 28.0, "min": 0.0, "max": 100.0, "unit": "%"},
}

class EnvironmentalAnomalyDetector:
    def __init__(self):
        self.feature_names = list(CLIMATE_BASELINES.keys())
        self.model: Optional[IsolationForest] = None
        self._initialize_model()

    def _generate_synthetic_training_corpus(self, n_samples: int = 1500) -> np.ndarray:
        """Generates realistic synthetic climatological distribution for Isolation Forest calibration."""
        np.random.seed(42)
        samples = []
        for _ in range(n_samples):
            row = []
            for feat in self.feature_names:
                b = CLIMATE_BASELINES[feat]
                val = np.random.normal(b["mean"], b["std"])
                val = max(b["min"], min(b["max"], val))
                row.append(val)
            samples.append(row)

        # Inject 3% deliberate multivariate climate extremes (heatwaves, squalls, severe inversions)
        for _ in range(int(n_samples * 0.03)):
            row = [
                np.random.choice([48.5, -4.0]),  # Extreme heat or freeze
                np.random.choice([8.0, 99.0]),   # Extreme dryness or saturation
                np.random.choice([965.0, 1045.0]), # Deep cyclone depression
                np.random.uniform(70.0, 110.0),  # Gale force
                np.random.uniform(220.0, 480.0), # Severe haze/inversion
                np.random.uniform(350.0, 600.0), # Severe dust
                np.random.uniform(12.0, 15.0),   # Extreme solar UV
                np.random.uniform(85.0, 100.0)
            ]
            samples.append(row)

        return np.array(samples)

    def _initialize_model(self):
        try:
            X_train = self._generate_synthetic_training_corpus()
            # Contamination represents expected rarity of extreme environmental anomalies
            self.model = IsolationForest(
                n_estimators=100,
                contamination=0.04,
                random_state=42
            )
            self.model.fit(X_train)
            logger.info("Isolation Forest anomaly detector initialized and trained.")
        except Exception as e:
            logger.error(f"Failed to fit Isolation Forest: {e}")

    def evaluate(self, current_data: Dict[str, Any]) -> AnomalyDetectionReport:
        vector = []
        imputed_dict = {}

        for feat in self.feature_names:
            val = current_data.get(feat)
            if val is None:
                val = CLIMATE_BASELINES[feat]["mean"]
            imputed_dict[feat] = float(val)
            vector.append(float(val))

        X = np.array([vector])

        # 1. Isolation Forest score
        # decision_function: lower means more abnormal
        raw_score = 0.0
        is_forest_anomaly = False
        if self.model:
            dec = self.model.decision_function(X)[0]
            # Map decision function to 0-100 anomaly scale
            # Normal values are ~0.10 to 0.25; anomalies are negative
            raw_score = float(max(0.0, min(100.0, (0.20 - dec) * 200.0)))
            is_forest_anomaly = bool(self.model.predict(X)[0] == -1)

        # 2. Per-feature multivariate Z-Score inspection
        flagged_features: List[AnomalyFeature] = []
        for feat in self.feature_names:
            b = CLIMATE_BASELINES[feat]
            val = imputed_dict[feat]
            z = (val - b["mean"]) / b["std"]

            if abs(z) >= 2.2 or val > b["max"] or val < b["min"]:
                sev = "HIGH" if abs(z) >= 3.0 else "ELEVATED"
                flagged_features.append(AnomalyFeature(
                    feature=feat,
                    display_name=b["name"],
                    observed_value=round(val, 1),
                    typical_range=f"{b['min']}{b['unit']} to {b['max']}{b['unit']}",
                    z_score=round(z, 2),
                    severity=sev
                ))

        is_anomaly = is_forest_anomaly or (len(flagged_features) >= 1 and raw_score > 50.0)

        if is_anomaly:
            severity = "EXTREME_OUTLIER" if raw_score > 75.0 else "ANOMALY_DETECTED"
            feat_desc = ", ".join([f"{f.display_name} ({f.observed_value} vs normal range {f.typical_range})" for f in flagged_features[:2]])
            explanation = (
                f"Potential environmental anomaly detected: Unusual atmospheric pattern observed. "
                f"Driven primarily by {feat_desc}. Note: This reflects atypical physical weather patterns, "
                f"distinct from sensor data inconsistencies."
            )
        else:
            severity = "WATCH" if raw_score > 35.0 else "NORMAL"
            explanation = "Atmospheric observations fall within standard climatological statistical thresholds."

        return AnomalyDetectionReport(
            is_anomaly=is_anomaly,
            anomaly_score=round(raw_score, 1),
            severity=severity,
            detection_method="Isolation Forest + Climatological Z-Score Boundary Verification",
            anomalous_features=flagged_features,
            explanation=explanation,
            model_version="IsolationForest-v1.2"
        )

# Global singleton detector
anomaly_detector = EnvironmentalAnomalyDetector()
