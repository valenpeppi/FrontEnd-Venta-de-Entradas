import api from './api';

export const MessageService = {
    createMessage: async (data: { title: string; description: string; senderEmail: string; }) => {
        const response = await api.post('/messages', data);
        return response.data;
    },

    getMessages: async () => {
        const response = await api.get('/messages');
        return response.data;
    },

    replyMessage: async (id: number, responseText: string) => {
        const response = await api.put(`/messages/${id}/reply`, { responseText });
        return response.data;
    },

    rejectMessage: async (id: number) => {
        const response = await api.put(`/messages/${id}/reject`);
        return response.data;
    }
};
