import React from 'react';
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
                  onClick={onLogout}
                  className="btn-secondary" // Puedes usar una clase diferente para "Cerrar Sesión"
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
    </nav>
  );
};

export default Navbar;
