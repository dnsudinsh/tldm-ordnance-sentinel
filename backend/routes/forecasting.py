"""
Forecasting API Routes for TLDM BITS
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Response
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from io import BytesIO

from models.forecasting import (
    ForecastingInput, ForecastResult, GenerateForecastRequest,
    ScenarioAnalysisRequest, ScenarioResult, UpdateForecastAccuracyRequest,
    ForecastHistory, AlertHistory, UsageData, ExerciseEvent, 
    SupplyChainData, HistoricalData, InventorySnapshot, ForecastingConfig,
    AccuracyMetrics, ModelPerformance
)
from services.forecasting_engine import ReadinessForecaster, TimeSeriesAnalyzer
from services.export_service import ForecastExportService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/forecasts", tags=["forecasting"])

# Global forecaster instance
forecaster = ReadinessForecaster()
analyzer = TimeSeriesAnalyzer()


async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance - this will be replaced with actual DB injection"""
    from server import db  # Import the db instance from main server
    return db


@router.post("/generate", response_model=ForecastResult)
async def generate_forecast(
    request: GenerateForecastRequest = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Generate comprehensive readiness forecast"""
    
    try:
        # Get current inventory data
        inventory_data = await _get_current_inventory(db, request.inventory_filter if request else None)
        
        # Get historical usage data
        usage_trends = await _get_usage_trends(db)
        
        # Get scheduled exercises
        scheduled_exercises = await _get_scheduled_exercises(db)
        
        # Get supply chain data
        supply_chain_data = await _get_supply_chain_data(db)
        
        # Get historical patterns
        historical_patterns = await _get_historical_patterns(db)
        
        # Calculate current readiness
        current_readiness = await _calculate_current_readiness(inventory_data)
        
        # Build forecasting input
        forecasting_input = ForecastingInput(
            current_readiness=current_readiness,
            usage_trends=usage_trends,
            scheduled_exercises=scheduled_exercises,
            lead_times=supply_chain_data,
            historical_patterns=historical_patterns,
            inventory_snapshot=inventory_data,
            config=request.custom_config if request and request.custom_config else ForecastingConfig()
        )
        
        # Generate forecast
        forecast_result = await forecaster.generate_forecast(forecasting_input)
        
        # Store forecast history in background
        background_tasks.add_task(
            _store_forecast_history, 
            db, forecast_result, forecasting_input
        )
        
        # Generate scenario analysis if requested
        if request and request.include_scenarios:
            # Add basic scenarios
            scenarios = await _generate_basic_scenarios(forecast_result)
            forecast_result.metadata['scenarios'] = scenarios
        
        return forecast_result
        
    except Exception as e:
        logger.error(f"Forecast generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")


@router.get("/{forecast_id}", response_model=ForecastResult)
async def get_forecast(
    forecast_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get forecast by ID"""
    
    try:
        forecast_doc = await db.forecast_history.find_one({"forecast_id": forecast_id})
        
        if not forecast_doc:
            raise HTTPException(status_code=404, detail="Forecast not found")
        
        # Convert MongoDB document to ForecastResult
        return ForecastResult(**forecast_doc["result"])
        
    except Exception as e:
        logger.error(f"Failed to retrieve forecast {forecast_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve forecast")


@router.post("/{forecast_id}/scenarios", response_model=List[ScenarioResult])
async def analyze_scenarios(
    forecast_id: str,
    request: ScenarioAnalysisRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Analyze what-if scenarios for a forecast"""
    
    try:
        # Get base forecast
        base_forecast_doc = await db.forecast_history.find_one({"forecast_id": forecast_id})
        if not base_forecast_doc:
            raise HTTPException(status_code=404, detail="Base forecast not found")
        
        base_forecast = ForecastResult(**base_forecast_doc["result"])
        base_input = ForecastingInput(**base_forecast_doc["input_parameters"])
        
        scenario_results = []
        
        for scenario in request.scenarios:
            # Modify input parameters based on scenario
            modified_input = _apply_scenario_parameters(base_input, scenario)
            
            # Generate new forecast with modified parameters
            scenario_forecast = await forecaster.generate_forecast(modified_input)
            
            # Create scenario result
            scenario_result = ScenarioResult(
                scenario_name=scenario.name,
                description=scenario.description,
                base_readiness=base_forecast.timeframe.current_readiness,
                scenario_readiness=scenario_forecast.timeframe.projections[-1].readiness if scenario_forecast.timeframe.projections else base_forecast.timeframe.current_readiness,
                readiness_impact=scenario_forecast.timeframe.projections[-1].readiness - base_forecast.timeframe.projections[-1].readiness if scenario_forecast.timeframe.projections and base_forecast.timeframe.projections else 0,
                risk_assessment={
                    "critical_alerts": len(scenario_forecast.critical_alerts),
                    "high_priority_recommendations": len([r for r in scenario_forecast.procurement_recommendations if r.priority in ["urgent", "high"]])
                },
                recommendations=scenario_forecast.mitigation_strategies,
                timeline_comparison=scenario_forecast.timeframe.projections,
                metadata={
                    "scenario_parameters": scenario.dict(),
                    "generated_at": datetime.utcnow().isoformat()
                }
            )
            scenario_results.append(scenario_result)
        
        return scenario_results
        
    except Exception as e:
        logger.error(f"Scenario analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Scenario analysis failed: {str(e)}")


@router.get("/", response_model=List[Dict[str, Any]])
async def list_forecasts(
    limit: int = 20,
    offset: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """List recent forecasts"""
    
    try:
        cursor = db.forecast_history.find().sort("generated_at", -1).skip(offset).limit(limit)
        forecasts = await cursor.to_list(length=limit)
        
        # Return summary information
        forecast_summaries = []
        for forecast in forecasts:
            summary = {
                "forecast_id": forecast["forecast_id"],
                "generated_at": forecast["generated_at"],
                "current_readiness": forecast["result"]["timeframe"]["current_readiness"],
                "projected_readiness_90d": forecast["result"]["timeframe"]["projections"][-1]["readiness"] if forecast["result"]["timeframe"]["projections"] else None,
                "critical_alerts_count": len(forecast["result"]["critical_alerts"]),
                "confidence_score": forecast["result"]["confidence_metrics"]["model_accuracy"]
            }
            forecast_summaries.append(summary)
        
        return forecast_summaries
        
    except Exception as e:
        logger.error(f"Failed to list forecasts: {e}")
        raise HTTPException(status_code=500, detail="Failed to list forecasts")


@router.post("/{forecast_id}/accuracy", response_model=Dict[str, Any])
async def update_forecast_accuracy(
    forecast_id: str,
    request: UpdateForecastAccuracyRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update forecast accuracy with actual data"""
    
    try:
        # Get original forecast
        forecast_doc = await db.forecast_history.find_one({"forecast_id": forecast_id})
        if not forecast_doc:
            raise HTTPException(status_code=404, detail="Forecast not found")
        
        # Calculate accuracy metrics
        accuracy_score = _calculate_accuracy_score(
            forecast_doc["result"], 
            request.actual_readiness_data
        )
        
        # Update forecast record
        await db.forecast_history.update_one(
            {"forecast_id": forecast_id},
            {
                "$set": {
                    "accuracy_score": accuracy_score,
                    "actual_vs_predicted": request.actual_readiness_data,
                    "accuracy_updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "forecast_id": forecast_id,
            "accuracy_score": accuracy_score,
            "updated_at": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Failed to update accuracy for forecast {forecast_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update forecast accuracy")


@router.get("/alerts/active", response_model=List[AlertHistory])
async def get_active_alerts(
    severity: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get active forecast alerts"""
    
    try:
        filter_criteria = {"status": "active"}
        
        if severity:
            filter_criteria["severity"] = severity
        if category:
            filter_criteria["category"] = category
        
        cursor = db.alert_history.find(filter_criteria).sort("created_at", -1)
        alerts = await cursor.to_list(length=100)
        
        return [AlertHistory(**alert) for alert in alerts]
        
    except Exception as e:
        logger.error(f"Failed to get active alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get active alerts")


# Helper Functions
async def _get_current_inventory(db: AsyncIOMotorDatabase, filter_criteria: Dict = None) -> List[InventorySnapshot]:
    """Get current inventory data"""
    
    try:
        # Get inventory from status_checks collection (using existing data structure)
        cursor = db.status_checks.find({})
        items = await cursor.to_list(length=1000)
        
        inventory_snapshots = []
        
        # Create mock inventory based on existing structure
        # In real implementation, this would fetch from actual inventory collection
        categories = ["Missile", "Torpedo", "Ammunition", "Pyrotechnic", "Seamine", "Demolition"]
        
        for i, category in enumerate(categories):
            snapshot = InventorySnapshot(
                inventory_id=f"inv_{i}_{category.lower()}",
                ordnance_category=category,
                ordnance_name=f"{category} Standard",
                quantity=100 + (i * 50),  # Mock quantities
                condition="Serviceable",
                location="WNAED",
                expiry_date=(datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')
            )
            inventory_snapshots.append(snapshot)
        
        return inventory_snapshots
        
    except Exception as e:
        logger.warning(f"Failed to get inventory data: {e}")
        return []


async def _get_usage_trends(db: AsyncIOMotorDatabase) -> List[UsageData]:
    """Get historical usage trends"""
    
    # Generate mock usage trends for demonstration
    usage_trends = []
    
    categories = ["Missile", "Torpedo", "Ammunition", "Pyrotechnic"]
    
    for i in range(30):  # Last 30 days
        date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        
        for category in categories:
            usage = UsageData(
                date=date,
                category=category,
                quantity_used=max(1, int(10 + (i % 7) * 2)),  # Mock usage pattern
                operation_type="Training" if i % 7 < 5 else "Exercise",
                location="WNAED"
            )
            usage_trends.append(usage)
    
    return usage_trends


async def _get_scheduled_exercises(db: AsyncIOMotorDatabase) -> List[ExerciseEvent]:
    """Get scheduled exercises"""
    
    # Generate mock exercises for demonstration
    exercises = [
        ExerciseEvent(
            name="Exercise Taming Sari",
            start_date=(datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            end_date=(datetime.now() + timedelta(days=37)).strftime('%Y-%m-%d'),
            intensity="high",
            required_ordnance=[],
            participating_units=["KD Lekiu", "KD Kasturi"]
        ),
        ExerciseEvent(
            name="Coastal Defense Training",
            start_date=(datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d'),
            end_date=(datetime.now() + timedelta(days=63)).strftime('%Y-%m-%d'),
            intensity="medium",
            required_ordnance=[],
            participating_units=["KD Kedah"]
        )
    ]
    
    return exercises


async def _get_supply_chain_data(db: AsyncIOMotorDatabase) -> List[SupplyChainData]:
    """Get supply chain data"""
    
    supply_chain_data = [
        SupplyChainData(
            category="Missile",
            average_lead_time=45,
            variability=10,
            supplier_reliability=85.0,
            current_backlog=0
        ),
        SupplyChainData(
            category="Torpedo", 
            average_lead_time=60,
            variability=15,
            supplier_reliability=90.0,
            current_backlog=2
        ),
        SupplyChainData(
            category="Ammunition",
            average_lead_time=30,
            variability=5,
            supplier_reliability=95.0,
            current_backlog=0
        )
    ]
    
    return supply_chain_data


async def _get_historical_patterns(db: AsyncIOMotorDatabase) -> List[HistoricalData]:
    """Get historical readiness patterns"""
    
    historical_data = []
    
    for i in range(12):  # Last 12 months
        period = (datetime.now() - timedelta(days=i*30)).strftime('%Y-%m')
        
        data = HistoricalData(
            period=period,
            readiness=85.0 + (i % 3) * 5 - 2.5,  # Mock readiness variation
            consumption=100 + (i % 4) * 20,  # Mock consumption
            events=[f"Training Month {i+1}"],
            shortages=[]
        )
        historical_data.append(data)
    
    return historical_data


async def _calculate_current_readiness(inventory_data: List[InventorySnapshot]) -> float:
    """Calculate current readiness from inventory"""
    
    # Mock calculation - in real system this would use actual readiness calculation
    # Based on existing inventory context logic
    
    if not inventory_data:
        return 75.0  # Default readiness
    
    # Simple calculation based on inventory levels
    total_categories = len(set(item.ordnance_category for item in inventory_data))
    readiness_sum = 0
    
    categories = {}
    for item in inventory_data:
        cat = item.ordnance_category
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += item.quantity
    
    # Mock target quantities for readiness calculation
    targets = {"Missile": 100, "Torpedo": 80, "Ammunition": 1000, "Pyrotechnic": 200, "Seamine": 60, "Demolition": 50}
    
    for category, quantity in categories.items():
        target = targets.get(category, 100)
        category_readiness = min(100, (quantity / target) * 100)
        readiness_sum += category_readiness
    
    overall_readiness = readiness_sum / len(categories) if categories else 75.0
    
    return round(overall_readiness, 1)


async def _store_forecast_history(db: AsyncIOMotorDatabase, forecast: ForecastResult, input_data: ForecastingInput):
    """Store forecast in history collection"""
    
    try:
        forecast_history = ForecastHistory(
            forecast_id=forecast.forecast_id,
            generated_at=forecast.generated_at,
            input_parameters=input_data.dict(),
            result=forecast
        )
        
        await db.forecast_history.insert_one(forecast_history.dict())
        
        # Also store alerts
        for alert in forecast.critical_alerts:
            alert_history = AlertHistory(
                forecast_id=forecast.forecast_id,
                category=alert.category,
                severity=alert.severity,
                predicted_date=alert.expected_shortage_date
            )
            await db.alert_history.insert_one(alert_history.dict())
        
    except Exception as e:
        logger.error(f"Failed to store forecast history: {e}")


async def _generate_basic_scenarios(forecast: ForecastResult) -> List[Dict[str, Any]]:
    """Generate basic scenario summaries"""
    
    scenarios = [
        {
            "name": "Increased Exercise Tempo",
            "description": "20% increase in exercise frequency and intensity",
            "impact_summary": "5-8% readiness decrease expected"
        },
        {
            "name": "Supply Chain Disruption",
            "description": "30-day delay in procurement timelines",
            "impact_summary": "10-15% readiness impact"
        },
        {
            "name": "Budget Constraints",
            "description": "20% reduction in procurement budget",
            "impact_summary": "Moderate impact on critical categories"
        }
    ]
    
    return scenarios


def _apply_scenario_parameters(base_input: ForecastingInput, scenario: Any) -> ForecastingInput:
    """Apply scenario parameters to base input"""
    
    # Create a copy of the base input
    modified_input = ForecastingInput(**base_input.dict())
    
    # Apply scenario modifications
    # This is a simplified implementation - in practice would be more sophisticated
    
    if hasattr(scenario, 'exercise_intensity_multiplier') and scenario.exercise_intensity_multiplier != 1.0:
        # Modify exercise intensities
        for exercise in modified_input.scheduled_exercises:
            if exercise.intensity == "medium":
                exercise.intensity = "high"
            elif exercise.intensity == "low":
                exercise.intensity = "medium"
    
    if hasattr(scenario, 'lead_time_increase_days') and scenario.lead_time_increase_days > 0:
        # Increase lead times
        for supply_data in modified_input.lead_times:
            supply_data.average_lead_time += scenario.lead_time_increase_days
    
    return modified_input


def _calculate_accuracy_score(forecast_result: Dict[str, Any], actual_data: Dict[str, float]) -> float:
    """Calculate forecast accuracy score"""
    
    try:
        projected_values = {}
        for projection in forecast_result["timeframe"]["projections"]:
            projected_values[projection["days"]] = projection["readiness"]
        
        errors = []
        for days_str, actual_readiness in actual_data.items():
            days = int(days_str)
            if days in projected_values:
                predicted = projected_values[days]
                error = abs(predicted - actual_readiness) / actual_readiness
                errors.append(error)
        
        if not errors:
            return 0.0
        
        # Calculate mean absolute percentage error (MAPE)
        mape = sum(errors) / len(errors)
        
        # Convert to accuracy score (0-1, where 1 is perfect)
        accuracy_score = max(0, 1 - mape)
        
        return round(accuracy_score, 3)
        
    except Exception as e:
        logger.error(f"Error calculating accuracy score: {e}")
        return 0.0