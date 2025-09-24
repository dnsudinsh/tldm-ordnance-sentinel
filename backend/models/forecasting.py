"""
Predictive Readiness Forecasting Models for TLDM BITS
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
import uuid
from enum import Enum


class IntensityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Input Models
class UsageData(BaseModel):
    date: str
    category: str
    quantity_used: int
    operation_type: str
    location: str


class OrdnanceRequirement(BaseModel):
    category: str
    quantity: int
    priority: str


class ExerciseEvent(BaseModel):
    name: str
    start_date: str
    end_date: str
    intensity: IntensityLevel
    required_ordnance: List[OrdnanceRequirement]
    participating_units: List[str]


class SupplyChainData(BaseModel):
    category: str
    average_lead_time: int  # days
    variability: int  # ± days
    supplier_reliability: float  # 0-100%
    current_backlog: int


class ShortageRecord(BaseModel):
    category: str
    date: str
    quantity: int
    impact_level: str


class HistoricalData(BaseModel):
    period: str
    readiness: float
    consumption: int
    events: List[str]
    shortages: List[ShortageRecord]


class InventorySnapshot(BaseModel):
    inventory_id: str
    ordnance_category: str
    ordnance_name: str
    quantity: int
    condition: str
    location: str
    expiry_date: str


class ForecastingConfig(BaseModel):
    time_horizon_days: int = 90
    confidence_level: float = 0.95
    risk_tolerance: str = "conservative"
    seasonality_enabled: bool = True


class ForecastingInput(BaseModel):
    current_readiness: float  # 0-100%
    usage_trends: List[UsageData]
    scheduled_exercises: List[ExerciseEvent]
    lead_times: List[SupplyChainData]
    historical_patterns: List[HistoricalData]
    inventory_snapshot: List[InventorySnapshot]
    config: ForecastingConfig = Field(default_factory=ForecastingConfig)


# Output Models
class ReadinessProjection(BaseModel):
    days: int
    readiness: float
    confidence_interval: List[float]  # [lower, upper]
    risk_level: RiskLevel


class CriticalAlert(BaseModel):
    category: str
    expected_shortage_date: str
    severity: AlertSeverity
    impacted_operations: List[str]
    current_stock_level: int
    projected_need: int


class ProcurementRecommendation(BaseModel):
    priority: str  # urgent, high, medium, low
    category: str
    recommended_quantity: int
    deadline: str
    rationale: str
    supplier_lead_time: int
    estimated_cost: Optional[float] = None


class OperationImpactAssessment(BaseModel):
    exercise_name: str
    readiness_impact: float  # percentage change
    critical_items_affected: List[str]
    recommendations: List[str]


class MitigationStrategy(BaseModel):
    strategy: str
    effectiveness: float  # 0-1
    implementation_time: int  # days
    impact: str  # description of impact
    items_affected: List[str]
    cost_estimate: Optional[float] = None


class ConfidenceMetrics(BaseModel):
    model_accuracy: float
    data_quality_score: float
    forecast_reliability: str  # high, medium, low


class TimeframeProjections(BaseModel):
    current_readiness: float
    projections: List[ReadinessProjection]


class ForecastResult(BaseModel):
    forecast_id: str = Field(default_factory=lambda: f"fcst_{datetime.now().strftime('%Y_%m_%d')}_{str(uuid.uuid4())[:8]}")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    timeframe: TimeframeProjections
    critical_alerts: List[CriticalAlert]
    procurement_recommendations: List[ProcurementRecommendation]
    operation_impact_assessment: List[OperationImpactAssessment]
    mitigation_strategies: List[MitigationStrategy]
    confidence_metrics: ConfidenceMetrics
    metadata: Dict[str, Any] = Field(default_factory=dict)


# Scenario Modeling
class ScenarioParameters(BaseModel):
    name: str
    description: Optional[str] = None
    
    # Exercise and Operations Impact
    exercise_intensity_multiplier: float = 1.0
    additional_events: int = 0
    operational_tempo_increase: float = 0.0  # 0-1 scale
    
    # Supply Chain Disruptions
    lead_time_increase_days: int = 0
    supplier_reliability_factor: float = 1.0
    logistics_disruption_probability: float = 0.0
    
    # Budget and Procurement
    procurement_delay_days: int = 0
    quantity_reduction_factor: float = 1.0
    budget_constraint_percentage: float = 100.0
    
    # External Factors
    weather_impact_factor: float = 1.0  # Monsoon/weather effects
    geopolitical_tension_level: str = "normal"  # normal, elevated, high, critical
    maintenance_schedule_impact: float = 0.0
    
    # Advanced Modeling
    demand_volatility_multiplier: float = 1.0
    stockout_cost_factor: float = 1.0
    emergency_procurement_capability: bool = True
    
    # Scenario Duration and Scope
    scenario_duration_days: int = 90
    affected_categories: Optional[List[str]] = None
    probability_weight: float = 1.0


class ScenarioResult(BaseModel):
    scenario_name: str
    description: Optional[str] = None
    base_readiness: float
    scenario_readiness: float
    readiness_impact: float
    risk_assessment: Dict[str, Any]
    recommendations: List[MitigationStrategy]
    timeline_comparison: List[ReadinessProjection]
    metadata: Dict[str, Any] = Field(default_factory=dict)


# Time Series Analysis Models
class ConsumptionPattern(BaseModel):
    base_consumption_rate: float
    seasonal_adjustments: Dict[str, float]
    trend_direction: str  # increasing, decreasing, stable
    volatility: float
    anomaly_flags: List[str]


class ConsumptionProjection(BaseModel):
    expected_consumption: float
    confidence_range: List[float]  # [min, max]
    risk_factors: List[str]


# Historical Accuracy Tracking Models
class ForecastAccuracy(BaseModel):
    forecast_id: str
    prediction_date: datetime
    actual_date: datetime
    category: str
    predicted_value: float
    actual_value: float
    error_percentage: float
    accuracy_score: float  # 0-1 scale
    
class AccuracyMetrics(BaseModel):
    overall_accuracy: float
    category_accuracy: Dict[str, float]
    time_horizon_accuracy: Dict[int, float]  # 30, 60, 90 days
    recent_trend: str  # improving, declining, stable
    confidence_calibration: float  # How well confidence intervals match actual outcomes
    bias_analysis: Dict[str, float]  # over_prediction, under_prediction by category

class ModelPerformance(BaseModel):
    model_version: str
    training_period: str
    evaluation_period: str
    accuracy_metrics: AccuracyMetrics
    feature_importance: Dict[str, float]
    drift_detection: bool
    recommendation: str  # retrain, continue, investigate

# Enhanced Database Models
class ForecastHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    forecast_id: str
    generated_at: datetime
    input_parameters: Dict[str, Any]
    result: ForecastResult
    accuracy_score: Optional[float] = None
    actual_vs_predicted: Optional[Dict[str, Any]] = None
    created_by: str = "system"
    model_version: str = "1.0"
    accuracy_tracking: Optional[List[ForecastAccuracy]] = None


class AlertHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    alert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    forecast_id: str
    category: str
    severity: AlertSeverity
    predicted_date: str
    actual_date: Optional[str] = None
    status: str = "active"  # active, resolved, false_positive
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


# API Request Models
class GenerateForecastRequest(BaseModel):
    inventory_filter: Optional[Dict[str, Any]] = None
    include_scenarios: bool = False
    custom_config: Optional[ForecastingConfig] = None


class ScenarioAnalysisRequest(BaseModel):
    forecast_id: str
    scenarios: List[ScenarioParameters]


class UpdateForecastAccuracyRequest(BaseModel):
    forecast_id: str
    actual_readiness_data: Dict[str, float]
    notes: Optional[str] = None