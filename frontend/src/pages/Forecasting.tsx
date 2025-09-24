import React, { useState, useEffect } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  RefreshCw,
  Zap,
  Shield,
  Activity,
  Calendar,
  MapPin,
  Clock,
  Users,
  Gauge,
  Brain,
  BarChart3,
  Download,
  Settings,
  PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ForecastResult {
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
  };
}

interface ScenarioResult {
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

export default function Forecasting() {
  const { state } = useInventory();
  const { loading } = state;
  const { toast } = useToast();

  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [forecastHistory, setForecastHistory] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("90");

  useEffect(() => {
    loadForecastHistory();
  }, []);

  const loadForecastHistory = async () => {
    try {
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/forecasts?limit=10`);
      if (response.ok) {
        const history = await response.json();
        setForecastHistory(history);
      }
    } catch (error) {
      console.error('Failed to load forecast history:', error);
    }
  };

  const generateForecast = async () => {
    setIsGenerating(true);
    
    try {
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/forecasts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          include_scenarios: false,
          custom_config: {
            time_horizon_days: parseInt(selectedTimeframe),
            confidence_level: 0.95,
            risk_tolerance: "conservative"
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setForecast(result);
        
        toast({
          title: "Forecast Generated Successfully",
          description: `AI analysis complete with ${result.confidence_metrics.model_accuracy * 100}% confidence.`,
        });
        
        // Reload history
        loadForecastHistory();
      } else {
        throw new Error('Failed to generate forecast');
      }
    } catch (error) {
      toast({
        title: "Forecast Generation Failed", 
        description: "Unable to generate forecast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateScenarios = async () => {
    if (!forecast) return;
    
    try {
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/forecasts/${forecast.forecast_id}/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forecast_id: forecast.forecast_id,
          scenarios: [
            {
              name: "Increased Exercise Tempo",
              description: "20% increase in exercise frequency and intensity",
              exercise_intensity_multiplier: 1.2,
              additional_events: 2
            },
            {
              name: "Supply Chain Disruption",
              description: "30-day delay in procurement timelines", 
              lead_time_increase_days: 30,
              supplier_reliability_factor: 0.7
            },
            {
              name: "Budget Constraints",
              description: "20% reduction in procurement budget",
              procurement_delay_days: 60,
              quantity_reduction_factor: 0.8
            }
          ]
        }),
      });

      if (response.ok) {
        const scenarioResults = await response.json();
        setScenarios(scenarioResults);
      }
    } catch (error) {
      console.error('Failed to generate scenarios:', error);
    }
  };

  const exportForecastPDF = async () => {
    if (!forecast) return;
    
    try {
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/forecasts/${forecast.forecast_id}/export/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forecast_${forecast.forecast_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "PDF Export Successful",
          description: "Forecast report downloaded successfully.",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "PDF Export Failed",
        description: "Unable to export PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportForecastExcel = async () => {
    if (!forecast) return;
    
    try {
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/forecasts/${forecast.forecast_id}/export/excel`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forecast_${forecast.forecast_id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Excel Export Successful", 
          description: "Forecast data downloaded successfully.",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Excel Export Failed",
        description: "Unable to export Excel file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getReadinessColor = (percentage: number) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning"; 
    return "text-destructive";
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-white';
      case 'high': return 'bg-warning text-white';
      case 'medium': return 'bg-info text-white';
      case 'low': return 'bg-success text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-white';
      case 'high': return 'bg-warning text-white';
      case 'medium': return 'bg-info text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Prepare chart data
  const chartData = forecast ? [
    {
      days: 0,
      readiness: forecast.timeframe.current_readiness,
      lower: forecast.timeframe.current_readiness,
      upper: forecast.timeframe.current_readiness,
    },
    ...forecast.timeframe.projections.map(p => ({
      days: p.days,
      readiness: p.readiness,
      lower: p.confidence_interval[0],
      upper: p.confidence_interval[1],
    }))
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading forecasting system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          Predictive Readiness Forecasting
        </h1>
        <p className="text-muted-foreground">
          AI-powered readiness projections and strategic planning insights
        </p>
      </div>

      {/* Control Panel */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Forecast Control Panel
          </CardTitle>
          <CardDescription>Generate new forecasts and configure analysis parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="timeframe">Forecast Horizon:</Label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">180 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={generateForecast}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </Button>

            {forecast && (
              <>
                <Button variant="outline" onClick={generateScenarios}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Run Scenarios
                </Button>
                
                <Button variant="outline" onClick={exportForecast}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {forecast && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Actions</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Forecast Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Readiness</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-display ${getReadinessColor(forecast.timeframe.current_readiness)}`}>
                    {forecast.timeframe.current_readiness.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Base measurement
                  </p>
                </CardContent>
              </Card>

              <Card className="glass hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">90-Day Projection</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-display ${getReadinessColor(forecast.timeframe.projections[2]?.readiness || 0)}`}>
                    {(forecast.timeframe.projections[2]?.readiness || 0).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    AI prediction
                  </p>
                </CardContent>
              </Card>

              <Card className="glass hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display text-destructive">
                    {forecast.critical_alerts.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Require attention
                  </p>
                </CardContent>
              </Card>

              <Card className="glass hover-lift">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display text-primary">
                    {(forecast.confidence_metrics.model_accuracy * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    AI reliability
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Readiness Timeline Chart */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Readiness Forecast Timeline
                </CardTitle>
                <CardDescription>
                  Projected readiness levels with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="days" 
                        label={{ value: 'Days', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        label={{ value: 'Readiness %', angle: -90, position: 'insideLeft' }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)}%`, 
                          name === 'readiness' ? 'Projected Readiness' : 
                          name === 'lower' ? 'Lower Bound' : 'Upper Bound'
                        ]}
                        labelFormatter={(label) => `Day ${label}`}
                      />
                      <Area 
                        dataKey="upper" 
                        stackId="1" 
                        stroke="none" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.1}
                      />
                      <Area 
                        dataKey="lower" 
                        stackId="1" 
                        stroke="none" 
                        fill="white" 
                        fillOpacity={1}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="readiness" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Confidence Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Model Accuracy</span>
                    <span className="font-bold">{(forecast.confidence_metrics.model_accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={forecast.confidence_metrics.model_accuracy * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Quality</span>
                    <span className="font-bold">{(forecast.confidence_metrics.data_quality_score * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={forecast.confidence_metrics.data_quality_score * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reliability</span>
                    <Badge variant="outline">{forecast.confidence_metrics.forecast_reliability}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Generation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Generated At:</span>
                    <span className="text-sm font-mono">{new Date(forecast.generated_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Method:</span>
                    <Badge variant="outline">
                      {forecast.metadata.generated_as === 'ai_service' ? 'AI-Powered' : 'Rule-Based'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Model:</span>
                    <span className="text-sm font-mono">{forecast.metadata.ai_model || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Quality:</span>
                    <Badge variant="outline">{forecast.metadata.data_quality}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projections Tab */}
          <TabsContent value="projections" className="space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Detailed Projections</CardTitle>
                <CardDescription>Readiness forecasts by timeframe with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast.timeframe.projections.map((projection, index) => (
                    <div key={projection.days} className="p-4 rounded-lg border border-border/50 bg-card/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{projection.days} Days</span>
                          </div>
                          <Badge className={getRiskLevelColor(projection.risk_level)}>
                            {projection.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className={`text-2xl font-bold ${getReadinessColor(projection.readiness)}`}>
                          {projection.readiness.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Confidence Interval</p>
                          <p className="text-sm font-mono">
                            [{projection.confidence_interval[0].toFixed(1)}% - {projection.confidence_interval[1].toFixed(1)}%]
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Change from Current</p>
                          <p className={`text-sm font-medium ${
                            projection.readiness >= forecast.timeframe.current_readiness ? 'text-success' : 'text-destructive'
                          }`}>
                            {projection.readiness >= forecast.timeframe.current_readiness ? '+' : ''}
                            {(projection.readiness - forecast.timeframe.current_readiness).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress value={projection.readiness} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts & Actions Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {/* Critical Alerts */}
            {forecast.critical_alerts.length > 0 && (
              <Card className="glass border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Critical Alerts ({forecast.critical_alerts.length})
                  </CardTitle>
                  <CardDescription>Immediate attention required</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecast.critical_alerts.map((alert, index) => (
                      <div key={index} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-destructive">{alert.category} Shortage Predicted</h4>
                            <p className="text-sm text-muted-foreground">Expected: {alert.expected_shortage_date}</p>
                          </div>
                          <Badge className="bg-destructive text-white">
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Stock</p>
                            <p className="font-bold">{alert.current_stock_level.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Projected Need</p>
                            <p className="font-bold">{alert.projected_need.toLocaleString()}</p>
                          </div>
                        </div>

                        {alert.impacted_operations.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Impacted Operations:</p>
                            <div className="flex flex-wrap gap-1">
                              {alert.impacted_operations.map((op, opIndex) => (
                                <Badge key={opIndex} variant="outline" className="text-xs">
                                  {op}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Procurement Recommendations */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Procurement Recommendations ({forecast.procurement_recommendations.length})
                </CardTitle>
                <CardDescription>AI-recommended procurement actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast.procurement_recommendations.map((rec, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border/50 bg-card/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{rec.category}</h4>
                          <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-bold">{rec.recommended_quantity.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="font-bold">{rec.deadline}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Lead Time</p>
                          <p className="font-bold">{rec.supplier_lead_time} days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mitigation Strategies */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Mitigation Strategies
                </CardTitle>
                <CardDescription>Recommended actions to improve readiness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast.mitigation_strategies.map((strategy, index) => (
                    <div key={index} className="p-4 rounded-lg border border-border/50 bg-card/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{strategy.strategy}</h4>
                          <p className="text-sm text-muted-foreground">{strategy.impact}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Effectiveness</div>
                          <div className="font-bold text-primary">{(strategy.effectiveness * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Implementation Time</p>
                          <p className="text-sm font-medium">{strategy.implementation_time} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Affected Items</p>
                          <div className="flex flex-wrap gap-1">
                            {strategy.items_affected.map((item, itemIndex) => (
                              <Badge key={itemIndex} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Progress value={strategy.effectiveness * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            {scenarios.length === 0 ? (
              <Card className="glass">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <PlayCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Scenarios Generated</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Run scenario analysis to see how different conditions might affect readiness projections.
                  </p>
                  <Button onClick={generateScenarios} variant="outline">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Generate Scenarios
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {scenarios.map((scenario, index) => (
                  <Card key={index} className="glass">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{scenario.scenario_name}</span>
                        <Badge variant={
                          scenario.readiness_impact > 0 ? "default" : 
                          scenario.readiness_impact < -10 ? "destructive" : "secondary"
                        }>
                          {scenario.readiness_impact > 0 ? '+' : ''}{scenario.readiness_impact.toFixed(1)}% Impact
                        </Badge>
                      </CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Base Readiness</p>
                          <p className="text-2xl font-bold text-primary">{scenario.base_readiness.toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Scenario Readiness</p>
                          <p className={`text-2xl font-bold ${getReadinessColor(scenario.scenario_readiness)}`}>
                            {scenario.scenario_readiness.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Net Impact</p>
                          <p className={`text-2xl font-bold ${
                            scenario.readiness_impact >= 0 ? 'text-success' : 'text-destructive'
                          }`}>
                            {scenario.readiness_impact > 0 ? '+' : ''}{scenario.readiness_impact.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Critical Alerts:</span>
                          <span className="font-medium">{scenario.risk_assessment?.critical_alerts || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>High Priority Actions:</span>
                          <span className="font-medium">{scenario.risk_assessment?.high_priority_recommendations || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!forecast && (
        <Card className="glass border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Forecast Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Generate your first AI-powered readiness forecast to see projections, alerts, and recommendations.
            </p>
            <Button onClick={generateForecast} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating First Forecast...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate First Forecast
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}