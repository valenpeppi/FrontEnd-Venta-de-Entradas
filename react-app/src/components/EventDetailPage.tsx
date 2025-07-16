import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { useCart } from '../context/CartContext';
import PurchaseModal from './PurchaseModal';
import type { Ticket } from '../App';

import './EventDetailPage.css';

interface EventDetailPageProps {
  setAppMessage?: (message: string | null) => void;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ setAppMessage }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allTickets, setAllTickets } = useEvents();
  const { addToCart } = useCart();

  const [event, setEvent] = useState<Ticket | undefined>(undefined);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const foundEvent = allTickets.find(ticket => ticket.id === id);
    setEvent(foundEvent);
    if (!foundEvent && id) {
      console.warn(`Evento con ID ${id} no encontrado.`);
    }
  }, [id, allTickets]);

  const handleBuyClick = () => {
    if (event) {
      setQuantity(1);
      setModalErrorMessage(null);
      setShowPurchaseModal(true);
      if (setAppMessage) setAppMessage(null);
    }
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setQuantity(1);
    setModalErrorMessage(null);
  };

  const handleConfirmPurchase = (purchasedQuantity: number) => {
    if (!event) {
      setModalErrorMessage('Ha ocurrido un error. No se encontró el evento.');
      return;
    }

    if (purchasedQuantity <= 0) {
      setModalErrorMessage('La cantidad debe ser al menos 1.');
      return;
    }

    if (purchasedQuantity > 3) {
      setModalErrorMessage('No puedes comprar más de 3 entradas a la vez.');
      return;
    }

    if (event.availableTickets < purchasedQuantity) {
      setModalErrorMessage('No hay suficientes entradas disponibles para tu solicitud.');
      return;
    }

    // Validación acumulada
    const wasAdded = addToCart(event, purchasedQuantity);
    if (!wasAdded) {
      setModalErrorMessage('No puedes tener más de 3 entradas para este evento en tu carrito.');
      return;
    }

    setAllTickets((prevTickets: Ticket[]) =>
      prevTickets.map((ticket: Ticket) =>
        ticket.id === event!.id
          ? { ...ticket, availableTickets: ticket.availableTickets - purchasedQuantity }
          : ticket
      )
    );

    if (setAppMessage) {
      setAppMessage(`¡Has agregado ${purchasedQuantity} entradas para ${event.eventName} al carrito!`);
    }
    handleCloseModal();
  };

  if (!event) {
    return (
      <div className="event-detail-loading">
        <p>Cargando detalles del evento...</p>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-card">
        <img src={event.imageUrl} alt={event.eventName} className="event-detail-image" />
        <div className="event-detail-content">
          <h1 className="event-detail-title">{event.eventName}</h1>
          <p className="event-detail-info">
            <i className="fas fa-calendar-alt"></i> Fecha: {event.date}
          </p>
          <p className="event-detail-info">
            <i className="fas fa-clock"></i> Hora: {event.time}
          </p>
          <p className="event-detail-info">
            <i className="fas fa-map-marker-alt"></i> Lugar: {event.location}
          </p>
          <p className="event-detail-price">Precio: ${event.price.toFixed(2)}</p>
          <p className="event-detail-available">
            Entradas disponibles: {event.availableTickets}
          </p>
          <button
            onClick={handleBuyClick}
            className={`btn-purchase ${event.availableTickets > 0 ? '' : 'btn-purchase--disabled'}`}
            disabled={event.availableTickets === 0}
          >
            {event.availableTickets > 0 ? 'Comprar Entradas' : 'Agotado'}
          </button>
          <button onClick={() => navigate('/')} className="btn-back-home">
            Volver a la página principal
          </button>
        </div>
      </div>

      {showPurchaseModal && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          selectedTicket={event}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onConfirmPurchase={handleConfirmPurchase}
          onCloseModal={handleCloseModal}
          errorMessage={modalErrorMessage}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
