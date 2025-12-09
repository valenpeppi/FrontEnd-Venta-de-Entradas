import api from '@/services/api';

export const SalesService = {
    getMyTickets: async () => {
        const response = await api.get('/sales/my-tickets');
        return (Array.isArray(response.data) ? response.data : response.data?.data) ?? [];
    }
};
