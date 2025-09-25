// Tipos unificados para la aplicación de venta de entradas

export interface Sector {
  idEvent: number;
  idSector: number;
  name: string;
  price: number;
  availableTickets: number;
  selected?: number;
  enumerated?: boolean;
}

export interface EventSummary {
  id: number;
  eventName: string;
  imageUrl: string;
  type: string;
  date: string;
  description?: string;
  placeType: string;
  placeName: string;
  availableTickets: number;
  agotado: boolean;
  price?: number;
}

export interface Seat {
  id: number;
  label?: string;
  state: 'available' | 'occupied' | 'selected';
}

export interface CartItem {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  location: string;
  placeName: string;
  sectorName: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
  type: string;
  featured: boolean;
  time: string;
  quantity: number;
  seats?: (string | number)[];
}

export interface EventDetailState {
  summary: EventSummary | null;
  sectors: Sector[];
  loading: boolean;
  generalQuantity: number;
  selectedSector: number | null;
  seats: Seat[];
  selectedSeatsMap: Record<number, number[]>;
}

export interface EventDetailActions {
  setSummary: (summary: EventSummary | null) => void;
  setSectors: (sectors: Sector[]) => void;
  setLoading: (loading: boolean) => void;
  setGeneralQuantity: (quantity: number) => void;
  setSelectedSector: (sectorId: number | null) => void;
  setSeats: (seats: Seat[]) => void;
  setSelectedSeatsMap: (map: Record<number, number[]>) => void;
  handleSectorQuantityChange: (sectorId: number, newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
  handleSeatsChange: (sectorId: number, seatsSel: number[]) => void;
  handleGeneralQuantityChange: (newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
}

export interface EventDetailContextType extends EventDetailState, EventDetailActions {}

// Tipos para componentes específicos
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

