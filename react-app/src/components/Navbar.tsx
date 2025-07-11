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
          <li><Link to="/mis-entradas" className="navbar-menu-item">Mis Entradas</Link></li>
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

// Footer agregado para consultas
import whatsappLogo from '../assets/whatsapp.png';

const Footer: React.FC = () => (
  <footer className="footer">
    <span className="footer-text">&copy; {new Date().getFullYear()} TicketApp</span>
    <a
      href="https://wa.me/549XXXXXXXXXX" // Reemplaza con el número de la empresa
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      <img src={whatsappLogo} alt="WhatsApp" className="whatsapp-logo" />
    </a>
  </footer>
);

export { Footer }; 