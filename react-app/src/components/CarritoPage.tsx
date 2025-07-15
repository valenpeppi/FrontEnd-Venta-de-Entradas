import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CarritoPage.css';

const CarritoPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeItem } = useCart();

  useEffect(() => {
    console.log('CarritoPage: Renderizando. Items en el carrito:', cartItems);
  }, [cartItems]);


  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">Carrito de compras</h2>
      
      {cartItems.length > 0 ? (
        <>
          <div className="cart-items-container">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
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
                  onClick={() => removeItem(item.id)}
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
