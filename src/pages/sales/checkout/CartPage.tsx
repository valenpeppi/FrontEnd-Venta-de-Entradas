import { useNavigate } from 'react-router-dom';
import styles from '@/pages/sales/checkout/styles/CarritoPage.module.css';
import { formatLongDate, formatTime } from '@/shared/utils/dateFormatter';
import {
  MdCalendarToday,
  MdAccessTime,
  MdLocationOn,
  MdLocationCity,
  MdEventSeat,
  MdAttachMoney,
} from "react-icons/md";
import { useCartPage } from '@/hooks/useCartPage';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    groupedItems,
    calculateTotal,
    handleQuantityChange,
    handleRemoveGroup,
    errorMsg
  } = useCartPage();

  return (
    <div className={styles.cartContainer}>
      <h2 className={styles.cartTitle}>Carrito de compras</h2>
      {errorMsg && <div className={styles.cartErrorMessage}>{errorMsg}</div>}
      {groupedItems.length > 0 ? (
        <>
          <div className={styles.cartItemsContainer}>
            {groupedItems.map((group, index) => (
              <div key={index} className={styles.cartItem}>
                <div className={styles.cartItemContent}>
                  <h3 className={styles.itemName}>{group.eventName}</h3>

                  {group.date && (
                    <p className={styles.itemRow}>
                      <MdCalendarToday className={styles.icon} />
                      {formatLongDate(group.date)}
                    </p>
                  )}

                  {group.time && (
                    <p className={styles.itemRow}>
                      <MdAccessTime className={styles.icon} />
                      {formatTime(group.date)}
                    </p>
                  )}

                  {group.placeName && (
                    <p className={styles.itemRow}>
                      <MdLocationOn className={styles.icon} />
                      <strong>Estadio:</strong> {group.placeName}
                    </p>
                  )}


                  {group.groupedSectorName && (
                    <p className={styles.itemRow}>
                      <MdLocationCity className={styles.icon} />
                      <strong>Sector:</strong> {group.groupedSectorName}
                    </p>
                  )}

                  {group.seatNumbers.length > 0 && (
                    <p className={styles.itemRow}>
                      <MdEventSeat className={styles.icon} />
                      <strong>Asientos:</strong>{group.seatNumbers.sort((a: string, b: string) => Number(a) - Number(b)).join(' - ')}

                    </p>
                  )}

                  <p className={styles.itemRow}>
                    <MdAttachMoney className={styles.icon} />
                    <strong>Precio unitario:</strong> ${group.price.toFixed(2)}
                  </p>
                </div>

                <div className={styles.cartItemControls}>
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
                      </>
                    )}
                  </div>

                  <div className={styles.itemSubtotal}>
                    Subtotal: ${group.totalPrice.toFixed(2)}
                  </div>

                  <button
                    onClick={() => handleRemoveGroup(group.ids)}
                    className={styles.itemRemoveBtn}
                  >
                    Eliminar
                  </button>
                </div>
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

export default CartPage;


