import React, { createContext, useReducer, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../../App';
import axios from 'axios';

interface EventsState { allTickets: Ticket[]; }

type EventsAction =
  | { type: 'SET_TICKETS'; payload: { tickets: Ticket[] } }
  | { type: 'UPDATE_TICKET'; payload: { ticket: Ticket } }
  | { type: 'ADD_TICKET'; payload: { ticket: Ticket } }
  | { type: 'REMOVE_TICKET'; payload: { id: string } }
  | { type: 'UPDATE_AVAILABLE_TICKETS'; payload: { id: string; quantity: number } };

interface EventsContextType {
  allTickets: Ticket[];
  setAllTickets: (tickets: Ticket[]) => void;
  updateTicket: (ticket: Ticket) => void;
  addTicket: (ticket: Ticket) => void;
  removeTicket: (id: string) => void;
  updateAvailableTickets: (id: string, quantity: number) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps { children: ReactNode; }

const eventsReducer = (state: EventsState, action: EventsAction): EventsState => {
  switch (action.type) {
    case 'SET_TICKETS': return { ...state, allTickets: action.payload.tickets };
    case 'UPDATE_TICKET': {
      const { ticket } = action.payload;
      return { ...state, allTickets: state.allTickets.map(t => t.id === ticket.id ? ticket : t) };
    }
    case 'ADD_TICKET': return { ...state, allTickets: [...state.allTickets, action.payload.ticket] };
    case 'REMOVE_TICKET': return { ...state, allTickets: state.allTickets.filter(t => t.id !== action.payload.id) };
    case 'UPDATE_AVAILABLE_TICKETS': {
      const { id, quantity } = action.payload;
      return {
        ...state,
        allTickets: state.allTickets.map(t =>
          t.id === id ? { ...t, availableTickets: t.availableTickets - quantity } : t
        )
      };
    }
    default: return state;
  }
};

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventsReducer, { allTickets: [] });
  const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/events/featured`);
        console.log('EventsContext: /featured =>', res.data);
        const events = (res.data?.data ?? []) as Array<any>;

        const tickets: Ticket[] = events.map(ev => {
          // calcular precio mínimo de todos los sectores
          let minPrice = 0;
          if (ev.eventSectors?.length > 0) {
            const allPrices = ev.eventSectors.flatMap((s: any) => s.prices.map((p: any) => p.price));
            if (allPrices.length) {
              minPrice = Math.min(...allPrices);
            }
          }

          return {
            id: String(ev.idEvent),
            eventName: ev.name,
            date: new Date(ev.date).toISOString().slice(0, 10),
            time: new Date(ev.date).toTimeString().slice(0, 5) + ' hs',
            location: ev.place?.name || 'Sin lugar',
            price: minPrice,
            availableTickets: ev.availableSeats ?? 0,            
            type: ev.eventType?.name || 'General',
            imageUrl: ev.image ? `${BASE_URL}${ev.image}` : '/ticket.png',
          };
        });

        if (alive) {
          dispatch({ type: 'SET_TICKETS', payload: { tickets } });
          console.log('EventsContext: tickets seteados =>', tickets);
        }
      } catch (err) {
        console.error('EventsContext: error cargando /featured', err);
      }
    })();
    return () => { alive = false; };
  }, [BASE_URL]);

  const setAllTickets = (tickets: Ticket[]) => dispatch({ type: 'SET_TICKETS', payload: { tickets } });
  const updateTicket = (ticket: Ticket) => dispatch({ type: 'UPDATE_TICKET', payload: { ticket } });
  const addTicket = (ticket: Ticket) => dispatch({ type: 'ADD_TICKET', payload: { ticket } });
  const removeTicket = (id: string) => dispatch({ type: 'REMOVE_TICKET', payload: { id } });
  const updateAvailableTickets = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_AVAILABLE_TICKETS', payload: { id, quantity } });

  return (
    <EventsContext.Provider value={{
      allTickets: state.allTickets, setAllTickets, updateTicket, addTicket, removeTicket, updateAvailableTickets
    }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents debe ser usado dentro de un EventsProvider');
  return ctx;
};
