import React, { useEffect } from 'react';
import styles from './styles/About.module.css';

const About: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.aboutContainer}>
      <h1 className={styles.aboutTitle} id="sobre-nosotros">Sobre TicketApp</h1>
      <p className={styles.aboutDescription}>
        TicketApp es líder en la venta de entradas para los mejores eventos de música, deportes, teatro y entretenimiento en todo el país. Nuestra tarea es acercar a las personas a experiencias inolvidables, brindando un servicio seguro, rápido y confiable. Con años de trayectoria, TicketApp se ha consolidado como la plataforma preferida por millones de usuarios, ofreciendo innovación, atención personalizada y la mejor tecnología para que tu acceso a los eventos sea simple y seguro.
      </p>
    </div>
  );
};
export default About;
