import React, { createContext, useReducer, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../App';
import mirandaImg from "../assets/miranda.jpg";
import nickyImg from "../assets/nicky.jpg";
import superOttoImg from "../assets/superotto.jpg";
import losMidachiImg from "../assets/losmidachi.jpg";
import exposicionArteImg from "../assets/exposicionarte.jpg";

interface EventsState {
  allTickets: Ticket[];
}

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

interface EventsProviderProps {
  children: ReactNode;
}

const eventsReducer = (state: EventsState, action: EventsAction): EventsState => {
  switch (action.type) {
    case 'SET_TICKETS': {
      return { ...state, allTickets: action.payload.tickets };
    }
    
    case 'UPDATE_TICKET': {
      const { ticket } = action.payload;
      return {
        ...state,
        allTickets: state.allTickets.map(t => 
          t.id === ticket.id ? ticket : t
        )
      };
    }
    
    case 'ADD_TICKET': {
      const { ticket } = action.payload;
      return {
        ...state,
        allTickets: [...state.allTickets, ticket]
      };
    }
    
    case 'REMOVE_TICKET': {
      const { id } = action.payload;
      return {
        ...state,
        allTickets: state.allTickets.filter(t => t.id !== id)
      };
    }
    
    case 'UPDATE_AVAILABLE_TICKETS': {
      const { id, quantity } = action.payload;
      return {
        ...state,
        allTickets: state.allTickets.map(ticket =>
          ticket.id === id
            ? { ...ticket, availableTickets: ticket.availableTickets - quantity }
            : ticket
        )
      };
    }
    
    default:
      return state;
  }
};

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(eventsReducer, { allTickets: [] });

  useEffect(() => {
    const dummyTickets: Ticket[] = [
      { id: '1', eventName: 'Miranda', date: '2025-07-20', location: 'Estadio Metropolitano', price: 10000.00, availableTickets: 2000, imageUrl: mirandaImg, time: '20:00 hs' },
      { id: '2', eventName: 'Nicky Nicole', date: '2025-08-10', location: 'Bioceres Arena', price: 6000.00, availableTickets: 6000, imageUrl: nickyImg, time: '21:30 hs' },
      { id: '3', eventName: 'Super Otto', date: '2025-09-01', location: 'Complejo Forest', price: 7000.00, availableTickets: 900, imageUrl: superOttoImg, time: '23:00 hs' },
      { id: '4', eventName: 'Los Midachi', date: '2025-09-15', location: 'Teatro Opera', price: 4500.00, availableTickets: 100, imageUrl: losMidachiImg, time: '22:00 hs' },
      { id: '5', eventName: 'Exposición de Arte Contemporaneo', date: '2025-10-05', location: 'Centro Cultural Roberto Fontanarrosa', price: 2500.00, availableTickets: 150, imageUrl: exposicionArteImg, time: '18:00 hs' },
    ];
    dispatch({ type: 'SET_TICKETS', payload: { tickets: dummyTickets } });
    console.log('EventsContext: Tickets cargados:', dummyTickets);
  }, []);

  const setAllTickets = (tickets: Ticket[]) => {
    dispatch({ type: 'SET_TICKETS', payload: { tickets } });
  };

  const updateTicket = (ticket: Ticket) => {
    dispatch({ type: 'UPDATE_TICKET', payload: { ticket } });
  };

  const addTicket = (ticket: Ticket) => {
    dispatch({ type: 'ADD_TICKET', payload: { ticket } });
  };

  const removeTicket = (id: string) => {
    dispatch({ type: 'REMOVE_TICKET', payload: { id } });
  };

  const updateAvailableTickets = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_AVAILABLE_TICKETS', payload: { id, quantity } });
  };

  return (
    <EventsContext.Provider value={{ 
      allTickets: state.allTickets, 
      setAllTickets, 
      updateTicket, 
      addTicket, 
      removeTicket, 
      updateAvailableTickets 
    }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents debe ser usado dentro de un EventsProvider');
  }
  return context;
};
