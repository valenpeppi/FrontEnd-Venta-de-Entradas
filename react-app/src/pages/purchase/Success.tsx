import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../shared/context/CartContext"; 
import { MdCheckCircle } from "react-icons/md";  //
import styles from "./styles/Pay.module.css";
import axios from "axios";

const Success: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    localStorage.removeItem("ticket-cart");
  }, [clearCart]);

  useEffect(() => {
    const sendSaleConfirmation = async () => {
      const storedCart = JSON.parse(localStorage.getItem("ticket-cart") || "[]");

      if (storedCart.length === 0) return;

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dniClient = user.dni;

      const grouped: Record<string, { quantity: number; ids: number[] }> = {};

      for (const item of storedCart) {
        const key = `${item.eventId}_${item.sectorName}`;
        if (!grouped[key]) {
          grouped[key] = { quantity: 0, ids: [] };
        }

        grouped[key].quantity += item.quantity;
        if (Array.isArray(item.idTickets)) {
          grouped[key].ids.push(...item.idTickets);
        }
      }

      const ticketsPayload = Object.values(grouped);

      try {
        await axios.post("http://localhost:3000/api/sales/confirm", {
          dniClient,
          tickets: ticketsPayload,
        });
      } catch (error) {
        console.error("Error al confirmar venta:", error);
      }

      clearCart();
      localStorage.removeItem("ticket-cart");
    };

    sendSaleConfirmation();
  }, [clearCart]);


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
