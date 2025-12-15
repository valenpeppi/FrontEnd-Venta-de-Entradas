import type { CartItem, Ticket } from '@/types/cart';

export interface Sector {
    idEvent: string;
    idSector: number;
    name: string;
    price: number;
    availableTickets: number;
    selected?: number;
    enumerated?: boolean;
}

export interface EventSummary {
    id: string;
    idPlace: string;
    eventName: string;
    imageUrl: string;
    type: string;
    date: string;
    description?: string;
    placeType: string;
    placeName: string;
    availableTickets: number;
    agotado: boolean;
    price?: number;
    idEventType: string;
}

export interface Seat {
    id: number;
    label?: string;
    state: 'available' | 'reserved' | 'sold' | 'selected';
}

export interface EventType {
    idType: string;
    name: string;
}

export interface EventDetailState {
    summary: EventSummary | null;
    sectors: Sector[];
    loading: boolean;
    generalQuantity: number;
    selectedSector: number | null;
    seats: Seat[];
    selectedSeatsMap: Record<number, number[]>;
}

export interface EventDetailActions {
    setSummary: (summary: EventSummary | null) => void;
    setSectors: (sectors: Sector[]) => void;
    setLoading: (loading: boolean) => void;
    setGeneralQuantity: (quantity: number) => void;
    setSelectedSector: (sectorId: number | null) => void;
    setSeats: (seats: Seat[]) => void;
    setSelectedSeatsMap: (map: Record<number, number[]>) => void;
    handleSectorQuantityChange: (sectorId: number, newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
    handleSeatsChange: (sectorId: number, seatsSel: number[]) => void;
    handleGeneralQuantityChange: (newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
    resetEventDetail: () => void;
}

export interface EventDetailContextType extends EventDetailState, EventDetailActions { }

export interface SeatSelectorProps {
    seats: Seat[];
    selectedSeats: number[];
    onChange: (selectedSeats: number[]) => void;
    setAppMessage?: (message: string, type: 'success' | 'error') => void;
    sectorName?: string;
    enumerated?: boolean;
    columns?: number;
}

export interface SectorListProps {
    sectors: Sector[];
    onQuantityChange: (sectorId: number, quantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
    onSelectSeatsClick: (sectorId: number) => void;
    setAppMessage?: (message: string, type: 'success' | 'error') => void;
}

export interface EventDetailHeaderProps {
    summary: EventSummary;
}

export interface EventDetailBodyProps {
    summary: EventSummary;
    sectors: Sector[];
    seats: Seat[];
    selectedSector: number | null;
    selectedSeatsMap: Record<number, number[]>;
    generalQuantity: number;
    handleSectorQuantityChange: (
        sectorId: number,
        newQty: number,
        setAppMessage?: (msg: string, t: 'success' | 'error') => void
    ) => void;
    handleGeneralQuantityChange: (
        newQty: number,
        setAppMessage?: (msg: string, t: 'success' | 'error') => void
    ) => void;
    handleSeatsChange: (sectorId: number, seatsSel: number[]) => void;
    handleAddToCart: () => Promise<void>;
    openSeatModal: (sectorId: number) => void;
    closeModal: () => void;
    isModalOpen: boolean;
    isModalClosing: boolean;
    seatTicketMap: Record<string, number>;
    setAppMessage: (msg: string, t: 'success' | 'error') => void;
    canAddTicketsToEvent: (eventId: number, newCount: number) => Promise<boolean>;
    addToCart: (ticket: Omit<CartItem, 'quantity'>, quantity: number) => boolean;
}

import type { ReactNode } from 'react';
export interface EventsProviderProps { children: ReactNode; }
export interface EventDetailProviderProps { children: ReactNode; }
export interface CarouselProps {
    tickets: Ticket[];
    currentEventIndex: number;
    onPreviousEvent: () => void;
    onNextEvent: () => void;
}
