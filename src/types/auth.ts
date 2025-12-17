
export interface User {
    name: string;
    surname?: string;
    mail?: string;
    email?: string;
    dni?: number;
    role: string | null;
    type?: 'user' | 'company';
    idOrganiser?: string;
    contactEmail?: string;
    companyName?: string;
    phone?: string;
    address?: string;
    cuil?: string;
    birthDate?: string | Date;
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
    updateUser: (userData: Partial<User>) => void;
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

export interface UserInfo {
    name: string;
    dni?: string | number;
}

export interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}
