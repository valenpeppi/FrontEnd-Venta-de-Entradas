import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Help.module.css';
import { FaQuestionCircle, FaEnvelope, FaInfoCircle } from 'react-icons/fa';

const Help: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.helpPage}>
      <main className={styles.helpContainer}>
        <section className={styles.helpHero}>
          <h1 className={styles.helpTitle}>Centro de Ayuda</h1>
          <p className={styles.helpSubtitle}>Encuentra respuestas a tus preguntas y contáctanos si necesitas más ayuda.</p>
        </section>

        <section className={styles.helpSection}>
          <div className={styles.helpGrid}>
            <div className={styles.helpCard} onClick={() => navigate('/faq')}>
              <FaQuestionCircle className={styles.helpIcon} />
              <h3>Preguntas Frecuentes</h3>
              <p>Encuentra respuestas a las dudas más comunes sobre compras, pagos y eventos.</p>
              <span className={styles.helpLink}>Ir a Preguntas Frecuentes</span>
            </div>
            <div className={styles.helpCard} onClick={() => navigate('/contact')}>
              <FaEnvelope className={styles.helpIcon} />
              <h3>Contacto</h3>
              <p>¿No encuentras lo que buscas? Contáctanos directamente por correo o teléfono.</p>
              <span className={styles.helpLink}>Ver Opciones de Contacto</span>
            </div>
            <div className={styles.helpCard} onClick={() => navigate('/about')}>
              <FaInfoCircle className={styles.helpIcon} />
              <h3>Sobre TicketApp</h3>
              <p>Conoce más sobre nuestra misión y quiénes somos.</p>
              <span className={styles.helpLink}>Leer más</span>
            </div>
          </div>
        </section>
        
        <div className={styles.backButtonContainer}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            Volver
          </button>
        </div>
      </main>
    </div>
  );
};

export default Help;



