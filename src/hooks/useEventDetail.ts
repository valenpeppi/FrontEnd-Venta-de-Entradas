import { useContext } from 'react';
import { EventDetailContext } from '@/shared/context/EventDetailContext';
import type { EventDetailContextType } from '@/types/events';

export const useEventDetail = (): EventDetailContextType => {
    const context = useContext(EventDetailContext);
    if (context === undefined) {
        throw new Error('useEventDetail debe ser usado dentro de un EventDetailProvider');
    }
    return context;
};
