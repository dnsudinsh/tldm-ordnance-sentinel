import { useState } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  QrCode, 
  Scan, 
  Download, 
  Search,
  Package,
  Camera,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Barcode() {
  const { state } = useInventory();
  const { items, loading } = state;
  const { toast } = useToast();

  const [selectedItem, setSelectedItem] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [scannedCode, setScannedCode] = useState("");

  const generateBarcode = () => {
    if (!selectedItem) {
      toast({
        title: "Selection Required",
        description: "Please select an inventory item to generate a barcode.",
        variant: "destructive",
      });
      return;
    }

    const item = items.find(i => i.inventoryId === selectedItem);
    if (!item) return;

    // Generate a simple barcode representation
    const barcodeData = `${item.inventoryId}-${item.batchNumber}`;
    setGeneratedBarcode(barcodeData);

    toast({
      title: "Barcode Generated",
      description: `Barcode created for ${item.ordnanceName}`,
    });
  };

  const downloadBarcode = () => {
    if (!generatedBarcode) return;

    // Simulate barcode download
    toast({
      title: "Download Started",
      description: "Barcode image download initiated.",
    });
  };

  const simulateScan = () => {
    // Simulate scanning a barcode
    const randomItem = items[Math.floor(Math.random() * items.length)];
    if (randomItem) {
      const simulatedCode = `${randomItem.inventoryId}-${randomItem.batchNumber}`;
      setScannedCode(simulatedCode);
      
      toast({
        title: "Barcode Scanned",
        description: `Found: ${randomItem.ordnanceName}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading barcode system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <QrCode className="h-8 w-8 text-primary" />
          Barcode System
        </h1>
        <p className="text-muted-foreground">
          Generate and scan barcodes for inventory tracking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barcode Generation */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Generate Barcode
            </CardTitle>
            <CardDescription>Create barcodes for inventory items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Inventory Item</label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.inventoryId} value={item.inventoryId}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.ordnanceCategory}
                        </Badge>
                        {item.ordnanceName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                {(() => {
                  const item = items.find(i => i.inventoryId === selectedItem);
                  return item ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item:</span>
                        <span className="text-sm">{item.ordnanceName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">ID:</span>
                        <span className="text-sm font-mono">{item.inventoryId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Batch:</span>
                        <span className="text-sm font-mono">{item.batchNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Location:</span>
                        <span className="text-sm">{item.location || item.unitShip}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <Button 
              onClick={generateBarcode}
              className="w-full"
              disabled={!selectedItem}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Generate Barcode
            </Button>

            {generatedBarcode && (
              <div className="space-y-4">
                <div className="p-6 rounded-lg bg-white border-2 border-dashed border-border text-center">
                  <div className="space-y-4">
                    {/* Simulated Barcode */}
                    <div className="space-y-1">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div 
                          key={i}
                          className="flex justify-center gap-1"
                        >
                          {Array.from({ length: 20 }, (_, j) => (
                            <div
                              key={j}
                              className={`w-1 h-8 ${
                                (i + j) % 3 === 0 ? 'bg-black' : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <p className="font-mono text-sm text-black">{generatedBarcode}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={downloadBarcode} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Barcode Scanner */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Barcode Scanner
            </CardTitle>
            <CardDescription>Scan existing barcodes to locate items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Manual Entry</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter barcode or scan with camera"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">or</p>
              
              <div className="p-8 rounded-lg border-2 border-dashed border-border bg-muted/30">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Camera Scanner</p>
                <Button 
                  onClick={simulateScan}
                  variant={scanMode ? "destructive" : "default"}
                  className="w-full"
                >
                  {scanMode ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera Scan
                    </>
                  )}
                </Button>
              </div>
            </div>

            {scannedCode && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <h4 className="font-medium text-success mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Scan Result
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Scanned Code:</span>
                    <span className="font-mono">{scannedCode}</span>
                  </div>
                  {(() => {
                    const foundItem = items.find(item => 
                      scannedCode.includes(item.inventoryId) || 
                      scannedCode.includes(item.batchNumber)
                    );
                    return foundItem ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Item:</span>
                          <span>{foundItem.ordnanceName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span>{foundItem.location || foundItem.unitShip}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-bold">{foundItem.quantity.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-destructive text-sm">Item not found in inventory</p>
                    );
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan History */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest barcode generation and scanning activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent barcode activity</p>
            <p className="text-sm text-muted-foreground mt-2">Generated and scanned barcodes will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}