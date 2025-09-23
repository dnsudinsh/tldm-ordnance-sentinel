import { useState, useEffect } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  RefreshCw,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Gauge
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  MissionParams, 
  AIRecommendation, 
  MissionType, 
  ThreatLevel, 
  WeatherCondition 
} from "../types/ai-recommendations";
import { 
  getAIRecommendationWithFallback, 
  checkAIServiceStatus 
} from "../services/aiRecommendationService";
import { NAVAL_SHIPS } from "../types/inventory";

export default function AIRecommendations() {
  const { state } = useInventory();
  const { loading } = state;
  const { toast } = useToast();

  const [missionParams, setMissionParams] = useState<MissionParams>({
    missionType: 'Coastal Patrol',
    duration: 7,
    threatLevel: 'Medium',
    selectedShips: [],
    weather: 'Clear',
    operationalArea: 'South China Sea',
    specialRequirements: []
  });

  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState<'available' | 'degraded' | 'unavailable'>('available');
  const [specialRequirement, setSpecialRequirement] = useState('');

  // Check AI service status on mount
  useEffect(() => {
    checkServiceStatus();
    const interval = setInterval(checkServiceStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkServiceStatus = async () => {
    const status = await checkAIServiceStatus();
    setAiServiceStatus(status);
  };

  const handleParamChange = (field: keyof MissionParams, value: any) => {
    setMissionParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialRequirement = () => {
    if (specialRequirement.trim()) {
      setMissionParams(prev => ({
        ...prev,
        specialRequirements: [...(prev.specialRequirements || []), specialRequirement.trim()]
      }));
      setSpecialRequirement('');
    }
  };

  const removeSpecialRequirement = (index: number) => {
    setMissionParams(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements?.filter((_, i) => i !== index) || []
    }));
  };

  const generateRecommendation = async () => {
    if (missionParams.selectedShips.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one ship for the mission.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await getAIRecommendationWithFallback(missionParams);
      setRecommendation(result);
      
      if (result.metadata.generated_as === 'fallback_mock') {
        toast({
          title: "AI Service Unavailable",
          description: "Showing mock recommendations based on standard procedures. System will retry automatically.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recommendations Generated",
          description: `AI analysis complete with ${result.metadata.confidence}% confidence.`,
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-success';
      case 'degraded': return 'text-warning';
      case 'unavailable': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'unavailable': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-destructive text-white';
      case 'High': return 'bg-warning text-white';
      case 'Medium': return 'bg-info text-white';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading AI recommendation system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          AI Ordnance Recommendations
        </h1>
        <p className="text-muted-foreground">
          Intelligent mission planning with AI-powered ordnance recommendations
        </p>
      </div>

      {/* AI Service Status */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-card/50 border border-border/50 ${getStatusColor(aiServiceStatus)}`}>
                {getStatusIcon(aiServiceStatus)}
              </div>
              <div>
                <p className="font-medium">AI Service Status</p>
                <p className={`text-sm ${getStatusColor(aiServiceStatus)}`}>
                  {aiServiceStatus.charAt(0).toUpperCase() + aiServiceStatus.slice(1)}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={checkServiceStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Parameters */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mission Parameters
            </CardTitle>
            <CardDescription>Configure mission details for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mission Type</Label>
                <Select 
                  value={missionParams.missionType} 
                  onValueChange={(value: MissionType) => handleParamChange('missionType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Anti-Submarine">Anti-Submarine</SelectItem>
                    <SelectItem value="Coastal Patrol">Coastal Patrol</SelectItem>
                    <SelectItem value="Amphibious Assault">Amphibious Assault</SelectItem>
                    <SelectItem value="Maritime Security">Maritime Security</SelectItem>
                    <SelectItem value="Search and Rescue">Search and Rescue</SelectItem>
                    <SelectItem value="Training Exercise">Training Exercise</SelectItem>
                    <SelectItem value="Convoy Escort">Convoy Escort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Threat Level</Label>
                <Select 
                  value={missionParams.threatLevel} 
                  onValueChange={(value: ThreatLevel) => handleParamChange('threatLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={missionParams.duration}
                  onChange={(e) => handleParamChange('duration', parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label>Weather Condition</Label>
                <Select 
                  value={missionParams.weather} 
                  onValueChange={(value: WeatherCondition) => handleParamChange('weather', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clear">Clear</SelectItem>
                    <SelectItem value="Overcast">Overcast</SelectItem>
                    <SelectItem value="Light Rain">Light Rain</SelectItem>
                    <SelectItem value="Heavy Rain">Heavy Rain</SelectItem>
                    <SelectItem value="Rough Seas">Rough Seas</SelectItem>
                    <SelectItem value="Storm">Storm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Operational Area</Label>
              <Input
                value={missionParams.operationalArea}
                onChange={(e) => handleParamChange('operationalArea', e.target.value)}
                placeholder="e.g., South China Sea, Strait of Malacca"
              />
            </div>

            <div className="space-y-2">
              <Label>Selected Ships</Label>
              <Select 
                value="" 
                onValueChange={(ship) => {
                  if (!missionParams.selectedShips.includes(ship)) {
                    handleParamChange('selectedShips', [...missionParams.selectedShips, ship]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add ships to mission" />
                </SelectTrigger>
                <SelectContent>
                  {NAVAL_SHIPS.filter(ship => !missionParams.selectedShips.includes(ship)).map(ship => (
                    <SelectItem key={ship} value={ship}>{ship}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {missionParams.selectedShips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {missionParams.selectedShips.map((ship, index) => (
                    <Badge 
                      key={ship} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-destructive hover:text-white"
                      onClick={() => {
                        handleParamChange('selectedShips', 
                          missionParams.selectedShips.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      {ship} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Special Requirements</Label>
              <div className="flex gap-2">
                <Input
                  value={specialRequirement}
                  onChange={(e) => setSpecialRequirement(e.target.value)}
                  placeholder="Add special requirement"
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialRequirement()}
                />
                <Button variant="outline" onClick={addSpecialRequirement}>
                  Add
                </Button>
              </div>
              
              {missionParams.specialRequirements && missionParams.specialRequirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {missionParams.specialRequirements.map((req, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-white"
                      onClick={() => removeSpecialRequirement(index)}
                    >
                      {req} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={generateRecommendation}
              disabled={isGenerating || missionParams.selectedShips.length === 0}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Mission Summary */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Mission Summary
            </CardTitle>
            <CardDescription>Current mission configuration overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Mission Type</span>
                </div>
                <p className="font-bold">{missionParams.missionType}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Threat Level</span>
                </div>
                <Badge variant={
                  missionParams.threatLevel === 'Critical' ? 'destructive' :
                  missionParams.threatLevel === 'High' ? 'secondary' : 'outline'
                }>
                  {missionParams.threatLevel}
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="font-bold">{missionParams.duration} days</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Ships</span>
                </div>
                <p className="font-bold">{missionParams.selectedShips.length}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">Operational Area</span>
              </div>
              <p className="text-sm">{missionParams.operationalArea}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Weather</span>
              </div>
              <p className="text-sm">{missionParams.weather}</p>
            </div>

            {missionParams.selectedShips.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-medium text-primary mb-2">Selected Vessels</h4>
                <div className="space-y-1">
                  {missionParams.selectedShips.map((ship, index) => (
                    <div key={ship} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      <span>{ship} {index === 0 && '(Primary)'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Display */}
      {recommendation && (
        <div className="space-y-6">
          {/* Mock Data Warning */}
          {recommendation.metadata.generated_as === 'fallback_mock' && (
            <Card className="glass border-warning/50 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                  <div>
                    <h4 className="font-medium text-warning">AI Service Temporarily Unavailable</h4>
                    <p className="text-sm text-muted-foreground">
                      Showing mock recommendations based on standard operational procedures. 
                      Verify with ordnance officer before deployment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mission Analysis */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mission Analysis
                <Badge variant="outline" className="ml-auto">
                  Confidence: {recommendation.metadata.confidence || 75}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-medium mb-2">Complexity Score</h4>
                  <div className="space-y-2">
                    <Progress value={recommendation.mission_analysis.complexity_score} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {recommendation.mission_analysis.complexity_score}/100
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-medium mb-2">Risk Level</h4>
                  <Badge variant={
                    recommendation.mission_analysis.risk_level === 'Critical' ? 'destructive' :
                    recommendation.mission_analysis.risk_level === 'High' ? 'secondary' : 'outline'
                  }>
                    {recommendation.mission_analysis.risk_level}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-medium mb-2">Estimated Consumption</h4>
                  <p className="text-sm">{recommendation.mission_analysis.estimated_consumption}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Recommendations */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Primary Ordnance Recommendations
              </CardTitle>
              <CardDescription>AI-recommended ordnance loadout for mission success</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendation.primary_recommendations.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/50 bg-card/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{item.ordnance_name}</h4>
                        <p className="text-sm text-muted-foreground">{item.justification}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">
                          {item.confidence}% confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Quantity</p>
                        <p className="font-bold text-lg">{item.quantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Ship Distribution</p>
                        <div className="space-y-1">
                          {Object.entries(item.allocation).map(([ship, qty]) => (
                            <div key={ship} className="flex justify-between text-sm">
                              <span>{ship}:</span>
                              <span className="font-medium">{qty.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Backup Recommendations */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Backup Recommendations
              </CardTitle>
              <CardDescription>Alternative ordnance options for contingency planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendation.backup_recommendations.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="font-medium">{item.ordnance_name}</p>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                    <Badge variant="outline">{item.quantity.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Potential Shortages</h4>
                  <div className="space-y-1">
                    {recommendation.risk_assessment.shortages.map((shortage, index) => (
                      <p key={index} className="text-sm text-muted-foreground">• {shortage}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Mitigation Strategies</h4>
                  <div className="space-y-1">
                    {recommendation.risk_assessment.mitigation_strategies.map((strategy, index) => (
                      <p key={index} className="text-sm text-muted-foreground">• {strategy}</p>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Risk Level</span>
                    <Badge variant={
                      recommendation.risk_assessment.overall_risk === 'Critical' ? 'destructive' :
                      recommendation.risk_assessment.overall_risk === 'High' ? 'secondary' : 'outline'
                    }>
                      {recommendation.risk_assessment.overall_risk}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}