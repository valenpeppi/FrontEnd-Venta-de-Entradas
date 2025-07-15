import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { useCart } from '../context/CartContext';
import PurchaseModal from './PurchaseModal'; // Reutiliza el modal de compra
import type { Ticket } from '../App'; // Importa la interfaz Ticket

import './EventDetailPage.css'; // Crea este archivo CSS para estilos

interface EventDetailPageProps {
  setAppMessage?: (message: string | null) => void;
}

const EventDetailPage: React.FC<EventDetailPageProps> = ({ setAppMessage }) => {
  const { id } = useParams<{ id: string }>(); // Obtiene el ID del evento de la URL
  const navigate = useNavigate();
  const { allTickets, setAllTickets } = useEvents(); // Obtiene todos los tickets del contexto
  const { addToCart } = useCart();

  const [event, setEvent] = useState<Ticket | undefined>(undefined);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Busca el evento por ID en la lista de todos los tickets
    const foundEvent = allTickets.find(ticket => ticket.id === id);
    setEvent(foundEvent);
    if (!foundEvent && id) {
      // Si no se encuentra el evento, podrías redirigir a una página 404 o a la home
      console.warn(`Evento con ID ${id} no encontrado.`);
      // navigate('/'); // Opcional: redirigir a la página principal
    }
  }, [id, allTickets]); // Depende de id y allTickets para re-buscar si cambian

  const handleBuyClick = () => {
    if (event) {
      setQuantity(1); // Reinicia la cantidad a 1
      setModalErrorMessage(null); // Limpia mensajes de error previos
      setShowPurchaseModal(true);
      if (setAppMessage) setAppMessage(null); // Limpia el mensaje global
    }
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setQuantity(1); // Resetear cantidad al cerrar
    setModalErrorMessage(null); // Limpia el mensaje de error del modal
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

    // Añadir al carrito
    addToCart(event, purchasedQuantity);

    // Actualizar la cantidad de tickets disponibles en el contexto de eventos
    setAllTickets((prevTickets: Ticket[]) => // Explicitly type prevTickets as Ticket[]
      prevTickets.map((ticket: Ticket) => // Explicitly type ticket as Ticket
        ticket.id === event!.id // Corrección aquí: Usar el operador de aserción no nula '!'
          ? { ...ticket, availableTickets: ticket.availableTickets - purchasedQuantity }
          : ticket
      )
    );

    if (setAppMessage) {
      setAppMessage(`¡Has agregado ${purchasedQuantity} entradas para ${event.eventName} al carrito!`);
    }
    handleCloseModal(); // Cierra el modal solo si la compra es exitosa
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
          selectedTicket={event} // Pasa el evento actual al modal
          quantity={quantity}
          onQuantityChange={setQuantity}
          onConfirmPurchase={handleConfirmPurchase}
          onCloseModal={handleCloseModal}
          errorMessage={modalErrorMessage} // Pasa el error local del modal
        />
      )}
    </div>
  );
};

export default EventDetailPage;
