import React from 'react';
import { Link } from 'react-router-dom';
import type { Ticket } from '../../App';
import styles from './styles/Carousel.module.css';

export interface CarouselProps {
  tickets: Ticket[];
  currentEventIndex: number;
  onPreviousEvent: () => void;
  onNextEvent: () => void;
  onBuyClick: (ticket: Ticket) => void;
}

const Carousel: React.FC<CarouselProps> = ({
  tickets,
  currentEventIndex,
  onPreviousEvent,
  onNextEvent,
  onBuyClick
}) => {
  if (tickets.length === 0) {
    return (
      <div className={styles.eventCarousel}>
        <p className={styles.eventCarouselEmpty}>No hay eventos disponibles.</p>
      </div>
    );
  }

  const currentEvent = tickets[currentEventIndex];

  return (
    <div className={styles.eventCarousel}>
      <button
        onClick={onPreviousEvent}
        className={`${styles.carouselNavigationBtn} ${styles.carouselNavigationBtnPrev}`}
        title="Evento anterior"
        aria-label="Evento anterior"
      >
        <i className={`fas fa-chevron-left ${styles.carouselNavigationIcon}`}></i>
      </button>
      
      {currentEvent ? (
        <Link to={`/event/${currentEvent.id}`} className={styles.eventCardLink}>
          <div className={styles.eventCard}>
            <img
              src={currentEvent.imageUrl}
              alt={currentEvent.eventName}
              className={styles.eventCardImage}
              onError={e => { e.currentTarget.src = '/public/ticket.png'; }}
            />
            {/* Contenedor agregado para agrupar el texto y el footer */}
            <div className={styles.eventCardDetailsWrapper}>
              <div className={styles.eventCardContent}>
                <h3 className={styles.eventCardTitle}>{currentEvent.eventName}</h3>
                <p className={styles.eventCardDetails}>
                  <i className={`fas fa-calendar-alt ${styles.eventCardIcon}`}></i>
                  {currentEvent.date}
                </p>
                <p className={styles.eventCardDetails}>
                  <i className={`fas fa-map-marker-alt ${styles.eventCardIcon}`}></i>
                  {currentEvent.location}
                </p>
              </div>
              <div className={styles.eventCardFooter}>
                <span className={styles.eventCardPrice}>${currentEvent.price.toFixed(2)}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onBuyClick(currentEvent);
                  }}
                  className={`${styles.btnPurchase} ${currentEvent.availableTickets > 0 ? '' : styles.btnPurchaseDisabled}`}
                  disabled={currentEvent.availableTickets === 0}
                >
                  {currentEvent.availableTickets > 0 ? 'Comprar' : 'Agotado'}
                </button>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <p className={styles.eventCarouselEmpty}>No hay eventos disponibles.</p>
      )}
      
      <button
        onClick={onNextEvent}
        className={`${styles.carouselNavigationBtn} ${styles.carouselNavigationBtnNext}`}
        title="Siguiente evento"
        aria-label="Siguiente evento"
      >
        <i className={`fas fa-chevron-right ${styles.carouselNavigationIcon}`}></i>
      </button>
    </div>
  );
};

export default Carousel;
