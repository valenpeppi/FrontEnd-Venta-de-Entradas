import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../App';
import mirandaImg from "../assets/miranda.jpg";
import nickyImg from "../assets/nicky.jpg";
import superOttoImg from "../assets/superotto.jpg";
import losMidachiImg from "../assets/losmidachi.jpg";
import exposicionArteImg from "../assets/exposicionarte.jpg";


interface EventsContextType {
  allTickets: Ticket[];
  setAllTickets: React.Dispatch<React.SetStateAction<Ticket[]>>; 
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const dummyTickets: Ticket[] = [
      { id: '1', eventName: 'Miranda', date: '2025-07-20', location: 'Estadio Metropolitano', price: 10000.00, availableTickets: 2000, imageUrl: mirandaImg, time: '20:00 hs' },
      { id: '2', eventName: 'Nicky Nicole', date: '2025-08-10', location: 'Bioceres Arena', price: 6000.00, availableTickets: 6000, imageUrl: nickyImg, time: '21:30 hs' },
      { id: '3', eventName: 'Super Otto', date: '2025-09-01', location: 'Complejo Forest', price: 7000.00, availableTickets: 900, imageUrl: superOttoImg, time: '23:00 hs' },
      { id: '4', eventName: 'Los Midachi', date: '2025-09-15', location: 'Teatro Opera', price: 4500.00, availableTickets: 100, imageUrl: losMidachiImg, time: '22:00 hs' },
      { id: '5', eventName: 'Exposición de Arte Contemporaneo', date: '2025-10-05', location: 'Centro Cultural Roberto Fontanarrosa', price: 2500.00, availableTickets: 150, imageUrl: exposicionArteImg, time: '18:00 hs' },
    ];
    setAllTickets(dummyTickets);
    console.log('EventsContext: Tickets cargados:', dummyTickets);
  }, []);

  return (
    <EventsContext.Provider value={{ allTickets, setAllTickets }}>
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
