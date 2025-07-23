import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Asegúrate de que este archivo CSS existe
import logoTicket from '../assets/ticket.png'; // Importa la imagen del logo
import cartIcon from '../assets/cart.png'; // Importa la imagen del carrito
import { useCart } from '../context/CartContext'; // Importa el hook useCart

interface NavbarProps {
  isLoggedIn: boolean;
  userName: string | null;
  onLogout: () => void;
  userRole: string | null; // Mantenemos userRole aunque ya no se use para la visibilidad del botón de crear evento
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, userName, onLogout, userRole }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Puedes tipar esto mejor
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart(); // Obtiene el cartCount del contexto del carrito

  // Función de búsqueda simulada (reemplazar con tu lógica de backend)
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      // Aquí harías una llamada a tu API de búsqueda de eventos
      // const response = await fetch(`/api/events/search?q=${term}`);
      // const data = await response.json();
      // setSearchResults(data);
      // Simulando resultados
      setSearchResults([
        { id: '1', name: 'Concierto de Verano' },
        { id: '2', name: 'Festival de Jazz' },
      ]);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchItemClick = (id: string) => {
    navigate(`/event/${id}`);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
    navigate('/login'); // Redirigir al login después de cerrar sesión
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          {/* Usa la imagen importada para el logo */}
          <img src={logoTicket} alt="TicketApp Logo" className="image1" />
          TicketApp
        </Link>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Buscar eventos..."
            className="navbar-search-input"
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 100)} // Retraso para permitir el clic
          />
          <i className="fas fa-search search-icon"></i>
          {showDropdown && (
            <div className="search-dropdown-container">
              <ul className="search-dropdown-list">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <li
                      key={result.id}
                      className="search-dropdown-item"
                      onMouseDown={() => handleSearchItemClick(result.id)} // Usar onMouseDown para que se active antes que onBlur
                    >
                      {result.name}
                    </li>
                  ))
                ) : (
                  <li className="search-dropdown-item no-results">No hay resultados</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <ul className="navbar-menu">
          <li><Link to="/help" className="navbar-menu-item">Ayuda</Link></li>
          {isLoggedIn && <li><Link to="/myTickets" className="navbar-menu-item">Mis Entradas</Link></li>}
          {/* Mueve el carrito AQUI, como un item de menú */}
          <li>
            <div className="navbar-cart-container"> {/* Mantén este wrapper para posicionar el contador */}
              <Link to="/cart" className="navbar-menu-item"> {/* Aplica el estilo de item de menú al enlace */}
                <img src={cartIcon} alt="Carrito de compras" className="navbar-cart" />
                <span id="cart-count">{cartCount}</span> {/* Muestra el cartCount dinámico */}
              </Link>
            </div>
          </li>
        </ul>

        <div className="navbar-auth-section">
          {isLoggedIn ? (
            <>
              <span className="navbar-username">Hola, {userName}</span>
              {/* Botón para crear evento, ahora visible si está logueado (sin importar el rol) */}
              {isLoggedIn && (
                <Link to="/create-event" className="btn-primary create-event-btn">
                  Crear Evento
                </Link>
              )}
              <button onClick={handleLogoutClick} className="btn-logout">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-outline-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-modal">
            <p className="logout-confirm-message">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="logout-confirm-actions">
              <button onClick={confirmLogout} className="btn-logout-confirm-yes">Sí, cerrar sesión</button>
              <button onClick={cancelLogout} className="btn-logout-confirm-no">No, cancelar</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
