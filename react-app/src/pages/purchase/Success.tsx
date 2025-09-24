import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Pay.module.css';

const Success: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.payContainer}>
      <h1 className={styles.payTitle}>✅ Pago exitoso</h1>
      <p>Tu compra se procesó correctamente. Gracias por confiar en nosotros 🎉</p>
      <div className={styles.payActions}>
        <button onClick={() => navigate('/')} className={styles.btnBack}>
          Volver a la tienda
        </button>
      </div>
    </div>
  );
};

export default Success;
