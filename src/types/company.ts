
export interface Place {
    idPlace: number;
    name: string;
}

export interface CreateEventState {
    eventName: string;
    description: string;
    date: string;
    time: string;
    idEventType: string;
    error: string | null;
    image: File | null;
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
    | { type: 'SET_IMAGE'; payload: { image: File | null } }
    | { type: 'SET_LOADING'; payload: { loading: boolean } };
