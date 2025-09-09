import React, { useState, useEffect } from 'react';
import { useEvents } from '../../shared/context/EventsContext';
import { useCart } from '../../shared/context/CartContext';
import { useMessage } from '../../shared/context/MessageContext';
import { useAuth } from '../../shared/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Carousel from './Carousel';
import PurchaseModal from './PurchaseModal';
import styles from './styles/UserHomePage.module.css';
import globalStyles from '../../shared/styles/GlobalStyles.module.css';
import type { Ticket } from '../../App';

const HomePage: React.FC = () => {
  const { featuredTickets, approvedTickets, updateAvailableTickets } = useEvents();
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  const { addToCart } = useCart();
  const { setAppMessage } = useMessage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (featuredTickets.length > 0 && currentEventIndex >= featuredTickets.length) {
      setCurrentEventIndex(0);
    }
  }, [featuredTickets, currentEventIndex]);

  // Auto-rotación del carousel
  useEffect(() => {
    if (featuredTickets.length === 0) return;
    const interval = setInterval(() => {
      setCurrentEventIndex(prevIndex =>
        prevIndex === featuredTickets.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000); 
    return () => clearInterval(interval);
  }, [featuredTickets]);

  const goToPreviousEvent = () => {
    if (featuredTickets.length === 0) return;
    setCurrentEventIndex(prevIndex =>
      prevIndex === 0 ? featuredTickets.length - 1 : prevIndex - 1
    );
  };

  const goToNextEvent = () => {
    if (featuredTickets.length === 0) return;
    setCurrentEventIndex(prevIndex =>
      prevIndex === featuredTickets.length - 1 ? 0 : prevIndex + 1
    );
  };


  const handleBuyClick = (ticket: Ticket) => {
    if (!isLoggedIn) {
      setAppMessage('Inicia sesión para poder comprar una entrada', 'info');
      navigate('/login');
    } else {
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

  const eventTypes = Array.from(new Set(approvedTickets.map(ticket => ticket.type)));
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const filteredTickets = selectedType === 'Todos'
    ? approvedTickets
    : approvedTickets.filter(ticket => ticket.type === selectedType);

  const eventsByType: { [key: string]: Ticket[] } = {};
  filteredTickets.forEach(ticket => {
    if (!eventsByType[ticket.type]) eventsByType[ticket.type] = [];
    eventsByType[ticket.type].push(ticket);
  });

  if (approvedTickets.length === 0) {
    return (
      <div className={styles.loadingState}>
        <p className={styles.loadingStateText}>Cargando eventos...</p>
      </div>
    );
  }

  console.log("🚀 featuredTickets:", featuredTickets);
  console.log("🎯 currentEventIndex:", currentEventIndex);


  return (
    <div className={styles.homepage}>
      <main className={styles.homepageMain}>
        <h1 className={styles.homepageTitle}>Eventos destacados</h1>
        <Carousel
          tickets={featuredTickets}
          currentEventIndex={currentEventIndex}
          onPreviousEvent={goToPreviousEvent}
          onNextEvent={goToNextEvent}
          onBuyClick={handleBuyClick}
        />

        <div className={styles.eventTypeFilterContainer}>
          <label htmlFor="event-type-select" className={styles.eventTypeFilterLabel}>Filtrar por tipo:</label>
          <select
            id="event-type-select"
            className={styles.eventTypeFilterSelect}
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Botones de ejemplo con estilos glow */}
        <div className={globalStyles.heroButtons}>
          <button className={globalStyles.glowBtn} onClick={() => navigate('/cart')}>
            Ver Carrito
          </button>
          <button className={globalStyles.glowBtnInverse} onClick={() => navigate('/myTickets')}>
            Mis Entradas
          </button>
        </div>

        <h2 className={styles.eventListTitle}>Todos los Eventos</h2>
        
        <div className={styles.eventListContainer}>
          {Object.keys(eventsByType).length === 0 ? (
            <p className={styles.eventTypeEmpty}>No hay eventos para este tipo.</p>
          ) : (
            Object.entries(eventsByType).map(([type, tickets]) => (
              <div key={type} className={styles.eventTypeSection}>
                <h2 className={styles.eventTypeTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                <div className={styles.eventTypeGallery}>
                  {tickets.map(ticket => (
                    <Link
                      to={`/event/${ticket.id}`}
                      key={ticket.id}
                      className={styles.eventCardLink}
                    >
                      <div className={styles.eventCard}>
                        <img
                          src={ticket.imageUrl}
                          alt={(ticket as any).eventName}
                          className={styles.eventCardImg}
                          onError={e => { e.currentTarget.src = '/ticket.png'; }}
                        />
                        <div className={styles.eventCardTitle}>{(ticket as any).eventName}</div>
                        {ticket.agotado && (
                          <div className={styles.eventCardSoldOut}>Agotado</div>
                        )}
                      </div>

                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
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
