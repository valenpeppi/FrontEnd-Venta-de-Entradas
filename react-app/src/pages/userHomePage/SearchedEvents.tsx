import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import type { Ticket } from '../../shared/context/CartContext';
import styles from './styles/SearchedEvents.module.css';

import {
  MdLocationOn,
  MdCalendarToday,
  MdCategory,
  MdAttachMoney
} from 'react-icons/md';

const SearchedEvents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('query') || '';
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
      time: eventDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }) + " hs",
      location: ev.location || ev.place?.name || "Lugar no especificado",
      placeName: ev.placeName || ev.place?.name || "Lugar no especificado",
      price: minPrice,
      availableTickets: ev.availableSeats ?? ev.availableTickets ?? 0,
      type: ev.eventType?.name || ev.type || "General",
      imageUrl: ev.imageUrl || "/ticket.png",
      featured: ev.featured ?? false,
      agotado: ev.agotado ?? false,
      quantity: 0
    };
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/events/search`, {
          params: { query }
        });

        if (response.data?.ok) {
          const mapped = response.data.data.map(mapApiEventToTicket);
          setResults(mapped);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error buscando eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (query.trim().length > 0) {
      fetchSearchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, BASE_URL]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Resultados de búsqueda para: <em>"{query}"</em>
      </h2>

      {loading ? (
        <div className={styles.loadingState}>
            <div className={styles.loadingDots}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
            <p className={styles.loadingStateText}>Cargando eventos...</p>
        </div>
      ) : results.length === 0 ? (
        <p className={styles.noResults}>No se encontraron eventos.</p>
      ) : (
        <div className={styles.grid}>
          {results.map((ticket, index) => (
            <EventCard key={ticket.id} ticket={ticket} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchedEvents;

const EventCard: React.FC<{ ticket: Ticket; index: number }> = ({ ticket, index }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card} style={{ animationDelay: `${index * 80}ms` }}>
      <img
        src={ticket.imageUrl}
        alt={ticket.eventName}
        className={styles.image}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/ticket.png';
        }}
      />
      <div className={styles.content}>
        <h3 className={styles.cardTitle}>{ticket.eventName}</h3>

        <p className={styles.infoRow}>
          <MdLocationOn className={styles.icon} />
          <span>{ticket.location}</span>
        </p>

        <p className={styles.infoRow}>
          <MdCalendarToday className={styles.icon} />
          <span>{ticket.date} - {ticket.time}</span>
        </p>

        <p className={styles.infoRow}>
          <MdCategory className={styles.icon} />
          <span>{ticket.type}</span>
        </p>

        <p className={styles.infoRow}>
          <MdAttachMoney className={styles.icon} />
          <span>Desde ${ticket.price.toLocaleString()}</span>
        </p>

        <button
          onClick={() => navigate(`/event/${ticket.eventId}`)}
          className={`${styles.button} ${ticket.agotado ? styles.disabledButton : ''}`}
          disabled={ticket.agotado}
        >
          {ticket.agotado ? 'Agotado' : 'Comprar'}
        </button>
      </div>
    </div>
  );
};

