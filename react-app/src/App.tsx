import React, { useState, useEffect } from 'react';
import Login from './login.tsx'; 
import Register from './register.tsx'; 

// Definición de la interfaz para una entrada
interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl: string;}

const App: React.FC = () => {
  // Estado para controlar qué vista se muestra: 'main_app', 'login', 'register'
  const [currentView, setCurrentView] = useState<'main_app' | 'login' | 'register'>('main_app'); 

  //Estados para manejo
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
        { id: '1', eventName: 'Concierto de Rock', date: '2025-07-20', location: 'Estadio Nacional', price: 50.00, availableTickets: 100, imageUrl: 'https://placehold.co/600x400/FF5733/FFFFFF?text=Concierto' },
        { id: '2', eventName: 'Obra de Teatro Clásica', date: '2025-08-10', location: 'Teatro Municipal', price: 30.00, availableTickets: 50, imageUrl: 'https://placehold.co/600x400/33FF57/FFFFFF?text=Teatro' },
        { id: '3', eventName: 'Festival de Cine Independiente', date: '2025-09-01', location: 'Centro Cultural', price: 20.00, availableTickets: 200, imageUrl: 'https://placehold.co/600x400/3357FF/FFFFFF?text=Cine' },
        { id: '4', eventName: 'Espectáculo de Magia', date: '2025-09-15', location: 'Teatro Fantasía', price: 25.00, availableTickets: 75, imageUrl: 'https://placehold.co/600x400/FF33CC/FFFFFF?text=Magia' },
        { id: '5', eventName: 'Exposición de Arte Moderno', date: '2025-10-05', location: 'Galería Central', price: 15.00, availableTickets: 150, imageUrl: 'https://placehold.co/600x400/33CCFF/FFFFFF?text=Arte' },
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

    if (quantity <= 0) {
      setModalErrorMessage('Por favor, selecciona una cantidad válida.');
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
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-gray-600 text-xl">Cargando eventos...</p>
            </div>
          );
        }
        const currentEvent = tickets[currentEventIndex];

        return (
          <>
            <nav className="bg-white shadow-md p-4 sticky top-0 z-40">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-700">TicketApp</h1>
                <ul className="flex space-x-6 items-center"> 
                  <li><a href="#" className="text-gray-600 hover:text-indigo-700 font-medium">Inicio</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-700 font-medium">Mis Entradas</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-indigo-700 font-medium">Ayuda</a></li>
                  <li className="ml-6"> 
                    <button
                      onClick={() => setCurrentView('login')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Iniciar Sesión
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentView('register')}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-full shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Registrarse
                    </button>
                  </li>
                </ul>
              </div>
            </nav>

            <main className="container mx-auto p-6 md:p-8">
              <div className="relative">
                <MessageDisplay message={appMessage} type={appMessage?.includes('comprado') ? 'success' : 'error'} />
              </div>

              <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 text-center animate-fade-in-down">Eventos Destacados</h2>

              {/* Contenedor del Carrusel */}
              <div className="relative flex items-center justify-center w-full max-w-4xl mx-auto py-8"> {/* Añadido padding vertical */}
                <button
                  onClick={goToPreviousEvent}
                  className="absolute -left-10 md:-left-12 p-3 bg-gray-200 text-gray-700 rounded-full shadow-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
                >
                  <i className="fas fa-chevron-left text-2xl"></i>
                </button>

                {/* Contenido del Evento Actual */}
                {currentEvent ? (
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col justify-between w-full max-w-2xl mx-auto"> {/* Aumentado el tamaño con max-w-2xl */}
                    <img
                      src={currentEvent.imageUrl}
                      alt={currentEvent.eventName}
                      className="w-full h-64 object-cover rounded-lg mb-4" 
                    />
                    <div>
                      <h3 className="text-3xl font-semibold text-gray-900 mb-2">{currentEvent.eventName}</h3>
                      <p className="text-gray-700 text-lg mb-1"><i className="fas fa-calendar-alt mr-2 text-indigo-500"></i>{currentEvent.date}</p>
                      <p className="text-gray-700 text-lg mb-4"><i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i>{currentEvent.location}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-4xl font-bold text-indigo-700">${currentEvent.price.toFixed(2)}</span> 
                      <button
                        onClick={() => handleBuyClick(currentEvent)}
                        className={`px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 text-lg
                          ${currentEvent.availableTickets > 0 ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' : 'bg-gray-400 cursor-not-allowed'}`
                        }
                        disabled={currentEvent.availableTickets === 0}
                      >
                        {currentEvent.availableTickets > 0 ? `Comprar (${currentEvent.availableTickets} restantes)` : 'Agotado'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-xl">No hay eventos disponibles.</p>
                )}
                {/* Botones de navegación del carrusel */}
                <button
                  onClick={goToNextEvent}
                  className="absolute -right-10 md:-right-12 p-3 bg-gray-200 text-gray-700 rounded-full shadow-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 z-10"
                >
                  <i className="fas fa-chevron-right text-2xl"></i>
                </button>
              </div>
            </main>

            {showPurchaseModal && selectedTicket && (
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-scale-in">
                  <h3 className="text-3xl font-bold text-indigo-800 mb-6 text-center">Comprar Entradas</h3>
                  <div className="mb-4">
                    <p className="text-gray-700 text-lg mb-2">Evento: <span className="font-semibold">{selectedTicket.eventName}</span></p>
                    <p className="text-gray-700 text-lg mb-2">Precio por entrada: <span className="font-semibold">${selectedTicket.price.toFixed(2)}</span></p>
                    <p className="text-gray-700 text-lg mb-4">Entradas disponibles: <span className="font-semibold">{selectedTicket.availableTickets}</span></p>
                  </div>
                  <div className="flex items-center justify-center mb-6">
                    <label htmlFor="quantity" className="text-gray-700 text-lg mr-4">Cantidad:</label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={selectedTicket.availableTickets}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(selectedTicket.availableTickets, parseInt(e.target.value) || 1)))}
                      className="w-24 p-3 border border-gray-300 rounded-md text-center text-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <MessageDisplay message={modalErrorMessage} type="error" />
                  <div className="flex justify-around space-x-4">
                    <button
                      onClick={handleConfirmPurchase}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Confirmar Compra
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter text-gray-800 antialiased">
      {renderContent()}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default App;
