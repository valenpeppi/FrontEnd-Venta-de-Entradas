import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './styles/NewsLetter.css';

const NewsLetter: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // Hook para la navegación

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos a tu backend o servicio de email
    console.log('Datos de suscripción:', { name, email });
    alert('¡Gracias por suscribirte!');
    setName('');
    setEmail('');
  };

  // Función para volver a la página anterior
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="newsletter-root">
      <div className="newsletter-card">
        <h2 className="newsletter-title">Suscríbete a nuestro boletín</h2>
        <p className="newsletter-subtitle">
          Recibe las últimas noticias, eventos y ofertas exclusivas.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="newsletter-field">
            <label htmlFor="name" className="newsletter-label">Nombre</label>
            <input
              type="text"
              id="name"
              className="newsletter-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>
          <div className="newsletter-field">
            <label htmlFor="email" className="newsletter-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@ejemplo.com"
              required
            />
          </div>
          <button type="submit" className="newsletter-btn-submit">
            Suscribirme ahora
          </button>
        </form>
        {/* Botón para volver */}
        <button onClick={handleGoBack} className="back-btn">
          Volver
        </button>
      </div>
    </div>
  );
};

export default NewsLetter;
