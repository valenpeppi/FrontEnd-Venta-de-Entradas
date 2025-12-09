import type { Ticket } from '@/types/cart';
import { formatLongDate, formatTime } from '@/shared/utils/dateFormatter';

export const mapApiEventToTicket = (ev: any): Ticket => {
    let minPrice = ev.minPrice ?? ev.price ?? 0;
    if (!minPrice && ev.eventSectors?.length > 0) {
        minPrice = Math.min(...ev.eventSectors.map((s: any) => parseFloat(s.price)));
    }

    return {
        id: String(ev.idEvent ?? ev.id),
        eventId: String(ev.idEvent ?? ev.id),
        description: ev.description,
        eventName: ev.eventName ?? ev.name,
        date: formatLongDate(ev.date),
        time: formatTime(ev.date),
        location: ev.place?.name || ev.placeName || "Sin lugar",
        placeName: ev.place?.name || ev.placeName || "Lugar no especificado",
        price: minPrice,
        availableTickets: ev.availableSeats ?? ev.availableTickets ?? 0,
        type: ev.eventType?.name || ev.type || "General",
        imageUrl: ev.imageUrl || "/ticket.png",
        featured: ev.featured ?? false,
        agotado: ev.agotado ?? false,
        quantity: 0,
    };
};
