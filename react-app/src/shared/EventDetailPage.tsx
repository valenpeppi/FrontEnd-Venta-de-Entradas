import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from './context/EventsContext';
import { useCart } from './context/CartContext';
import { useMessage } from './context/MessageContext';
import PurchaseModal from '../pages/userHomePage/PurchaseModal';
import type { Ticket } from '../App';
import styles from './styles/EventDetailPage.module.css';

const EventDetailPage: React.FC = () => {
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
      <div className={styles.loadingState}>
        <p className={styles.loadingStateText}>Cargando evento...</p>
      </div>
    );
  }

  return (
    <div className={styles.eventDetailContainer}>
      <div className={styles.eventDetailCard}>
        <div className={styles.eventImageContainer}>
          <img src={event.imageUrl} alt={event.eventName} className={styles.eventImage} />
        </div>
        
        <div className={styles.eventInfo}>
          <h1 className={styles.eventTitle}>{event.eventName}</h1>
          
          <div className={styles.eventDetails}>
            <div className={styles.eventDetailItem}>
              <span className={styles.detailLabel}>Fecha:</span>
              <span className={styles.detailValue}>{event.date}</span>
            </div>
            
            <div className={styles.eventDetailItem}>
              <span className={styles.detailLabel}>Hora:</span>
              <span className={styles.detailValue}>{event.time}</span>
            </div>
            
            <div className={styles.eventDetailItem}>
              <span className={styles.detailLabel}>Ubicación:</span>
              <span className={styles.detailValue}>{event.location}</span>
            </div>
            
            <div className={styles.eventDetailItem}>
              <span className={styles.detailLabel}>Precio:</span>
              <span className={`${styles.detailValue} ${styles.price}`}>${event.price.toFixed(2)}</span>
            </div>
            
            <div className={styles.eventDetailItem}>
              <span className={styles.detailLabel}>Entradas disponibles:</span>
              <span className={styles.detailValue}>{event.availableTickets}</span>
            </div>
          </div>
          
          <div className={styles.eventActions}>
            <button 
              onClick={handleBuyClick}
              className={styles.buyButton}
              disabled={event.availableTickets === 0}
            >
              {event.availableTickets === 0 ? 'Agotado' : 'Comprar Entradas'}
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className={styles.backButton}
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
