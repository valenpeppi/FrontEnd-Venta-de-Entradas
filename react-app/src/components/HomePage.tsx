import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Carousel from './Carousel';
import PurchaseModal from './PurchaseModal';
import MessageDisplay from './MessageDisplay';
import './HomePage.css';

// Definición de la interfaz para una entrada
export interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
}

const HomePage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [appMessage, setAppMessage] = useState<string | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  // useEffect para cargar datos iniciales
  useEffect(() => {
    const dummyTickets: Ticket[] = [
      { id: '1', eventName: 'Miranda', date: '2025-07-20', location: 'Estadio Metropolitano', price: 10000.00, availableTickets: 2000, imageUrl: 'https://placehold.co/600x400/FF5733/FFFFFF?text=Concierto' },
      { id: '2', eventName: 'Nicky Nicole', date: '2025-08-10', location: 'Bioceres Arena', price: 6000.00, availableTickets: 6000, imageUrl: 'https://placehold.co/600x400/33FF57/FFFFFF?text=Trap' },
      { id: '3', eventName: 'Super Otto', date: '2025-09-01', location: 'Complejo Forest', price: 7000.00, availableTickets: 900, imageUrl: 'https://placehold.co/600x400/3357FF/FFFFFF?text=Fiesta' },
      { id: '4', eventName: 'Los Midachi', date: '2025-09-15', location: 'Teatro Opera', price: 4500.00, availableTickets: 100, imageUrl: 'https://placehold.co/600x400/FF33CC/FFFFFF?text=Humor' },
      { id: '5', eventName: 'Exposición de Arte Contemporaneo', date: '2025-10-05', location: 'Centro Cultural Roberto Fontanarrosa', price: 2500.00, availableTickets: 150, imageUrl: 'https://placehold.co/600x400/33CCFF/FFFFFF?text=Arte' },
    ];
    setTickets(dummyTickets);
  }, []);

  // Navegacion del carrusel
  const goToPreviousEvent = () => {
    setCurrentEventIndex(prevIndex =>
      prevIndex === 0 ? tickets.length - 1 : prevIndex - 1
    );
  };

  const goToNextEvent = () => {
    setCurrentEventIndex(prevIndex =>
      prevIndex === tickets.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Funciones para manejar la compra de entradas
  const handleBuyClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setQuantity(1);
    setShowPurchaseModal(true);
    setAppMessage(null);
    setModalErrorMessage(null);
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setSelectedTicket(null);
    setModalErrorMessage(null);
  };

  // Función para simular el proceso de compra
  const handleConfirmPurchase = () => {
    if (!selectedTicket) {
      setModalErrorMessage('Ha ocurrido un error. Por favor, intente de nuevo.');
      return;
    }

    //No permitir comprar más de 3 entradas a la vez
    if (quantity > 3) {
      setModalErrorMessage('No puedes comprar más de 3 entradas a la vez.');
      return;
    }

    if (quantity > selectedTicket.availableTickets) {
      setModalErrorMessage('No hay suficientes entradas disponibles para tu solicitud.');
      return;
    }

    // Si todo es válido, proceder con la compra simulada
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === selectedTicket.id
          ? { ...ticket, availableTickets: ticket.availableTickets - quantity }
          : ticket
      )
    );
    setAppMessage(`¡Has comprado ${quantity} entradas para ${selectedTicket.eventName}!`);
    handleCloseModal();
  };

  // Si no hay tickets, mostrar un mensaje de carga
  if (tickets.length === 0) {
    return (
      <div className="homepage">
        <Navbar />
        <div className="loading-state">
          <p className="loading-state-text">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Navbar />
      
      <main className="homepage-main">
        <div className="notification-container">
          <MessageDisplay 
            message={appMessage} 
            type={appMessage?.includes('comprado') ? 'success' : 'error'} 
          />
        </div>
        
        <h2 className="homepage-title">Eventos Destacados</h2>
        
        <Carousel
          tickets={tickets}
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
        errorMessage={modalErrorMessage}
      />
    </div>
  );
};

export default HomePage; 