
// Sectores del estadio
export interface SectorLite {
  idSector: number;
  name: string;
  enumerated?: boolean; 
}

// Asientos
export interface Seat {
  id: number;
  label?: string; 
}

export interface CartItem {
  ticketId: number;
  quantity: number;
  sector: SectorLite;
  price: number;
}

export interface Event {
  idEvent: number;
  name: string;
  description: string;
  date: string;
  image?: string;
  placeName: string;
  sectors: SectorLite[];
}

interface SearchState {
  searchQuery: string;
}

interface EventsState {
  featuredTickets: Ticket[];
  approvedTickets: Ticket[];
}

interface EventsContextType {
  featuredTickets: Ticket[];
  approvedTickets: Ticket[];
  updateAvailableTickets: (id: string, quantity: number) => void;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  location: string;
  placeName: string;
  sectorName?: string; 
  price: number;
  availableTickets: number;
  imageUrl: string;
  time: string;
  type: string;
  featured: boolean;
  agotado?: boolean;
}

export interface CartItem extends Ticket {
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
}

export interface User {
  name: string;
  role: string | null;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}
