// AI Recommendation Engine Types for TLDM BITS

export interface MissionParams {
  missionType: MissionType;
  duration: number; // in days
  threatLevel: ThreatLevel;
  selectedShips: string[];
  weather: WeatherCondition;
  operationalArea: string;
  specialRequirements?: string[];
}

export interface AIRecommendation {
  mission_analysis: {
    complexity_score: number;
    risk_level: string;
    estimated_consumption: string;
    Note?: string;
  };
  primary_recommendations: OrdnanceRecommendation[];
  backup_recommendations: BackupRecommendation[];
  risk_assessment: {
    shortages: string[];
    mitigation_strategies: string[];
    overall_risk: string;
  };
  distribution_strategy: {
    primary_ship: string;
    support_ships: string[];
    reserve_allocation: string;
  };
  metadata: {
    generated_as: 'ai_service' | 'fallback_mock';
    timestamp: string;
    ai_service_status: 'available' | 'unavailable' | 'degraded';
    confidence?: number;
  };
}

export interface OrdnanceRecommendation {
  ordnance_name: string;
  quantity: number;
  allocation: { [ship: string]: number };
  confidence: number;
  justification: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface BackupRecommendation {
  ordnance_name: string;
  quantity: number;
  reason: string;
}

export interface AIResponseStatus {
  success: boolean;
  error?: string;
  responseTime?: number;
  confidence?: number;
  fallbackTriggered?: boolean;
}

export type MissionType = 
  | 'Anti-Submarine'
  | 'Coastal Patrol'
  | 'Amphibious Assault'
  | 'Maritime Security'
  | 'Search and Rescue'
  | 'Training Exercise'
  | 'Convoy Escort';

export type ThreatLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type WeatherCondition = 
  | 'Clear'
  | 'Overcast'
  | 'Light Rain'
  | 'Heavy Rain'
  | 'Rough Seas'
  | 'Storm';

export interface MissionTemplate {
  primary: Array<{
    ordnance_name: string;
    base_quantity: number;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }>;
  backup: Array<{
    ordnance_name: string;
    quantity: number;
    reason: string;
  }>;
  risk_level: string;
  complexity_base: number;
}