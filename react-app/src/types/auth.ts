
export interface User {
    name: string;
    surname?: string;
    mail?: string;
    dni?: number;
    role: string | null;
}

export interface AuthState {
    isLoggedIn: boolean;
    user: User | null;
    isLoading: boolean;
}

export interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    isLoading: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (name: string, role?: string) => void;
}

import type { ReactNode } from 'react';

export interface AuthProviderProps {
    children: ReactNode;
}

export interface LoginProps {
    onLoginSuccess: (user: User, token: string) => void;
}

export interface LoginCompanyProps {
    onLoginSuccess: (company: { companyName: string }, token: string) => void;
}

export interface RegisterUserProps {
    onRegisterSuccess: () => void;
}

export interface RegisterCompanyProps {
    onRegisterSuccess: () => void;
}
