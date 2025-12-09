
export interface PurchasedTicket {
    id: string;
    idSale: number;
    eventId: number;
    eventName: string;
    date: string;
    time: string;
    location: string;
    sectorName: string;
    sectorType?: 'enumerated' | 'nonEnumerated' | string;
    seatNumber?: number;
    imageUrl: string;
    idTicket: number;
}

export interface PurchasedTicketGroup {
    idSale: number;
    eventId: number;
    eventName: string;
    date: string;
    time: string;
    location: string;
    sectorName: string;
    sectorType?: 'enumerated' | 'nonEnumerated' | string;
    tickets: PurchasedTicket[];
}

// Payment/Checkout Types
export interface PaymentTicketGroup {
    idEvent: number;
    idPlace: number;
    idSector: number;
    ids?: number[];
    quantity?: number;
}

export interface GroupedBySector {
    sectorName: string;
    totalQuantity: number;
    totalPrice: number;
    seatNumbers: string[];
}

export interface GroupedByEvent {
    eventId: string;
    eventName: string;
    date: string;
    time: string;
    placeName?: string;
    sectors: GroupedBySector[];
}
