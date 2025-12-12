
export interface Message {
    text: string;
    type: 'success' | 'error' | 'info';
    id: string;
}

export interface MessageState {
    messages: Message[];
}

export type MessageAction =
    | { type: 'ADD_MESSAGE'; payload: { text: string; type: 'success' | 'error' | 'info'; id: string } }
    | { type: 'REMOVE_MESSAGE'; payload: { id: string } }
    | { type: 'CLEAR_MESSAGES' };

export interface MessageContextType {
    messages: Message[];
    addMessage: (text: string, type?: 'success' | 'error' | 'info') => void;
    removeMessage: (id: string) => void;
    clearMessages: () => void;
    setAppMessage: (message: string | null, type?: 'success' | 'error' | 'info') => void;
}

export interface SearchState {
    searchQuery: string;
}

export type SearchAction =
    | { type: 'SET_SEARCH_QUERY'; payload: { query: string } }
    | { type: 'CLEAR_SEARCH' };

export interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;
}

import type { ReactNode } from 'react';

export interface SearchProviderProps {
    children: ReactNode;
}

export interface MessageProviderProps {
    children: ReactNode;
}

export interface MessageDisplayProps {
    message: string | null;
    type: 'success' | 'error' | 'info';
}

export interface LayoutProps {
    children: ReactNode;
}

export interface GradientTextProps {
    children: ReactNode;
    className?: string;
}
