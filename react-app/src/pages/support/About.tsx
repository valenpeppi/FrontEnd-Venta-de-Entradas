import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/About.module.css';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutContainer}>
        <h1 className={styles.aboutTitle}>Sobre TicketApp</h1>
        <p className={styles.aboutDescription}>
          TicketApp es líder en la venta de entradas para los mejores eventos de música, deportes, teatro y entretenimiento en todo el país. Nuestra tarea es acercar a las personas a experiencias inolvidables, brindando un servicio seguro, rápido y confiable. Con años de trayectoria, TicketApp se ha consolidado como la plataforma preferida por millones de usuarios, ofreciendo innovación, atención personalizada y la mejor tecnología para que tu acceso a los eventos sea simple y seguro.
        </p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default About;



