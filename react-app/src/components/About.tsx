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
      <div className="about-contact-section" id="contacto">
        <h2 className="about-contact-title">Formas de contacto</h2>
        <ul className="about-contact-list">
          <li>Email: <a href="mail.soporte@ticketek.com" className="about-contact-link">soporte@ticketek.com</a></li>
          <li>Teléfono: <a href="tel:+541123456789" className="about-contact-link">+54 11 2345-6789</a></li>
          <li>Instagram: <a href="https://instagram.com/ticketek" target="_blank" rel="noopener noreferrer" className="about-contact-link">@ticketek</a></li>
          <li>Facebook: <a href="https://facebook.com/ticketek" target="_blank" rel="noopener noreferrer" className="about-contact-link">/ticketek</a></li>
        </ul>
      </div>
    </div>
  );
};

export default About; 