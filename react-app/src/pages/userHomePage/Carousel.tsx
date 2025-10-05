import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Ticket } from '../../shared/context/CartContext';
import styles from './styles/Carousel.module.css';
import GlobalStyles from '../../shared/styles/GlobalStyles.module.css';
import { MdAccessTime, MdCalendarToday, MdLocationOn } from "react-icons/md";

export interface CarouselProps {
  tickets: Ticket[];
  currentEventIndex: number;
  onPreviousEvent: () => void;
  onNextEvent: () => void;
}

const Carousel: React.FC<CarouselProps> = ({
  tickets,
  currentEventIndex,
  onPreviousEvent,
  onNextEvent,
}) => {
  const navigate = useNavigate();

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
        <div className={styles.eventCard}>
          <img
            src={currentEvent.imageUrl}
            alt={currentEvent.eventName}
            className={styles.eventCardImage}
            onError={e => { e.currentTarget.src = '/ticket.png'; }}
          />
          <div className={styles.eventCardDetailsWrapper}>
            <div className={styles.eventCardContent}>
              <h3 className={styles.eventCardTitle}>{currentEvent.eventName}</h3>
              <div className={styles.eventCardMeta}>
                {currentEvent.description && (
                  <div className={styles.eventCardDescription}>
                    <span className={styles.eventCardText}>
                      {currentEvent.description}
                    </span>
                  </div>
                )}
               <div className={styles.eventCardDetailItem}>
                  <MdCalendarToday className={styles.eventCardIcon} />
                  <span className={styles.eventCardText}>{currentEvent.date}</span>
                </div>
                <div className={styles.eventCardDetailItem}>
                  <MdAccessTime className={styles.eventCardIcon} />
                  <span className={styles.eventCardText}>{currentEvent.time}</span>
                </div>
                <div className={styles.eventCardDetailItem}>
                  <MdLocationOn className={styles.eventCardIcon} />
                  <span className={styles.eventCardText}>{currentEvent.location}</span>
                </div>

              </div>
            </div>
            <div className={styles.eventCardFooter}>
              <span className={styles.eventCardPrice}>Desde ${currentEvent.price.toFixed(2)}</span>
              <br />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/event/${currentEvent.id}`);
                }}
                className={`${GlobalStyles.glowBtnInverse} ${currentEvent.availableTickets > 0 ? '' : styles.btnPurchaseDisabled}`}
                disabled={currentEvent.availableTickets === 0}
              >
                {currentEvent.availableTickets > 0 ? 'Comprar' : 'Agotado'}
              </button>
            </div>
          </div>
        </div>
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
