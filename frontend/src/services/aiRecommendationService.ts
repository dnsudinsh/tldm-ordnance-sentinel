import { MissionParams, AIRecommendation, AIResponseStatus, MissionTemplate, OrdnanceRecommendation } from '../types/ai-recommendations';
import { useToast } from '@/hooks/use-toast';

// Mission templates for fallback generation
const MISSION_TEMPLATES: Record<string, MissionTemplate> = {
  'Anti-Submarine': {
    primary: [
      { ordnance_name: 'A244/S MOD 3', base_quantity: 4, priority: 'Critical' },
      { ordnance_name: 'Mk 46 MOD 5', base_quantity: 6, priority: 'High' },
      { ordnance_name: '12.7mm Machine Gun Rounds', base_quantity: 2000, priority: 'Medium' }
    ],
    backup: [
      { ordnance_name: 'Black Shark Torpedo', quantity: 2, reason: 'Alternative torpedo system' },
      { ordnance_name: 'Signal Flares', quantity: 24, reason: 'Emergency signaling' }
    ],
    risk_level: 'High',
    complexity_base: 70
  },
  'Coastal Patrol': {
    primary: [
      { ordnance_name: '76mm Naval Gun Rounds', base_quantity: 12, priority: 'High' },
      { ordnance_name: '57mm Naval Gun Rounds', base_quantity: 24, priority: 'Medium' },
      { ordnance_name: '5.56mm Rifle Rounds', base_quantity: 1000, priority: 'Medium' }
    ],
    backup: [
      { ordnance_name: '12.7mm Machine Gun Rounds', quantity: 500, reason: 'Close defense capability' },
      { ordnance_name: 'Signal Flares', quantity: 12, reason: 'Communication and distress' }
    ],
    risk_level: 'Medium',
    complexity_base: 40
  },
  'Amphibious Assault': {
    primary: [
      { ordnance_name: 'EXOCET MM40 Block 3', base_quantity: 6, priority: 'Critical' },
      { ordnance_name: '76mm Naval Gun Rounds', base_quantity: 48, priority: 'High' },
      { ordnance_name: 'C4 Explosive Blocks', base_quantity: 12, priority: 'High' }
    ],
    backup: [
      { ordnance_name: 'EXOCET MM40 Block 2', quantity: 4, reason: 'Alternative missile system' },
      { ordnance_name: '12.7mm Machine Gun Rounds', quantity: 3000, reason: 'Suppressive fire support' }
    ],
    risk_level: 'Critical',
    complexity_base: 85
  },
  'Maritime Security': {
    primary: [
      { ordnance_name: '57mm Naval Gun Rounds', base_quantity: 18, priority: 'High' },
      { ordnance_name: '12.7mm Machine Gun Rounds', base_quantity: 1500, priority: 'High' },
      { ordnance_name: '5.56mm Rifle Rounds', base_quantity: 2000, priority: 'Medium' }
    ],
    backup: [
      { ordnance_name: '76mm Naval Gun Rounds', quantity: 8, reason: 'Escalation capability' },
      { ordnance_name: 'Signal Flares', quantity: 18, reason: 'Warning and communication' }
    ],
    risk_level: 'Medium',
    complexity_base: 50
  },
  'Convoy Escort': {
    primary: [
      { ordnance_name: 'A244/S MOD 3', base_quantity: 8, priority: 'Critical' },
      { ordnance_name: '76mm Naval Gun Rounds', base_quantity: 36, priority: 'High' },
      { ordnance_name: '57mm Naval Gun Rounds', base_quantity: 48, priority: 'Medium' }
    ],
    backup: [
      { ordnance_name: 'EXOCET MM40 Block 3', quantity: 2, reason: 'Anti-ship capability' },
      { ordnance_name: 'Mk 46 MOD 5', quantity: 4, reason: 'Additional ASW capability' }
    ],
    risk_level: 'High',
    complexity_base: 75
  },
  'Training Exercise': {
    primary: [
      { ordnance_name: '76mm Naval Gun Rounds', base_quantity: 6, priority: 'Medium' },
      { ordnance_name: '5.56mm Rifle Rounds', base_quantity: 500, priority: 'Low' },
      { ordnance_name: 'Signal Flares', base_quantity: 12, priority: 'Low' }
    ],
    backup: [
      { ordnance_name: '12.7mm Machine Gun Rounds', quantity: 200, reason: 'Training scenarios' }
    ],
    risk_level: 'Low',
    complexity_base: 25
  }
};

// Smart failure detection
export const detectAIFailure = (response: any, responseTime?: number): AIResponseStatus => {
  const status: AIResponseStatus = { success: true };
  
  if (!response || response.error) {
    status.success = false;
    status.error = response?.error || 'No response from AI service';
    status.fallbackTriggered = true;
    return status;
  }
  
  if (response?.confidence && response.confidence < 60) {
    status.success = false;
    status.error = 'Low confidence score from AI';
    status.fallbackTriggered = true;
    return status;
  }
  
  if (responseTime && responseTime > 10000) { // 10 seconds timeout
    status.success = false;
    status.error = 'AI response timeout';
    status.fallbackTriggered = true;
    return status;
  }
  
  status.confidence = response?.confidence || 85;
  status.responseTime = responseTime;
  return status;
};

// Smart ship distribution logic
const distributeToShips = (ships: string[], totalQuantity: number): { [ship: string]: number } => {
  const allocation: { [ship: string]: number } = {};
  const shipsCount = ships.length;
  
  if (shipsCount === 0) return allocation;
  
  const baseAllocation = Math.floor(totalQuantity / shipsCount);
  const remainder = totalQuantity % shipsCount;
  
  ships.forEach((ship, index) => {
    // Give remainder to first ships (typically flagship gets priority)
    allocation[ship] = baseAllocation + (index < remainder ? 1 : 0);
  });
  
  return allocation;
};

// Complexity scoring for mock data
const calculateComplexity = (missionParams: MissionParams): number => {
  const template = MISSION_TEMPLATES[missionParams.missionType];
  let score = template?.complexity_base || 50;
  
  // Adjust based on threat level
  const threatMultipliers = { Low: 0, Medium: 15, High: 30, Critical: 45 };
  score += threatMultipliers[missionParams.threatLevel] || 0;
  
  // Adjust based on duration
  score += Math.min(30, missionParams.duration * 2);
  
  // Adjust based on number of ships
  score += Math.min(15, missionParams.selectedShips.length * 3);
  
  // Weather impact
  const weatherImpact = {
    'Clear': 0, 'Overcast': 5, 'Light Rain': 10,
    'Heavy Rain': 15, 'Rough Seas': 20, 'Storm': 25
  };
  score += weatherImpact[missionParams.weather] || 0;
  
  return Math.min(95, Math.max(10, score));
};

// Mock recommendation generator
export const generateMockRecommendation = (missionParams: MissionParams): AIRecommendation => {
  const template = MISSION_TEMPLATES[missionParams.missionType] || MISSION_TEMPLATES['Coastal Patrol'];
  
  // Calculate multipliers
  const threatMultipliers = { Low: 1, Medium: 1.5, High: 2, Critical: 3 };
  const threatMultiplier = threatMultipliers[missionParams.threatLevel] || 1;
  const durationFactor = Math.max(1, missionParams.duration / 7); // Weekly scaling
  const weatherFactor = missionParams.weather === 'Storm' ? 1.2 : 1;
  
  const primaryRecommendations: OrdnanceRecommendation[] = template.primary.map(item => {
    const adjustedQuantity = Math.ceil(
      item.base_quantity * threatMultiplier * durationFactor * weatherFactor
    );
    
    return {
      ordnance_name: item.ordnance_name,
      quantity: adjustedQuantity,
      allocation: distributeToShips(missionParams.selectedShips, adjustedQuantity),
      confidence: 75, // Conservative confidence for mock data
      justification: `Standard ${missionParams.missionType} loadout with ${threatMultiplier}x threat adjustment and ${durationFactor.toFixed(1)}x duration scaling`,
      priority: item.priority
    };
  });

  return {
    mission_analysis: {
      complexity_score: calculateComplexity(missionParams),
      risk_level: template.risk_level,
      estimated_consumption: durationFactor > 2 ? 'High' : durationFactor > 1.5 ? 'Medium' : 'Standard',
      Note: '⚠️ MOCK DATA - AI SERVICE UNAVAILABLE'
    },
    primary_recommendations: primaryRecommendations,
    backup_recommendations: template.backup,
    risk_assessment: {
      shortages: ['None detected in mock data - verify with current inventory'],
      mitigation_strategies: [
        'Consult with ordnance officer for verification',
        'Check real-time inventory levels',
        'Consider alternative ordnance if shortages exist'
      ],
      overall_risk: template.risk_level
    },
    distribution_strategy: {
      primary_ship: missionParams.selectedShips[0] || 'No ships selected',
      support_ships: missionParams.selectedShips.slice(1),
      reserve_allocation: `Nearest depot to ${missionParams.operationalArea}`
    },
    metadata: {
      generated_as: 'fallback_mock',
      timestamp: new Date().toISOString(),
      ai_service_status: 'unavailable',
      confidence: 75
    }
  };
};

// Simulate AI service call (replace with actual API call)
const callAIService = async (missionParams: MissionParams): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
  
  // Simulate random failures for testing
  if (Math.random() < 0.3) { // 30% failure rate for demo
    throw new Error('AI service temporarily unavailable');
  }
  
  // Simulate successful response
  return {
    success: true,
    confidence: Math.random() * 40 + 60, // 60-100% confidence
    data: generateMockRecommendation(missionParams) // For demo, return mock data
  };
};

// Main service function with retry and fallback
export const getAIRecommendationWithFallback = async (
  missionParams: MissionParams,
  maxRetries: number = 2
): Promise<AIRecommendation> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    
    try {
      const response = await callAIService(missionParams);
      const responseTime = Date.now() - startTime;
      const status = detectAIFailure(response, responseTime);
      
      if (status.success && response.data) {
        // Mark as AI-generated
        response.data.metadata = {
          ...response.data.metadata,
          generated_as: 'ai_service',
          ai_service_status: 'available',
          confidence: response.confidence
        };
        return response.data;
      }
      
      console.warn(`AI attempt ${attempt} failed:`, status.error);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
      
    } catch (error) {
      console.error(`AI attempt ${attempt} error:`, error);
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }
  
  // All attempts failed, generate mock data
  console.log('All AI attempts failed, generating fallback mock recommendations');
  return generateMockRecommendation(missionParams);
};

// Service status checker
export const checkAIServiceStatus = async (): Promise<'available' | 'degraded' | 'unavailable'> => {
  try {
    const startTime = Date.now();
    const response = await fetch('/api/ai-service/health', { 
      method: 'GET',
      timeout: 5000 
    });
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return responseTime > 3000 ? 'degraded' : 'available';
    }
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
};