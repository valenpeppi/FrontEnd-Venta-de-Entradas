
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
    idOrganiser?: string | null;
    featured: boolean;
    organiser?: {
        companyName?: string | null;
        contactEmail?: string | null;
    } | null;
}

export interface DashboardStats {
    salesToday: number;
    ticketsToday: number;
    revenueToday: number;
    pendingEvents: number;
}
