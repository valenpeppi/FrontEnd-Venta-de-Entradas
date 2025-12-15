
export interface PurchasedTicket {
    id: string;
    idSale: string;
    eventId: string;
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
    idSale: string;
    eventId: string;
    eventName: string;
    date: string;
    time: string;
    location: string;
    sectorName: string;
    sectorType?: 'enumerated' | 'nonEnumerated' | string;
    tickets: PurchasedTicket[];
}


export interface PaymentTicketGroup {
    idEvent: string;
    idPlace: string;
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
