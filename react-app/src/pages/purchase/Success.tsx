import { MdCheckCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../../shared/context/CartContext";
import axios from "axios";
import styles from "./styles/Pay.module.css";

const Success = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmSale = async () => {
      try {
        // Recuperar info guardada antes del checkout
        const ticketGroups = localStorage.getItem("ticketGroups");
        const dniClient = localStorage.getItem("dniClient");

        if (!ticketGroups || !dniClient) {
          console.warn("⚠️ No hay datos de ticketGroups o dniClient en localStorage");
          return;
        }

        console.log("📩 Enviando confirmSale al backend...");

        const res = await axios.post(`http://localhost:3000/api/sales/confirm`, {
          dniClient: Number(dniClient),
          tickets: JSON.parse(ticketGroups),
        });

        console.log("✅ Venta confirmada:", res.data);
      } catch (err) {
        console.error("❌ Error confirmando venta:", err);
      } finally {
        // limpiar carrito siempre
        clearCart();
        localStorage.removeItem("ticket-cart");
        localStorage.removeItem("ticketGroups");
        localStorage.removeItem("dniClient");
      }
    };

    confirmSale();
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