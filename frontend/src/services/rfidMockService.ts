/**
 * RFID Mock Service for Smart Ordnance Tracking
 * Simulates RFID hardware and data operations
 */

import { 
  RFIDTag, InventoryItem, RFIDScanResult, LocationTransfer, 
  MovementHistory, RFIDAlert, InventoryDiscrepancy, ScanSession,
  AuditReport, RFIDSystemConfig 
} from '../types/rfid';

export class RFIDMockService {
  private static instance: RFIDMockService;
  private mockInventory: InventoryItem[] = [];
  private mockTags: RFIDTag[] = [];
  private scanHistory: RFIDScanResult[] = [];
  private movementHistory: MovementHistory[] = [];
  private alerts: RFIDAlert[] = [];
  private transfers: LocationTransfer[] = [];
  private activeSessions: ScanSession[] = [];

  // TLDM Naval Ordnance Categories
  private ordnanceTypes = [
    { type: 'Missile', items: ['EXOCET MM40', 'ASPIDE Missile', 'Sea Wolf Missile'] },
    { type: 'Torpedo', items: ['A244S Torpedo', 'MK46 Torpedo', 'Black Shark Torpedo'] },
    { type: 'Naval Gun', items: ['RDS 76MM', 'RDS 40MM', 'RDS 30MM'] },
    { type: 'Ammunition', items: ['RDS 5.56MM', 'RDS 7.62MM', 'RDS 12.7MM'] },
    { type: 'Mine', items: ['Manta Mine', 'Sea Mine Type A', 'Influence Mine'] },
    { type: 'Pyrotechnic', items: ['Signal Flares', 'Smoke Markers', 'Emergency Flares'] },
    { type: 'Demolition', items: ['C4 Explosive', 'TNT Blocks', 'Shaped Charges'] }
  ];

  // TLDM Naval Bases and Storage Locations
  private locations = [
    'WNAED Lumut', 'KD Sultan Idris', 'Lumut Naval Base', 'Tanjung Pengelih', 
    'Kuantan Naval Base', 'Kota Kinabalu Naval Base', 'Labuan Naval Base',
    'Storage Bunker A1', 'Storage Bunker B2', 'Missile Storage C3', 'Torpedo Bay D4',
    'Forward Operating Base 1', 'Forward Operating Base 2', 'Emergency Cache Alpha'
  ];

  private personnel = [
    'CPO Ahmad Hassan', 'PO Lim Wei Ming', 'AB Siti Nurhaliza', 'LT Raj Kumar',
    'CDR Mohd Azlan', 'CPO Zhang Wei', 'PO Fatimah Zahra', 'AB Ravi Shankar'
  ];

  constructor() {
    this.initializeMockData();
  }

  static getInstance(): RFIDMockService {
    if (!RFIDMockService.instance) {
      RFIDMockService.instance = new RFIDMockService();
    }
    return RFIDMockService.instance;
  }

  private initializeMockData() {
    // Generate mock inventory and RFID tags
    let tagCounter = 1000;
    let itemCounter = 1;

    this.ordnanceTypes.forEach(category => {
      category.items.forEach(itemName => {
        const locations = this.getRandomItems(this.locations, Math.floor(Math.random() * 3) + 1);
        
        locations.forEach(location => {
          const quantity = Math.floor(Math.random() * 500) + 10;
          const tagId = `RFID-${tagCounter++}`;
          const itemId = `ORD-${itemCounter++}`;

          // Create inventory item
          const inventoryItem: InventoryItem = {
            id: itemId,
            ordnanceName: itemName,
            ordnanceType: category.type,
            quantity,
            location,
            rfidTagId: tagId,
            lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            condition: this.getRandomItem(['serviceable', 'serviceable', 'serviceable', 'unserviceable', 'maintenance']),
            securityLevel: this.getRandomItem(['restricted', 'confidential', 'secret'])
          };

          // Create RFID tag
          const rfidTag: RFIDTag = {
            tagId,
            ordnanceId: itemId,
            ordnanceName: itemName,
            ordnanceType: category.type,
            quantity,
            location,
            lastScanned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
            status: this.getRandomItem(['active', 'active', 'active', 'inactive'])
          };

          this.mockInventory.push(inventoryItem);
          this.mockTags.push(rfidTag);
        });
      });
    });

    // Generate some movement history
    this.generateMockMovementHistory();
    
    // Generate some alerts
    this.generateMockAlerts();
  }

  private generateMockMovementHistory() {
    const numberOfMovements = 50;
    
    for (let i = 0; i < numberOfMovements; i++) {
      const tag = this.getRandomItem(this.mockTags);
      const fromLocation = tag.location;
      const toLocation = this.getRandomItem(this.locations.filter(loc => loc !== fromLocation));
      
      const movement: MovementHistory = {
        movementId: `MOV-${Date.now()}-${i}`,
        tagId: tag.tagId,
        ordnanceId: tag.ordnanceId,
        fromLocation,
        toLocation,
        movedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        movedBy: this.getRandomItem(this.personnel),
        reason: this.getRandomItem([
          'Scheduled Transfer', 'Emergency Resupply', 'Maintenance Required', 
          'Exercise Preparation', 'Storage Optimization', 'Security Relocation'
        ]),
        authorization: `AUTH-${Math.floor(Math.random() * 9999)}`
      };

      this.movementHistory.push(movement);
    }
  }

  private generateMockAlerts() {
    const alertTypes = [
      'Large quantity movement detected',
      'After-hours scan activity',
      'Unauthorized location access',
      'Missing RFID tag signal',
      'Inventory discrepancy detected',
      'Battery level critical',
      'Suspicious movement pattern'
    ];

    for (let i = 0; i < 15; i++) {
      const tag = this.getRandomItem(this.mockTags);
      
      const alert: RFIDAlert = {
        alertId: `ALT-${Date.now()}-${i}`,
        alertType: this.getRandomItem(['anomaly', 'security', 'maintenance', 'discrepancy']),
        severity: this.getRandomItem(['low', 'medium', 'high', 'critical']),
        tagId: tag.tagId,
        ordnanceId: tag.ordnanceId,
        ordnanceName: tag.ordnanceName,
        location: tag.location,
        description: this.getRandomItem(alertTypes),
        detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        status: this.getRandomItem(['active', 'investigating', 'resolved']),
        assignedTo: this.getRandomItem(this.personnel)
      };

      this.alerts.push(alert);
    }
  }

  // RFID Scanner Simulator
  simulateRFIDScan(location: string, scannedBy: string): RFIDScanResult[] {
    const locationTags = this.mockTags.filter(tag => 
      tag.location === location && tag.status === 'active'
    );
    
    const scansToSimulate = Math.min(locationTags.length, Math.floor(Math.random() * 10) + 1);
    const selectedTags = this.getRandomItems(locationTags, scansToSimulate);
    
    const scanResults: RFIDScanResult[] = selectedTags.map((tag, index) => {
      // Simulate some variance in scanned quantities
      const scannedQuantity = Math.random() > 0.9 ? 
        tag.quantity + Math.floor(Math.random() * 10) - 5 : tag.quantity;

      const scanResult: RFIDScanResult = {
        scanId: `SCAN-${Date.now()}-${index}`,
        tagId: tag.tagId,
        ordnanceId: tag.ordnanceId,
        ordnanceName: tag.ordnanceName,
        ordnanceType: tag.ordnanceType,
        quantity: Math.max(0, scannedQuantity),
        location: tag.location,
        scannedAt: new Date(),
        scannedBy,
        scannerDevice: `RFID-Scanner-${Math.floor(Math.random() * 5) + 1}`,
        coordinates: {
          lat: 4.2105 + (Math.random() - 0.5) * 0.1, // Near Lumut, Malaysia
          lng: 100.6197 + (Math.random() - 0.5) * 0.1
        }
      };

      // Update tag last scanned time
      tag.lastScanned = new Date();
      this.scanHistory.push(scanResult);
      
      return scanResult;
    });

    // Check for anomalies
    this.checkForAnomalies(scanResults, location, scannedBy);
    
    return scanResults;
  }

  // Inventory Quick Count
  performQuickCount(scanResults: RFIDScanResult[]): InventoryDiscrepancy[] {
    const discrepancies: InventoryDiscrepancy[] = [];

    scanResults.forEach(scan => {
      const inventoryItem = this.mockInventory.find(item => 
        item.rfidTagId === scan.tagId
      );

      if (inventoryItem) {
        let discrepancyType: 'overage' | 'shortage' | 'location_mismatch' | 'missing_tag' = 'shortage';
        
        if (scan.quantity > inventoryItem.quantity) {
          discrepancyType = 'overage';
        } else if (scan.quantity < inventoryItem.quantity) {
          discrepancyType = 'shortage';
        } else if (scan.location !== inventoryItem.location) {
          discrepancyType = 'location_mismatch';
        }

        if (discrepancyType === 'location_mismatch' || Math.abs(scan.quantity - inventoryItem.quantity) > 0) {
          const discrepancy: InventoryDiscrepancy = {
            discrepancyId: `DISC-${Date.now()}-${scan.tagId}`,
            tagId: scan.tagId,
            ordnanceId: scan.ordnanceId,
            ordnanceName: scan.ordnanceName,
            location: scan.location,
            expectedQuantity: inventoryItem.quantity,
            scannedQuantity: scan.quantity,
            difference: scan.quantity - inventoryItem.quantity,
            discrepancyType,
            detectedAt: new Date(),
            status: 'pending'
          };

          discrepancies.push(discrepancy);
        }
      } else {
        // Tag not found in inventory
        const discrepancy: InventoryDiscrepancy = {
          discrepancyId: `DISC-${Date.now()}-${scan.tagId}`,
          tagId: scan.tagId,
          ordnanceId: scan.ordnanceId,
          ordnanceName: scan.ordnanceName,
          location: scan.location,
          expectedQuantity: 0,
          scannedQuantity: scan.quantity,
          difference: scan.quantity,
          discrepancyType: 'missing_tag',
          detectedAt: new Date(),
          status: 'pending'
        };

        discrepancies.push(discrepancy);
      }
    });

    return discrepancies;
  }

  // RFID-based Transfer System
  initiateTransfer(tagId: string, toLocation: string, quantity: number, initiatedBy: string): LocationTransfer {
    const tag = this.mockTags.find(t => t.tagId === tagId);
    
    if (!tag) {
      throw new Error(`RFID tag ${tagId} not found`);
    }

    const transfer: LocationTransfer = {
      transferId: `TXF-${Date.now()}-${tagId}`,
      tagId,
      ordnanceId: tag.ordnanceId,
      ordnanceName: tag.ordnanceName,
      quantity,
      fromLocation: tag.location,
      toLocation,
      initiatedBy,
      transferDate: new Date(),
      status: 'pending'
    };

    this.transfers.push(transfer);
    
    // Create movement history record
    const movement: MovementHistory = {
      movementId: `MOV-${Date.now()}-${tagId}`,
      tagId,
      ordnanceId: tag.ordnanceId,
      fromLocation: tag.location,
      toLocation,
      movedAt: new Date(),
      movedBy: initiatedBy,
      reason: 'RFID Transfer Request',
      authorization: transfer.transferId
    };

    this.movementHistory.push(movement);
    
    return transfer;
  }

  completeTransfer(transferId: string): LocationTransfer {
    const transfer = this.transfers.find(t => t.transferId === transferId);
    
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found`);
    }

    transfer.status = 'completed';
    transfer.completedDate = new Date();

    // Update tag and inventory locations
    const tag = this.mockTags.find(t => t.tagId === transfer.tagId);
    const inventoryItem = this.mockInventory.find(i => i.rfidTagId === transfer.tagId);

    if (tag) {
      tag.location = transfer.toLocation;
      tag.quantity = transfer.quantity;
    }

    if (inventoryItem) {
      inventoryItem.location = transfer.toLocation;
      inventoryItem.quantity = transfer.quantity;
      inventoryItem.lastUpdated = new Date();
    }

    return transfer;
  }

  // Location Tracking & Auditing
  getMovementHistory(tagId?: string, location?: string, dateRange?: { start: Date; end: Date }): MovementHistory[] {
    let filtered = [...this.movementHistory];

    if (tagId) {
      filtered = filtered.filter(m => m.tagId === tagId);
    }

    if (location) {
      filtered = filtered.filter(m => m.fromLocation === location || m.toLocation === location);
    }

    if (dateRange) {
      filtered = filtered.filter(m => 
        m.movedAt >= dateRange.start && m.movedAt <= dateRange.end
      );
    }

    return filtered.sort((a, b) => b.movedAt.getTime() - a.movedAt.getTime());
  }

  generateAuditReport(
    reportType: 'movement_history' | 'frequent_movers' | 'location_audit' | 'discrepancy_summary',
    dateRange: { start: Date; end: Date },
    location?: string
  ): AuditReport {
    const reportId = `RPT-${Date.now()}-${reportType}`;
    let data: any;
    let totalItems = 0;
    let flaggedItems = 0;
    let summary = '';

    switch (reportType) {
      case 'movement_history':
        data = this.getMovementHistory(undefined, location, dateRange);
        totalItems = data.length;
        flaggedItems = data.filter((m: MovementHistory) => 
          m.reason.includes('Emergency') || m.reason.includes('Security')
        ).length;
        summary = `${totalItems} movements recorded, ${flaggedItems} flagged as priority movements`;
        break;

      case 'frequent_movers':
        const movementCounts = this.movementHistory
          .filter(m => m.movedAt >= dateRange.start && m.movedAt <= dateRange.end)
          .reduce((acc, movement) => {
            acc[movement.tagId] = (acc[movement.tagId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        
        data = Object.entries(movementCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20)
          .map(([tagId, count]) => {
            const tag = this.mockTags.find(t => t.tagId === tagId);
            return { tagId, ordnanceName: tag?.ordnanceName, movementCount: count };
          });
        
        totalItems = Object.keys(movementCounts).length;
        flaggedItems = data.filter((item: any) => item.movementCount > 5).length;
        summary = `${totalItems} items moved, ${flaggedItems} items with high movement frequency`;
        break;

      case 'location_audit':
        const locationItems = location ? 
          this.mockInventory.filter(item => item.location === location) :
          this.mockInventory;
        
        data = locationItems.map(item => ({
          ...item,
          lastMovement: this.movementHistory
            .filter(m => m.tagId === item.rfidTagId)
            .sort((a, b) => b.movedAt.getTime() - a.movedAt.getTime())[0]
        }));
        
        totalItems = data.length;
        flaggedItems = data.filter((item: any) => 
          item.condition !== 'serviceable' || !item.lastMovement
        ).length;
        summary = `${totalItems} items audited, ${flaggedItems} items require attention`;
        break;

      default:
        data = [];
        summary = 'Report type not implemented';
    }

    return {
      reportId,
      generatedAt: new Date(),
      reportType,
      dateRange,
      location,
      data,
      totalItems,
      flaggedItems,
      summary
    };
  }

  // Anomaly Detection & Alert System
  private checkForAnomalies(scanResults: RFIDScanResult[], location: string, scannedBy: string) {
    scanResults.forEach(scan => {
      // Check for after-hours scanning
      const hour = scan.scannedAt.getHours();
      if (hour < 6 || hour > 22) {
        this.createAlert({
          alertType: 'security',
          severity: 'medium',
          tagId: scan.tagId,
          ordnanceId: scan.ordnanceId,
          ordnanceName: scan.ordnanceName,
          location: scan.location,
          description: `After-hours scan detected at ${scan.scannedAt.toLocaleTimeString()}`,
          detectedAt: new Date(),
          status: 'active'
        });
      }

      // Check for large quantity movements
      const tag = this.mockTags.find(t => t.tagId === scan.tagId);
      if (tag && Math.abs(scan.quantity - tag.quantity) > 50) {
        this.createAlert({
          alertType: 'anomaly',
          severity: 'high',
          tagId: scan.tagId,
          ordnanceId: scan.ordnanceId,
          ordnanceName: scan.ordnanceName,
          location: scan.location,
          description: `Large quantity variance detected: Expected ${tag.quantity}, Scanned ${scan.quantity}`,
          detectedAt: new Date(),
          status: 'active'
        });
      }

      // Check for unauthorized locations
      const unauthorizedZones = ['Civilian Area', 'Restricted Zone Alpha', 'Maintenance Bay 7'];
      if (unauthorizedZones.includes(location)) {
        this.createAlert({
          alertType: 'security',
          severity: 'critical',
          tagId: scan.tagId,
          ordnanceId: scan.ordnanceId,
          ordnanceName: scan.ordnanceName,
          location: scan.location,
          description: `Unauthorized location access detected: ${location}`,
          detectedAt: new Date(),
          status: 'active'
        });
      }
    });
  }

  private createAlert(alertData: Partial<RFIDAlert>) {
    const alert: RFIDAlert = {
      alertId: `ALT-${Date.now()}-${alertData.tagId}`,
      ...alertData
    } as RFIDAlert;

    this.alerts.push(alert);
  }

  // Getters
  getActiveAlerts(): RFIDAlert[] {
    return this.alerts.filter(alert => alert.status === 'active');
  }

  getAllTags(): RFIDTag[] {
    return [...this.mockTags];
  }

  getAllInventory(): InventoryItem[] {
    return [...this.mockInventory];
  }

  getLocations(): string[] {
    return [...this.locations];
  }

  getPersonnel(): string[] {
    return [...this.personnel];
  }

  getTransfers(): LocationTransfer[] {
    return [...this.transfers];
  }

  getScanHistory(): RFIDScanResult[] {
    return [...this.scanHistory];
  }

  // Utility methods
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }
}