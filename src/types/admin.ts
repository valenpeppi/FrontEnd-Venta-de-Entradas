
export interface PendingEvent {
    idEvent: number | string;
    name: string;
    description?: string;
    date?: string;
    image?: string;
    idEventType?: number;
    state?: string;
    idOrganiser?: string;
}

export interface AdminEvent {
    idEvent: number | string;
    name: string;
    description?: string;
    date?: string;
    image?: string;
    idEventType?: number;
    state?: string;
    idOrganiser?: string;
    featured: boolean;
}

 
