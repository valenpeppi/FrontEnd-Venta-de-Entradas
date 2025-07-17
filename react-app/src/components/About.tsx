import React, { useEffect } from 'react';
import './About.css';

const About: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="about-container">
      <h1 className="about-title" id="sobre-nosotros">Sobre Ticketek</h1>
      <p className="about-description">
        Ticketek es líder en la venta de entradas para los mejores eventos de música, deportes, teatro y entretenimiento en todo el país. Nuestra misión es acercar a las personas a experiencias inolvidables, brindando un servicio seguro, rápido y confiable. Con años de trayectoria, Ticketek se ha consolidado como la plataforma preferida por millones de usuarios, ofreciendo innovación, atención personalizada y la mejor tecnología para que tu acceso a los eventos sea simple y seguro.
      </p>
    </div>
  );
};

export default About; 