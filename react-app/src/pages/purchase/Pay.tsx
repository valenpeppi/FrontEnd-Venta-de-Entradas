import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext'; // Ajusta la ruta si es necesario
import './styles/Pay.css'; // Asegúrate de que la ruta al CSS sea correcta

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="pay-container">
      <h1 className="pay-title">Finalizar Compra</h1>
      
      {cartItems.length > 0 ? (
        <>
          <div className="pay-summary-section">
            <h2>Resumen de tu compra</h2>
            {cartItems.map(item => (
              <div key={item.id} className="pay-summary-item">
                <span>{item.eventName} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="pay-summary-total">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>

          <div className="pay-wallet-container">
            {/* Aquí irían futuros métodos de pago */}
            <p className="loading-text">Próximamente: Métodos de pago.</p>
          </div>

          <div className="pay-actions">
            <button onClick={() => navigate('/cart')} className="btn-back">
              Volver al Carrito
            </button>
          </div>
        </>
      ) : (
        <div className="pay-summary-section">
          <p className="pay-cart-empty">Tu carrito está vacío.</p>
          <div className="pay-actions pay-actions-margin">
             <button onClick={() => navigate('/')} className="btn-back">
              Ir a la tienda
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pay;
