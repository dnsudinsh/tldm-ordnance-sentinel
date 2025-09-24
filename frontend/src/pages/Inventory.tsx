import { useState, useMemo } from "react";
import { useInventory } from "../contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Package, 
  MapPin, 
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ORDNANCE_CATEGORIES, CONDITIONS } from "../types/inventory";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { state, deleteInventoryItem } = useInventory();
  const { items, loading } = state;
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Get unique locations for filter
  const locations = useMemo(() => {
    const allLocations = new Set<string>();
    items.forEach(item => {
      if (item.location) allLocations.add(item.location);
      if (item.unitShip) allLocations.add(item.unitShip);
    });
    return Array.from(allLocations).sort();
  }, [items]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.ordnanceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.typeSubType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || item.ordnanceCategory === categoryFilter;
      const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
      
      const itemLocation = item.location || item.unitShip || "";
      const matchesLocation = locationFilter === "all" || itemLocation === locationFilter;

      return matchesSearch && matchesCategory && matchesCondition && matchesLocation;
    });
  }, [items, searchTerm, categoryFilter, conditionFilter, locationFilter]);

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'New':
        return <Badge variant="default" className="bg-success text-white">New</Badge>;
      case 'Serviceable':
        return <Badge variant="secondary">Serviceable</Badge>;
      case 'Damage':
        return <Badge variant="destructive">Damage</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Missile': 'text-primary',
      'Torpedo': 'text-info',
      'Ammunition': 'text-success',
      'Seamine': 'text-warning',
      'Pyrotechnic': 'text-secondary',
      'Demolition': 'text-destructive',
      'Naval Mines': 'text-muted-foreground'
    };
    return colors[category] || 'text-muted-foreground';
  };

  const handleDelete = (inventoryId: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`)) {
      deleteInventoryItem(inventoryId);
      toast({
        title: "Item Deleted",
        description: `${itemName} has been removed from inventory.`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Inventory Management
        </h1>
        <p className="text-muted-foreground">
          Comprehensive ordnance inventory tracking and management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold font-display">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Locations</p>
                <p className="text-2xl font-bold font-display">{locations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold font-display">{ORDNANCE_CATEGORIES.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Filtered</p>
                <p className="text-2xl font-bold font-display">{filteredItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {ORDNANCE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {CONDITIONS.map(condition => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setConditionFilter("all");
                setLocationFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {filteredItems.length} of {items.length} items shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Item Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.inventoryId} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.ordnanceName}</p>
                        <p className="text-sm text-muted-foreground">{item.typeSubType}</p>
                        <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(item.ordnanceCategory)}>
                        {item.ordnanceCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-medium">{item.quantity.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.location || item.unitShip}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getConditionBadge(item.condition)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{item.batchNumber}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(item.inventoryId, item.ordnanceName)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No items found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}