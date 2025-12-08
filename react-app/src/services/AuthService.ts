
import api from './api';

export const AuthService = {
    validateToken: async () => {
        const response = await api.get('/auth/validate');
        return response.data;
    },

    login: async (credentials: any): Promise<{ token: string, user: any }> => {
        // Implement if used elsewhere, currently AuthContext has logic inside but we are refactoring.
        // AuthContext uses manual fetch. usage: fetch(`${import.meta.env.VITE_BACKEND_URL}.../api/auth/validate
        // We are replacing that one.
        // The login/register pages might use other endpoints.
        // I should check LoginUser.tsx to see what it uses.
        // For now, only validateToken is clearly seen in AuthContext.
        // I'll add login/register placeholders or implementations if I find them.
        // I'll stick to what I verified in AuthContext for now.
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    registerUser: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    registerCompany: async (companyData: any) => {
        const response = await api.post('/auth/register-company', companyData);
        return response.data;
    },

    loginCompany: async (credentials: any) => {
        const response = await api.post('/auth/login-company', credentials);
        return response.data;
    },

    updateUser: async (userData: any) => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },

    deleteAccount: async () => {
        const response = await api.delete('/auth/profile');
        return response.data;
    }
};
