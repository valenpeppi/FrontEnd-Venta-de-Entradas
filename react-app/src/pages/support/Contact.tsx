import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Contact.module.css';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.contactPage}>
      <div className={styles.contactContainer}>
        <h1 className={styles.contactTitle}>Contacto</h1>
        <p className={styles.contactSubtitle}>
          ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte.
        </p>
        
        <div className={styles.contactMethods}>
          <div className={styles.contactCard}>
            <FaEnvelope className={styles.contactIcon} />
            <h3>Correo Electrónico</h3>
            <p>Te responderemos en un plazo de 24 horas hábiles.</p>
            <a href="mailto:support@ticketapp.com" className={styles.contactLink}>support@ticketapp.com</a>
          </div>
          
          <div className={styles.contactCard}>
            <FaPhone className={styles.contactIcon} />
            <h3>Atención Telefónica</h3>
            <p>Lunes a Viernes, 9:00 a 18:00 hs (ARG)</p>
            <a href="tel:+543415555555" className={styles.contactLink}>+54 (341) 555-5555</a>
          </div>
        </div>

        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default Contact;



