// pages/userHomePage/EventDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../shared/context/CartContext";
import { useMessage } from "../../shared/context/MessageContext";
import { EventDetailProvider, useEventDetail } from "../../shared/context/EventDetailContext";
import type { Event, EventSector, Seat } from "../../shared/context/Interfaces";
import StadiumPlan from "../place/StadiumPlan";
import SeatSelector from "../place/SeatSelector";
import { mapEventToCartItem } from "../purchase/CartMapper";
import s from "./styles/EventDetailPage.module.css";

const EventDetailContent: React.FC<{ event: Event }> = ({ event }) => {
  const { addToCart } = useCart();
  const { addMessage } = useMessage();
  const { selectedSector } = useEventDetail();

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const sectorSelected: EventSector | undefined = event.sectors.find(
    (s) => s.idSector === selectedSector
  );

  const handleAddToCart = () => {
    if (!sectorSelected) {
      addMessage("Debes seleccionar un sector", "error");
      return;
    }

    if (sectorSelected.enumerated) {
      if (selectedSeats.length === 0) {
        addMessage("Debes seleccionar al menos un asiento", "error");
        return;
      }

      selectedSeats.forEach((seatId) => {
        const cartItem = mapEventToCartItem(
          event,
          sectorSelected.name,
          `${event.idEvent}-${sectorSelected.idSector}-${seatId}`,
          sectorSelected.price,
          sectorSelected.availableTickets,
          event.type
        );
        addToCart(cartItem, 1);
      });

      addMessage("Entradas agregadas al carrito", "success");
      setSelectedSeats([]);
    } else {
      const cartItem = mapEventToCartItem(
        event,
        sectorSelected.name,
        `${event.idEvent}-${sectorSelected.idSector}`,
        sectorSelected.price,
        sectorSelected.availableTickets,
        event.type
      );
      addToCart(cartItem, 1);
      addMessage("Entrada agregada al carrito", "success");
    }
  };

  return (
    <div className={s.detailContainer}>
      <div className={s.left}>
        <img
          src={event.image || "/ticket.png"}
          alt={event.name}
          className={s.eventImage}
        />
        <div className={s.eventInfo}>
          <h1>{event.name}</h1>
          <p>{event.description}</p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(event.date).toLocaleDateString("es-ES")}
          </p>
          <p>
            <strong>Lugar:</strong> {event.placeName}
          </p>
          <p>
            <strong>Tipo:</strong> {event.type}
          </p>
        </div>
      </div>

      <div className={s.right}>
        <StadiumPlan
          placeName={event.placeName}
          sectors={event.sectors}
          imageSrc={event.image || "/ticket.png"}
        />

        {sectorSelected && sectorSelected.enumerated && (
          <SeatSelector
            seats={Array.from({ length: sectorSelected.availableTickets }).map((_, i) => ({
              id: i + 1,
              label: `A${i + 1}`,
            })) as Seat[]}
            selectedSeats={selectedSeats}
            onChange={setSelectedSeats}
          />
        )}

        <button className={s.buyButton} onClick={handleAddToCart}>
          Comprar Entrada
        </button>
      </div>
    </div>
  );
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Info básica del evento
        const resEvent = await axios.get(`${BASE_URL}/api/events/events/${id}`);
        // Sectores con precios y disponibilidad
        const resSectors = await axios.get(`${BASE_URL}/api/events/events/${id}/sectors`);

        const eventData = resEvent.data;
        const sectorsData: EventSector[] = resSectors.data ?? [];

        const mappedEvent: Event = {
          idEvent: eventData.idEvent,
          name: eventData.name,
          description: eventData.description,
          date: eventData.date,
          image: eventData.image,
          placeName: eventData.place?.name || "Lugar no especificado",
          type: eventData.eventType?.name || "General",
          sectors: sectorsData,
        };

        setEvent(mappedEvent);
      } catch (err) {
        console.error("Error cargando evento:", err);
      }
    };

    if (id) fetchEvent();
  }, [id, BASE_URL]);

  if (!event) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Cargando evento...</p>;
  }

  return (
    <EventDetailProvider>
      <EventDetailContent event={event} />
    </EventDetailProvider>
  );
};

export default EventDetailPage;
