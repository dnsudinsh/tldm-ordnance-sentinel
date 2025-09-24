"""
Predictive Readiness Forecasting Engine for TLDM BITS
"""
import json
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from statistics import mean, stdev
import math
import asyncio

from emergentintegrations.llm.chat import LlmChat, UserMessage
from models.forecasting import (
    ForecastingInput, ForecastResult, TimeframeProjections, ReadinessProjection,
    CriticalAlert, ProcurementRecommendation, OperationImpactAssessment,
    MitigationStrategy, ConfidenceMetrics, ConsumptionPattern, ConsumptionProjection,
    ScenarioParameters, ScenarioResult, AlertSeverity, RiskLevel
)

logger = logging.getLogger(__name__)


class ReadinessForecaster:
    """Core forecasting engine with AI-powered predictions"""
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
    
    async def generate_forecast(self, input_data: ForecastingInput) -> ForecastResult:
        """Generate comprehensive readiness forecast"""
        try:
            # Generate AI forecast
            ai_forecast = await self._generate_ai_forecast(input_data)
            return ai_forecast
        except Exception as error:
            logger.warning(f"AI forecasting failed: {error}")
            # Fall back to rule-based forecast
            return self._generate_fallback_forecast(input_data)
    
    async def _generate_ai_forecast(self, input_data: ForecastingInput) -> ForecastResult:
        """Generate AI-powered forecast using LLM"""
        
        # Create unique session ID for this forecast
        session_id = f"forecast_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize AI chat with system message
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=self._get_system_prompt()
        ).with_model("openai", "gpt-5")
        
        # Build the forecasting prompt
        user_prompt = self._build_forecasting_prompt(input_data)
        
        # Create user message
        user_message = UserMessage(text=user_prompt)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        # Parse and validate AI response
        try:
            forecast_data = json.loads(response)
            return self._validate_and_parse_response(forecast_data, input_data)
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse AI response: {e}")
            return self._generate_fallback_forecast(input_data)
    
    def _get_system_prompt(self) -> str:
        """Get the enhanced system prompt for AI forecasting"""
        return """You are an advanced predictive analytics engine for the Royal Malaysian Navy (TLDM) ordnance readiness forecasting. You specialize in naval warfare logistics, ordnance consumption patterns, and strategic defense planning.

        EXPERTISE AREAS:
        - Naval ordnance lifecycle management and consumption modeling
        - Exercise impact analysis on ammunition usage rates
        - Supply chain risk assessment for defense procurement
        - Operational readiness optimization for naval operations
        - Multi-variable forecasting with uncertainty quantification

        FORECASTING METHODOLOGY:
        1. TEMPORAL ANALYSIS: Apply time-series decomposition (trend, seasonality, cyclical patterns)
        2. OPERATIONAL MODELING: Factor naval exercise intensity, duration, and ordnance requirements
        3. RISK QUANTIFICATION: Monte Carlo simulation for confidence intervals
        4. SUPPLY CHAIN INTEGRATION: Lead time variability and supplier reliability modeling
        5. STRATEGIC OPTIMIZATION: Balance readiness vs. inventory carrying costs

        ANALYSIS PARAMETERS:
        - Forecast Horizon: 30/60/90 days with daily granularity
        - Confidence Level: 95% (conservative military planning standard)
        - Risk Tolerance: Conservative (prioritize mission readiness over cost optimization)
        - Seasonality: Account for monsoon patterns affecting naval operations
        - Geopolitical Context: South China Sea operational requirements

        OUTPUT REQUIREMENTS:
        - Provide quantitative projections with statistical confidence measures
        - Generate actionable procurement recommendations with priority rankings
        - Identify critical shortage risks with specific timeline forecasts
        - Propose evidence-based mitigation strategies with effectiveness ratings
        - Include sensitivity analysis for key input variables

        Always respond with valid JSON matching the required schema. Use conservative estimates to ensure mission readiness."""
    
    def _build_forecasting_prompt(self, input_data: ForecastingInput) -> str:
        """Build the detailed forecasting prompt"""
        
        # Summarize input data
        usage_summary = self._summarize_usage_trends(input_data.usage_trends)
        exercise_summary = self._summarize_exercises(input_data.scheduled_exercises)
        supply_summary = self._summarize_supply_chain(input_data.lead_times)
        historical_summary = self._summarize_historical(input_data.historical_patterns)
        inventory_summary = self._summarize_inventory(input_data.inventory_snapshot)
        
        prompt = f"""
CURRENT READINESS: {input_data.current_readiness}%
TIME HORIZON: 30/60/90 days
FORECASTING REQUEST: Generate comprehensive readiness projections with actionable recommendations

USAGE TRENDS (Last 180 days):
{usage_summary}

SCHEDULED EXERCISES:
{exercise_summary}

SUPPLY CHAIN STATUS:
{supply_summary}

HISTORICAL PATTERNS:
{historical_summary}

CURRENT INVENTORY:
{inventory_summary}

GENERATE FORECAST WITH:
1. Readiness projections for 30, 60, 90 days with confidence intervals
2. Critical shortage alerts with estimated timelines
3. Procurement priority recommendations with quantities and deadlines
4. Risk impact assessment of planned operations
5. Mitigation strategies for identified risks

RESPONSE FORMAT: Return valid JSON with this structure:
{{
    "timeframe": {{
        "current_readiness": {input_data.current_readiness},
        "projections": [
            {{
                "days": 30,
                "readiness": <percentage>,
                "confidence_interval": [<lower>, <upper>],
                "risk_level": "<low|medium|high|critical>"
            }},
            {{
                "days": 60,
                "readiness": <percentage>,
                "confidence_interval": [<lower>, <upper>],
                "risk_level": "<low|medium|high|critical>"
            }},
            {{
                "days": 90,
                "readiness": <percentage>,
                "confidence_interval": [<lower>, <upper>],
                "risk_level": "<low|medium|high|critical>"
            }}
        ]
    }},
    "critical_alerts": [
        {{
            "category": "<ordnance_category>",
            "expected_shortage_date": "<YYYY-MM-DD>",
            "severity": "<low|medium|high|critical>",
            "impacted_operations": ["<operation_names>"],
            "current_stock_level": <number>,
            "projected_need": <number>
        }}
    ],
    "procurement_recommendations": [
        {{
            "priority": "<urgent|high|medium|low>",
            "category": "<ordnance_category>",
            "recommended_quantity": <number>,
            "deadline": "<YYYY-MM-DD>",
            "rationale": "<explanation>",
            "supplier_lead_time": <days>
        }}
    ],
    "operation_impact_assessment": [
        {{
            "exercise_name": "<exercise_name>",
            "readiness_impact": <percentage_change>,
            "critical_items_affected": ["<ordnance_names>"],
            "recommendations": ["<action_items>"]
        }}
    ],
    "mitigation_strategies": [
        {{
            "strategy": "<strategy_name>",
            "effectiveness": <0-1>,
            "implementation_time": <days>,
            "impact": "<impact_description>",
            "items_affected": ["<ordnance_categories>"]
        }}
    ],
    "confidence_metrics": {{
        "model_accuracy": <0-1>,
        "data_quality_score": <0-1>,
        "forecast_reliability": "<high|medium|low>"
    }}
}}

Be conservative in projections. Prioritize shortage prevention over cost optimization.
"""
        return prompt
    
    def _summarize_usage_trends(self, usage_trends: List[Any]) -> str:
        """Summarize usage trend data"""
        if not usage_trends:
            return "No historical usage data available"
        
        categories = {}
        for usage in usage_trends:
            cat = usage.category if hasattr(usage, 'category') else usage.get('category', 'Unknown')
            qty = usage.quantity_used if hasattr(usage, 'quantity_used') else usage.get('quantity_used', 0)
            
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(qty)
        
        summary = []
        for category, quantities in categories.items():
            avg_usage = mean(quantities) if quantities else 0
            total_usage = sum(quantities)
            summary.append(f"- {category}: Avg {avg_usage:.1f}/period, Total {total_usage}")
        
        return "\n".join(summary)
    
    def _summarize_exercises(self, exercises: List[Any]) -> str:
        """Summarize scheduled exercises"""
        if not exercises:
            return "No scheduled exercises"
        
        summary = []
        for exercise in exercises:
            name = exercise.name if hasattr(exercise, 'name') else exercise.get('name', 'Unknown')
            intensity = exercise.intensity if hasattr(exercise, 'intensity') else exercise.get('intensity', 'medium')
            start = exercise.start_date if hasattr(exercise, 'start_date') else exercise.get('start_date', 'TBD')
            summary.append(f"- {name} ({intensity} intensity, starts {start})")
        
        return "\n".join(summary)
    
    def _summarize_supply_chain(self, supply_data: List[Any]) -> str:
        """Summarize supply chain information"""
        if not supply_data:
            return "No supply chain data available"
        
        summary = []
        for supply in supply_data:
            cat = supply.category if hasattr(supply, 'category') else supply.get('category', 'Unknown')
            lead_time = supply.average_lead_time if hasattr(supply, 'average_lead_time') else supply.get('average_lead_time', 0)
            reliability = supply.supplier_reliability if hasattr(supply, 'supplier_reliability') else supply.get('supplier_reliability', 0)
            summary.append(f"- {cat}: {lead_time} days lead time, {reliability}% reliability")
        
        return "\n".join(summary)
    
    def _summarize_historical(self, historical_data: List[Any]) -> str:
        """Summarize historical patterns"""
        if not historical_data:
            return "No historical pattern data available"
        
        readiness_values = []
        consumption_values = []
        
        for data in historical_data:
            readiness = data.readiness if hasattr(data, 'readiness') else data.get('readiness', 0)
            consumption = data.consumption if hasattr(data, 'consumption') else data.get('consumption', 0)
            readiness_values.append(readiness)
            consumption_values.append(consumption)
        
        avg_readiness = mean(readiness_values) if readiness_values else 0
        avg_consumption = mean(consumption_values) if consumption_values else 0
        
        return f"Historical average: {avg_readiness:.1f}% readiness, {avg_consumption:.1f} consumption rate"
    
    def _summarize_inventory(self, inventory_data: List[Any]) -> str:
        """Summarize current inventory"""
        if not inventory_data:
            return "No inventory data available"
        
        categories = {}
        for item in inventory_data:
            cat = item.ordnance_category if hasattr(item, 'ordnance_category') else item.get('ordnance_category', 'Unknown')
            qty = item.quantity if hasattr(item, 'quantity') else item.get('quantity', 0)
            
            if cat not in categories:
                categories[cat] = 0
            categories[cat] += qty
        
        summary = []
        for category, total_qty in categories.items():
            summary.append(f"- {category}: {total_qty} units")
        
        return "\n".join(summary)
    
    def _validate_and_parse_response(self, forecast_data: Dict[str, Any], input_data: ForecastingInput) -> ForecastResult:
        """Validate and parse AI response into ForecastResult"""
        
        # Parse timeframe projections
        timeframe_data = forecast_data.get('timeframe', {})
        projections = []
        
        for proj_data in timeframe_data.get('projections', []):
            projection = ReadinessProjection(
                days=proj_data.get('days', 30),
                readiness=proj_data.get('readiness', input_data.current_readiness),
                confidence_interval=proj_data.get('confidence_interval', [70, 90]),
                risk_level=RiskLevel(proj_data.get('risk_level', 'medium'))
            )
            projections.append(projection)
        
        timeframe = TimeframeProjections(
            current_readiness=input_data.current_readiness,
            projections=projections
        )
        
        # Parse alerts
        critical_alerts = []
        for alert_data in forecast_data.get('critical_alerts', []):
            alert = CriticalAlert(
                category=alert_data.get('category', 'Unknown'),
                expected_shortage_date=alert_data.get('expected_shortage_date', 
                                                     (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')),
                severity=AlertSeverity(alert_data.get('severity', 'medium')),
                impacted_operations=alert_data.get('impacted_operations', []),
                current_stock_level=alert_data.get('current_stock_level', 0),
                projected_need=alert_data.get('projected_need', 0)
            )
            critical_alerts.append(alert)
        
        # Parse procurement recommendations
        procurement_recommendations = []
        for rec_data in forecast_data.get('procurement_recommendations', []):
            rec = ProcurementRecommendation(
                priority=rec_data.get('priority', 'medium'),
                category=rec_data.get('category', 'Unknown'),
                recommended_quantity=rec_data.get('recommended_quantity', 0),
                deadline=rec_data.get('deadline', (datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d')),
                rationale=rec_data.get('rationale', 'AI recommendation'),
                supplier_lead_time=rec_data.get('supplier_lead_time', 30)
            )
            procurement_recommendations.append(rec)
        
        # Parse operation impact assessment
        operation_impact = []
        for op_data in forecast_data.get('operation_impact_assessment', []):
            impact = OperationImpactAssessment(
                exercise_name=op_data.get('exercise_name', 'Unknown Exercise'),
                readiness_impact=op_data.get('readiness_impact', 0),
                critical_items_affected=op_data.get('critical_items_affected', []),
                recommendations=op_data.get('recommendations', [])
            )
            operation_impact.append(impact)
        
        # Parse mitigation strategies
        mitigation_strategies = []
        for mit_data in forecast_data.get('mitigation_strategies', []):
            strategy = MitigationStrategy(
                strategy=mit_data.get('strategy', 'Unknown Strategy'),
                effectiveness=mit_data.get('effectiveness', 0.5),
                implementation_time=mit_data.get('implementation_time', 7),
                impact=mit_data.get('impact', 'Unknown impact'),
                items_affected=mit_data.get('items_affected', [])
            )
            mitigation_strategies.append(strategy)
        
        # Parse confidence metrics
        conf_data = forecast_data.get('confidence_metrics', {})
        confidence_metrics = ConfidenceMetrics(
            model_accuracy=conf_data.get('model_accuracy', 0.85),
            data_quality_score=conf_data.get('data_quality_score', 0.80),
            forecast_reliability=conf_data.get('forecast_reliability', 'medium')
        )
        
        # Create final forecast result
        forecast_result = ForecastResult(
            timeframe=timeframe,
            critical_alerts=critical_alerts,
            procurement_recommendations=procurement_recommendations,
            operation_impact_assessment=operation_impact,
            mitigation_strategies=mitigation_strategies,
            confidence_metrics=confidence_metrics,
            metadata={
                'generated_as': 'ai_service',
                'ai_model': 'gpt-5',
                'processing_time_ms': 0,
                'data_quality': 'high'
            }
        )
        
        return forecast_result
    
    def _generate_fallback_forecast(self, input_data: ForecastingInput) -> ForecastResult:
        """Generate rule-based fallback forecast when AI fails"""
        
        logger.info("Generating fallback forecast using rule-based approach")
        
        current_readiness = input_data.current_readiness
        
        # Simple linear projection with conservative estimates
        projections = []
        
        # Calculate trend based on historical data or assume slight decline
        trend_decline = -0.5  # Conservative 0.5% decline per month
        
        for days in [30, 60, 90]:
            months = days / 30
            projected_readiness = max(0, current_readiness + (trend_decline * months))
            
            # Add confidence intervals
            margin = 5.0  # ±5% confidence interval
            confidence_interval = [
                max(0, projected_readiness - margin),
                min(100, projected_readiness + margin)
            ]
            
            # Determine risk level
            risk_level = RiskLevel.LOW
            if projected_readiness < 50:
                risk_level = RiskLevel.CRITICAL
            elif projected_readiness < 65:
                risk_level = RiskLevel.HIGH
            elif projected_readiness < 80:
                risk_level = RiskLevel.MEDIUM
            
            projection = ReadinessProjection(
                days=days,
                readiness=projected_readiness,
                confidence_interval=confidence_interval,
                risk_level=risk_level
            )
            projections.append(projection)
        
        timeframe = TimeframeProjections(
            current_readiness=current_readiness,
            projections=projections
        )
        
        # Generate basic alerts for low readiness
        critical_alerts = []
        if any(p.readiness < 70 for p in projections):
            alert = CriticalAlert(
                category="General Ordnance",
                expected_shortage_date=(datetime.now() + timedelta(days=45)).strftime('%Y-%m-%d'),
                severity=AlertSeverity.MEDIUM,
                impacted_operations=["Standard Operations"],
                current_stock_level=int(current_readiness),
                projected_need=80
            )
            critical_alerts.append(alert)
        
        # Basic procurement recommendations
        procurement_recommendations = []
        if current_readiness < 80:
            rec = ProcurementRecommendation(
                priority="high",
                category="Critical Ordnance",
                recommended_quantity=100,
                deadline=(datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
                rationale="Fallback recommendation to maintain readiness above 80%",
                supplier_lead_time=30
            )
            procurement_recommendations.append(rec)
        
        # Basic mitigation strategy
        mitigation_strategies = [
            MitigationStrategy(
                strategy="Inventory Optimization",
                effectiveness=0.7,
                implementation_time=14,
                impact="Improve readiness by 5-10%",
                items_affected=["All Categories"]
            )
        ]
        
        # Conservative confidence metrics
        confidence_metrics = ConfidenceMetrics(
            model_accuracy=0.70,
            data_quality_score=0.65,
            forecast_reliability="medium"
        )
        
        return ForecastResult(
            timeframe=timeframe,
            critical_alerts=critical_alerts,
            procurement_recommendations=procurement_recommendations,
            operation_impact_assessment=[],
            mitigation_strategies=mitigation_strategies,
            confidence_metrics=confidence_metrics,
            metadata={
                'generated_as': 'fallback_rule_based',
                'ai_model': 'none',
                'processing_time_ms': 0,
                'data_quality': 'limited'
            }
        )


class TimeSeriesAnalyzer:
    """Time-series analysis component for consumption patterns"""
    
    def analyze_consumption_patterns(self, usage_data: List[Any]) -> ConsumptionPattern:
        """Analyze consumption patterns from usage data"""
        
        if not usage_data:
            return ConsumptionPattern(
                base_consumption_rate=0,
                seasonal_adjustments={'current_factor': 1.0},
                trend_direction='stable',
                volatility=0,
                anomaly_flags=[]
            )
        
        # Extract quantities
        quantities = []
        for usage in usage_data:
            qty = usage.quantity_used if hasattr(usage, 'quantity_used') else usage.get('quantity_used', 0)
            quantities.append(qty)
        
        # Calculate base consumption rate
        base_consumption_rate = mean(quantities) if quantities else 0
        
        # Calculate volatility (standard deviation)
        volatility = stdev(quantities) if len(quantities) > 1 else 0
        
        # Determine trend direction (simplified)
        trend_direction = 'stable'
        if len(quantities) >= 5:
            first_half = mean(quantities[:len(quantities)//2])
            second_half = mean(quantities[len(quantities)//2:])
            if second_half > first_half * 1.1:
                trend_direction = 'increasing'
            elif second_half < first_half * 0.9:
                trend_direction = 'decreasing'
        
        # Basic seasonal adjustments (simplified)
        seasonal_adjustments = {'current_factor': 1.0}
        
        # Detect anomalies (values > 2 standard deviations)
        anomaly_flags = []
        if volatility > 0:
            threshold = base_consumption_rate + (2 * volatility)
            anomalous_count = sum(1 for q in quantities if q > threshold)
            if anomalous_count > 0:
                anomaly_flags.append(f"{anomalous_count} anomalous consumption periods detected")
        
        return ConsumptionPattern(
            base_consumption_rate=base_consumption_rate,
            seasonal_adjustments=seasonal_adjustments,
            trend_direction=trend_direction,
            volatility=volatility,
            anomaly_flags=anomaly_flags
        )
    
    def project_future_consumption(self, pattern: ConsumptionPattern, 
                                 exercises: List[Any], days: int) -> ConsumptionProjection:
        """Project future consumption based on patterns and events"""
        
        base_consumption = pattern.base_consumption_rate * (days / 30)  # Monthly to period
        
        # Adjust for exercises
        exercise_impact = 0
        for exercise in exercises:
            intensity_multipliers = {'low': 1.2, 'medium': 1.5, 'high': 2.0, 'critical': 3.0}
            intensity = exercise.intensity if hasattr(exercise, 'intensity') else exercise.get('intensity', 'medium')
            multiplier = intensity_multipliers.get(intensity, 1.5)
            
            # Assume exercise lasts 1 week and affects consumption
            exercise_impact += base_consumption * (multiplier - 1) * (7 / days)
        
        projected_consumption = base_consumption + exercise_impact
        
        # Calculate confidence range based on volatility
        margin = pattern.volatility * 0.5  # 50% of historical volatility
        confidence_range = [
            max(0, projected_consumption - margin),
            projected_consumption + margin
        ]
        
        # Identify risk factors
        risk_factors = []
        if pattern.trend_direction == 'increasing':
            risk_factors.append("Increasing consumption trend detected")
        if pattern.volatility > pattern.base_consumption_rate * 0.5:
            risk_factors.append("High consumption volatility")
        if exercise_impact > base_consumption * 0.3:
            risk_factors.append("High exercise impact on consumption")
        
        return ConsumptionProjection(
            expected_consumption=projected_consumption,
            confidence_range=confidence_range,
            risk_factors=risk_factors
        )