import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Rocket,
  Anchor,
  Zap,
  Shield
} from "lucide-react";
import { READINESS_WEIGHTS } from "../types/inventory";

export default function Dashboard() {
  const { state } = useInventory();
  const { readiness, items, loading } = state;

  const getReadinessColor = (percentage: number) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  const getReadinessStatus = (percentage: number) => {
    if (percentage >= 80) return { label: "COMBAT READY", variant: "default" as const, color: "bg-success" };
    if (percentage >= 60) return { label: "CAUTION", variant: "secondary" as const, color: "bg-warning" };
    return { label: "CRITICAL", variant: "destructive" as const, color: "bg-destructive" };
  };

  const totalItems = items.length;
  const activeLocations = new Set([
    ...items.filter(item => item.location).map(item => item.location),
    ...items.filter(item => item.unitShip).map(item => item.unitShip)
  ]).size;

  const categoryStats = [
    { 
      name: "Missile", 
      percentage: readiness.missile, 
      weight: READINESS_WEIGHTS.Missile,
      icon: Rocket,
      color: "text-primary"
    },
    { 
      name: "Torpedo", 
      percentage: readiness.torpedo, 
      weight: READINESS_WEIGHTS.Torpedo,
      icon: Target,
      color: "text-info"
    },
    { 
      name: "Seamine", 
      percentage: readiness.seamine, 
      weight: READINESS_WEIGHTS.Seamine,
      icon: Zap,
      color: "text-warning"
    },
    { 
      name: "Ammunition", 
      percentage: readiness.ammunition, 
      weight: READINESS_WEIGHTS.Ammunition,
      icon: Shield,
      color: "text-success"
    },
    { 
      name: "Pyrotechnic", 
      percentage: readiness.pyrotechnic, 
      weight: READINESS_WEIGHTS.Pyrotechnic,
      icon: Zap,
      color: "text-secondary"
    },
    { 
      name: "Demolition", 
      percentage: readiness.demolition, 
      weight: READINESS_WEIGHTS.Demolition,
      icon: AlertTriangle,
      color: "text-destructive"
    },
  ];

  const status = getReadinessStatus(readiness.overall);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Command Center
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Real-time ordnance readiness and fleet status overview
        </p>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Readiness</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-gradient">
              {readiness.overall.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={status.variant} className={`${status.color} text-white`}>
                {status.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">
              {totalItems.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Items across all categories
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <Anchor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">
              {activeLocations}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Depots and vessels
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-success">
              ONLINE
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Readiness Breakdown */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-display">Ordnance Readiness Analysis</CardTitle>
          <CardDescription>
            Weighted readiness calculation based on strategic importance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categoryStats.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-card/50 border border-border/50`}>
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Weight: {(category.weight * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getReadinessColor(category.percentage)}`}>
                      {category.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{(category.percentage * category.weight).toFixed(1)}pts
                    </p>
                  </div>
                </div>
                <Progress 
                  value={category.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>

          {/* Formula Explanation */}
          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Readiness Formula
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Total = (0.42 × % Missile) + (0.26 × % Torpedo) + (0.16 × % Seamine) + (0.10 × % Ammunition) + (0.06 × % Pyrotechnic) + (0.03 × % Demolition) + (0.03 × % Naval Mines)
            </p>
            <p className="text-xs text-muted-foreground">
              Weights reflect strategic importance and operational priority in naval combat scenarios
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}