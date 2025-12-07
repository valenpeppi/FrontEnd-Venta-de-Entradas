import api from './api';
import type { Place } from '../types/company';
import type { Sector } from '../types/events';

export const PlaceService = {
    getAllPlaces: async (): Promise<Place[]> => {
        const response = await api.get('/places/getPlaces');
        return response.data;
    },

    getPlaceSectors: async (placeId: string | number): Promise<Sector[]> => {
        const response = await api.get(`/places/${placeId}/sectors`);
        return response.data;
    },

    getAvailableDates: async (placeId: string | number): Promise<string[]> => {
        const response = await api.get<{ data: string[] }>(`/events/available-dates/${placeId}`);
        return response.data.data;
    }
};
