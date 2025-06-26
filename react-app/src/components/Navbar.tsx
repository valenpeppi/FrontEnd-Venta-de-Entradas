import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-brand" onClick={() => navigate('/')}>TicketApp</h1>
        <ul className="navbar-menu"> 
          <li><Link to="/" className="navbar-menu-item">Inicio</Link></li>
          <li><a href="#" className="navbar-menu-item">Mis Entradas</a></li>
          <li><a href="#" className="navbar-menu-item">Ayuda</a></li>
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