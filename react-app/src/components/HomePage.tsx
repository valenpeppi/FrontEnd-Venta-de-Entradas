import React, { useState, useEffect } from 'react';
import Carousel from './Carousel';
import PurchaseModal from './PurchaseModal';
import { useCart } from '../context/CartContext';
import { useEvents } from '../context/EventsContext';
import './HomePage.css';


export interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
  time: string;
}

interface HomePageProps {
  setAppMessage?: (message: string | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setAppMessage }) => {
  const { allTickets, setAllTickets } = useEvents();
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  const { addToCart } = useCart();

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

    const wasAdded = addToCart(selectedTicket, purchasedQuantity);
    if (!wasAdded) {
      if (setAppMessage) setAppMessage('No puedes tener más de 3 entradas para este evento en tu carrito.');
      return;
    }
    
    setAllTickets((prevTickets: Ticket[]) =>
      prevTickets.map((ticket: Ticket) =>
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
      <h1 className="homepage-title">Eventos destacados</h1>
      <Carousel
        tickets={allTickets}
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
