import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

// Importa las imágenes desde la carpeta assets
import logoTicket from '../assets/ticket.png';
import facebookIcon from '../assets/facebook.png';
import twitterIcon from '../assets/x.png'; 
import instagramIcon from '../assets/instagram.png';
import visaIcon from '../assets/visa.png';
import mastercardIcon from '../assets/mastercard.png';
import paypalIcon from '../assets/paypal.png';


const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand-section">
          <Link to="/" className="footer-brand">
            <img className="footer-logo" src={logoTicket} alt="TicketApp Logo" />
            <span>TicketApp</span>
          </Link>
          <p className="footer-slogan">Encuentra los mejores eventos cerca de ti</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <img src={facebookIcon} alt="Facebook" />
            </a>
            <a href="#" aria-label="Twitter">
              <img src={twitterIcon} alt="Twitter" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-links-column">
            <h4>Eventos</h4>
            <ul>
              <li><Link to="/events/music">Conciertos</Link></li>
              {/* Puedes añadir más categorías de eventos aquí */}
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Compañía</h4>
            <ul>
              <li><a href="/about#sobre-nosotros">Sobre nosotros</a></li>
              <li><Link to="/help">Contacto</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Ayuda</h4>
            <ul>
              <li><Link to="/help">Centro de ayuda</Link></li>
              <li><Link to="/privacy">Privacidad</Link></li>
              <li><Link to="/terms">Términos y condiciones</Link></li>
              <li><Link to="/faq">Preguntas frecuentes</Link></li>
            </ul>
          </div>
        </div>

        {/* Nuevo contenedor para agrupar Newsletter y Organizadores */}
        <div className="footer-newsletter-organizer-wrapper">
          <div className="footer-newsletter">
            <h4>Suscríbete a nuestro boletín</h4>
            <p>Recibe ofertas exclusivas y novedades</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Tu correo electrónico" required />
              <button type="submit" className="btn-primary">Suscribirse</button>
            </form>
          </div>

          {/* Sección para Organizadores, ahora dentro del nuevo wrapper */}
          <div className="footer-links-column footer-organizer-section">
            <h4>Organizadores</h4>
            <p className="organizer-promo-text">
              ¿Quieres ser organizador de eventos?{' '}
              {/* El texto "¡Regístrate ya!" ahora es un botón/enlace con estilo de btn-outline-primary */}
              <Link to="/registercompany" className="btn-outline-primary">
                ¡Regístrate ya!
              </Link>
            </p>
            <ul>
              <li>
                {/* El botón de Iniciar Sesión usa el estilo de btn-primary */}
                <Link to="/logincompany" className="btn-primary">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} TicketApp. Todos los derechos reservados.</p>
          <div className="footer-payment-methods">
            <img src={visaIcon} alt="Visa" />
            <img src={mastercardIcon} alt="Mastercard" />
            <img src={paypalIcon} alt="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
