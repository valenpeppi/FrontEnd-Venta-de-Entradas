
import api from './api';
import type { EventType, EventSummary } from '../types/events';

export const EventService = {
    getEventTypes: async (): Promise<EventType[]> => {
        const response = await api.get<EventType[]>('/events/event-types');
        return response.data;
    },

    getFeaturedEvents: async (): Promise<any[]> => {
        // Based on UserHomePage usage or similar
        const response = await api.get('/events/featured');
        return response.data;
    },

    // Add other methods as I uncover them in components
    getEventById: async (id: string | number): Promise<EventSummary> => {
        const response = await api.get<EventSummary>(`/events/${id}`);
        return response.data;
    }
};
