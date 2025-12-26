
export interface Ticket {
    id: string;
    eventId: string;
    eventName: string;
    date: string;
    time: string;
    location: string;
    placeName: string;
    sectorName?: string;
    price: number;
    availableTickets: number;
    imageUrl: string;
    type: string;
    featured: boolean;
    agotado?: boolean;
    description?: string;
    quantity: number;
    idTicket?: number;
    seats?: (string | number)[];
    ticketIds?: number[];
    idPlace?: string;
    idSector?: number;
}

export type CartItem = Ticket;

export interface CartState {
    cartItems: CartItem[];
}

export type CartAction =
    | { type: 'ADD_TO_CART'; payload: { ticket: Omit<CartItem, 'quantity'>; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: { id: string } }
    | { type: 'CLEAR_CART' }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'LOAD_CART'; payload: { items: CartItem[] } };

export interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    addToCart: (ticket: Omit<CartItem, 'quantity'>, quantity: number) => boolean;
    removeItem: (id: string) => void;
    clearCart: () => void;
    updateItemQuantity: (id: string, newQuantity: number) => boolean;
    canAddTicketsToEvent: (eventId: string | number, quantity: number) => Promise<boolean>;
}

import type { ReactNode } from 'react';
export interface CartProviderProps {
    children: ReactNode;
}
