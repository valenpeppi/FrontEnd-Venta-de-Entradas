import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import styles from './styles/Pay.module.css';

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className={styles.payContainer}>
      <h1 className={styles.payTitle}>Finalizar Compra</h1>
      
      {cartItems.length > 0 ? (
        <>
          <div className={styles.paySummarySection}>
            <h2>Resumen de tu compra</h2>
            {cartItems.map(item => (
              <div key={item.id} className={styles.paySummaryItem}>
                <span>{item.eventName} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.paySummaryTotal}>
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>

          <div className={styles.payWalletContainer}>
            <p className={styles.loadingText}>Próximamente: Métodos de pago.</p>
          </div>

          <div className={styles.payActions}>
            <button onClick={() => navigate('/cart')} className={styles.btnBack}>
              Volver al Carrito
            </button>
          </div>
        </>
      ) : (
        <div className={styles.paySummarySection}>
          <p className={styles.payCartEmpty}>Tu carrito está vacío.</p>
          <div className={`${styles.payActions} ${styles.payActionsMargin}`}>
             <button onClick={() => navigate('/')} className={styles.btnBack}>
              Ir a la tienda
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pay;
