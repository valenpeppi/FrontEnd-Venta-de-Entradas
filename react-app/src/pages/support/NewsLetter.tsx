import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/NewsLetter.module.css';

const NewsLetter: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos de suscripción:', { name, email });
    alert('¡Gracias por suscribirte!');
    setName('');
    setEmail('');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.newsletterRoot}>
      <div className={styles.newsletterCard}>
        <h2 className={styles.newsletterTitle}>Suscríbete a nuestro boletín</h2>
        <p className={styles.newsletterSubtitle}>
          Recibe las últimas noticias, eventos y ofertas exclusivas.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.newsletterField}>
            <label htmlFor="name" className={styles.newsletterLabel}>Nombre</label>
            <input
              type="text"
              id="name"
              className={styles.newsletterInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>
          <div className={styles.newsletterField}>
            <label htmlFor="email" className={styles.newsletterLabel}>Correo electrónico</label>
            <input
              type="email"
              id="email"
              className={styles.newsletterInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@ejemplo.com"
              required
            />
          </div>
          <button type="submit" className={styles.newsletterBtnSubmit}>
            Suscribirme ahora
          </button>
        </form>
        <button onClick={handleGoBack} className={styles.backBtn}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default NewsLetter;
