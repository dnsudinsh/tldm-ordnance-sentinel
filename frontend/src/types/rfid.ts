/**
 * RFID System Types and Interfaces for TLDM BITS
 * Smart Ordnance Tracking System
 */

export interface RFIDTag {
  tagId: string;
  ordnanceId: string;
  ordnanceName: string;
  ordnanceType: string;
  quantity: number;
  location: string;
  lastScanned: Date;
  batteryLevel?: number;
  status: 'active' | 'inactive' | 'damaged' | 'missing';
}

export interface InventoryItem {
  id: string;
  ordnanceName: string;
  ordnanceType: string;
  quantity: number;
  location: string;
  rfidTagId?: string;
  lastUpdated: Date;
  condition: 'serviceable' | 'unserviceable' | 'maintenance';
  securityLevel: 'restricted' | 'confidential' | 'secret';
}

export interface RFIDScanResult {
  scanId: string;
  tagId: string;
  ordnanceId: string;
  ordnanceName: string;
  ordnanceType: string;
  quantity: number;
  location: string;
  scannedAt: Date;
  scannedBy: string;
  scannerDevice: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface LocationTransfer {
  transferId: string;
  tagId: string;
  ordnanceId: string;
  ordnanceName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  initiatedBy: string;
  authorizedBy?: string;
  transferDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MovementHistory {
  movementId: string;
  tagId: string;
  ordnanceId: string;
  fromLocation: string;
  toLocation: string;
  movedAt: Date;
  movedBy: string;
  reason: string;
  authorization?: string;
}

export interface RFIDAlert {
  alertId: string;
  alertType: 'anomaly' | 'security' | 'maintenance' | 'discrepancy' | 'unauthorized';
  severity: 'low' | 'medium' | 'high' | 'critical';
  tagId: string;
  ordnanceId: string;
  ordnanceName: string;
  location: string;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  notes?: string;
}

export interface InventoryDiscrepancy {
  discrepancyId: string;
  tagId: string;
  ordnanceId: string;
  ordnanceName: string;
  location: string;
  expectedQuantity: number;
  scannedQuantity: number;
  difference: number;
  discrepancyType: 'overage' | 'shortage' | 'location_mismatch' | 'missing_tag';
  detectedAt: Date;
  status: 'pending' | 'investigating' | 'resolved';
}

export interface RFIDSystemConfig {
  scanRange: number; // meters
  alertThresholds: {
    largeMovement: number; // quantity threshold
    afterHours: { start: string; end: string }; // time range
    unauthorizedZones: string[]; // location IDs
  };
  autoScanInterval: number; // milliseconds for simulation
  requiredAuthorizations: string[]; // transfer approval levels
}

export interface ScanSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  scannedBy: string;
  location: string;
  scans: RFIDScanResult[];
  discrepancies: InventoryDiscrepancy[];
  status: 'active' | 'completed' | 'aborted';
}

export interface AuditReport {
  reportId: string;
  generatedAt: Date;
  reportType: 'movement_history' | 'frequent_movers' | 'location_audit' | 'discrepancy_summary';
  dateRange: {
    start: Date;
    end: Date;
  };
  location?: string;
  data: any; // Flexible data structure for different report types
  totalItems: number;
  flaggedItems: number;
  summary: string;
}