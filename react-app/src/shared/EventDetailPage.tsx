import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../shared/context/EventsContext';
import { useCart } from '../shared/context/CartContext';
import { useMessage } from '../shared/context/MessageContext';
import PurchaseModal from '../pages/userHomePage/PurchaseModal';
import type { Ticket } from '../App';
import './styles/EventDetailPage.css';
import "./layout/styles/Layout.css";

interface EventDetailPageProps {
  // Removed setAppMessage prop
}

const EventDetailPage: React.FC<EventDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const { allTickets, updateAvailableTickets } = useEvents();
  const [event, setEvent] = useState<Ticket | undefined>(undefined);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setAppMessage } = useMessage();

  useEffect(() => {
    if (id && allTickets.length > 0) {
      const foundEvent = allTickets.find(ticket => ticket.id === id);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        setAppMessage('Evento no encontrado.');
        navigate('/');
      }
    }
  }, [id, allTickets, navigate, setAppMessage]);

  const handleBuyClick = () => {
    if (event) {
      setQuantity(1);
      setModalErrorMessage(null);
      setShowPurchaseModal(true);
      setAppMessage(null);
    }
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setEvent(undefined);
  };

  const handleConfirmPurchase = (purchasedQuantity: number) => {
    if (!event) {
      setAppMessage('Ha ocurrido un error. Por favor, intente de nuevo.');
      handleCloseModal();
      return;
    }

    const wasAdded = addToCart(event, purchasedQuantity);
    if (!wasAdded) {
      setModalErrorMessage('No puedes tener más de 3 entradas para este evento en tu carrito.');
      return;
    }

    updateAvailableTickets(event.id, purchasedQuantity);
    setAppMessage(`¡Has agregado ${purchasedQuantity} entradas para ${event.eventName} al carrito!`);
    handleCloseModal();
  };

  if (!event) {
    return (
      <div className="loading-state">
        <p className="loading-state-text">Cargando evento...</p>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      <div className="event-detail-card">
        <div className="event-image-container">
          <img src={event.imageUrl} alt={event.eventName} className="event-image" />
        </div>
        
        <div className="event-info">
          <h1 className="event-title">{event.eventName}</h1>
          
          <div className="event-details">
            <div className="event-detail-item">
              <span className="detail-label">Fecha:</span>
              <span className="detail-value">{event.date}</span>
            </div>
            
            <div className="event-detail-item">
              <span className="detail-label">Hora:</span>
              <span className="detail-value">{event.time}</span>
            </div>
            
            <div className="event-detail-item">
              <span className="detail-label">Ubicación:</span>
              <span className="detail-value">{event.location}</span>
            </div>
            
            <div className="event-detail-item">
              <span className="detail-label">Precio:</span>
              <span className="detail-value price">${event.price.toFixed(2)}</span>
            </div>
            
            <div className="event-detail-item">
              <span className="detail-label">Entradas disponibles:</span>
              <span className="detail-value">{event.availableTickets}</span>
            </div>
          </div>
          
          <div className="event-actions">
            <button 
              onClick={handleBuyClick}
              className="buy-button"
              disabled={event.availableTickets === 0}
            >
              {event.availableTickets === 0 ? 'Agotado' : 'Comprar Entradas'}
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="back-button"
            >
              Volver a Eventos
            </button>
          </div>
        </div>
      </div>

      <PurchaseModal
        isOpen={showPurchaseModal}
        selectedTicket={event}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onConfirmPurchase={handleConfirmPurchase}
        onCloseModal={handleCloseModal}
        errorMessage={modalErrorMessage}
      />
    </div>
  );
};

export default EventDetailPage;
