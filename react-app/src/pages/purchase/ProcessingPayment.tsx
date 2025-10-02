import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../shared/context/CartContext";
import axios from "axios";
import styles from "./styles/Pay.module.css";

const ProcessingPayment = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loadingMessage, setLoadingMessage] = useState("Procesando tu pago...");

  useEffect(() => {
    const confirmSale = async () => {
      try {
        setLoadingMessage("Confirmando la venta con el servidor...");

        const ticketGroups = localStorage.getItem("ticketGroups");
        const dniClient = localStorage.getItem("dniClient");

        if (!ticketGroups || !dniClient) {
          setLoadingMessage("No hay datos de venta. Redirigiendo...");
          clearCart();
          localStorage.removeItem("ticket-cart");
          navigate("/pay/success");
          return;
        }

        const response = await axios.post("http://localhost:3000/api/sales/confirm", {
          dniClient: Number(dniClient),
          tickets: JSON.parse(ticketGroups),
        });

        console.log("✅ Venta confirmada:", response.data);
      } catch (err) {
        console.error("❌ Error confirmando venta:", err);
      } finally {
        clearCart();
        localStorage.removeItem("ticket-cart");
        localStorage.removeItem("ticketGroups");
        localStorage.removeItem("dniClient");

        setTimeout(() => navigate("/pay/success"), 1500);
      }
    };

    confirmSale();
  }, []);

  return (
    <div className={`${styles.payContainer} text-center`}>
      <h2 className={styles.payTitle}>Estamos procesando tu compra...</h2>
      <div className={styles.payWalletContainer}>
        <div className="loader"></div>
      </div>
      <p className={styles.loadingText}>{loadingMessage}</p>
    </div>
  );
};

export default ProcessingPayment;
