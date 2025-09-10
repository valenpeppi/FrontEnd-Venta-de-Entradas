import React, { createContext, useReducer, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../../App';
import axios from 'axios';

interface EventsState {
  featuredTickets: Ticket[];
  approvedTickets: Ticket[];
}

type EventsAction =
  | { type: 'SET_FEATURED_TICKETS'; payload: { tickets: Ticket[] } }
  | { type: 'SET_APPROVED_TICKETS'; payload: { tickets: Ticket[] } }
  | { type: 'UPDATE_AVAILABLE_TICKETS'; payload: { id: string; quantity: number } };

interface EventsContextType {
  featuredTickets: Ticket[];
  approvedTickets: Ticket[];
  updateAvailableTickets: (id: string, quantity: number) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps { children: ReactNode; }

const eventsReducer = (state: EventsState, action: EventsAction): EventsState => {
  switch (action.type) {
    case 'SET_FEATURED_TICKETS':
      return { ...state, featuredTickets: action.payload.tickets };
    case 'SET_APPROVED_TICKETS':
      return { ...state, approvedTickets: action.payload.tickets };
    case 'UPDATE_AVAILABLE_TICKETS': {
      const { id, quantity } = action.payload;
      const updateTickets = (tickets: Ticket[]) =>
        tickets.map(t =>
          t.id === id ? { ...t, availableTickets: t.availableTickets - quantity } : t
        );
      return {
        ...state,
        featuredTickets: updateTickets(state.featuredTickets),
        approvedTickets: updateTickets(state.approvedTickets),
      };
    }
    default: return state;
  }
};

const mapApiEventToTicket = (ev: any): Ticket => {
  let minPrice = ev.minPrice ?? ev.price ?? 0;
  if (!minPrice && ev.eventSectors?.length > 0) {
    minPrice = Math.min(...ev.eventSectors.map((s: any) => parseFloat(s.price)));
  }

  const eventDate = new Date(ev.date);

  return {
    id: String(ev.idEvent ?? ev.id),
    eventId: String(ev.idEvent ?? ev.id),
    eventName: ev.eventName ?? ev.name,
    date: eventDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    time:
      eventDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }) + " hs",
    location: ev.place?.name || ev.placeName || "Sin lugar",
    placeName: ev.place?.name || ev.placeName || "Lugar no especificado",
    price: minPrice,
    availableTickets: ev.availableSeats ?? ev.availableTickets ?? 0,
    type: ev.eventType?.name || ev.type || "General",
    imageUrl: ev.imageUrl || "/ticket.png",
    featured: ev.featured ?? false,
    agotado: ev.agotado ?? false,
  };
};

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventsReducer, { featuredTickets: [], approvedTickets: [] });
  const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    let alive = true;
    const fetchEvents = async () => {
      try {
        const [featuredRes, approvedRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/events/featured`),
          axios.get(`${BASE_URL}/api/events/approved`),
        ]);

        if (alive) {
          const featuredTickets = (featuredRes.data?.data ?? []).map((ev: any) => mapApiEventToTicket(ev));
          dispatch({ type: 'SET_FEATURED_TICKETS', payload: { tickets: featuredTickets } });

          const approvedTickets = (approvedRes.data?.data ?? []).map((ev: any) => mapApiEventToTicket(ev));
          dispatch({ type: 'SET_APPROVED_TICKETS', payload: { tickets: approvedTickets } });
        }
      } catch (err) {
        console.error('EventsContext: error cargando eventos', err);
      }
    };
    fetchEvents();
    return () => { alive = false; };
  }, [BASE_URL]);

  const updateAvailableTickets = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_AVAILABLE_TICKETS', payload: { id, quantity } });

  return (
    <EventsContext.Provider value={{ ...state, updateAvailableTickets }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents debe ser usado dentro de un EventsProvider');
  return ctx;
};
