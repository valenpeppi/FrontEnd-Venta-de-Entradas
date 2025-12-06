import React, { useState, useEffect, useMemo } from 'react';
import { useEvents } from '../../shared/context/EventsContext';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
import styles from './styles/UserHomePage.module.css';
import type { Ticket } from '../../types/cart';
import { EventService } from '../../services/EventService';
import type { EventType } from '../../types/events';

const HomePage: React.FC = () => {
  const { featuredTickets, approvedTickets } = useEvents();
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [allEventTypes, setAllEventTypes] = useState<EventType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('Todos');

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const data = await EventService.getEventTypes();
        setAllEventTypes(data);
      } catch (error) {
        console.error("Error fetching event types:", error);
      }
    };
    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (featuredTickets.length > 0 && currentEventIndex >= featuredTickets.length) {
      setCurrentEventIndex(0);
    }
  }, [featuredTickets, currentEventIndex]);

  const goToPreviousEvent = () => {
    if (featuredTickets.length === 0) return;
    setCurrentEventIndex(prevIndex =>
      prevIndex === 0 ? featuredTickets.length - 1 : prevIndex - 1
    );
  };

  const goToNextEvent = () => {
    if (featuredTickets.length === 0) return;
    setCurrentEventIndex(prevIndex =>
      prevIndex === featuredTickets.length - 1 ? 0 : prevIndex + 1
    );
  };

  const eventCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    for (const ticket of approvedTickets) {
      counts[ticket.type] = (counts[ticket.type] || 0) + 1;
    }
    return counts;
  }, [approvedTickets]);

  const filteredTickets = selectedType === 'Todos'
    ? approvedTickets
    : approvedTickets.filter(ticket => ticket.type === selectedType);

  const eventsByType = useMemo(() => {
    const groups: { [key: string]: Ticket[] } = {};
    filteredTickets.forEach(ticket => {
      if (!groups[ticket.type]) {
        groups[ticket.type] = [];
      }
      groups[ticket.type].push(ticket);
    });
    return groups;
  }, [filteredTickets]);

  if (approvedTickets.length === 0 && allEventTypes.length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
        <p className={styles.loadingStateText}>Cargando eventos...</p>
      </div>
    );


  }

  return (
    <div className={styles.homepage}>
      <main className={styles.homepageMain}>
        <Carousel
          tickets={featuredTickets}
          currentEventIndex={currentEventIndex}
          onPreviousEvent={goToPreviousEvent}
          onNextEvent={goToNextEvent}
        />

        <div className={styles.eventTypeFilterContainer}>
          <button
            onClick={() => setSelectedType('Todos')}
            className={`${styles.eventTypeFilterButton} ${selectedType === 'Todos' ? styles.active : ''}`}
          >
            Todos
            <span className={styles.eventCount}>{approvedTickets.length}</span>
          </button>
          {allEventTypes.map(type => (
            <button
              key={type.idType}
              onClick={() => setSelectedType(type.name)}
              className={`${styles.eventTypeFilterButton} ${selectedType === type.name ? styles.active : ''}`}
            >
              {type.name}
              <span className={styles.eventCount}>{eventCounts[type.name] || 0}</span>
            </button>
          ))}
        </div>

        <h2 className={styles.eventListTitle}>Todos los Eventos</h2>

        <div className={styles.eventListContainer}>
          {Object.keys(eventsByType).length > 0 ? (
            Object.entries(eventsByType).map(([type, tickets]) => (
              <div key={type} className={styles.eventTypeSection}>
                <h2 className={styles.eventTypeTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <div className={styles.eventTypeGallery}>
                  {tickets.map(ticket => (
                    <Link
                      to={`/event/${ticket.id}`}
                      key={ticket.id}
                      className={styles.eventCardLink}
                    >
                      <div className={styles.eventCard}>
                        <img
                          src={ticket.imageUrl}
                          alt={(ticket as any).eventName}
                          className={styles.eventCardImg}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = '/ticket.png'; }}
                        />
                        <div className={styles.eventCardTitle}>{(ticket as any).eventName}</div>
                        {ticket.agotado && (
                          <div className={styles.eventCardSoldOut}>Agotado</div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.eventTypeEmpty}>No hay eventos disponibles para esta categoría.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;

