import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Radar, 
  Scan, 
  MapPin, 
  MoveRight, 
  AlertTriangle, 
  CheckCircle2,
  Activity,
  Clock,
  Users,
  Package,
  Radio,
  Shield,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  Zap,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RFIDMockService } from "../services/rfidMockService";
import { 
  RFIDTag, RFIDScanResult, InventoryDiscrepancy, LocationTransfer, 
  RFIDAlert, MovementHistory, AuditReport 
} from "../types/rfid";

export default function SmartOrdnanceTracking() {
  const { toast } = useToast();
  const rfidService = RFIDMockService.getInstance();

  // State management
  const [activeTab, setActiveTab] = useState("scanner");
  const [scanResults, setScanResults] = useState<RFIDScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [scannerOperator, setScannerOperator] = useState("");
  const [discrepancies, setDiscrepancies] = useState<InventoryDiscrepancy[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<RFIDAlert[]>([]);
  const [transfers, setTransfers] = useState<LocationTransfer[]>([]);
  const [movementHistory, setMovementHistory] = useState<MovementHistory[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [transferLocation, setTransferLocation] = useState("");
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);

  // Data from service
  const locations = rfidService.getLocations();
  const personnel = rfidService.getPersonnel();
  const allTags = rfidService.getAllTags();
  const inventory = rfidService.getAllInventory();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoScanEnabled && selectedLocation && scannerOperator) {
      interval = setInterval(() => {
        performAutoScan();
      }, 10000); // Auto-scan every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScanEnabled, selectedLocation, scannerOperator]);

  const loadInitialData = () => {
    setActiveAlerts(rfidService.getActiveAlerts());
    setTransfers(rfidService.getTransfers());
    setMovementHistory(rfidService.getMovementHistory().slice(0, 20));
  };

  // RFID Scanner Simulator
  const simulateRFIDScan = async () => {
    if (!selectedLocation || !scannerOperator) {
      toast({
        title: "Missing Information",
        description: "Please select location and enter operator name.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const results = rfidService.simulateRFIDScan(selectedLocation, scannerOperator);
      setScanResults(results);
      
      toast({
        title: "RFID Scan Complete",
        description: `Scanned ${results.length} items at ${selectedLocation}`,
      });

      // Perform quick count automatically
      const discrepanciesFound = rfidService.performQuickCount(results);
      setDiscrepancies(discrepanciesFound);
      
      if (discrepanciesFound.length > 0) {
        toast({
          title: "Discrepancies Detected",
          description: `Found ${discrepanciesFound.length} inventory discrepancies`,
          variant: "destructive"
        });
      }

      // Refresh alerts
      setActiveAlerts(rfidService.getActiveAlerts());
      
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to complete RFID scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const performAutoScan = async () => {
    try {
      const results = rfidService.simulateRFIDScan(selectedLocation, scannerOperator + " (Auto)");
      setScanResults(prev => [...results, ...prev].slice(0, 50)); // Keep last 50 scans
      
      const discrepanciesFound = rfidService.performQuickCount(results);
      if (discrepanciesFound.length > 0) {
        setDiscrepancies(prev => [...discrepanciesFound, ...prev]);
      }
      
      setActiveAlerts(rfidService.getActiveAlerts());
    } catch (error) {
      console.error("Auto-scan failed:", error);
    }
  };

  // Transfer System
  const initiateTransfer = () => {
    if (selectedTags.length === 0 || !transferLocation || transferQuantity <= 0) {
      toast({
        title: "Invalid Transfer",
        description: "Please select tags, location, and quantity.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newTransfers = selectedTags.map(tagId => {
        return rfidService.initiateTransfer(tagId, transferLocation, transferQuantity, scannerOperator);
      });

      setTransfers(prev => [...newTransfers, ...prev]);
      setSelectedTags([]);
      setTransferLocation("");
      setTransferQuantity(0);

      toast({
        title: "Transfer Initiated",
        description: `${selectedTags.length} item(s) transfer started to ${transferLocation}`,
      });

      // Refresh movement history
      setMovementHistory(rfidService.getMovementHistory().slice(0, 20));
      
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Transfer initiation failed",
        variant: "destructive"
      });
    }
  };

  const completeTransfer = (transferId: string) => {
    try {
      const completedTransfer = rfidService.completeTransfer(transferId);
      
      setTransfers(prev => 
        prev.map(t => t.transferId === transferId ? completedTransfer : t)
      );

      toast({
        title: "Transfer Completed",
        description: `${completedTransfer.ordnanceName} successfully moved to ${completedTransfer.toLocation}`,
      });

    } catch (error) {
      toast({
        title: "Transfer Completion Failed",
        description: error instanceof Error ? error.message : "Failed to complete transfer",
        variant: "destructive"
      });
    }
  };

  // Audit Reports
  const generateReport = (reportType: 'movement_history' | 'frequent_movers' | 'location_audit') => {
    const dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    };

    try {
      const report = rfidService.generateAuditReport(reportType, dateRange, selectedLocation);
      setAuditReports(prev => [report, ...prev].slice(0, 10)); // Keep last 10 reports

      toast({
        title: "Report Generated",
        description: report.summary,
      });

    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate audit report",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'in_transit': return 'bg-info text-white';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Radar className="h-8 w-8 text-primary animate-pulse" />
          Smart Ordnance Tracking
        </h1>
        <p className="text-muted-foreground">
          RFID-powered inventory management and real-time asset tracking for TLDM operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active RFID Tags</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-success">
              {allTags.filter(tag => tag.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {allTags.length} total tags
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-destructive">
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
            <MoveRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-warning">
              {transfers.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {transfers.length} total transfers
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display text-info">
              {discrepancies.filter(d => d.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending resolution
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scanner">RFID Scanner</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="tracking">Location Tracking</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Audit Reports</TabsTrigger>
        </TabsList>

        {/* RFID Scanner Tab */}
        <TabsContent value="scanner" className="space-y-6">
          {/* Scanner Control Panel */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                RFID Scanner Control
              </CardTitle>
              <CardDescription>
                Configure and operate RFID scanning operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Scan Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator">Scanner Operator</Label>
                  <Select value={scannerOperator} onValueChange={setScannerOperator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator..." />
                    </SelectTrigger>
                    <SelectContent>
                      {personnel.map(person => (
                        <SelectItem key={person} value={person}>{person}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Button 
                    onClick={simulateRFIDScan} 
                    disabled={isScanning || !selectedLocation || !scannerOperator}
                    className="flex-1"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Radar className="h-4 w-4 mr-2" />
                        Start Scan
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t">
                <Switch 
                  id="auto-scan" 
                  checked={autoScanEnabled}
                  onCheckedChange={setAutoScanEnabled}
                  disabled={!selectedLocation || !scannerOperator}
                />
                <Label htmlFor="auto-scan" className="text-sm">
                  Enable Auto-Scan (10s interval)
                </Label>
                {autoScanEnabled && (
                  <Badge variant="outline" className="ml-2">
                    <Activity className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scan Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Scan Results
                  </span>
                  {scanResults.length > 0 && (
                    <Badge variant="outline">{scanResults.length} items</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scanResults.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {scanResults.map((scan, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-card/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{scan.ordnanceName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {scan.ordnanceType} • {scan.location}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {scan.quantity} units
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Tag: {scan.tagId}</span>
                          <span>{scan.scannedAt.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scan results yet</p>
                    <p className="text-sm">Start an RFID scan to see results here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventory Discrepancies */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Inventory Discrepancies
                  </span>
                  {discrepancies.length > 0 && (
                    <Badge variant="destructive">{discrepancies.length} issues</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {discrepancies.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {discrepancies.map((disc, index) => (
                      <div key={index} className="p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-destructive">{disc.ordnanceName}</h4>
                            <p className="text-sm text-muted-foreground">{disc.location}</p>
                          </div>
                          <Badge className="bg-destructive text-white">
                            {disc.discrepancyType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Expected:</span> {disc.expectedQuantity}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Scanned:</span> {disc.scannedQuantity}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Difference: {disc.difference > 0 ? '+' : ''}{disc.difference}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                    <p>No discrepancies found</p>
                    <p className="text-sm">All scanned items match inventory records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfer Control */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MoveRight className="h-5 w-5" />
                  Initiate Transfer
                </CardTitle>
                <CardDescription>
                  Transfer selected items to a new location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Items from Scan Results</Label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                    {scanResults.length > 0 ? (
                      scanResults.map((scan, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            id={`tag-${scan.tagId}`}
                            checked={selectedTags.includes(scan.tagId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags([...selectedTags, scan.tagId]);
                              } else {
                                setSelectedTags(selectedTags.filter(id => id !== scan.tagId));
                              }
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`tag-${scan.tagId}`} className="text-sm flex-1">
                            {scan.ordnanceName} ({scan.quantity} units)
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Perform an RFID scan first to select items for transfer
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transfer-location">Destination</Label>
                    <Select value={transferLocation} onValueChange={setTransferLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location..." />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transfer-quantity">Quantity</Label>
                    <Input
                      id="transfer-quantity"
                      type="number"
                      value={transferQuantity}
                      onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 0)}
                      min="1"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <Button 
                  onClick={initiateTransfer}
                  disabled={selectedTags.length === 0 || !transferLocation || transferQuantity <= 0}
                  className="w-full"
                >
                  <MoveRight className="h-4 w-4 mr-2" />
                  Initiate Transfer
                </Button>
              </CardContent>
            </Card>

            {/* Active Transfers */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Active Transfers
                  </span>
                  {transfers.length > 0 && (
                    <Badge variant="outline">{transfers.length} transfers</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transfers.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {transfers.slice(0, 10).map((transfer) => (
                      <div key={transfer.transferId} className="p-3 border rounded-lg bg-card/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{transfer.ordnanceName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {transfer.fromLocation} → {transfer.toLocation}
                            </p>
                          </div>
                          <Badge className={getStatusColor(transfer.status)}>
                            {transfer.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {transfer.quantity} units • {transfer.initiatedBy}
                          </span>
                          {transfer.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => completeTransfer(transfer.transferId)}
                              className="h-7 text-xs"
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MoveRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active transfers</p>
                    <p className="text-sm">Transfer history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Location Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Movement History */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Recent Movements
                </CardTitle>
                <CardDescription>
                  Track item location changes and movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {movementHistory.map((movement) => (
                    <div key={movement.movementId} className="p-3 border rounded-lg bg-card/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">Tag: {movement.tagId}</h4>
                          <p className="text-sm text-muted-foreground">
                            {movement.fromLocation} → {movement.toLocation}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {movement.reason}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By: {movement.movedBy}</span>
                        <span>{movement.movedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tag Location Status */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Tag Locations
                </CardTitle>
                <CardDescription>
                  Current location status of RFID tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allTags.slice(0, 10).map((tag) => (
                    <div key={tag.tagId} className="p-3 border rounded-lg bg-card/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{tag.ordnanceName}</h4>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {tag.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={tag.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {tag.status}
                          </Badge>
                          {tag.batteryLevel && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Battery: {tag.batteryLevel}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tag: {tag.tagId}</span>
                        <span>Last: {tag.lastScanned.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Alerts
                </span>
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive">{activeAlerts.length} active</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time anomaly detection and security alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeAlerts.length > 0 ? (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.alertId} className="p-4 border rounded-lg bg-card/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {alert.alertType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{alert.ordnanceName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {alert.location}
                          </p>
                          <p className="text-sm">{alert.description}</p>
                        </div>
                        <Badge 
                          variant={alert.status === 'active' ? 'destructive' : 'secondary'}
                          className="ml-4"
                        >
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                        <span>Tag: {alert.tagId}</span>
                        <span>Detected: {alert.detectedAt.toLocaleString()}</span>
                      </div>
                      {alert.assignedTo && (
                        <div className="text-xs text-muted-foreground">
                          Assigned to: {alert.assignedTo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems are operating normally</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Reports
                </CardTitle>
                <CardDescription>
                  Create audit and analysis reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => generateReport('movement_history')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Movement History Report
                  </Button>
                  <Button
                    onClick={() => generateReport('frequent_movers')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Frequent Movers Analysis
                  </Button>
                  <Button
                    onClick={() => generateReport('location_audit')}
                    variant="outline"
                    className="justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Location Audit Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Generated Reports
                  </span>
                  {auditReports.length > 0 && (
                    <Badge variant="outline">{auditReports.length} reports</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditReports.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {auditReports.map((report) => (
                      <div key={report.reportId} className="p-3 border rounded-lg bg-card/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">
                              {report.reportType.replace('_', ' ').toUpperCase()}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {report.summary}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {report.flaggedItems} flagged
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{report.totalItems} items analyzed</span>
                          <span>{report.generatedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reports generated</p>
                    <p className="text-sm">Generate your first audit report</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}