import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import styles from './styles/Pay.module.css';

// SDK de Mercado Pago
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    email: 'test_user_123456@testuser.com',
    name: 'Test',
    surname: 'User',
  });

  useEffect(() => {
    initMercadoPago("APP_USR-cd78e2e4-b7ee-4b1d-ad89-e90d69693f9c", {
      locale: "es-AR",
      advancedFraudPrevention: false,
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      email: user.email || 'test_user_123456@testuser.com',
      name: user.name || 'Test',
      surname: user.surname || 'User',
    });
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // MERCADO PAGO
  const handlePayment = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/payments/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id.toString(),
            title: item.eventName,
            unit_price: item.price,
            quantity: item.quantity,
          })),
          payer: {
            email: userData.email,
            name: userData.name,
            surname: userData.surname,
          },
        }),
      });

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      } else {
        console.error("No se recibió preferenceId:", data);
      }
    } catch (error) {
      console.error("Error al generar preferencia de pago:", error);
    }
  };

  // STRIPE
    const handleStripePayment = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            name: item.eventName,
            amount: Math.round(item.price * 100),
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Guardamos el carrito actual en localStorage antes de salir a Stripe
        localStorage.setItem("ticket-cart", JSON.stringify(cartItems));
        window.location.href = data.url;
      }

    } catch (error) {
      console.error("Error en Stripe Checkout:", error);
    }
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

          <div className={styles.payButtons}>
            {!preferenceId ? (
              <button onClick={handlePayment} className={styles.btnPay}>
                Pagar con Mercado Pago
              </button>
            ) : (
              <Wallet initialization={{ preferenceId }} />
            )}

            <button onClick={handleStripePayment} className={styles.btnStripe}>
              Pagar con Stripe
            </button>
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
