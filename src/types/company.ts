
export interface Place {
    idPlace: string;
    name: string;
}

export interface CreateEventState {
    eventName: string;
    description: string;
    date: string;
    time: string;
    idEventType: string;
    error: string | null;
    idPlace: string;
    occupiedDates: string[];
    sectorPrices: { [key: string]: string };
    loading?: boolean;
}

export type CreateEventAction =
    | { type: 'SET_FIELD'; payload: { field: keyof CreateEventState; value: any } }
    | { type: 'SET_OCCUPIED_DATES'; payload: { dates: string[] } }
    | { type: 'SET_ERROR'; payload: { error: string | null } }
    | { type: 'RESET_FORM' }
    | { type: 'SET_LOADING'; payload: { loading: boolean } }

export interface CompanyStats {
    activeEvents: number;
    ticketsSold: number;
    totalRevenue: number;
}

export interface CompanyEventCardProps {
    event: {
        idEvent: string;
        name: string;
        date: string;
        imageUrl?: string;
        state: string;
        soldPercentage: number;
        soldSeats: number;
        totalSeats: number;
    };
    onDelete?: (id: string) => void;
}
