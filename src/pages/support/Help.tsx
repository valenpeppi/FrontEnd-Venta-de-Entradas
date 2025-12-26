import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupportLayout from '@/shared/components/SupportLayout';
import styles from '@/pages/support/styles/Help.module.css';
import { FaQuestionCircle, FaEnvelope, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';


const Help: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <SupportLayout
      title="Centro de Ayuda"
      subtitle="Encuentra respuestas a tus preguntas y contáctanos si necesitas más ayuda."
      transparent
    >
      <div className={styles.helpSection}>
        <div className={styles.helpGrid}>
          <div className={styles.helpCard} onClick={() => navigate('/faq')}>
            <FaQuestionCircle className={styles.helpIcon} />
            <h3>Preguntas Frecuentes</h3>
            <p>Resuelve tus dudas rápidamente sobre el proceso de compra, métodos de pago y gestión de entradas.</p>
            <span className={styles.helpLink}>Ver Preguntas Frecuentes</span>
          </div>
          <div className={styles.helpCard} onClick={() => navigate('/contact')}>
            <FaEnvelope className={styles.helpIcon} />
            <h3>Contacto</h3>
            <p>¿Tienes un problema específico? Envíanos un mensaje y te responderemos a la brevedad.</p>
            <span className={styles.helpLink}>Contactar Soporte</span>
          </div>
          <div className={styles.helpCard} onClick={() => navigate('/about')}>
            <FaInfoCircle className={styles.helpIcon} />
            <h3>Sobre TicketApp</h3>
            <p>Conoce más sobre nuestra misión y quiénes somos.</p>
            <span className={styles.helpLink}>Leer más</span>
          </div>
          { }
          <div className={styles.helpCard} onClick={handleProfileClick}>
            <FaQuestionCircle className={styles.helpIcon} />
            <h3>Mi Perfil</h3>
            <p>Gestiona tus datos personales y preferencias de cuenta.</p>
            <span className={styles.helpLink}>Ir a mi Perfil</span>
          </div>
        </div>
      </div>
    </SupportLayout>
  );
};

export default Help;
