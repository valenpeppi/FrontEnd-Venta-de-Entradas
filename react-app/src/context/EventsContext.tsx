import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Ticket } from '../App'; // Importa la interfaz Ticket

// Interfaz para el valor del contexto de eventos
interface EventsContextType {
  allTickets: Ticket[];
  // Corrección aquí: setAllTickets puede ser una función de actualización de estado
  setAllTickets: React.Dispatch<React.SetStateAction<Ticket[]>>; 
}

// Crea el contexto
const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Props para el proveedor de eventos
interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);

  // Carga los tickets iniciales aquí una vez
  useEffect(() => {
    const dummyTickets: Ticket[] = [
      { id: '1', eventName: 'Miranda', date: '2025-07-20', location: 'Estadio Metropolitano', price: 10000.00, availableTickets: 2000, imageUrl: 'https://placehold.co/600x400/FF5733/FFFFFF?text=Concierto' },
      { id: '2', eventName: 'Nicky Nicole', date: '2025-08-10', location: 'Bioceres Arena', price: 6000.00, availableTickets: 6000, imageUrl: 'https://placehold.co/600x400/33FF57/FFFFFF?text=Trap' },
      { id: '3', eventName: 'Super Otto', date: '2025-09-01', location: 'Complejo Forest', price: 7000.00, availableTickets: 900, imageUrl: 'https://placehold.co/600x400/3357FF/FFFFFF?text=Fiesta' },
      { id: '4', eventName: 'Los Midachi', date: '2025-09-15', location: 'Teatro Opera', price: 4500.00, availableTickets: 100, imageUrl: 'https://placehold.co/600x400/FF33CC/FFFFFF?text=Humor' },
      { id: '5', eventName: 'Exposición de Arte Contemporaneo', date: '2025-10-05', location: 'Centro Cultural Roberto Fontanarrosa', price: 2500.00, availableTickets: 150, imageUrl: 'https://placehold.co/600x400/33CCFF/FFFFFF?text=Arte' },
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

// Hook personalizado para consumir el contexto de eventos
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents debe ser usado dentro de un EventsProvider');
  }
  return context;
};
