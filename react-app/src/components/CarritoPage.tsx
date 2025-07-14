import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Ticket } from './HomePage';
import './CarritoPage.css'; // Archivo CSS separado

interface CartItem extends Ticket {
  quantity: number;
}

const CarritoPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('ticket') || '[]');
    setCartItems(items);
  }, []);

  const removeItem = (index: number) => {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    localStorage.setItem('ticket', JSON.stringify(newCartItems));
    setCartItems(newCartItems);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Carrito de compras</h2>
      
      {cartItems.length > 0 ? (
        <>
          <div className="cart-items-container">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-info">
                  <h3 className="item-name">{item.eventName}</h3>
                  {item.date && <p className="item-date">{item.date}</p>}
                  {item.location && <p className="item-location">{item.location}</p>}
                  <p className="item-price">Precio unitario: ${item.price.toFixed(2)}</p>
                </div>
                
                <div className="item-quantity">
                  <span>Cantidad: {item.quantity}</span>
                </div>
                
                <div className="item-subtotal">
                  <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
                <button 
                  onClick={() => removeItem(index)} 
                  className="item-remove-btn"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="total-section">
              <h3>Total: ${calculateTotal().toFixed(2)}</h3>
            </div>
            
            <div className="action-buttons">
              <button onClick={() => navigate('/')} className="continue-btn">
                Seguir comprando
              </button>
              <button onClick={() => navigate('/pay')} className="checkout-btn">
                Proceder al pago
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-cart">
          <p>No hay entradas en tu carrito</p>
          <button onClick={() => navigate('/')} className="continue-btn">
            Ver eventos disponibles
          </button>
        </div>
      )}
    </div>
  );
};

export default CarritoPage;