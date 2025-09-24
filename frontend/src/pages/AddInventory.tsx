import { useState } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Package, 
  MapPin, 
  Calendar,
  Hash,
  Factory,
  Target
} from "lucide-react";
import { 
  ORDNANCE_CATEGORIES, 
  NAVAL_CALIBERS, 
  BULLET_TYPES, 
  DEPOT_LOCATIONS, 
  NAVAL_SHIPS, 
  CONDITIONS, 
  MANUFACTURERS,
  InventoryItem 
} from "../types/inventory";

export default function AddInventory() {
  const { addInventoryItem } = useInventory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ordnanceCategory: "",
    ordnanceName: "",
    typeSubType: "",
    caliber: "",
    bulletType: "",
    manufacturer: "",
    quantity: "",
    locationType: "depot", // depot or ship
    location: "",
    unitShip: "",
    condition: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateInventoryId = () => {
    const prefix = formData.ordnanceCategory.slice(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}-${prefix}`;
  };

  const validateForm = () => {
    const required = [
      'ordnanceCategory',
      'ordnanceName',
      'typeSubType',
      'manufacturer',
      'quantity',
      'condition',
      'batchNumber',
      'manufactureDate',
      'expiryDate'
    ];

    for (const field of required) {
      if (!formData[field]) {
        toast({
          title: "Validation Error",
          description: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (formData.locationType === "depot" && !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please select a depot location.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.locationType === "ship" && !formData.unitShip) {
      toast({
        title: "Validation Error",
        description: "Please select a ship/unit.",
        variant: "destructive",
      });
      return false;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid quantity greater than 0.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      const newItem: InventoryItem = {
        inventoryId: generateInventoryId(),
        ordnanceCategory: formData.ordnanceCategory as any,
        ordnanceName: formData.ordnanceName,
        typeSubType: formData.typeSubType,
        caliber: formData.caliber,
        bulletType: formData.bulletType,
        manufacturer: formData.manufacturer,
        quantity: parseInt(formData.quantity),
        location: formData.locationType === "depot" ? formData.location : undefined,
        unitShip: formData.locationType === "ship" ? formData.unitShip : undefined,
        condition: formData.condition as any,
        batchNumber: formData.batchNumber,
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        notes: formData.notes
      };

      addInventoryItem(newItem);

      toast({
        title: "Item Added Successfully",
        description: `${newItem.ordnanceName} has been added to inventory.`,
      });

      // Reset form
      setFormData({
        ordnanceCategory: "",
        ordnanceName: "",
        typeSubType: "",
        caliber: "",
        bulletType: "",
        manufacturer: "",
        quantity: "",
        locationType: "depot",
        location: "",
        unitShip: "",
        condition: "",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        notes: ""
      });

      // Navigate to inventory page
      navigate("/inventory");

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Plus className="h-8 w-8 text-primary" />
          Add Inventory Item
        </h1>
        <p className="text-muted-foreground">
          Register new ordnance items into the TLDM inventory system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Information
              </CardTitle>
              <CardDescription>Basic details about the ordnance item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ordnanceCategory">Ordnance Category *</Label>
                <Select value={formData.ordnanceCategory} onValueChange={(value) => handleInputChange('ordnanceCategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDNANCE_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ordnanceName">Ordnance Name *</Label>
                <Input
                  id="ordnanceName"
                  value={formData.ordnanceName}
                  onChange={(e) => handleInputChange('ordnanceName', e.target.value)}
                  placeholder="e.g., EXOCET MM40 Block 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeSubType">Type/Sub-Type *</Label>
                <Input
                  id="typeSubType"
                  value={formData.typeSubType}
                  onChange={(e) => handleInputChange('typeSubType', e.target.value)}
                  placeholder="e.g., Anti-Ship Missile"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caliber">Caliber</Label>
                  <Select value={formData.caliber} onValueChange={(value) => handleInputChange('caliber', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select caliber" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A</SelectItem>
                      {NAVAL_CALIBERS.map(caliber => (
                        <SelectItem key={caliber} value={caliber}>{caliber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulletType">Bullet Type</Label>
                  <Select value={formData.bulletType} onValueChange={(value) => handleInputChange('bulletType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BULLET_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Select value={formData.manufacturer} onValueChange={(value) => handleInputChange('manufacturer', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUFACTURERS.map(manufacturer => (
                      <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Details */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Inventory Details
              </CardTitle>
              <CardDescription>Quantity, location, and condition information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label>Location Type *</Label>
                <Select value={formData.locationType} onValueChange={(value) => handleInputChange('locationType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="depot">Depot</SelectItem>
                    <SelectItem value="ship">Ship/Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.locationType === "depot" ? (
                <div className="space-y-2">
                  <Label htmlFor="location">Depot Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select depot" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPOT_LOCATIONS.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="unitShip">Ship/Unit *</Label>
                  <Select value={formData.unitShip} onValueChange={(value) => handleInputChange('unitShip', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ship/unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {NAVAL_SHIPS.map(ship => (
                        <SelectItem key={ship} value={ship}>{ship}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  placeholder="e.g., EX-2024-001"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dates and Notes */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates & Additional Information
            </CardTitle>
            <CardDescription>Manufacturing dates and additional notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufactureDate">Manufacture Date *</Label>
                <Input
                  id="manufactureDate"
                  type="date"
                  value={formData.manufactureDate}
                  onChange={(e) => handleInputChange('manufactureDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or special instructions..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Item...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Inventory
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}