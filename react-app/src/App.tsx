import React, { useState, useEffect } from 'react';
import Login from './components/Login.tsx'; 
import Register from './components/Register.tsx'; 

// Definición de la interfaz para una entrada
interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
}

const App: React.FC = () => {
  // Estado para controlar qué vista se muestra: 'main_app', 'login', 'register'
  const [currentView, setCurrentView] = useState<'main_app' | 'login' | 'register'>('main_app'); 

  //Estados para los manejos
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [appMessage, setAppMessage] = useState<string | null>(null);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  // useEffect para cargar datos iniciales
  useEffect(() => {
    if (currentView === 'main_app') {
      const dummyTickets: Ticket[] = [
        { id: '1', eventName: 'Miranda', date: '2025-07-20', location: 'Estadio Metropolitano', price: 10000.00, availableTickets: 2000, imageUrl: 'https://placehold.co/600x400/FF5733/FFFFFF?text=Concierto' },
        { id: '2', eventName: 'Nicky Nicole', date: '2025-08-10', location: 'Bioceres Arena', price: 6000.00, availableTickets: 6000, imageUrl: 'https://placehold.co/600x400/33FF57/FFFFFF?text=Trap' },
        { id: '3', eventName: 'Super Otto', date: '2025-09-01', location: 'Complejo Forest', price: 7000.00, availableTickets: 900, imageUrl: 'https://placehold.co/600x400/3357FF/FFFFFF?text=Fiesta' },
        { id: '4', eventName: 'Los Midachi', date: '2025-09-15', location: 'Teatro Opera', price: 4500.00, availableTickets: 100, imageUrl: 'https://placehold.co/600x400/FF33CC/FFFFFF?text=Humor' },
        { id: '5', eventName: 'Exposición de Arte Contemporaneo', date: '2025-10-05', location: 'Centro Cultural Roberto Fontanarrosa', price: 2500.00, availableTickets: 150, imageUrl: 'https://placehold.co/600x400/33CCFF/FFFFFF?text=Arte' },
      ];
      setTickets(dummyTickets);
    }
  }, [currentView]); 

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

  // Función para manejar el éxito del login
  const handleLoginSuccess = () => {
    setCurrentView('main_app'); 
  };

  // Función para manejar el registro 
  const handleRegisterSuccess = () => {
    setCurrentView('login');
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  // Componente de Mensaje (para alertas o confirmaciones)
  const MessageDisplay: React.FC<{ message: string | null; type: 'success' | 'error' | 'info' }> = ({ message, type }) => {
    if (!message) return null;
    let bgColor = '';
    let textColor = '';
    switch (type) {
      case 'success':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'error':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'info':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    return (
      <div className={`p-3 rounded-md shadow-sm mb-4 ${bgColor} ${textColor} text-center`}>
        {message}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case 'register': 
        return <Register onRegisterSuccess={handleRegisterSuccess} onGoToLogin={() => setCurrentView('login')} />;
      case 'main_app':
        // Si no hay tickets, mostrar un mensaje de carga o vacío
        if (tickets.length === 0) {
          return (
            <div className="app-center-screen">
              <p className="text-gray-600 text-xl">Cargando eventos...</p>
            </div>
          );
        }
        const currentEvent = tickets[currentEventIndex];

        return (
          <>
            <nav className="app-navbar">
              <div className="app-navbar-container">
                <h1 className="app-navbar-title">TicketApp</h1>
                <ul className="app-navbar-list"> 
                  <li><a href="#" className="app-navbar-link">Inicio</a></li>
                  <li><a href="#" className="app-navbar-link">Mis Entradas</a></li>
                  <li><a href="#" className="app-navbar-link">Ayuda</a></li>
                  <li className="app-navbar-login-btn"> 
                    <button
                      onClick={() => setCurrentView('login')}
                      className="app-btn-login"
                    >
                      Iniciar Sesión
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentView('register')}
                      className="app-btn-register"
                    >
                      Registrarse
                    </button>
                  </li>
                </ul>
              </div>
            </nav>

            <main className="app-main">
              <div className="app-message-container">
                <MessageDisplay message={appMessage} type={appMessage?.includes('comprado') ? 'success' : 'error'} />
              </div>
              <h2 className="app-title">Eventos Destacados</h2>
              <div className="app-carousel">
                <button
                  onClick={goToPreviousEvent}
                  className="app-carousel-btn-left"
                >
                  <i className="fas fa-chevron-left app-carousel-icon"></i>
                </button>
                {currentEvent ? (
                  <div className="app-event-card">
                    <img
                      src={currentEvent.imageUrl}
                      alt={currentEvent.eventName}
                      className="app-event-img"
                    />
                    <div>
                      <h3 className="app-event-title">{currentEvent.eventName}</h3>
                      <p className="app-event-date"><i className="fas fa-calendar-alt app-event-date-icon"></i>{currentEvent.date}</p>
                      <p className="app-event-location"><i className="fas fa-map-marker-alt app-event-location-icon"></i>{currentEvent.location}</p>
                    </div>
                    <div className="app-event-footer">
                      <span className="app-event-price">${currentEvent.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleBuyClick(currentEvent)}
                        className={`app-btn-buy${currentEvent.availableTickets > 0 ? '' : ' app-btn-buy-disabled'}`}
                        disabled={currentEvent.availableTickets === 0}
                      >
                        {currentEvent.availableTickets > 0 ? `Comprar (${currentEvent.availableTickets} restantes)` : 'Agotado'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="app-no-events">No hay eventos disponibles.</p>
                )}
                <button
                  onClick={goToNextEvent}
                  className="app-carousel-btn-right"
                >
                  <i className="fas fa-chevron-right app-carousel-icon"></i>
                </button>
              </div>
            </main>

            {showPurchaseModal && selectedTicket && (
              <div className="app-modal-bg">
                <div className="app-modal">
                  <h3 className="app-modal-title">Comprar Entradas</h3>
                  <div className="app-modal-info">
                    <p className="app-modal-event">Evento: <span className="app-modal-event-name">{selectedTicket.eventName}</span></p>
                    <p className="app-modal-price">Precio por entrada: <span className="app-modal-price-value">${selectedTicket.price.toFixed(2)}</span></p>
                    <p className="app-modal-available">Entradas disponibles: <span className="app-modal-available-value">{selectedTicket.availableTickets}</span></p>
                  </div>
                  <div className="app-modal-quantity-row">
                    <label htmlFor="quantity" className="app-modal-quantity-label">Cantidad:</label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={selectedTicket.availableTickets}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(selectedTicket.availableTickets, parseInt(e.target.value) || 1)))}
                      className="app-modal-quantity-input"
                    />
                  </div>
                  <MessageDisplay message={modalErrorMessage} type="error" />
                  <div className="app-modal-btn-row">
                    <button
                      onClick={handleConfirmPurchase}
                      className="app-modal-btn-confirm"
                    >
                      Confirmar Compra
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="app-modal-btn-cancel"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      {renderContent()}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default App;
