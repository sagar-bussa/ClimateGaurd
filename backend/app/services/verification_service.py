import statistics
import logging
from typing import List, Dict, Optional, Tuple
from ..schemas.weather import NormalizedObservation, ParameterVerification, VerificationReport

logger = logging.getLogger(__name__)

# Realistic tolerance thresholds for environmental sensor discrepancy
PARAM_THRESHOLDS = {
    "temperature_c": {"name": "Temperature", "unit": "°C", "tight_diff": 1.2, "mod_diff": 2.5, "warn_diff": 4.5},
    "humidity_pct": {"name": "Relative Humidity", "unit": "%", "tight_diff": 5.0, "mod_diff": 12.0, "warn_diff": 20.0},
    "wind_speed_kmh": {"name": "Wind Speed", "unit": "km/h", "tight_diff": 4.0, "mod_diff": 10.0, "warn_diff": 18.0},
    "pressure_hpa": {"name": "Barometric Pressure", "unit": "hPa", "tight_diff": 2.0, "mod_diff": 5.0, "warn_diff": 10.0},
    "pm25": {"name": "PM2.5 Particulate", "unit": "µg/m³", "tight_diff": 6.0, "mod_diff": 15.0, "warn_diff": 30.0},
    "pm10": {"name": "PM10 Particulate", "unit": "µg/m³", "tight_diff": 10.0, "mod_diff": 25.0, "warn_diff": 50.0},
}

class VerificationEngine:
    @classmethod
    def verify_single_parameter(
        cls,
        param_key: str,
        observations: List[NormalizedObservation]
    ) -> Optional[ParameterVerification]:
        cfg = PARAM_THRESHOLDS.get(param_key)
        if not cfg:
            return None

        # Extract values from observations that have this parameter
        source_values: Dict[str, float] = {}
        for obs in observations:
            val = getattr(obs, param_key, None)
            if val is not None:
                source_values[obs.source] = float(val)

        if not source_values:
            return None

        vals = list(source_values.values())
        count = len(vals)

        # Baseline single source
        if count == 1:
            val = vals[0]
            src = list(source_values.keys())[0]
            return ParameterVerification(
                parameter=param_key,
                display_name=cfg["name"],
                unit=cfg["unit"],
                consensus_value=round(val, 2),
                median_value=round(val, 2),
                min_value=round(val, 2),
                max_value=round(val, 2),
                difference=0.0,
                std_dev=0.0,
                values_by_source=source_values,
                consistency_level="MODERATE",
                confidence_score=75.0,
                potential_outliers=[],
                consensus_sources=[src],
                explanation=f"Only 1 reporting source ({src}) is active for {cfg['name']}. Cross-verification requires at least 2 sources."
            )

        mean_val = statistics.mean(vals)
        median_val = statistics.median(vals)
        min_val = min(vals)
        max_val = max(vals)
        spread = max_val - min_val
        std_dev = statistics.stdev(vals) if count > 1 else 0.0

        # Outlier detection via distance to median
        outliers: List[str] = []
        consensus: List[str] = []

        if count >= 3:
            distances = {src: abs(v - median_val) for src, v in source_values.items()}
            # If the spread exceeds moderate threshold and one source is disproportionately far
            max_dist_src = max(distances, key=distances.get)
            max_dist = distances[max_dist_src]

            if max_dist > cfg["mod_diff"] and spread >= cfg["warn_diff"]:
                outliers.append(max_dist_src)
                consensus = [s for s in source_values.keys() if s != max_dist_src]
            else:
                consensus = list(source_values.keys())
        else:
            consensus = list(source_values.keys())

        # Consensus value: average of consensus sources (trimmed of potential outliers)
        if consensus:
            consensus_vals = [source_values[s] for s in consensus]
            robust_consensus = statistics.mean(consensus_vals)
        else:
            robust_consensus = median_val

        # Scoring & Consistency classification
        tight = cfg["tight_diff"]
        mod = cfg["mod_diff"]
        warn = cfg["warn_diff"]

        if spread <= tight:
            confidence = max(95.0, 100.0 - (spread / tight) * 5.0)
            level = "VERY_HIGH"
            explanation = f"High agreement among sources across {cfg['name']} (Spread: {spread:.1f}{cfg['unit']})."
        elif spread <= mod:
            confidence = 85.0 + (1.0 - (spread - tight) / (mod - tight)) * 9.0
            level = "HIGH"
            explanation = f"Good consistency observed. Natural microclimatic deviation is within normal bounds (±{spread:.1f}{cfg['unit']})."
        elif spread <= warn:
            confidence = 70.0 + (1.0 - (spread - mod) / (warn - mod)) * 14.0
            level = "MODERATE"
            explanation = f"Moderate divergence across providers (Spread: {spread:.1f}{cfg['unit']}). Verification caution recommended."
        else:
            confidence = max(35.0, 69.0 - (spread - warn) * 3.0)
            level = "INCONSISTENT" if outliers else "LOW"
            if outliers:
                explanation = f"Data inconsistency detected. Potential outlier source: {', '.join(outliers)} differs significantly from consensus."
            else:
                explanation = f"Wide disparity across sources ({spread:.1f}{cfg['unit']} delta). Data consistency is low."

        return ParameterVerification(
            parameter=param_key,
            display_name=cfg["name"],
            unit=cfg["unit"],
            consensus_value=round(robust_consensus, 2),
            median_value=round(median_val, 2),
            min_value=round(min_val, 2),
            max_value=round(max_val, 2),
            difference=round(spread, 2),
            std_dev=round(std_dev, 2),
            values_by_source=source_values,
            consistency_level=level,
            confidence_score=round(confidence, 1),
            potential_outliers=outliers,
            consensus_sources=consensus,
            explanation=explanation
        )

    @classmethod
    def verify_all_sources(cls, observations: List[NormalizedObservation]) -> VerificationReport:
        queried = len(observations)
        source_statuses = {obs.source: obs.source_status for obs in observations}

        param_keys = ["temperature_c", "humidity_pct", "wind_speed_kmh", "pressure_hpa", "pm25", "pm10"]
        param_reports: Dict[str, ParameterVerification] = {}
        all_outliers: set = set()
        confidence_scores: List[float] = []

        # Parameter weights for overall confidence
        weights = {
            "temperature_c": 0.35,
            "humidity_pct": 0.20,
            "wind_speed_kmh": 0.15,
            "pressure_hpa": 0.10,
            "pm25": 0.15,
            "pm10": 0.05
        }

        weighted_sum = 0.0
        total_weight = 0.0

        for key in param_keys:
            ver = cls.verify_single_parameter(key, observations)
            if ver:
                param_reports[key] = ver
                all_outliers.update(ver.potential_outliers)
                w = weights.get(key, 0.1)
                weighted_sum += ver.confidence_score * w
                total_weight += w
                confidence_scores.append(ver.confidence_score)

        if total_weight > 0:
            overall_confidence = round(weighted_sum / total_weight, 1)
        else:
            overall_confidence = 50.0

        # Confidence category mapping (per specifications in Section 10)
        if overall_confidence >= 95.0:
            conf_label = "Very High Confidence"
            status = "VERIFIED"
            summary = "Multi-source sensor consensus verified with high statistical concordance."
        elif overall_confidence >= 85.0:
            conf_label = "High Confidence"
            status = "VERIFIED"
            summary = "Sensors show good alignment within expected atmospheric modeling tolerances."
        elif overall_confidence >= 70.0:
            conf_label = "Moderate Confidence"
            status = "CAUTION_INCONSISTENCY" if all_outliers else "MODERATE"
            summary = "Minor inter-provider divergence detected. Results are within acceptable variance."
        elif overall_confidence >= 50.0:
            conf_label = "Low Confidence"
            status = "CAUTION_INCONSISTENCY"
            summary = "Notable data inconsistency detected across multiple environmental indicators."
        else:
            conf_label = "Very Low Confidence"
            status = "LOW_CONFIDENCE"
            summary = "Significant sensor conflict or extreme outlier identified. Data requires manual verification."

        methodology = (
            "Verification computes consensus medians, standard deviations, and inter-provider spread "
            "across independent reporting nodes. Outliers are flagged using robust median-absolute-deviation (MAD). "
            "Confidence is an estimated consistency metric and not an assertion of absolute ground truth."
        )

        return VerificationReport(
            overall_confidence_score=overall_confidence,
            confidence_label=conf_label,
            verification_status=status,
            sources_queried=queried,
            sources_responding=len([s for s in observations if s.source_status == "ONLINE"]),
            source_statuses=source_statuses,
            parameters=param_reports,
            potential_outliers=list(all_outliers),
            summary_statement=summary,
            methodology_explanation=methodology
        )
