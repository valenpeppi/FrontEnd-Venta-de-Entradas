import type { Event, CartItem } from "../../shared/context/Interfaces";

export const mapEventToCartItem = (
  event: Event,
  sectorName: string,
  uniqueId: string,
  price: number,
  availableTickets: number,
  type: string
): Omit<CartItem, "quantity"> => ({
  id: uniqueId,
  eventId: String(event.idEvent),
  eventName: event.name,
  date: event.date,
  location: event.placeName,
  placeName: event.placeName,
  sectorName,
  price,
  availableTickets, 
  imageUrl: event.image || "/ticket.png",
  time: new Date(event.date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  type, 
  featured: false,
});
