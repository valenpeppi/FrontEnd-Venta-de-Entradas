import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import styles from './styles/CarritoPage.module.css';

const CarritoPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeItem, updateItemQuantity } = useCart();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    console.log('CarritoPage: Renderizando. Items en el carrito:', cartItems);
  }, [cartItems]);


  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleQuantityChange = (id: string, value: string) => {
    const newQuantity = parseInt(value);
    if (isNaN(newQuantity)) return;
    
    const wasUpdated = updateItemQuantity(id, newQuantity);
    if (!wasUpdated) {
      setErrorMsg('Solo puedes tener entre 1 y 3 entradas por evento.');
    } else {
      setErrorMsg(null);
    }
  };

  return (
    <div className={styles.cartContainer}>
      <h2 className={styles.cartTitle}>Carrito de compras</h2>
      {errorMsg && <div className={styles.cartErrorMessage}>{errorMsg}</div>}
      {cartItems.length > 0 ? (
        <>
          <div className={styles.cartItemsContainer}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.eventName}</h3>
                  {item.date && <p className={styles.itemDate}>{item.date}</p>}
                  {item.location && <p className={styles.itemLocation}>{item.location}</p>}
                  <p className={styles.itemPrice}>Precio unitario: ${item.price.toFixed(2)}</p>
                </div>
                
                <div className={styles.itemQuantity}>
                  <label htmlFor={`quantity-select-${item.id}`} className={styles.quantityLabel}>
                    Cantidad:
                  </label>
                  <select
                    id={`quantity-select-${item.id}`}
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.id, e.target.value)}
                    className={styles.cartQuantitySelect}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
                
                <div className={styles.itemSubtotal}>
                  <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className={styles.itemRemoveBtn}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          
          <div className={styles.cartSummary}>
            <div className={styles.totalSection}>
              <h3>Total: ${calculateTotal().toFixed(2)}</h3>
            </div>
            
            <div className={styles.actionButtons}>
              <button onClick={() => navigate('/')} className={styles.continueBtn}>
                Seguir comprando
              </button>
              <button onClick={() => navigate('/pay')} className={styles.checkoutBtn}>
                Proceder al pago
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyCart}>
          <p>No hay entradas en tu carrito</p>
          <button onClick={() => navigate('/')} className={styles.continueBtn}>
            Ver eventos disponibles
          </button>
        </div>
      )}
    </div>
  );
};

export default CarritoPage;
