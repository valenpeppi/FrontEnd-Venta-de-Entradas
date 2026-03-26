import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/pages/sales/checkout/styles/Pay.module.css';
import { useCheckout } from '@/hooks/useCheckout';

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    user,
    groupedEvents,
    calculateTotal,
    handleStripePayment,
    isProcessing,
  } = useCheckout();

  return (
    <div className={styles.payContainer}>
      <h1 className={styles.payTitle}>Finalizar compra</h1>

      {cartItems.length > 0 ? (
        <>
          <div className={styles.paySummarySection}>
            <h2>Resumen de tu compra</h2>

            {groupedEvents.map(event => (
              <div key={event.eventId} className={styles.payEventGroup}>
                <div className={styles.payEventHeader}>{event.eventName}</div>

                {event.placeName && <div className={styles.payEventPlace}>Estadio: {event.placeName}</div>}

                <div className={styles.paySectorsList}>
                  {event.sectors.map(sector => (
                    <div key={sector.sectorName} className={styles.paySectorGroup}>
                      <div className={styles.paySectorHeader}>
                        <span>
                          {sector.sectorName} (x{sector.totalQuantity})
                        </span>
                        <span className={styles.paySectorPrice}>${sector.totalPrice.toFixed(2)}</span>
                      </div>

                      {sector.seatNumbers.length > 0 && (
                        <div className={styles.paySeatList}>
                          Asientos: {sector.seatNumbers.sort((a, b) => Number(a) - Number(b)).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className={styles.paySummaryTotal}>Total: ${calculateTotal.toFixed(2)}</div>
          </div>

          <div className={styles.payButtons}>
            <button
              onClick={() => navigate('/cart')}
              className={styles.btnBack}
              disabled={isProcessing}
            >
              Volver al carrito
            </button>
            <button
              onClick={handleStripePayment}
              className={styles.btnStripe}
              disabled={!user?.dni || isProcessing}
            >
              {isProcessing
                ? 'Procesando...'
                : `Pagar${!user?.dni ? ' (requiere login)' : ''}`}
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
