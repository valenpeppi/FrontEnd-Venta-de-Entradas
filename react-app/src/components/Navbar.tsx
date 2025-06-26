import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title" onClick={() => navigate('/')}>TicketApp</h1>
        <ul className="navbar-list"> 
          <li><Link to="/" className="navbar-link">Inicio</Link></li>
          <li><a href="#" className="navbar-link">Mis Entradas</a></li>
          <li><a href="#" className="navbar-link">Ayuda</a></li>
          <li className="navbar-login-btn"> 
            <button
              onClick={() => navigate('/login')}
              className="btn-login"
            >
              Iniciar Sesión
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/register')}
              className="btn-register"
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