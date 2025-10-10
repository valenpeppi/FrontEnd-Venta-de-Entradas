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
      const dniClient = localStorage.getItem("dniClient");
      const ticketGroups = localStorage.getItem("ticketGroups");

      // Evitar confirmación duplicada
      const alreadyConfirmed = localStorage.getItem("saleConfirmed");
      if (alreadyConfirmed === "true") {
        console.warn("⚠️ Venta ya confirmada anteriormente. Se evita duplicación.");
        return;
      }

      if (!dniClient || !ticketGroups) {
        console.warn("❌ Faltan datos para confirmar la venta:", {
          dniClient,
          ticketGroups,
        });
        return;
      }

      try {
        console.log("📦 Enviando confirmación de venta con:", {
          dniClient,
          ticketGroups: JSON.parse(ticketGroups),
        });

        const res = await axios.post("http://localhost:3000/api/sales/confirm", {
          dniClient: Number(dniClient),
          tickets: JSON.parse(ticketGroups),
        });

        console.log("✅ Venta confirmada exitosamente desde frontend:", res.data);
        localStorage.setItem("saleConfirmed", "true");
      } catch (error: any) {
        console.error("❌ Error confirmando venta desde frontend:", error?.response?.data || error.message);
        navigate("/pay/failure");
      }
    };

    const start = async () => {
      try {
        setLoadingMessage("Procesando tu pago...");
        await new Promise(res => setTimeout(res, 3000));

        setLoadingMessage("Confirmando tu compra...");
        await confirmSale();

        await new Promise(res => setTimeout(res, 3000));

        clearCart();
        localStorage.removeItem("ticket-cart");
        localStorage.removeItem("ticketGroups");
        localStorage.removeItem("dniClient");

        navigate("/pay/success");
      } catch (e) {
        navigate("/pay/failure");
      }
    };

    start();
  }, [navigate, clearCart]);

  return (
    <div className={styles.successContent}>
      <div className={styles.loader}></div>
      <p className={styles.loadingText}>{loadingMessage}</p>
    </div>
  );
};

export default ProcessingPayment;
