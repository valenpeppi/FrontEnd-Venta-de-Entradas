import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '@/shared/context/CartContext';
import { PaymentService } from '@/services/PaymentService';
import { MdCancel } from "react-icons/md";
import styles from '@/pages/sales/checkout/styles/Pay.module.css';

const Failure: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  useEffect(() => {
    localStorage.removeItem("saleConfirmed");
  }, []);

  useEffect(() => {
    const releaseReservations = async () => {
      try {
        const ticketGroupsRaw = localStorage.getItem("ticketGroups");
        if (!ticketGroupsRaw) return;

        const ticketGroups = JSON.parse(ticketGroupsRaw);
        if (!Array.isArray(ticketGroups) || ticketGroups.length === 0) return;

        console.log("🔄 Liberando reservas (cancel_url)...", ticketGroups);
        await PaymentService.releaseReservations(ticketGroups);
      } catch (e) {
        console.warn("⚠️ No se pudieron liberar reservas en Failure.", e);
      }
    };

    releaseReservations();
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      const stored = localStorage.getItem("ticket-cart");
      if (stored) {
        const items = JSON.parse(stored);
        items.forEach((item: any) => {
          addToCart(item, item.quantity);
        });
      }
    }
  }, [cartItems, addToCart]);

  return (
    <div className={styles.failureContent}>
      <div className={styles.failureIcon}>
        <MdCancel size={64} color="#dc2626" />
      </div>
      <h1 className={styles.failureTitle}>Pago cancelado</h1>
      <p className={styles.failureMessage}>
        Hubo un problema al procesar tu pago, o lo cancelaste y volviste atrás.
        Tus entradas siguen en el carrito para que puedas reintentar la compra.
      </p>
      <button
        onClick={() => navigate("/cart")}
        className={styles.failureButton}
      >
        Volver al carrito
      </button>
    </div>
  );
};

export default Failure;



