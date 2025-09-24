import { useMemo } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { ORDNANCE_CATEGORIES } from "../types/inventory";

export default function Reports() {
  const { state } = useInventory();
  const { items, readiness, loading } = state;

  // Calculate various statistics
  const stats = useMemo(() => {
    const categoryCounts = ORDNANCE_CATEGORIES.reduce((acc, category) => {
      acc[category] = items.filter(item => item.ordnanceCategory === category).length;
      return acc;
    }, {} as Record<string, number>);

    const conditionCounts = {
      New: items.filter(item => item.condition === 'New').length,
      Serviceable: items.filter(item => item.condition === 'Serviceable').length,
      Damage: items.filter(item => item.condition === 'Damage').length,
    };

    const locationCounts = items.reduce((acc, item) => {
      const location = item.location || item.unitShip || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const expiringItems = items.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const warningDate = new Date();
      warningDate.setFullYear(warningDate.getFullYear() + 1);
      return expiryDate <= warningDate;
    });

    const totalValue = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      categoryCounts,
      conditionCounts,
      locationCounts,
      expiringItems,
      totalValue,
      totalItems: items.length,
      uniqueLocations: Object.keys(locationCounts).length,
    };
  }, [items]);

  const reports = [
    {
      title: "Inventory Summary Report",
      description: "Complete overview of all ordnance items",
      icon: FileText,
      color: "text-primary",
      data: `${stats.totalItems} items across ${stats.uniqueLocations} locations`
    },
    {
      title: "Readiness Assessment",
      description: "Combat readiness analysis and metrics",
      icon: TrendingUp,
      color: "text-success",
      data: `${readiness.overall.toFixed(1)}% overall readiness`
    },
    {
      title: "Expiry Alert Report",
      description: "Items approaching expiration dates",
      icon: AlertTriangle,
      color: "text-warning",
      data: `${stats.expiringItems.length} items expiring within 1 year`
    },
    {
      title: "Location Distribution",
      description: "Inventory distribution across facilities",
      icon: BarChart3,
      color: "text-info",
      data: `${stats.uniqueLocations} active locations`
    },
    {
      title: "Category Analysis",
      description: "Breakdown by ordnance categories",
      icon: PieChart,
      color: "text-secondary",
      data: `${ORDNANCE_CATEGORIES.length} categories tracked`
    },
    {
      title: "Transfer Activity Log",
      description: "Historical transfer operations",
      icon: Activity,
      color: "text-muted-foreground",
      data: "Recent transfers and movements"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">
          Comprehensive analysis and reporting for TLDM inventory management
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold font-display">{stats.totalItems.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Readiness</p>
                <p className="text-2xl font-bold font-display text-gradient">{readiness.overall.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold font-display">{stats.expiringItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold font-display">{stats.uniqueLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Generate detailed reports for analysis and compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report, index) => (
              <div key={index} className="p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-card/50 border border-border/50 ${report.color}`}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{report.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
                    <p className="text-xs font-medium text-foreground">{report.data}</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      <Download className="h-3 w-3 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Distribution
            </CardTitle>
            <CardDescription>Items by ordnance category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ORDNANCE_CATEGORIES.map(category => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{stats.categoryCounts[category] || 0}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({((stats.categoryCounts[category] || 0) / stats.totalItems * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Condition Analysis */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Condition Analysis
            </CardTitle>
            <CardDescription>Items by condition status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm">New</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats.conditionCounts.New}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(stats.conditionCounts.New / stats.totalItems * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-sm">Serviceable</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats.conditionCounts.Serviceable}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(stats.conditionCounts.Serviceable / stats.totalItems * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-sm">Damage</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{stats.conditionCounts.Damage}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(stats.conditionCounts.Damage / stats.totalItems * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {stats.expiringItems.length > 0 && (
                <div className="mt-6 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="font-medium text-warning mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Expiry Alerts
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {stats.expiringItems.length} items are approaching their expiry dates within the next year.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
          <CardDescription>Download reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}