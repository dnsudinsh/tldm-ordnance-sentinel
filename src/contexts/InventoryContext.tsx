import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { InventoryItem, TransferRequest, ReadinessMetrics, READINESS_WEIGHTS, TARGET_QUANTITIES } from '../types/inventory';
import { generateSampleData } from '../data/sampleData';

interface InventoryState {
  items: InventoryItem[];
  transfers: TransferRequest[];
  readiness: ReadinessMetrics;
  loading: boolean;
}

type InventoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: InventoryItem[] }
  | { type: 'ADD_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_TRANSFER'; payload: TransferRequest }
  | { type: 'UPDATE_TRANSFER'; payload: TransferRequest }
  | { type: 'UPDATE_READINESS'; payload: ReadinessMetrics };

const initialState: InventoryState = {
  items: [],
  transfers: [],
  readiness: {
    missile: 0,
    torpedo: 0,
    seamine: 0,
    ammunition: 0,
    pyrotechnic: 0,
    demolition: 0,
    navalMines: 0,
    overall: 0,
  },
  loading: true,
};

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.inventoryId === action.payload.inventoryId ? action.payload : item
        ),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.inventoryId !== action.payload),
      };
    case 'ADD_TRANSFER':
      return { ...state, transfers: [...state.transfers, action.payload] };
    case 'UPDATE_TRANSFER':
      return {
        ...state,
        transfers: state.transfers.map(transfer =>
          transfer.id === action.payload.id ? action.payload : transfer
        ),
      };
    case 'UPDATE_READINESS':
      return { ...state, readiness: action.payload };
    default:
      return state;
  }
}

const InventoryContext = createContext<{
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  calculateReadiness: () => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  addTransfer: (transfer: TransferRequest) => void;
  updateTransfer: (transfer: TransferRequest) => void;
} | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Calculate readiness metrics based on current inventory
  const calculateReadiness = () => {
    const categoryCounts: Record<string, number> = {};
    
    // Count items by category
    state.items.forEach(item => {
      const category = item.ordnanceCategory.toLowerCase().replace(' ', '');
      categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
    });

    // Calculate percentages against targets
    const missile = Math.min((categoryCounts.missile || 0) / TARGET_QUANTITIES.Missile * 100, 100);
    const torpedo = Math.min((categoryCounts.torpedo || 0) / TARGET_QUANTITIES.Torpedo * 100, 100);
    const seamine = Math.min((categoryCounts.seamine || 0) / TARGET_QUANTITIES.Seamine * 100, 100);
    const ammunition = Math.min((categoryCounts.ammunition || 0) / TARGET_QUANTITIES.Ammunition * 100, 100);
    const pyrotechnic = Math.min((categoryCounts.pyrotechnic || 0) / TARGET_QUANTITIES.Pyrotechnic * 100, 100);
    const demolition = Math.min((categoryCounts.demolition || 0) / TARGET_QUANTITIES.Demolition * 100, 100);
    const navalMines = Math.min((categoryCounts.navalmines || 0) / TARGET_QUANTITIES['Naval Mines'] * 100, 100);

    // Calculate weighted overall readiness
    const overall = 
      (READINESS_WEIGHTS.Missile * missile) +
      (READINESS_WEIGHTS.Torpedo * torpedo) +
      (READINESS_WEIGHTS.Seamine * seamine) +
      (READINESS_WEIGHTS.Ammunition * ammunition) +
      (READINESS_WEIGHTS.Pyrotechnic * pyrotechnic) +
      (READINESS_WEIGHTS.Demolition * demolition) +
      (READINESS_WEIGHTS['Naval Mines'] * navalMines);

    dispatch({
      type: 'UPDATE_READINESS',
      payload: {
        missile,
        torpedo,
        seamine,
        ammunition,
        pyrotechnic,
        demolition,
        navalMines,
        overall,
      },
    });
  };

  const addInventoryItem = (item: InventoryItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    // Save to localStorage
    const updatedItems = [...state.items, item];
    localStorage.setItem('bits_inventory', JSON.stringify(updatedItems));
  };

  const updateInventoryItem = (item: InventoryItem) => {
    dispatch({ type: 'UPDATE_ITEM', payload: item });
    // Save to localStorage
    const updatedItems = state.items.map(i => 
      i.inventoryId === item.inventoryId ? item : i
    );
    localStorage.setItem('bits_inventory', JSON.stringify(updatedItems));
  };

  const deleteInventoryItem = (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
    // Save to localStorage
    const updatedItems = state.items.filter(item => item.inventoryId !== id);
    localStorage.setItem('bits_inventory', JSON.stringify(updatedItems));
  };

  const addTransfer = (transfer: TransferRequest) => {
    dispatch({ type: 'ADD_TRANSFER', payload: transfer });
    // Save to localStorage
    const updatedTransfers = [...state.transfers, transfer];
    localStorage.setItem('bits_transfers', JSON.stringify(updatedTransfers));
  };

  const updateTransfer = (transfer: TransferRequest) => {
    dispatch({ type: 'UPDATE_TRANSFER', payload: transfer });
    // Save to localStorage
    const updatedTransfers = state.transfers.map(t => 
      t.id === transfer.id ? transfer : t
    );
    localStorage.setItem('bits_transfers', JSON.stringify(updatedTransfers));
  };

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from localStorage first
        const savedItems = localStorage.getItem('bits_inventory');
        const savedTransfers = localStorage.getItem('bits_transfers');

        if (savedItems) {
          const items = JSON.parse(savedItems);
          dispatch({ type: 'SET_ITEMS', payload: items });
        } else {
          // Generate and save sample data
          const sampleData = generateSampleData();
          dispatch({ type: 'SET_ITEMS', payload: sampleData });
          localStorage.setItem('bits_inventory', JSON.stringify(sampleData));
        }

        if (savedTransfers) {
          const transfers = JSON.parse(savedTransfers);
          // Set transfers in state (we'll add this action if needed)
        }

        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error loading inventory data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Recalculate readiness when items change
  useEffect(() => {
    if (!state.loading) {
      calculateReadiness();
    }
  }, [state.items, state.loading]);

  return (
    <InventoryContext.Provider
      value={{
        state,
        dispatch,
        calculateReadiness,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addTransfer,
        updateTransfer,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}