import React, { useState, useEffect } from 'react';
import { useEvents } from '../../shared/context/EventsContext';
import { useCart } from '../../shared/context/CartContext';
import { useMessage } from '../../shared/context/MessageContext';
import { useAuth } from '../../shared/context/AuthContext'; // Importa el hook de autenticación
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate
import Carousel from './Carousel';
import PurchaseModal from './PurchaseModal';
import './styles/UserHomePage.css';
import type { Ticket } from '../../App';

const HomePage: React.FC = () => {
  const { allTickets, updateAvailableTickets } = useEvents();
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  const { addToCart } = useCart();
  const { setAppMessage } = useMessage();
  const { isLoggedIn } = useAuth(); // Obtiene el estado de la sesión
  const navigate = useNavigate(); // Hook para redirigir

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
    if (!isLoggedIn) {
      // Si el usuario no ha iniciado sesión
      setAppMessage('Inicia sesión para poder comprar una entrada', 'info');
      navigate('/login'); // Redirige a la página de login
    } else {
      // Si el usuario ha iniciado sesión, abre el modal de compra
      setSelectedTicket(ticket);
      setQuantity(1);
      setShowPurchaseModal(true);
      setAppMessage(null);
    }
  };

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setSelectedTicket(null);
  };

  const handleConfirmPurchase = (purchasedQuantity: number) => {
    if (!selectedTicket) {
      setAppMessage('Ha ocurrido un error. Por favor, intente de nuevo.');
      handleCloseModal();
      return;
    }

    const wasAdded = addToCart(selectedTicket, purchasedQuantity);
    if (!wasAdded) {
      setAppMessage('No puedes tener más de 3 entradas para este evento en tu carrito.');
      return;
    }
    
    updateAvailableTickets(selectedTicket.id, purchasedQuantity);

    setAppMessage(`¡Has agregado ${purchasedQuantity} entradas para ${selectedTicket.eventName} al carrito!`);
    handleCloseModal();
  };

  // (El resto del componente sigue igual)
  const eventTypes = Array.from(new Set(allTickets.map(ticket => ticket.type)));
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const filteredTickets = selectedType === 'Todos'
    ? allTickets
    : allTickets.filter(ticket => ticket.type === selectedType);

  const eventsByType: { [key: string]: Ticket[] } = {};
  filteredTickets.forEach(ticket => {
    if (!eventsByType[ticket.type]) eventsByType[ticket.type] = [];
    eventsByType[ticket.type].push(ticket);
  });

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

        <div className="event-type-filter-container event-type-filter-left">
          <label htmlFor="event-type-select" className="event-type-filter-label">Filtrar por tipo:</label>
          <select
            id="event-type-select"
            className="event-type-filter-select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        <h2 className="event-list-title">Eventos por tipo</h2>
        <div className="event-list-by-type">
          {Object.keys(eventsByType).length === 0 && (
            <p className="event-type-empty">No hay eventos para este tipo.</p>
          )}
          {Object.entries(eventsByType).map(([type, tickets]) => (
            <div key={type} className="event-type-section">
              <h2 className="event-type-title">{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
              <div className="event-type-gallery event-type-gallery">
                {tickets.map(ticket => (
                  <Link
                    to={`/event/${ticket.id}`}
                    key={ticket.id}
                    className="event-card-link"
                  >
                    <div className="event-card">
                      <img
                        src={ticket.imageUrl}
                        alt={ticket.eventName}
                        className="event-card-img"
                        onError={e => { e.currentTarget.src = '/public/ticket.png'; }}
                      />
                      <div className="event-card-title">{ticket.eventName}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
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
