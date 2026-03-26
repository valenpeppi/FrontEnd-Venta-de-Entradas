import React from 'react';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { Link } from 'react-router-dom';
import Carousel from '@/pages/home/Carousel';
import styles from '@/pages/home/styles/UserHomePage.module.css';
import ticketPlaceholder from '@/assets/ticket.png';
import { useUserHome } from '@/hooks/useUserHome';

const HomePage: React.FC = () => {
  const {
    featuredEvents,
    approvedEvents,
    currentEventIndex,
    allEventTypes,
    selectedType,
    setSelectedType,
    goToPreviousEvent,
    goToNextEvent,
    eventCounts,
    eventsByType
  } = useUserHome();

  if (approvedEvents.length === 0 && allEventTypes.length === 0) {
    return <LoadingSpinner text="Cargando eventos..." />;
  }

  return (
    <div className={styles.homepage}>
      <main className={styles.homepageMain}>
        <Carousel
          tickets={featuredEvents}
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
            <span className={styles.eventCount}>{approvedEvents.length}</span>
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
            Object.entries(eventsByType).map(([type, events]) => (
              <div key={type} className={styles.eventTypeSection}>
                <h2 className={styles.eventTypeTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <div className={styles.eventTypeGallery}>
                  {events.map(event => (
                    <Link
                      to={`/event/${event.id}`}
                      key={event.id}
                      className={styles.eventCardLink}
                    >
                      <div className={styles.eventCard}>
                        <img
                          src={event.imageUrl}
                          alt={event.eventName}
                          className={styles.eventCardImg}
                          onError={e => { (e.currentTarget as HTMLImageElement).src = ticketPlaceholder; }}
                        />
                        <div className={styles.eventCardTitle}>{event.eventName}</div>
                        {event.agotado && (
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
