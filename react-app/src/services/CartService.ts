import api from './api';

export const CartService = {
    saveCart: async (cart: any) => {
        const response = await api.post('/cart/save', { cart });
        return response.data;
    },

    getTicketCount: async (eventId: string | number) => {
        const response = await api.get(`/events/events/${eventId}/tickets/count`);
        return response.data;
    }
};
