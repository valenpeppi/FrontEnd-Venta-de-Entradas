import { createContext, useReducer, useEffect, useContext } from 'react';
import type { Ticket } from '@/types/cart';
import { EventService } from '@/services/EventService';
import { mapApiEventToTicket } from '@/shared/adapters/eventAdapter';

interface EventsState {
  featuredEvents: Ticket[];
  approvedEvents: Ticket[];
}

type EventsAction =
  | { type: 'SET_FEATURED_EVENTS'; payload: { events: Ticket[] } }
  | { type: 'SET_APPROVED_EVENTS'; payload: { events: Ticket[] } }
  | { type: 'UPDATE_AVAILABLE_TICKETS'; payload: { id: string; quantity: number } };

interface EventsContextType {
  featuredEvents: Ticket[];
  approvedEvents: Ticket[];
  updateAvailableTickets: (id: string, quantity: number) => void;
}

import type { EventsProviderProps } from '@/types/events';

export const EventsContext = createContext<EventsContextType | undefined>(undefined);

const eventsReducer = (state: EventsState, action: EventsAction): EventsState => {
  switch (action.type) {
    case 'SET_FEATURED_EVENTS':
      return { ...state, featuredEvents: action.payload.events };
    case 'SET_APPROVED_EVENTS':
      return { ...state, approvedEvents: action.payload.events };
    case 'UPDATE_AVAILABLE_TICKETS': {
      const { id, quantity } = action.payload;
      const updateTickets = (tickets: Ticket[]) =>
        tickets.map(t =>
          t.id === id ? { ...t, availableTickets: t.availableTickets - quantity } : t
        );
      return {
        ...state,
        featuredEvents: updateTickets(state.featuredEvents),
        approvedEvents: updateTickets(state.approvedEvents),
      };
    }
    default: return state;
  }
};

function EventsProvider({ children }: EventsProviderProps) {
  const [state, dispatch] = useReducer(eventsReducer, { featuredEvents: [], approvedEvents: [] });

  useEffect(() => {
    let alive = true;
    const fetchEvents = async () => {
      try {
        const [featuredRes, approvedRes] = await Promise.all([
          EventService.getFeatured(),
          EventService.getApproved(),
        ]);

        if (alive) {
          const featured = (featuredRes ?? []).map(mapApiEventToTicket);
          dispatch({ type: 'SET_FEATURED_EVENTS', payload: { events: featured } });

          const approved = (approvedRes ?? []).map(mapApiEventToTicket);
          dispatch({ type: 'SET_APPROVED_EVENTS', payload: { events: approved } });
        }
      } catch (err) {
        console.error('EventsContext: error cargando eventos', err);
      }
    };
    fetchEvents();
    return () => { alive = false; };
  }, []);

  const updateAvailableTickets = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_AVAILABLE_TICKETS', payload: { id, quantity } });

  return (
    <EventsContext.Provider value={{ ...state, updateAvailableTickets }}>
      {children}
    </EventsContext.Provider>
  );
};

export { EventsProvider };


