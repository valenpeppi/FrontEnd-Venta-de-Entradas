import api from '@/services/api';

export const PaymentService = {


    stripeCheckout: async (data: any) => {
        const response = await api.post('/stripe/checkout', data);
        return response.data;
    },

    releaseReservations: async (ticketGroups: any[]) => {
        const response = await api.post("/stripe/release", { ticketGroups });
        return response.data;
    },

    confirmStripeSession: async (sessionId: string) => {
        const response = await api.get("/stripe/confirm-session", {
            params: { session_id: sessionId },
        });
        return response.data;
    },



    checkSaleStatus: async (dniClient: string) => {
        const response = await api.get(`/sales/check?dniClient=${dniClient}`);
        return response.data;
    }
};
