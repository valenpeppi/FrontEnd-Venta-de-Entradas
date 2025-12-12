
import api from '@/services/api';
import type { EventType, EventSummary } from '@/types/events';

export const EventService = {
    getEventTypes: async (): Promise<EventType[]> => {
        const response = await api.get<EventType[]>('/events/event-types');
        return (Array.isArray(response.data) ? response.data : (response.data as any).data) ?? [];
    },

    getFeaturedEvents: async (): Promise<any[]> => {
        const response = await api.get('/events/featured');
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    getEventById: async (id: string | number): Promise<EventSummary> => {
        const response = await api.get(`/events/events/${id}`);
         
         
         
         
         
        return response.data?.data ?? response.data;
    },

    getEventSectors: async (id: string | number): Promise<any> => {
        const response = await api.get(`/events/events/${id}/sectors`);
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    getEventTicketMap: async (id: string | number): Promise<any> => {
        const response = await api.get(`/events/events/${id}/tickets/map`);
         
        return response.data?.data ?? response.data;
    },

    getEventSeats: async (eventId: string | number, sectorId: number): Promise<any> => {
        const response = await api.get(`/events/events/${eventId}/sectors/${sectorId}/seats`);
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    getFeatured: async () => {
        const response = await api.get('/events/featured');
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    getApproved: async () => {
        const response = await api.get('/events/approved');
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    getPublishedEventsPromise: (userId: string | number) => {
        return api.get(`/events/events/user/${userId}/events`);
    },

    searchEvents: async (query: string) => {
        const response = await api.get('/events/search', { params: { query } });
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    createEvent: async (eventData: FormData) => {
        const response = await api.post('/events/createEvent', eventData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getCompanyEvents: async (): Promise<any[]> => {
        const response = await api.get('/events/company');
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    deleteEvent: async (id: number) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },

    updateEvent: async (id: number, eventData: FormData) => {
        const response = await api.put(`/events/${id}`, eventData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
