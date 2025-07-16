import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand-section">
          <Link to="/" className="footer-brand">
            <img className="footer-logo" src="ticket.png" alt="TicketApp Logo" />
            <span>TicketApp</span>
          </Link>
          <p className="footer-slogan">Encuentra los mejores eventos cerca de ti</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <img src="/facebook.png" alt="Facebook" />
            </a>
            <a href="#" aria-label="Twitter">
              <img src="/x.png" alt="Twitter" />
            </a>
            <a href="#" aria-label="Instagram">
              <img src="/instagram.png" alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-links-column">
            <h4>Eventos</h4>
            <ul>
              <li><Link to="/events/music">Conciertos</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Compañía</h4>
            <ul>
              <li><a href="/about#sobre-nosotros">Sobre nosotros</a></li>
              <li><a href="/about#contacto">Contacto</a></li>
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

        <div className="footer-newsletter">
          <h4>Suscríbete a nuestro boletín</h4>
          <p>Recibe ofertas exclusivas y novedades</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Tu correo electrónico" required />
            <button type="submit" className="btn-primary">Suscribirse</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} TicketApp. Todos los derechos reservados.</p>
          <div className="footer-payment-methods">
            <img src="/visa.png" alt="Visa" />
            <img src="/mastercard.png" alt="Mastercard" />
            <img src="/paypal.png" alt="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
