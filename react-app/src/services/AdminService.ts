
import api from './api';
import type { PendingEvent, AdminEvent } from '../types/admin';

export const AdminService = {
    getPendingEvents: async (): Promise<PendingEvent[]> => {
        const response = await api.get('/events/pending');
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    getAllEvents: async (): Promise<AdminEvent[]> => {
        const response = await api.get('/events/all');
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    },

    approveEvent: async (id: number | string) => {
        const response = await api.patch(`/events/${id}/approve`);
        return response.data;
    },

    rejectEvent: async (id: number | string) => {
        const response = await api.patch(`/events/${id}/reject`);
        return response.data;
    },

    toggleFeature: async (id: number | string) => {
        const response = await api.patch(`/events/${id}/feature`);
        return response.data;
    }
};
