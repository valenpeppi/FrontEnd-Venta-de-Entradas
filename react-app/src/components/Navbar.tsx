import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
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
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 