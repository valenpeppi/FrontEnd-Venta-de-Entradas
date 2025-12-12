 
export * from '@/types/events';
export * from '@/types/cart';

 
 
import type { EventSummary, Sector, Seat } from '@/types/events';

export interface EventInfoProps {
  summary: EventSummary;
}

export interface SectorListProps {
  sectors: Sector[];
  onQuantityChange: (sectorId: number, quantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
  onSelectSeatsClick: (sectorId: number) => void;
  setAppMessage?: (message: string, type: 'success' | 'error') => void;
}


export interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: number[];
  onChange: (selectedSeats: number[]) => void;
  setAppMessage?: (message: string, type: 'success' | 'error') => void;
  sectorName?: string;
  enumerated?: boolean;
  columns?: number;
}
