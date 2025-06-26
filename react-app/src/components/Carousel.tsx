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
      <div className="carousel">
        <p className="no-events">No hay eventos disponibles.</p>
      </div>
    );
  }

  const currentEvent = tickets[currentEventIndex];

  return (
    <div className="carousel">
      <button
        onClick={onPreviousEvent}
        className="carousel-btn-left"
        title="Evento anterior"
        aria-label="Evento anterior"
      >
        <i className="fas fa-chevron-left carousel-icon"></i>
      </button>
      
      {currentEvent ? (
        <div className="event-card">
          <img
            src={currentEvent.imageUrl}
            alt={currentEvent.eventName}
            className="event-img"
          />
          <div>
            <h3 className="event-title">{currentEvent.eventName}</h3>
            <p className="event-date">
              <i className="fas fa-calendar-alt event-date-icon"></i>
              {currentEvent.date}
            </p>
            <p className="event-location">
              <i className="fas fa-map-marker-alt event-location-icon"></i>
              {currentEvent.location}
            </p>
          </div>
          <div className="event-footer">
            <span className="event-price">${currentEvent.price.toFixed(2)}</span>
            <button
              onClick={() => onBuyClick(currentEvent)}
              className={`btn-buy${currentEvent.availableTickets > 0 ? '' : ' btn-buy-disabled'}`}
              disabled={currentEvent.availableTickets === 0}
            >
              {currentEvent.availableTickets > 0 ? `Comprar (${currentEvent.availableTickets} restantes)` : 'Agotado'}
            </button>
          </div>
        </div>
      ) : (
        <p className="no-events">No hay eventos disponibles.</p>
      )}
      
      <button
        onClick={onNextEvent}
        className="carousel-btn-right"
        title="Siguiente evento"
        aria-label="Siguiente evento"
      >
        <i className="fas fa-chevron-right carousel-icon"></i>
      </button>
    </div>
  );
};

export default Carousel; 