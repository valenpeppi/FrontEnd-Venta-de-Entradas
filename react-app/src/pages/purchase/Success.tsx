import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useCart } from "../../shared/context/CartContext"; 
import { MdCheckCircle } from "react-icons/md";
import styles from "./styles/Pay.module.css";

const Success = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate(); // ← Mover esto FUERA del useEffect

  useEffect(() => {
    const sendSaleConfirmation = async () => {
      if (cartItems.length === 0) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dniClient = user.dni;

      type TicketGroup = {
        idEvent: number;
        idPlace: number;
        idSector: number;
        ids: number[];
      };

      const grouped: Record<string, TicketGroup> = {};

      cartItems.forEach(item => {
        if (!item.ticketIds || item.ticketIds.length === 0) return;

        const idPlace = (item as any).idPlace;
        const idSector = (item as any).idSector;

        const key = `${item.eventId}_${idPlace}_${item.sectorName}_${idSector}`;

        if (!grouped[key]) {
          grouped[key] = {
            idEvent: Number(item.eventId),
            idPlace: Number(idPlace),
            idSector: Number(idSector),
            ids: [],
          };
        }

        grouped[key].ids.push(...item.ticketIds);
      });

      const ticketsPayload = Object.values(grouped);

      try {
        await axios.post(`${import.meta.env.VITE_API_BASE}/api/sales/confirm`, {
          dniClient,
          tickets: ticketsPayload,
        });
      } catch (error) {
        console.error("Error al confirmar la venta:", error);
      }

      clearCart();
      localStorage.removeItem("ticket-cart");
    };

    sendSaleConfirmation();
  }, [cartItems, clearCart]);

  return (
    <div className={styles.successContent}>
      <div className={styles.successIcon}>
        <MdCheckCircle size={64} color="#059669" />
      </div>
      <h1 className={styles.successTitle}>¡Pago exitoso!</h1>
      <p className={styles.successMessage}>
        Tu compra se procesó correctamente. <br />
        Gracias por confiar en nosotros 
      </p>
      <button
        onClick={() => navigate("/")}
        className={styles.successButton}
      >
        Volver a la tienda
      </button>
    </div>
  );
};

export default Success;
