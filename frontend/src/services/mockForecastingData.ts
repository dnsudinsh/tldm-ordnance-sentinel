/**
 * Frontend Mock Forecasting Data Service
 * Provides immediate demonstration data when backend is unavailable
 */

export interface MockForecastResult {
  forecast_id: string;
  generated_at: string;
  timeframe: {
    current_readiness: number;
    projections: Array<{
      days: number;
      readiness: number;
      confidence_interval: [number, number];
      risk_level: string;
    }>;
  };
  critical_alerts: Array<{
    category: string;
    expected_shortage_date: string;
    severity: string;
    impacted_operations: string[];
    current_stock_level: number;
    projected_need: number;
  }>;
  procurement_recommendations: Array<{
    priority: string;
    category: string;
    recommended_quantity: number;
    deadline: string;
    rationale: string;
    supplier_lead_time: number;
  }>;
  operation_impact_assessment: Array<{
    exercise_name: string;
    readiness_impact: number;
    critical_items_affected: string[];
    recommendations: string[];
  }>;
  mitigation_strategies: Array<{
    strategy: string;
    effectiveness: number;
    implementation_time: number;
    impact: string;
    items_affected: string[];
  }>;
  confidence_metrics: {
    model_accuracy: number;
    data_quality_score: number;
    forecast_reliability: string;
  };
  metadata: {
    generated_as: string;
    ai_model?: string;
    processing_time_ms: number;
    data_quality: string;
    demo_mode?: boolean;
    note?: string;
  };
}

export interface MockScenarioResult {
  scenario_name: string;
  description?: string;
  base_readiness: number;
  scenario_readiness: number;
  readiness_impact: number;
  risk_assessment: any;
  recommendations: any[];
  timeline_comparison: any[];
  metadata: any;
}

export class FrontendMockDataService {
  
  static generateMockForecast(horizon_days: number = 90): MockForecastResult {
    const currentReadiness = 87.3;
    const forecast_id = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    // Generate realistic projections showing gradual decline
    const projections = [
      {
        days: 30,
        readiness: 84.1,
        confidence_interval: [81.2, 87.0] as [number, number],
        risk_level: "low"
      },
      {
        days: 60,
        readiness: 78.6,
        confidence_interval: [74.8, 82.4] as [number, number],
        risk_level: "medium"
      },
      {
        days: 90,
        readiness: 71.2,
        confidence_interval: [66.5, 75.9] as [number, number],
        risk_level: "high"
      }
    ];

    // Generate critical alerts
    const critical_alerts = [
      {
        category: "EXOCET MM40 Missile",
        expected_shortage_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        severity: "high",
        impacted_operations: ["Exercise Taming Sari", "Patrol Operations"],
        current_stock_level: 8,
        projected_need: 16
      },
      {
        category: "A244S Torpedo", 
        expected_shortage_date: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        severity: "medium",
        impacted_operations: ["Anti-Submarine Training"],
        current_stock_level: 24,
        projected_need: 36
      },
      {
        category: "RDS 76MM Naval Gun Rounds",
        expected_shortage_date: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        severity: "critical",
        impacted_operations: ["Live Fire Exercises", "Combat Training"],
        current_stock_level: 450,
        projected_need: 850
      }
    ];

    // Generate procurement recommendations
    const procurement_recommendations = [
      {
        priority: "urgent",
        category: "RDS 76MM Naval Gun Rounds",
        recommended_quantity: 500,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rationale: "Critical shortage projected for upcoming Exercise Taming Sari requiring immediate procurement action",
        supplier_lead_time: 35
      },
      {
        priority: "high",
        category: "EXOCET MM40 Missile",
        recommended_quantity: 12,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rationale: "Strategic inventory replenishment to maintain minimum operational readiness levels",
        supplier_lead_time: 60
      },
      {
        priority: "medium", 
        category: "RDS 5.56MM Ammunition",
        recommended_quantity: 75000,
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rationale: "Preventive procurement based on projected consumption patterns during training intensification",
        supplier_lead_time: 20
      },
      {
        priority: "high",
        category: "Signal Flares & Pyrotechnics",
        recommended_quantity: 300,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        rationale: "Safety-critical items required for emergency response and night operations capability",
        supplier_lead_time: 15
      }
    ];

    // Generate operation impact assessments
    const operation_impact_assessment = [
      {
        exercise_name: "Exercise Taming Sari 2025",
        readiness_impact: -12.4,
        critical_items_affected: ["EXOCET MM40", "RDS 76MM", "A244S Torpedo"],
        recommendations: [
          "Pre-position additional inventory at Lumut Naval Base",
          "Coordinate with MINDEF for emergency procurement approval", 
          "Consider exercise scope reduction if critical shortages occur",
          "Implement strict consumption monitoring protocols"
        ]
      },
      {
        exercise_name: "Multi-National Maritime Exercise",
        readiness_impact: -8.7,
        critical_items_affected: ["Naval Mines", "Anti-Ship Missiles"],
        recommendations: [
          "Activate strategic reserve stocks from WNAED",
          "Request allied nation training ammunition sharing agreement",
          "Prioritize high-impact training scenarios"
        ]
      },
      {
        exercise_name: "Coastal Defense Training",
        readiness_impact: -5.2,
        critical_items_affected: ["RDS 5.56MM", "Signal Flares"],
        recommendations: [
          "Optimize training schedules to reduce consumption",
          "Implement simulation-based training where possible"
        ]
      }
    ];

    // Generate mitigation strategies
    const mitigation_strategies = [
      {
        strategy: "Strategic Inventory Redistribution", 
        effectiveness: 0.75,
        implementation_time: 7,
        impact: "Optimize stock allocation across naval bases to improve overall readiness by 8-12%",
        items_affected: ["All Ordnance Categories", "Emergency Reserves"]
      },
      {
        strategy: "Expedited Procurement Protocol",
        effectiveness: 0.85,
        implementation_time: 21,
        impact: "Accelerate critical item deliveries through defense industry partnerships",
        items_affected: ["EXOCET MM40", "A244S Torpedo", "RDS 76MM"]
      },
      {
        strategy: "Exercise Schedule Optimization",
        effectiveness: 0.60,
        implementation_time: 3,
        impact: "Reduce consumption through intelligent scheduling and simulation integration",
        items_affected: ["Training Ammunition", "Naval Gun Rounds"]
      },
      {
        strategy: "Emergency Reserve Activation",
        effectiveness: 0.90,
        implementation_time: 1,
        impact: "Deploy strategic reserves to maintain operational capability during shortages",
        items_affected: ["Critical Combat Systems", "Emergency Response Items"]
      },
      {
        strategy: "Supply Chain Diversification",
        effectiveness: 0.70,
        implementation_time: 45,
        impact: "Establish alternative supplier relationships for improved reliability and reduced lead times",
        items_affected: ["Standard Ammunition", "Maintenance Components"]
      }
    ];

    return {
      forecast_id,
      generated_at: new Date().toISOString(),
      timeframe: {
        current_readiness: currentReadiness,
        projections
      },
      critical_alerts,
      procurement_recommendations,
      operation_impact_assessment,
      mitigation_strategies,
      confidence_metrics: {
        model_accuracy: 0.89,
        data_quality_score: 0.92,
        forecast_reliability: "high"
      },
      metadata: {
        generated_as: "frontend_demo_data",
        ai_model: "demonstration_mode",
        processing_time_ms: 847,
        data_quality: "high",
        demo_mode: true,
        note: "This is realistic demonstration data showcasing BITS forecasting capabilities. Live AI analysis will be available when service connectivity is restored."
      }
    };
  }

  static generateMockScenarios(): MockScenarioResult[] {
    const scenarios = [
      {
        scenario_name: "Increased Exercise Tempo",
        description: "Enhanced training schedule with 50% more exercises and higher intensity operations",
        base_readiness: 87.3,
        scenario_readiness: 79.1,
        readiness_impact: -8.2,
        risk_assessment: {
          critical_alerts: 4,
          high_priority_recommendations: 6,
          overall_risk: "elevated"
        },
        recommendations: [],
        timeline_comparison: [
          { days: 30, readiness: 81.2, confidence_interval: [78.4, 84.0], risk_level: "medium" },
          { days: 60, readiness: 74.8, confidence_interval: [70.1, 79.5], risk_level: "high" },
          { days: 90, readiness: 66.4, confidence_interval: [61.7, 71.1], risk_level: "critical" }
        ],
        metadata: {
          scenario_type: "operational_tempo",
          generated_at: new Date().toISOString(),
          confidence: 0.87,
          demo_mode: true
        }
      },
      {
        scenario_name: "Supply Chain Disruption",
        description: "Major logistics disruption affecting procurement and delivery timelines",
        base_readiness: 87.3,
        scenario_readiness: 68.9,
        readiness_impact: -18.4,
        risk_assessment: {
          critical_alerts: 7,
          high_priority_recommendations: 9,
          overall_risk: "critical"
        },
        recommendations: [],
        timeline_comparison: [
          { days: 30, readiness: 76.5, confidence_interval: [71.8, 81.2], risk_level: "high" },
          { days: 60, readiness: 65.2, confidence_interval: [59.4, 71.0], risk_level: "critical" },
          { days: 90, readiness: 52.7, confidence_interval: [46.3, 59.1], risk_level: "critical" }
        ],
        metadata: {
          scenario_type: "supply_chain",
          generated_at: new Date().toISOString(),
          confidence: 0.82,
          demo_mode: true
        }
      },
      {
        scenario_name: "Budget Constraints",
        description: "Significant budget reduction requiring careful resource optimization",
        base_readiness: 87.3,
        scenario_readiness: 75.6,
        readiness_impact: -11.7,
        risk_assessment: {
          critical_alerts: 3,
          high_priority_recommendations: 5,
          overall_risk: "moderate"
        },
        recommendations: [],
        timeline_comparison: [
          { days: 30, readiness: 82.1, confidence_interval: [79.3, 84.9], risk_level: "low" },
          { days: 60, readiness: 76.8, confidence_interval: [72.5, 81.1], risk_level: "medium" },
          { days: 90, readiness: 69.2, confidence_interval: [64.1, 74.3], risk_level: "high" }
        ],
        metadata: {
          scenario_type: "budget_constraint",
          generated_at: new Date().toISOString(),
          confidence: 0.85,
          demo_mode: true
        }
      },
      {
        scenario_name: "Geopolitical Tension",
        description: "Elevated security posture requiring increased readiness and consumption",
        base_readiness: 87.3,
        scenario_readiness: 73.4,
        readiness_impact: -13.9,
        risk_assessment: {
          critical_alerts: 5,
          high_priority_recommendations: 8,
          overall_risk: "elevated"
        },
        recommendations: [],
        timeline_comparison: [
          { days: 30, readiness: 80.7, confidence_interval: [76.9, 84.5], risk_level: "medium" },
          { days: 60, readiness: 72.1, confidence_interval: [67.3, 76.9], risk_level: "high" },
          { days: 90, readiness: 61.8, confidence_interval: [56.2, 67.4], risk_level: "critical" }
        ],
        metadata: {
          scenario_type: "geopolitical",
          generated_at: new Date().toISOString(),
          confidence: 0.78,
          demo_mode: true
        }
      },
      {
        scenario_name: "Monsoon Impact",
        description: "Seasonal weather effects limiting operations and supply deliveries",
        base_readiness: 87.3,
        scenario_readiness: 81.5,
        readiness_impact: -5.8,
        risk_assessment: {
          critical_alerts: 2,
          high_priority_recommendations: 4,
          overall_risk: "moderate"
        },
        recommendations: [],
        timeline_comparison: [
          { days: 30, readiness: 84.6, confidence_interval: [81.8, 87.4], risk_level: "low" },
          { days: 60, readiness: 79.3, confidence_interval: [75.7, 82.9], risk_level: "medium" },
          { days: 90, readiness: 72.8, confidence_interval: [68.4, 77.2], risk_level: "medium" }
        ],
        metadata: {
          scenario_type: "weather_impact",
          generated_at: new Date().toISOString(),
          confidence: 0.91,
          demo_mode: true
        }
      }
    ];

    return scenarios;
  }
}