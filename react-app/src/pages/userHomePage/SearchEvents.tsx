import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import type { Ticket } from '../../shared/context/CartContext';
import styles from './styles/SearchedEvents.module.css';

const SearchedEvents: React.FC = () => {
  const location = useLocation();
  const [results, setResults] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search).get('query') || '';
  const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  const mapApiEventToTicket = (ev: any): Ticket => {
    let minPrice = ev.minPrice ?? ev.price ?? 0;
    if (!minPrice && ev.eventSectors?.length > 0) {
      minPrice = Math.min(...ev.eventSectors.map((s: any) => parseFloat(s.price)));
    }

    const eventDate = new Date(ev.date);

    return {
      id: String(ev.idEvent ?? ev.id),
      eventId: String(ev.idEvent ?? ev.id),
      eventName: ev.eventName ?? ev.name,
      date: eventDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      time:
        eventDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        }) + " hs",
      location: ev.place?.name || ev.placeName || "Sin lugar",
      placeName: ev.place?.name || ev.placeName || "Lugar no especificado",
      price: minPrice,
      availableTickets: ev.availableSeats ?? ev.availableTickets ?? 0,
      type: ev.eventType?.name || ev.type || "General",
      imageUrl: ev.imageUrl || "/ticket.png",
      featured: ev.featured ?? false,
      agotado: ev.agotado ?? false,
    };
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/events/search`, {
          params: { query }
        });

        if (response.data?.ok) {
          const mapped = response.data.data.map(mapApiEventToTicket);
          setResults(mapped);
        }
      } catch (err) {
        console.error('Error buscando eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, BASE_URL]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Resultados de búsqueda para: <em>"{query}"</em>
      </h2>

      {loading ? (
        <p className={styles.loading}>Cargando...</p>
      ) : results.length === 0 ? (
        <p className={styles.noResults}>No se encontraron eventos.</p>
      ) : (
        <div className={styles.grid}>
          {results.map(ticket => (
            <EventCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchedEvents;

//  EventCard (con estilos externos)
const EventCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  return (
    <div className={styles.card}>
      <img src={ticket.imageUrl} alt={ticket.eventName} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.cardTitle}>{ticket.eventName}</h3>
        <p><strong>Lugar:</strong> {ticket.placeName}</p>
        <p><strong>Fecha:</strong> {ticket.date} - {ticket.time}</p>
        <p><strong>Tipo:</strong> {ticket.type}</p>
        <p><strong>Desde:</strong> ${ticket.price.toLocaleString()}</p>
        <p className={ticket.agotado ? styles.soldOut : styles.available}>
          {ticket.agotado ? 'AGOTADO ❌' : `${ticket.availableTickets} disponibles ✅`}
        </p>
        <Link to={`/event/${ticket.eventId}`} className={styles.button}>
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};
