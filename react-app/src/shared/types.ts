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
  placeType: string;
  placeName: string;
  availableTickets: number;
  agotado: boolean;
  price?: number;
}

export interface Seat {
  id: number;
  label?: string;
}

export interface CartItem {
  ticket: {
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
  };
  quantity: number;
}

export interface EventDetailState {
  summary: EventSummary | null;
  sectors: Sector[];
  loading: boolean;
  generalQuantity: number;
  selectedSector: number | null;
  seats: Seat[];
  selectedSeatsMap: Record<number, number[]>;
  zoom: number;
}

export interface EventDetailActions {
  setSummary: (summary: EventSummary | null) => void;
  setSectors: (sectors: Sector[]) => void;
  setLoading: (loading: boolean) => void;
  setGeneralQuantity: (quantity: number) => void;
  setSelectedSector: (sectorId: number | null) => void;
  setSeats: (seats: Seat[]) => void;
  setSelectedSeatsMap: (map: Record<number, number[]>) => void;
  setZoom: (zoom: number) => void;
  handleSectorQuantityChange: (sectorId: number, newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
  handleSeatsChange: (sectorId: number, seatsSel: number[]) => void;
  handleGeneralQuantityChange: (newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export interface EventDetailContextType extends EventDetailState, EventDetailActions {}

// Tipos para componentes específicos
export interface EventInfoProps {
  summary: EventSummary;
}

export interface SectorListProps {
  sectors: Sector[];
  selectedSector: number | null;
  onQuantityChange: (sectorId: number, quantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
  onSeatsChange: (sectorId: number, seats: number[]) => void;
  selectedSeatsMap: Record<number, number[]>;
  seats: Seat[];
  setAppMessage?: (message: string, type: 'success' | 'error') => void;
}

export interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: number[];
  onChange: (selectedSeats: number[]) => void;
}

export interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  minZoom: number;
  maxZoom: number;
}
