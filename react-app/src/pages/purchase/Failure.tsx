import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Pay.module.css';

const Failure: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.payContainer}>
      <h1 className={styles.payTitle}>❌ Pago cancelado</h1>
      <p>Hubo un problema al procesar tu pago o lo cancelaste.</p>
      <div className={styles.payActions}>
        <button onClick={() => navigate('/cart')} className={styles.btnBack}>
          Volver al carrito
        </button>
      </div>
    </div>
  );
};

export default Failure;
