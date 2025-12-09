import api from '@/services/api';

export const SystemService = {
    getBoot: async () => {
        const response = await api.get('/system/boot');
        return response.data;
    }
};
