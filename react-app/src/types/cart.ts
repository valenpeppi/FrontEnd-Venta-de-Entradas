
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
    idTicket?: number; // Optional as not all tickets might have a specific ticket instance ID yet
    // Cart specific props. If unified, we include them as optional or part of the type.
    seats?: (string | number)[];
    ticketIds?: number[];
    idPlace?: number;
    idSector?: number;
}

export type CartItem = Ticket;

import type { ReactNode } from 'react';
export interface CartProviderProps {
    children: ReactNode;
}
