import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoTicket from '../../assets/ticket.png';
import cartIcon from '../../assets/cart.png';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();

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
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
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
            onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
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
                      onMouseDown={() => handleSearchItemClick(result.id)}
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
          {isLoggedIn && (user?.role === 'admin' || user?.role === 'company') && (
            <li><Link to="/create-event" className="navbar-menu-item">Crear Evento</Link></li>
          )}
        </ul>

        {/* --- MODIFICACIÓN AQUÍ --- */}
        {/* El carrito solo se muestra si el usuario ha iniciado sesión */}
        {isLoggedIn && (
          <div className="navbar-cart-container">
            <Link to="/cart" className="navbar-menu-item">
              <img src={cartIcon} alt="Carrito de compras" className="navbar-cart" />
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </Link>
          </div>
        )}

        <div className="navbar-auth-section">
          {isLoggedIn ? (
            <div className="navbar-user-section">
              <span className="navbar-username">Hola, {user?.name}</span>
              <button onClick={handleLogoutClick} className="navbar-logout-btn">
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="navbar-login-btn">Iniciar Sesión</Link>
              <Link to="/register" className="navbar-register-btn">Registrarse</Link>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de logout */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <h3>¿Estás seguro de que quieres cerrar sesión?</h3>
            <div className="logout-modal-buttons">
              <button onClick={confirmLogout} className="logout-confirm-btn">
                Sí, cerrar sesión
              </button>
              <button onClick={cancelLogout} className="logout-cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
  