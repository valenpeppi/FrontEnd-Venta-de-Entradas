import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/Footer.module.css';

// Importa las imágenes desde la carpeta assets
import logoTicket from '../../assets/ticket.png';
import facebookIcon from '../../assets/facebook.png';
import twitterIcon from '../../assets/x.png'; 
import instagramIcon from '../../assets/instagram.png';
import visaIcon from '../../assets/visa.png';
import mastercardIcon from '../../assets/mastercard.png';
import paypalIcon from '../../assets/paypal.png';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerBrandSection}>
          <Link to="/" className={styles.footerBrand}>
            <img className={styles.footerLogo} src={logoTicket} alt="TicketApp Logo" />
            <span>TicketApp</span>
          </Link>
          <p className={styles.footerSlogan}>Encuentra los mejores eventos cerca de ti</p>
          <div className={styles.footerSocial}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src={facebookIcon} alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <img src={twitterIcon} alt="Twitter" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" />
            </a>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.footerLinksColumn}>
            <h4>Eventos</h4>
            <ul>
              <li><Link to="/">Conciertos</Link></li>
              <li><Link to="/">Deportes</Link></li>
              <li><Link to="/">Teatro</Link></li>
            </ul>
          </div>

          <div className={styles.footerLinksColumn}>
            <h4>Compañía</h4>
            <ul>
              <li><Link to="/about">Sobre nosotros</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </div>

          <div className={styles.footerLinksColumn}>
            <h4>Ayuda</h4>
            <ul>
              <li><Link to="/help">Centro de ayuda</Link></li>
              <li><Link to="/privacy">Privacidad</Link></li>
              <li><Link to="/terms">Términos y condiciones</Link></li>
              <li><Link to="/faq">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          <div className={styles.footerLinksColumn}>
            <h4>Únete</h4>
            <ul className={styles.footerActionLinks}>
              <li>
                <Link to="/newsletter">Recibe ofertas exclusivas</Link>
              </li>
              <li>
                <Link to="/registercompany">Sé un organizador</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContainer}>
          <p>© {new Date().getFullYear()} TicketApp. Todos los derechos reservados.</p>
          <div className={styles.footerPaymentMethods}>
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
