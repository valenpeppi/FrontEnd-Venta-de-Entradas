import { useContext } from 'react';
import { EventsContext } from '@/shared/context/EventsContext';

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (!context) throw new Error('useEvents debe ser usado dentro de un EventsProvider');
    return context;
};
