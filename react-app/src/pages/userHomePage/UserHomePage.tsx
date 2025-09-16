import React, { useState, useEffect } from 'react';
import { useEvents } from '../../shared/context/EventsContext';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
import styles from './styles/UserHomePage.module.css';
import type { Ticket } from '../../shared/context/CartContext';

const HomePage: React.FC = () => {
  const { featuredTickets, approvedTickets } = useEvents();
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

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

  const eventTypes = Array.from(new Set(approvedTickets.map(ticket => ticket.type)));
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const filteredTickets = selectedType === 'Todos'
    ? approvedTickets
    : approvedTickets.filter(ticket => ticket.type === selectedType);

  const eventsByType: { [key: string]: Ticket[] } = {};
  filteredTickets.forEach(ticket => {
    if (!eventsByType[ticket.type]) eventsByType[ticket.type] = [];
    eventsByType[ticket.type].push(ticket);
  });

  if (approvedTickets.length === 0) {
    return (
      <div className={styles.loadingState}>
        <p className={styles.loadingStateText}>Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className={styles.homepage}>
      <main className={styles.homepageMain}>
        <h1 className={styles.homepageTitle}>Eventos destacados</h1>
        <Carousel
          tickets={featuredTickets}
          currentEventIndex={currentEventIndex}
          onPreviousEvent={goToPreviousEvent}
          onNextEvent={goToNextEvent}
        />

        <div className={styles.eventTypeFilterContainer}>
          <label htmlFor="event-type-select" className={styles.eventTypeFilterLabel}>Filtrar</label>
          <select
            id="event-type-select"
            className={styles.eventTypeFilterSelect}
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        <h2 className={styles.eventListTitle}>Todos los Eventos</h2>
        
        <div className={styles.eventListContainer}>
          {Object.keys(eventsByType).length === 0 ? (
            <p className={styles.eventTypeEmpty}>No hay eventos para este tipo.</p>
          ) : (
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
                          onError={e => { e.currentTarget.src = '/ticket.png'; }}
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
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;

