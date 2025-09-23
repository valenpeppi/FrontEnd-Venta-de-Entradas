import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Terms.module.css';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.termsPage}>
      <div className={styles.termsContainer}>
        <h1 className={styles.termsTitle}>Términos y Condiciones</h1>
        <div className={styles.termsContent}>
          <h2>1. Aceptación de los Términos</h2>
          <p>Al utilizar nuestro sitio web y nuestros servicios, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo, no utilices nuestros servicios.</p>
          
          <h2>2. Compra de Entradas</h2>
          <p>Todas las ventas de entradas son finales. No se permiten reembolsos, cambios ni cancelaciones. Es tu responsabilidad verificar los detalles del evento antes de comprar.</p>
          
          <h2>3. Cancelación de Eventos</h2>
          <p>En caso de que un evento sea cancelado, se te notificará y se te proporcionará información sobre el proceso de reembolso. Si un evento se reprograma, tus entradas serán válidas para la nueva fecha.</p>
          
          <h2>4. Propiedad Intelectual</h2>
          <p>Todo el contenido de este sitio web, incluyendo textos, gráficos y logos, es propiedad de TicketApp y está protegido por las leyes de derechos de autor.</p>
        </div>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default Terms;

