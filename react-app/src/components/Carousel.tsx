import React from 'react';
import type { Ticket } from './HomePage';
import './Carousel.css';

interface CarouselProps {
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
      <div className="event-carousel">
        <p className="event-carousel-empty">No hay eventos disponibles.</p>
      </div>
    );
  }

  const currentEvent = tickets[currentEventIndex];

  return (
    <div className="event-carousel">
      <button
        onClick={onPreviousEvent}
        className="carousel-navigation-btn carousel-navigation-btn--prev"
        title="Evento anterior"
        aria-label="Evento anterior"
      >
        <i className="fas fa-chevron-left carousel-navigation-icon"></i>
      </button>
      
      {currentEvent ? (
        <div className="event-card">
          <img
            src={currentEvent.imageUrl}
            alt={currentEvent.eventName}
            className="event-card-image"
          />
          <div className="event-card-content">
            <h3 className="event-card-title">{currentEvent.eventName}</h3>
            <p className="event-card-details">
              <i className="fas fa-calendar-alt event-card-icon"></i>
              {currentEvent.date}
            </p>
            <p className="event-card-details">
              <i className="fas fa-map-marker-alt event-card-icon"></i>
              {currentEvent.location}
            </p>
          </div>
          <div className="event-card-footer">
            <span className="event-card-price">${currentEvent.price.toFixed(2)}</span>
            <button
              onClick={() => onBuyClick(currentEvent)}
              className={`btn-purchase${currentEvent.availableTickets > 0 ? '' : ' btn-purchase--disabled'}`}
              disabled={currentEvent.availableTickets === 0}
            >
              {currentEvent.availableTickets > 0 ? `Comprar (${currentEvent.availableTickets} restantes)` : 'Agotado'}
            </button>
          </div>
        </div>
      ) : (
        <p className="event-carousel-empty">No hay eventos disponibles.</p>
      )}
      
      <button
        onClick={onNextEvent}
        className="carousel-navigation-btn carousel-navigation-btn--next"
        title="Siguiente evento"
        aria-label="Siguiente evento"
      >
        <i className="fas fa-chevron-right carousel-navigation-icon"></i>
      </button>
    </div>
  );
};

export default Carousel; 