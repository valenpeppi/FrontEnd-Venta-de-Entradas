import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import EventCard from '../../../shared/components/EventCard';
import { useSearchParams } from 'react-router-dom';
import { EventService } from '../../../services/EventService';
import type { Ticket } from '../../../types/cart';
import styles from './styles/SearchedEvents.module.css';
import { formatLongDate, formatTime } from '../../../shared/utils/dateFormatter';
import { FaSearch } from 'react-icons/fa';
import EmptyState from '../../../shared/components/EmptyState';

const SearchedEvents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('query') || '';

  const mapApiEventToTicket = (ev: any): Ticket => {
    let minPrice = ev.minPrice ?? ev.price ?? 0;
    if (!minPrice && ev.eventSectors?.length > 0) {
      minPrice = Math.min(...ev.eventSectors.map((s: any) => parseFloat(s.price)));
    }


    return {
      id: String(ev.idEvent ?? ev.id),
      eventId: String(ev.idEvent ?? ev.id),
      eventName: ev.eventName ?? ev.name,
      date: formatLongDate(ev.date),
      time: formatTime(ev.date),
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
        const results = await EventService.searchEvents(query);

        if (Array.isArray(results)) {
          const mapped = results.map(mapApiEventToTicket);
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
  }, [query]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Resultados de búsqueda para: <em>"{query}"</em>
      </h2>

      {loading ? (
        <LoadingSpinner text="Cargando eventos..." />
      ) : results.length === 0 ? (
        <EmptyState
          title="No se encontraron eventos"
          description="Intenta con otros términos de búsqueda."
          icon={<FaSearch />}
          compact
        />
      ) : (
        <div className={styles.grid}>
          {results.map((ticket, index) => (
            <EventCard key={ticket.id} ticket={{ ...ticket, agotado: ticket.agotado ?? false }} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchedEvents;



