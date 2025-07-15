import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useEvents } from '../context/EventsContext'; // Importa el hook useEvents
import './Navbar.css';

interface NavbarProps {
  isLoggedIn: boolean;
  userName: string | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, userName, onLogout }) => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const { allTickets } = useEvents(); // Obtiene todos los tickets del contexto de eventos
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filtra los eventos reales basados en el término de búsqueda
  const filteredSuggestions = allTickets.filter(ticket =>
    searchQuery && ticket.eventName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Búsqueda activada:', searchQuery);
      const matchedEvent = allTickets.find(ticket =>
        ticket.eventName.toLowerCase() === searchQuery.toLowerCase()
      );

      if (matchedEvent) {
        navigate(`/event/${matchedEvent.id}`); // Navega al detalle del evento
        setSearchQuery(''); // Limpia la barra de búsqueda
      } else {
        // Opcional: Mostrar un mensaje global si no se encontró el evento
        // if (setAppMessage) setAppMessage(`No se encontró el evento "${searchQuery}".`);
        console.log(`No se encontró el evento "${searchQuery}".`);
      }
      setShowSuggestions(false); // Oculta las sugerencias al presionar Enter
    }
  };

  const handleSuggestionClick = (suggestionName: string) => {
    setSearchQuery(suggestionName); // Establece el término de búsqueda con la sugerencia seleccionada
    setShowSuggestions(false); // Oculta las sugerencias

    const matchedEvent = allTickets.find(ticket =>
      ticket.eventName.toLowerCase() === suggestionName.toLowerCase()
    );

    if (matchedEvent) {
      navigate(`/event/${matchedEvent.id}`); // Navega al detalle del evento
      setSearchQuery(''); // Limpia la barra de búsqueda
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="navbar-brand" onClick={() => navigate('/')}><img className="image1" src="ticket.png" alt="logo" />TicketApp</button>
        <div className="navbar-search" ref={searchContainerRef}>
          <img className="search-icon" src="/lupa.png" alt="Buscar" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            className="navbar-search-input"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && searchQuery && (
            <div className="search-dropdown-container">
              <ul className="search-dropdown-list">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((ticket, index) => ( // Mapea directamente el objeto ticket
                    <li
                      key={ticket.id} // Usa el ID del ticket como key
                      className="search-dropdown-item"
                      onClick={() => handleSuggestionClick(ticket.eventName)} // Pasa el nombre del evento
                    >
                      {ticket.eventName}
                    </li>
                  ))
                ) : (
                  <li className="search-dropdown-item no-results">
                    No se encontraron resultados para "{searchQuery}"
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <ul className="navbar-menu">
          <li><button onClick={() => navigate('/myTickets')}className="btn-navbar-menu-item">Mis Entradas
            </button></li>
          <li><button onClick={() => navigate('/help')}className="btn-navbar-menu-item">Ayuda
            </button></li>
          <li className="navbar-cart-container">
            <img className="navbar-cart" src="/cart1.png" alt="Carrito de Compras" />
            <span id="cart-count">{cartCount}</span>
            <button onClick={() => navigate('/cart')}
              className="btn"></button>
            </li>

          {isLoggedIn ? (
            <>
              <li className="navbar-auth-section">
                <span className="text-gray-700 font-semibold mr-2">Hola, {userName}</span>
                <button
                  onClick={handleLogoutClick}
                  className="btn-logout" 
                >
                  Cerrar Sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-auth-section"> 
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary"
                >
                  Iniciar Sesión
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-outline-primary"
                >
                  Registrarse
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-modal">
            <p className="logout-confirm-message">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="logout-confirm-actions">
              <button onClick={handleConfirmLogout} className="btn-logout-confirm-yes">Sí</button>
              <button onClick={handleCancelLogout} className="btn-logout-confirm-no">No</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
