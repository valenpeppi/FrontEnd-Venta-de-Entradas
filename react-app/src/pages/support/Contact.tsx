import React from 'react';
import SupportLayout from '../../shared/components/SupportLayout';
import styles from './styles/Contact.module.css';
import { FaEnvelope, FaPhone } from 'react-icons/fa';

const Contact: React.FC = () => {
  return (
    <SupportLayout
      title="Contacto"
      subtitle="¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte."
    >
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
    </SupportLayout>
  );
};

export default Contact;
