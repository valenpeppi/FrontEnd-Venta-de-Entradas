import api from './api';

export const PaymentService = {
    mpCheckout: async (data: any) => {
        const response = await api.post('/mp/create-preference', data);
        return response.data;
    },

    stripeCheckout: async (data: any) => {
        const response = await api.post('/stripe/create-checkout-session', data);
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

    confirmMercadoPagoPayment: async (paymentId: string) => {
        const response = await api.get("/mp/confirm-payment", {
            params: { payment_id: paymentId },
        });
        return response.data;
    },

    checkSaleStatus: async (dniClient: string) => {
        const response = await api.get(`/sales/check?dniClient=${dniClient}`);
        return response.data;
    }
};
