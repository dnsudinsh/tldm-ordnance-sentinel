"""
Mock Forecasting Service for Demo and Fallback
Provides realistic sample data when AI service is unavailable
"""
import uuid
from datetime import datetime, timedelta
from typing import List
import random
import math

from models.forecasting import (
    ForecastResult, TimeframeProjections, ReadinessProjection,
    CriticalAlert, ProcurementRecommendation, OperationImpactAssessment,
    MitigationStrategy, ConfidenceMetrics, ScenarioResult,
    AlertSeverity, RiskLevel
)


class MockForecastingService:
    """Service that generates realistic mock forecasting data"""
    
    def __init__(self):
        # Seed for consistent but realistic variation
        random.seed(42)
    
    def generate_mock_forecast(self, current_readiness: float = None, horizon_days: int = 90) -> ForecastResult:
        """Generate a comprehensive mock forecast with realistic data"""
        
        if current_readiness is None:
            current_readiness = random.uniform(75.0, 95.0)
        
        # Generate forecast ID
        forecast_id = f"fcst_demo_{datetime.now().strftime('%Y%m%d')}_{str(uuid.uuid4())[:8]}"
        
        # Generate projections with realistic decline over time
        projections = self._generate_projections(current_readiness, horizon_days)
        
        timeframe = TimeframeProjections(
            current_readiness=current_readiness,
            projections=projections
        )
        
        # Generate critical alerts based on projections
        critical_alerts = self._generate_critical_alerts(projections)
        
        # Generate procurement recommendations
        procurement_recommendations = self._generate_procurement_recommendations()
        
        # Generate operation impact assessments
        operation_impact = self._generate_operation_impact()
        
        # Generate mitigation strategies
        mitigation_strategies = self._generate_mitigation_strategies()
        
        # Generate confidence metrics
        confidence_metrics = ConfidenceMetrics(
            model_accuracy=random.uniform(0.82, 0.94),
            data_quality_score=random.uniform(0.85, 0.96),
            forecast_reliability="high" if random.random() > 0.3 else "medium"
        )
        
        return ForecastResult(
            forecast_id=forecast_id,
            generated_at=datetime.utcnow(),
            timeframe=timeframe,
            critical_alerts=critical_alerts,
            procurement_recommendations=procurement_recommendations,
            operation_impact_assessment=operation_impact,
            mitigation_strategies=mitigation_strategies,
            confidence_metrics=confidence_metrics,
            metadata={
                'generated_as': 'mock_demo_data',
                'ai_model': 'demo_fallback',
                'processing_time_ms': random.randint(800, 1500),
                'data_quality': 'high',
                'note': 'This is demonstration data for system preview'
            }
        )
    
    def _generate_projections(self, current_readiness: float, horizon_days: int) -> List[ReadinessProjection]:
        """Generate realistic readiness projections"""
        projections = []
        
        # Base decline rate (readiness typically decreases over time without intervention)
        base_decline_rate = random.uniform(0.3, 0.8)  # % per month
        
        for days in [30, 60, 90]:
            if days > horizon_days:
                continue
                
            # Calculate projected readiness with some randomness
            months = days / 30.0
            decline = base_decline_rate * months
            
            # Add some seasonal variation and noise
            seasonal_factor = math.sin((days / 365.0) * 2 * math.pi) * 2
            noise = random.uniform(-2, 2)
            
            projected_readiness = current_readiness - decline + seasonal_factor + noise
            projected_readiness = max(40.0, min(100.0, projected_readiness))  # Clamp realistic range
            
            # Generate confidence interval (wider for longer horizons)
            margin = 3 + (days / 30) * 2  # Wider uncertainty for longer periods
            confidence_interval = [
                max(0, projected_readiness - margin),
                min(100, projected_readiness + margin)
            ]
            
            # Determine risk level
            if projected_readiness < 50:
                risk_level = RiskLevel.CRITICAL
            elif projected_readiness < 65:
                risk_level = RiskLevel.HIGH
            elif projected_readiness < 80:
                risk_level = RiskLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
            
            projection = ReadinessProjection(
                days=days,
                readiness=round(projected_readiness, 1),
                confidence_interval=[round(confidence_interval[0], 1), round(confidence_interval[1], 1)],
                risk_level=risk_level
            )
            projections.append(projection)
        
        return projections
    
    def _generate_critical_alerts(self, projections: List[ReadinessProjection]) -> List[CriticalAlert]:
        """Generate realistic critical alerts based on projections"""
        alerts = []
        
        # Categories that might have shortages
        ordnance_categories = [
            "EXOCET MM40 Missile",
            "A244S Torpedo", 
            "RDS 76MM Naval Gun",
            "RDS 5.56MM Ammunition",
            "Naval Mine Type A",
            "Emergency Flares"
        ]
        
        # Generate 1-3 alerts based on readiness levels
        low_readiness_projections = [p for p in projections if p.readiness < 70]
        
        if low_readiness_projections:
            num_alerts = min(3, len(low_readiness_projections) + random.randint(0, 2))
            
            for i in range(num_alerts):
                category = random.choice(ordnance_categories)
                
                # Determine severity based on readiness level
                worst_projection = min(projections, key=lambda x: x.readiness)
                if worst_projection.readiness < 50:
                    severity = AlertSeverity.CRITICAL
                elif worst_projection.readiness < 60:
                    severity = AlertSeverity.HIGH
                else:
                    severity = AlertSeverity.MEDIUM
                
                # Generate realistic shortage date
                shortage_date = datetime.now() + timedelta(days=random.randint(15, 75))
                
                # Mock current stock and projected need
                current_stock = random.randint(20, 150)
                projected_need = current_stock + random.randint(50, 200)
                
                # Mock impacted operations
                operations = ["Exercise Taming Sari", "Patrol Operations", "Training Exercises", "Emergency Response"]
                impacted_ops = random.sample(operations, random.randint(1, 2))
                
                alert = CriticalAlert(
                    category=category,
                    expected_shortage_date=shortage_date.strftime('%Y-%m-%d'),
                    severity=severity,
                    impacted_operations=impacted_ops,
                    current_stock_level=current_stock,
                    projected_need=projected_need
                )
                alerts.append(alert)
        
        return alerts
    
    def _generate_procurement_recommendations(self) -> List[ProcurementRecommendation]:
        """Generate realistic procurement recommendations"""
        recommendations = []
        
        categories = [
            ("EXOCET MM40 Missile", 4, 45),
            ("A244S Torpedo", 8, 60), 
            ("RDS 76MM Naval Gun Rounds", 500, 30),
            ("RDS 5.56MM Ammunition", 50000, 20),
            ("Signal Flares", 200, 15),
            ("Naval Mine Type A", 12, 75)
        ]
        
        priorities = ["urgent", "high", "medium", "low"]
        
        num_recommendations = random.randint(2, 5)
        
        for i in range(num_recommendations):
            category, base_qty, base_lead_time = random.choice(categories)
            
            priority = priorities[min(i, len(priorities)-1)]
            
            # Vary quantities and lead times
            quantity = base_qty + random.randint(-base_qty//3, base_qty//2)
            lead_time = base_lead_time + random.randint(-5, 10)
            
            # Generate deadline based on priority
            if priority == "urgent":
                deadline_days = random.randint(14, 30)
            elif priority == "high":
                deadline_days = random.randint(30, 60)
            else:
                deadline_days = random.randint(60, 120)
                
            deadline = (datetime.now() + timedelta(days=deadline_days)).strftime('%Y-%m-%d')
            
            # Generate rationale
            rationales = [
                f"Projected shortage based on consumption analysis and scheduled exercises",
                f"Preventive procurement to maintain strategic reserve levels",
                f"Critical for maintaining operational readiness during high-tempo periods",
                f"Required to support upcoming training and exercise schedule",
                f"Essential backup inventory for emergency response capabilities"
            ]
            
            recommendation = ProcurementRecommendation(
                priority=priority,
                category=category,
                recommended_quantity=quantity,
                deadline=deadline,
                rationale=random.choice(rationales),
                supplier_lead_time=lead_time
            )
            recommendations.append(recommendation)
        
        return recommendations
    
    def _generate_operation_impact(self) -> List[OperationImpactAssessment]:
        """Generate realistic operation impact assessments"""
        operations = []
        
        exercises = [
            ("Exercise Taming Sari", ["EXOCET MM40", "RDS 76MM"]),
            ("Coastal Patrol Training", ["RDS 5.56MM", "Signal Flares"]),
            ("Multi-National Exercise", ["A244S Torpedo", "Naval Mine"]),
            ("Combat Readiness Assessment", ["All Categories"])
        ]
        
        num_operations = random.randint(1, 3)
        
        for i in range(num_operations):
            exercise_name, affected_items = random.choice(exercises)
            
            # Generate impact (negative for most cases)
            readiness_impact = random.uniform(-15.0, -3.0)
            
            recommendations = [
                "Pre-position additional inventory at forward bases",
                "Coordinate with supply chain for expedited delivery",
                "Consider exercise scope reduction if shortages occur",
                "Implement strict inventory management protocols",
                "Activate emergency procurement procedures"
            ]
            
            selected_recommendations = random.sample(recommendations, random.randint(2, 4))
            
            impact = OperationImpactAssessment(
                exercise_name=exercise_name,
                readiness_impact=round(readiness_impact, 1),
                critical_items_affected=affected_items,
                recommendations=selected_recommendations
            )
            operations.append(impact)
        
        return operations
    
    def _generate_mitigation_strategies(self) -> List[MitigationStrategy]:
        """Generate realistic mitigation strategies"""
        strategies = []
        
        strategy_templates = [
            {
                "name": "Inventory Redistribution",
                "effectiveness": (0.6, 0.8),
                "time": (5, 14),
                "impact": "Optimize distribution across naval bases",
                "items": ["All Categories"]
            },
            {
                "name": "Expedited Procurement",
                "effectiveness": (0.7, 0.9),
                "time": (21, 45),
                "impact": "Accelerate critical item deliveries",
                "items": ["EXOCET MM40", "A244S Torpedo"]
            },
            {
                "name": "Exercise Schedule Adjustment",
                "effectiveness": (0.4, 0.7),
                "time": (1, 7),
                "impact": "Reduce consumption through schedule optimization",
                "items": ["Training Ammunition", "Naval Gun Rounds"]
            },
            {
                "name": "Strategic Reserve Activation",
                "effectiveness": (0.8, 0.95),
                "time": (2, 5),
                "impact": "Deploy reserve stocks for critical operations",
                "items": ["Emergency Supplies"]
            },
            {
                "name": "Alternative Supplier Engagement",
                "effectiveness": (0.5, 0.75),
                "time": (30, 60),
                "impact": "Diversify supply chain for reliability",
                "items": ["Standard Ammunition", "Maintenance Items"]
            }
        ]
        
        num_strategies = random.randint(3, 5)
        selected_templates = random.sample(strategy_templates, num_strategies)
        
        for template in selected_templates:
            effectiveness = random.uniform(*template["effectiveness"])
            time = random.randint(*template["time"])
            
            strategy = MitigationStrategy(
                strategy=template["name"],
                effectiveness=round(effectiveness, 2),
                implementation_time=time,
                impact=template["impact"],
                items_affected=template["items"]
            )
            strategies.append(strategy)
        
        return strategies
    
    def generate_mock_scenarios(self, base_forecast: ForecastResult) -> List[ScenarioResult]:
        """Generate mock scenario results"""
        scenarios = []
        
        scenario_configs = [
            {
                "name": "Increased Exercise Tempo", 
                "description": "Enhanced training schedule with 50% more exercises",
                "impact_range": (-8, -15)
            },
            {
                "name": "Supply Chain Disruption",
                "description": "Major logistics disruption affecting procurement timelines",
                "impact_range": (-12, -20)
            },
            {
                "name": "Budget Constraints",
                "description": "Significant budget reduction requiring resource optimization", 
                "impact_range": (-5, -12)
            },
            {
                "name": "Geopolitical Tension",
                "description": "Elevated security posture requiring increased readiness",
                "impact_range": (-10, -18)
            },
            {
                "name": "Monsoon Impact", 
                "description": "Seasonal weather effects limiting operations and deliveries",
                "impact_range": (-3, -8)
            }
        ]
        
        base_readiness = base_forecast.timeframe.current_readiness
        
        for config in scenario_configs:
            impact = random.uniform(*config["impact_range"])
            scenario_readiness = max(20.0, base_readiness + impact)
            
            # Generate mock timeline comparison
            timeline_comparison = []
            for proj in base_forecast.timeframe.projections:
                adjusted_readiness = max(15.0, proj.readiness + impact + random.uniform(-2, 2))
                
                scenario_proj = ReadinessProjection(
                    days=proj.days,
                    readiness=adjusted_readiness,
                    confidence_interval=[adjusted_readiness - 5, adjusted_readiness + 5],
                    risk_level=RiskLevel.HIGH if adjusted_readiness < 60 else RiskLevel.MEDIUM
                )
                timeline_comparison.append(scenario_proj)
            
            scenario = ScenarioResult(
                scenario_name=config["name"],
                description=config["description"],
                base_readiness=base_readiness,
                scenario_readiness=round(scenario_readiness, 1),
                readiness_impact=round(impact, 1),
                risk_assessment={
                    "critical_alerts": random.randint(1, 4),
                    "high_priority_recommendations": random.randint(2, 6),
                    "overall_risk": "elevated" if impact < -10 else "moderate"
                },
                recommendations=base_forecast.mitigation_strategies[:3],  # Reuse some strategies
                timeline_comparison=timeline_comparison,
                metadata={
                    "scenario_type": "mock_demonstration",
                    "generated_at": datetime.utcnow().isoformat(),
                    "confidence": random.uniform(0.75, 0.90)
                }
            )
            scenarios.append(scenario)
        
        return scenarios