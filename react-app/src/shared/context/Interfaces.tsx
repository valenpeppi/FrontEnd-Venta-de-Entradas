// Sectores del estadio con precio
export interface EventSector {
  idSector: number;
  name: string;
  price: number;
  enumerated: boolean;
  availableTickets: number;
}



// Evento (detalle completo)
export interface Event {
  idEvent: number;
  name: string;
  description: string;
  date: string;
  image?: string;
  type: string;
  placeName: string;
  sectors: EventSector[];
}

// Asientos
export interface Seat {
  id: number;
  label?: string;
}

// Ticket (listado en home o carrito)
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

// Carrito
export interface CartItem extends Ticket {
  quantity: number;
}

export interface CartState {
  cartItems: CartItem[];
}

// Contexto de eventos
export interface EventsState {
  featuredTickets: Ticket[];
  approvedTickets: Ticket[];
}

export interface EventsContextType {
  featuredTickets: Ticket[];
  approvedTickets: Ticket[];
  updateAvailableTickets: (id: string, quantity: number) => void;
}

// Auth
export interface User {
  name: string;
  role: string | null;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

// Search
export interface SearchState {
  searchQuery: string;
}
