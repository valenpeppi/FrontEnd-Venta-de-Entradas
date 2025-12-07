import api from './api';

export const SalesService = {
    getMyTickets: async () => {
        const response = await api.get('/sales/my-tickets');
        return response.data;
    }
};
