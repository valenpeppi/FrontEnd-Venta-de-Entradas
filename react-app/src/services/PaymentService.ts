import api from './api';

export const PaymentService = {
    mpCheckout: async (data: any) => {
        const response = await api.post('/mp/checkout', data);
        return response.data;
    },

    stripeCheckout: async (data: any) => {
        const response = await api.post('/stripe/checkout', data);
        return response.data;
    }
};
