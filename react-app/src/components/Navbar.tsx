import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

// Añade props para el estado de autenticación
interface NavbarProps {
  isLoggedIn: boolean;
  userName: string | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, userName, onLogout }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // Estado para el modal de confirmación

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true); // Muestra el modal de confirmación al hacer clic en "Cerrar Sesión"
  };

  const handleConfirmLogout = () => {
    onLogout(); // Llama a la función de cerrar sesión pasada por props
    setShowLogoutConfirm(false); // Cierra el modal
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false); // Cierra el modal sin cerrar sesión
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="navbar-brand" onClick={() => navigate('/')}><img className="image1" src="ticket.png" alt="logo" />TicketApp</button>
        <div className="navbar-search">
          <img className="search-icon" src="/lupa.png" alt="Buscar" />
          <input type="text" placeholder="Buscar eventos..." className="navbar-search-input" />
          <button className="navbar-search-button"></button>
        </div>
        <ul className="navbar-menu">
          <li><button onClick={() => navigate('/myTickets')}className="btn-navbar-menu-item">Mis Entradas
            </button></li>
          <li><button onClick={() => navigate('/help')}className="btn-navbar-menu-item">Ayuda
            </button></li>
          <li className="navbar-cart-container">
            <img className="navbar-cart" src="/cart1.png" alt="Carrito de Compras" />
            <span id="cart-count">0</span> 
            <button onClick={() => navigate('/cart')}
              className="btn"></button>
            </li>

          {/* Renderizado condicional de botones de autenticación o nombre de usuario */}
          {isLoggedIn ? (
            <>
              <li className="navbar-auth-section">
                <span className="text-gray-700 font-semibold mr-2">Hola, {userName}</span> {/* Muestra el nombre del usuario */}
                <button
                  onClick={handleLogoutClick} // Llama a la función para mostrar el modal
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
                  className="btn-secondary"
                >
                  Registrarse
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-modal">
            <p className="logout-confirm-message">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="logout-confirm-actions">
              {/* Botón "Sí" con estilo más liviano y borde */}
              <button onClick={handleConfirmLogout} className="btn-logout-confirm-yes">Sí</button>
              {/* Botón "No" con estilo más visible y borde */}
              <button onClick={handleCancelLogout} className="btn-logout-confirm-no">No</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
