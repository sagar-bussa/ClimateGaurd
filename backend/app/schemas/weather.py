from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class LocationInfo(BaseModel):
    name: str
    region: Optional[str] = None
    country: Optional[str] = None
    latitude: float
    longitude: float
    timezone: Optional[str] = None

class NormalizedObservation(BaseModel):
    location: str
    latitude: float
    longitude: float
    source: str
    timestamp: str
    temperature_c: Optional[float] = None
    feels_like_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    pressure_hpa: Optional[float] = None
    cloud_cover_pct: Optional[float] = None
    uv_index: Optional[float] = None
    rain_prob_pct: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    o3: Optional[float] = None
    is_simulated: bool = False
    source_status: str = "ONLINE"  # ONLINE, DEGRADED, SIMULATED, OFFLINE

class ParameterVerification(BaseModel):
    parameter: str
    display_name: str
    unit: str
    consensus_value: Optional[float] = None
    median_value: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    difference: Optional[float] = None
    std_dev: Optional[float] = None
    values_by_source: Dict[str, Optional[float]] = Field(default_factory=dict)
    consistency_level: str  # VERY_HIGH, HIGH, MODERATE, LOW, INCONSISTENT
    confidence_score: float  # 0 to 100
    potential_outliers: List[str] = Field(default_factory=list)
    consensus_sources: List[str] = Field(default_factory=list)
    explanation: str

class VerificationReport(BaseModel):
    overall_confidence_score: float  # 0 to 100
    confidence_label: str  # Very High Confidence, High Confidence, Moderate, Low, Very Low
    verification_status: str  # VERIFIED, HIGH_CONFIDENCE, CAUTION_INCONSISTENCY, LOW_CONFIDENCE, INSUFFICIENT_SOURCES
    sources_queried: int
    sources_responding: int
    source_statuses: Dict[str, str] = Field(default_factory=dict)
    parameters: Dict[str, ParameterVerification] = Field(default_factory=dict)
    potential_outliers: List[str] = Field(default_factory=list)
    summary_statement: str
    methodology_explanation: str

class ContributingFactor(BaseModel):
    factor: str
    name: str
    value: Optional[float]
    unit: str
    weight: float
    subscore: float
    severity: str  # SAFE, ELEVATED, HIGH, CRITICAL
    description: str

class EnvironmentalRiskReport(BaseModel):
    risk_score: float  # 0 to 100
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    color_code: str  # green, yellow, orange, red
    main_contributing_factors: List[ContributingFactor] = Field(default_factory=list)
    health_advisory: str
    activity_recommendations: List[str] = Field(default_factory=list)
    methodology: str

class AnomalyFeature(BaseModel):
    feature: str
    display_name: str
    observed_value: float
    typical_range: str
    z_score: float
    severity: str

class AnomalyDetectionReport(BaseModel):
    is_anomaly: bool
    anomaly_score: float  # 0 to 100
    severity: str  # NORMAL, WATCH, ANOMALY_DETECTED, EXTREME_OUTLIER
    detection_method: str  # Isolation Forest + Multivariate Z-Score
    anomalous_features: List[AnomalyFeature] = Field(default_factory=list)
    explanation: str
    model_version: str

class ForecastPeriod(BaseModel):
    time: str
    period_label: str  # Now, Next 6h, Next 12h, Next 24h, Tomorrow, etc.
    temperature_c: float
    humidity_pct: float
    rain_prob_pct: float
    wind_speed_kmh: float
    uv_index: Optional[float] = None
    condition: str
    source_type: str = "API Forecast"  # API Forecast or Model Prediction

class AlertItem(BaseModel):
    id: str
    type: str  # AIR_QUALITY, HEAT, UV, STORM, INCONSISTENCY, ANOMALY
    severity: str  # WARNING, DANGER, CRITICAL, INFO
    title: str
    message: str
    current_value: Optional[str] = None
    threshold: Optional[str] = None
    timestamp: str

class EnvironmentSummaryResponse(BaseModel):
    location: LocationInfo
    timestamp: str
    current_conditions: Dict[str, Any]
    air_quality: Dict[str, Any]
    verification: VerificationReport
    risk: EnvironmentalRiskReport
    anomaly: AnomalyDetectionReport
    sources: List[NormalizedObservation]
    forecast: List[ForecastPeriod]
    alerts: List[AlertItem]
    is_demo_mode: bool = False
    data_freshness_seconds: int = 0

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class ChatQueryRequest(BaseModel):
    message: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    context_data: Optional[Dict[str, Any]] = None

class ChatQueryResponse(BaseModel):
    reply: str
    sources_cited: List[str] = Field(default_factory=list)
    data_backed: bool = True
