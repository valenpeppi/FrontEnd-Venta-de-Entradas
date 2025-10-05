import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import styles from './styles/CarritoPage.module.css';

type CartItemGroupKey = string;

const CarritoPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeItem, updateItemQuantity } = useCart();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    console.log('CarritoPage: Renderizando. Items en el carrito:', cartItems);
  }, [cartItems]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'full',
      timeZone: 'UTC'
    }).format(date);
  };

  const isSeatNumbered = (sectorName: string | undefined) => {
    return sectorName?.toLowerCase().includes('asiento');
  };

  const getSectorGroupName = (sectorName: string | undefined): string => {
    if (!sectorName) return 'Otro';
    return sectorName.replace(/Asiento\s*\d+/gi, '').trim();
  };

  const extractSeatNumber = (sectorName: string | undefined): string | null => {
    if (!sectorName) return null;
    const match = sectorName.match(/Asiento\s*(\d+)/i);
    return match ? match[1] : null;
  };

  const groupCartItems = () => {
    const groups = new Map<CartItemGroupKey, any>();

    for (const item of cartItems) {
      const sectorGroup = getSectorGroupName(item.sectorName);
      const seatNumber = extractSeatNumber(item.sectorName);

      const key = `${item.eventName}-${item.date}-${item.time}-${item.location}-${sectorGroup}-${item.price}`;

      if (!groups.has(key)) {
        groups.set(key, {
          ...item,
          ids: [item.id],
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          groupedSectorName: sectorGroup,
          seatNumbers: seatNumber ? [seatNumber] : [],
        });
      } else {
        const group = groups.get(key);
        group.quantity += item.quantity;
        group.totalPrice += item.price * item.quantity;
        group.ids.push(item.id);
        if (seatNumber) group.seatNumbers.push(seatNumber);
      }
    }

    return Array.from(groups.values());
  };

  const groupedItems = groupCartItems();

  const calculateTotal = () => {
    return groupedItems.reduce((total, group) => total + group.totalPrice, 0);
  };

  const handleQuantityChange = (groupIds: string[], value: string) => {
    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity)) return;

    if (groupIds.length === 1) {
      const wasUpdated = updateItemQuantity(groupIds[0], newQuantity);
      if (!wasUpdated) {
        setErrorMsg('Solo puedes tener hasta 6 entradas por evento en tu carrito.');
      } else {
        setErrorMsg(null);
      }
    } else {
      setErrorMsg('No se puede editar la cantidad de entradas agrupadas con asiento. Elimina y vuelve a agregar.');
    }
  };

  const handleRemoveGroup = (groupIds: string[]) => {
    groupIds.forEach(id => removeItem(id));
  };

  return (
    <div className={styles.cartContainer}>
      <h2 className={styles.cartTitle}>Carrito de compras</h2>
      {errorMsg && <div className={styles.cartErrorMessage}>{errorMsg}</div>}
      {groupedItems.length > 0 ? (
        <>
          <div className={styles.cartItemsContainer}>
            {groupedItems.map((group, index) => (
              <div key={index} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{group.eventName}</h3>
                  {group.date && <p className={styles.itemDate}>{formatDate(group.date)}</p>}
                  {group.time && <p className={styles.itemDate}><strong>Hora:</strong> {group.time}</p>}
                  {group.location && <p className={styles.itemLocation}><strong>Lugar:</strong> {group.location}</p>}
                  {group.groupedSectorName && (
                    <p className={styles.itemSector}>
                      <strong>Sector:</strong> {group.groupedSectorName}
                    </p>
                  )}
                  {group.seatNumbers.length > 0 && (
                    <p className={styles.itemSector}>
                      <strong>Asientos:</strong> {group.seatNumbers.sort((a, b) => Number(a) - Number(b)).join(', ')}
                    </p>
                  )}
                  <p className={styles.itemPrice}>Precio unitario: ${group.price.toFixed(2)}</p>
                </div>

                <div className={styles.itemQuantity}>
                  {group.seatNumbers.length > 0 ? (
                    <span>Cantidad: {group.quantity}</span>
                  ) : (
                    <>
                      <label htmlFor={`quantity-select-${index}`} className={styles.quantityLabel}>
                        Cantidad:
                      </label>
                      <select
                        id={`quantity-select-${index}`}
                        value={group.quantity}
                        onChange={e => handleQuantityChange(group.ids, e.target.value)}
                        className={styles.cartQuantitySelect}
                        disabled={group.ids.length > 1}
                      >
                        {[...Array(7).keys()].slice(1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      {group.ids.length > 1 && (
                        <p className={styles.cartErrorMessageSmall}>
                          Para modificar la cantidad, elimina y vuelve a agregar.
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.itemSubtotal}>
                  <p>Subtotal: ${group.totalPrice.toFixed(2)}</p>
                </div>

                <button 
                  onClick={() => handleRemoveGroup(group.ids)}
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
