import React, { useState, useEffect, useMemo } from 'react';
import Carousel from './Carousel';
import PurchaseModal from './PurchaseModal';
import { useCart } from '../context/CartContext';
import { useEvents } from '../context/EventsContext'; // Importa el hook useEvents

export interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
}

interface HomePageProps {
  setAppMessage?: (message: string | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setAppMessage }) => {
  const { allTickets, setAllTickets } = useEvents(); // Obtiene todos los tickets del contexto
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  const { addToCart } = useCart();

  // No necesitamos un useEffect para cargar dummyTickets aquí, EventsContext lo hace.
  // Pero necesitamos un useEffect para actualizar currentEventIndex cuando allTickets cambian
  useEffect(() => {
    if (currentEventIndex >= allTickets.length && allTickets.length > 0) {
      setCurrentEventIndex(0);
    } else if (allTickets.length === 0) {
      setCurrentEventIndex(0);
    }
  }, [allTickets, currentEventIndex]);


  const goToPreviousEvent = () => {
    setCurrentEventIndex(prevIndex =>
      prevIndex === 0 ? allTickets.length - 1 : prevIndex - 1
    );
  };

  const goToNextEvent = () => {
    setCurrentEventIndex(prevIndex =>
      prevIndex === allTickets.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleBuyClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setQuantity(1);
    setShowPurchaseModal(true);
    if (setAppMessage) setAppMessage(null);
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setSelectedTicket(null);
  };

  const handleConfirmPurchase = (purchasedQuantity: number) => {
    if (!selectedTicket) {
      if (setAppMessage) setAppMessage('Ha ocurrido un error. Por favor, intente de nuevo.');
      handleCloseModal();
      return;
    }

    addToCart(selectedTicket, purchasedQuantity);
    
    // Actualizar la cantidad de tickets disponibles en el estado global de EventsContext
    setAllTickets((prevTickets: Ticket[]) => // Explicitly type prevTickets as Ticket[]
      prevTickets.map((ticket: Ticket) => // Explicitly type ticket as Ticket
        ticket.id === selectedTicket.id
          ? { ...ticket, availableTickets: ticket.availableTickets - purchasedQuantity }
          : ticket
      )
    );

    if (setAppMessage) {
      setAppMessage(`¡Has agregado ${purchasedQuantity} entradas para ${selectedTicket.eventName} al carrito!`);
    }
    handleCloseModal();
  };

  if (allTickets.length === 0) {
    return (
      <div className="loading-state">
        <p className="loading-state-text">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="homepage">
      <main className="homepage-main">
        <h2 className="homepage-title">Eventos Destacados</h2>
        
        <Carousel
          tickets={allTickets} // Siempre pasa todos los tickets al carrusel
          currentEventIndex={currentEventIndex}
          onPreviousEvent={goToPreviousEvent}
          onNextEvent={goToNextEvent}
          onBuyClick={handleBuyClick}
        />
      </main>

      <PurchaseModal
        isOpen={showPurchaseModal}
        selectedTicket={selectedTicket}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onConfirmPurchase={handleConfirmPurchase}
        onCloseModal={handleCloseModal}
        errorMessage={null}
      />
    </div>
  );
};

export default HomePage;
