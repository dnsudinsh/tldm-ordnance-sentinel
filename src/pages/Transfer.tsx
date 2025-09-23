import { useState } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowRightLeft, 
  MapPin, 
  Package, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { DEPOT_LOCATIONS, NAVAL_SHIPS } from "../types/inventory";
import { useToast } from "@/hooks/use-toast";

export default function Transfer() {
  const { state } = useInventory();
  const { items, loading } = state;
  const { toast } = useToast();

  const [sourceLocation, setSourceLocation] = useState("");
  const [destinationType, setDestinationType] = useState("depot");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Get items available at source location
  const availableItems = items.filter(item => {
    const itemLocation = item.location || item.unitShip;
    return itemLocation === sourceLocation && item.quantity > 0;
  });

  const allLocations = [
    ...DEPOT_LOCATIONS,
    ...NAVAL_SHIPS
  ];

  const destinationOptions = destinationType === "depot" ? DEPOT_LOCATIONS : NAVAL_SHIPS;

  const handleTransfer = () => {
    if (!sourceLocation || !destinationLocation || selectedItems.length === 0) {
      toast({
        title: "Transfer Error",
        description: "Please select source, destination, and items to transfer.",
        variant: "destructive",
      });
      return;
    }

    if (sourceLocation === destinationLocation) {
      toast({
        title: "Transfer Error",
        description: "Source and destination cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    // Simulate transfer
    toast({
      title: "Transfer Initiated",
      description: `Transfer of ${selectedItems.length} item(s) from ${sourceLocation} to ${destinationLocation} has been initiated.`,
    });

    // Reset form
    setSourceLocation("");
    setDestinationLocation("");
    setSelectedItems([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading transfer system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
          Transfer Items
        </h1>
        <p className="text-muted-foreground">
          Transfer ordnance between depots and naval vessels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Setup */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Transfer Configuration
            </CardTitle>
            <CardDescription>Select source and destination locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Location</label>
              <Select value={sourceLocation} onValueChange={setSourceLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source location" />
                </SelectTrigger>
                <SelectContent>
                  {allLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Type</label>
              <Select value={destinationType} onValueChange={setDestinationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="depot">Depot</SelectItem>
                  <SelectItem value="ship">Ship/Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinationOptions
                    .filter(loc => loc !== sourceLocation)
                    .map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {sourceLocation && destinationLocation && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Transfer Route:</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{sourceLocation}</span>
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  <MapPin className="h-4 w-4" />
                  <span>{destinationLocation}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Items */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Available Items
              {sourceLocation && (
                <Badge variant="outline" className="ml-2">
                  {availableItems.length} items
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {sourceLocation ? `Items available at ${sourceLocation}` : "Select a source location to view items"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sourceLocation ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a source location to view available items</p>
              </div>
            ) : availableItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items available at this location</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableItems.map(item => (
                  <div 
                    key={item.inventoryId}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedItems.includes(item.inventoryId) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedItems(prev => 
                        prev.includes(item.inventoryId)
                          ? prev.filter(id => id !== item.inventoryId)
                          : [...prev, item.inventoryId]
                      );
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.ordnanceName}</p>
                        <p className="text-xs text-muted-foreground">{item.typeSubType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium text-sm">{item.quantity.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.ordnanceCategory}
                        </Badge>
                      </div>
                    </div>
                    {selectedItems.includes(item.inventoryId) && (
                      <div className="mt-2 p-2 rounded bg-primary/10 border border-primary/20">
                        <p className="text-xs text-primary font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Selected for transfer (full quantity: {item.quantity.toLocaleString()})
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transfer Summary */}
      {selectedItems.length > 0 && (
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-5 w-5" />
              Transfer Summary
            </CardTitle>
            <CardDescription>Review transfer details before confirmation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Items Selected</p>
                <p className="text-2xl font-bold font-display text-primary">{selectedItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium">{sourceLocation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium">{destinationLocation}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertCircle className="h-4 w-4 text-warning" />
              <p className="text-sm text-warning">
                Note: Full quantity transfers only. Partial transfers are not permitted.
              </p>
            </div>

            <Button 
              onClick={handleTransfer}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Initiate Transfer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Transfers */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transfers
          </CardTitle>
          <CardDescription>Latest transfer operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent transfers to display</p>
            <p className="text-sm text-muted-foreground mt-2">Transfer history will appear here once operations are completed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}