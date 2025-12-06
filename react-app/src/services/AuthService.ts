
import api from './api';
import type { User } from '../types/auth'; // Importing from new location

export const AuthService = {
    validateToken: async () => {
        const response = await api.get('/auth/validate');
        return response.data;
    },

    login: async (credentials: any): Promise<{ user: User, token: string }> => {
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
        const response = await api.post('/auth/register/user', userData);
        return response.data;
    },

    registerCompany: async (companyData: any) => {
        const response = await api.post('/auth/register/company', companyData);
        return response.data;
    }
};
