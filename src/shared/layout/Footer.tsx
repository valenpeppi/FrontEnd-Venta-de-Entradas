import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/shared/layout/styles/Footer.module.css';
import logoTicket from '@/assets/ticket.png';
import facebookIcon from '@/assets/facebook.png';
import twitterIcon from '@/assets/x.png';
import instagramIcon from '@/assets/instagram.png';
import visaIcon from '@/assets/visa.png';
import mastercardIcon from '@/assets/mastercard.png';
import paypalIcon from '@/assets/paypal.png';

import { useAuth } from '@/hooks/useAuth';


const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(path);
  };
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerBrandSection}>
          <button
            className={styles.footerBrand}
            onClick={() => handleNavigate('/')}
          >
            <img className={styles.footerLogo} src={logoTicket} alt="TicketApp Logo" />
            <span>TicketApp</span>
          </button>
          <p className={styles.footerSlogan}>
            Encuentra los mejores eventos cerca de ti
          </p>

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
          {user?.role !== 'company' && user?.role !== 'admin' && (
            <div className={styles.footerLinksColumn}>
              <h4>Eventos</h4>
              <ul>
                <li><button onClick={() => handleNavigate('/searchedEvents?query=concierto')}>Conciertos</button></li>
                <li><button onClick={() => handleNavigate('/searchedEvents?query=evento%20deportivo')}>Eventos Deportivos</button></li>
                <li><button onClick={() => handleNavigate('/searchedEvents?query=fiesta')}>Fiestas</button></li>
                <li><button onClick={() => handleNavigate('/searchedEvents?query=arte')}>Exposiciones de Arte</button></li>
                <li><button onClick={() => handleNavigate('/searchedEvents?query=festival')}>Festival</button></li>
                <li><button onClick={() => handleNavigate('/searchedEvents?query=stand%20up')}>Stand Ups</button></li>
              </ul>
            </div>
          )}

          <div className={styles.footerLinksColumn}>
            <h4>Compañía</h4>
            <ul>
              <li><button onClick={() => handleNavigate('/about')}>Sobre nosotros</button></li>
              {!isAdmin && <li><button onClick={() => handleNavigate('/contact')}>Contacto</button></li>}
            </ul>
          </div>

          <div className={styles.footerLinksColumn}>
            <h4>Ayuda</h4>
            <ul>
              <li><button onClick={() => handleNavigate('/help')}>Centro de ayuda</button></li>
              <li><button onClick={() => handleNavigate('/privacy')}>Privacidad</button></li>
              <li><button onClick={() => handleNavigate('/terms')}>Términos y condiciones</button></li>
              <li><button onClick={() => handleNavigate('/faq')}>Preguntas frecuentes</button></li>
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
