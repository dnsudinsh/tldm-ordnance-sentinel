// Core Types for TLDM BITS Application

export interface InventoryItem {
  inventoryId: string;
  ordnanceCategory: OrdnanceCategory;
  ordnanceName: string;
  typeSubType: string;
  caliber: string;
  bulletType: string;
  manufacturer: string;
  quantity: number;
  location?: string; // For depots
  unitShip?: string; // For ships/units
  condition: Condition;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  notes: string;
}

export interface TransferRequest {
  id: string;
  fromLocation: string;
  toLocation: string;
  items: {
    inventoryId: string;
    quantity: number;
  }[];
  status: TransferStatus;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface ReadinessMetrics {
  missile: number;
  torpedo: number;
  seamine: number;
  ammunition: number;
  pyrotechnic: number;
  demolition: number;
  navalMines: number;
  overall: number;
}

// Enums and Constants
export type OrdnanceCategory = 
  | 'Ammunition' 
  | 'Missile' 
  | 'Torpedo' 
  | 'Seamine' 
  | 'Pyrotechnic' 
  | 'Demolition' 
  | 'Naval Mines';

export type Condition = 'New' | 'Serviceable' | 'Damage';
export type TransferStatus = 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';

export const ORDNANCE_CATEGORIES: OrdnanceCategory[] = [
  'Ammunition',
  'Missile', 
  'Torpedo',
  'Seamine',
  'Pyrotechnic',
  'Demolition',
  'Naval Mines'
];

export const NAVAL_CALIBERS = [
  '5.56mm', '7.62mm', '9mm', '.45 ACP', '.308 Win', '12.7mm',
  '20mm', '25mm', '30mm', '40mm', '57mm', '76mm', '127mm'
];

export const BULLET_TYPES = [
  'Full Metal Jacket (FMJ)',
  'Armor-Piercing (AP)',
  'Tracer',
  'Hollow Point',
  'Ball',
  'Match',
  'High Explosive (HE)',
  'APFSDS'
];

export const DEPOT_LOCATIONS = [
  'Armada Barat - WNAED',
  'Armada Timur - ENAED',
  'Mawilla 1 - East Coast'
];

export const NAVAL_SHIPS = [
  'KD Tunku Abdul Rahman',
  'KD Tun Abdul Razak',
  'KD Maharaja Lela',
  'KD Jebat',
  'KD Lekiu',
  'KD Kasturi',
  'KD Lekir',
  'KD Laksamana Hang Nadim',
  'KD Kedah',
  'KD Keris',
  'KD Mahamiru',
  'KD Sri Indera Sakti'
];

export const CONDITIONS: Condition[] = ['New', 'Serviceable', 'Damage'];

export const MANUFACTURERS = [
  'Lockheed Martin',
  'RTX Corporation',
  'Northrop Grumman',
  'Boeing',
  'General Dynamics',
  'BAE Systems',
  'Rostec',
  'NORINCO',
  'CASIC',
  'KTRV',
  'Roketsan',
  'MKE',
  'Pakistan Ordnance Factories (POF)',
  'Global Industrial Defence Solutions (GIDS)',
  'Denel Dynamics',
  'Rheinmetall Denel Munition (RDM)'
];

// Readiness calculation weights
export const READINESS_WEIGHTS: Record<OrdnanceCategory, number> = {
  'Missile': 0.42,
  'Torpedo': 0.26,
  'Seamine': 0.16,
  'Ammunition': 0.10,
  'Pyrotechnic': 0.06,
  'Demolition': 0.03,
  'Naval Mines': 0.03
};

// Target quantities for readiness calculation (example values)
export const TARGET_QUANTITIES: Record<OrdnanceCategory, number> = {
  'Missile': 100,
  'Torpedo': 80,
  'Seamine': 60,
  'Ammunition': 10000,
  'Pyrotechnic': 500,
  'Demolition': 200,
  'Naval Mines': 40
};