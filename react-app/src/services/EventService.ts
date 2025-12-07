
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
        const response = await api.get(`/events/events/${id}`);
        return response.data;
    },

    getEventSectors: async (id: string | number): Promise<any> => {
        const response = await api.get(`/events/events/${id}/sectors`);
        return response.data;
    },

    getEventTicketMap: async (id: string | number): Promise<any> => {
        const response = await api.get(`/events/events/${id}/tickets/map`);
        return response.data;
    },

    getEventSeats: async (eventId: string | number, sectorId: number): Promise<any> => {
        const response = await api.get(`/events/events/${eventId}/sectors/${sectorId}/seats`);
        return response.data;
    },

    getFeatured: async () => {
        const response = await api.get('/events/featured');
        return response.data;
    },

    getApproved: async () => {
        const response = await api.get('/events/approved');
        return response.data;
    },

    getPublishedEventsPromise: (userId: string | number) => {
        return api.get(`/events/events/user/${userId}/events`);
    },

    searchEvents: async (query: string) => {
        const response = await api.get('/events/search', { params: { query } });
        return response.data;
    },

    createEvent: async (eventData: FormData) => {
        const response = await api.post('/events/createEvent', eventData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
