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
    const releaseReservations = async () => {
      try {
        const ticketGroupsRaw = localStorage.getItem("ticketGroups");
        if (!ticketGroupsRaw) return;

        const ticketGroups = JSON.parse(ticketGroupsRaw);
        if (!Array.isArray(ticketGroups) || ticketGroups.length === 0) return;

        console.log("🔄 Liberando reservas (fallback front)...", ticketGroups);
        await axios.post("http://localhost:3000/api/stripe/release", { ticketGroups });
      } catch (e) {
        console.warn("⚠️ No se pudieron liberar reservas desde el front (fallback).", e);
      }
    };

    const checkIfSaleWasConfirmed = async () => {
      const dniClient = localStorage.getItem("dniClient");

      if (!dniClient) {
        console.warn("❌ Faltan datos para verificar venta.");
        await releaseReservations(); // liberar por si quedaron reservadas
        navigate("/pay/failure");
        return;
      }

      try {
        setLoadingMessage("Verificando confirmación de venta...");

        const { data } = await axios.get(`http://localhost:3000/api/sales/check?dniClient=${dniClient}`);

        if (data?.confirmed) {
          setLoadingMessage("¡Venta confirmada!");
          clearCart();
          localStorage.removeItem("ticket-cart");
          localStorage.removeItem("ticketGroups");
          localStorage.removeItem("dniClient");
          navigate("/pay/success");
        } else {
          setLoadingMessage("Esperando confirmación del pago...");
          // pequeño delay y consideramos fallo
          await new Promise(res => setTimeout(res, 2500));
          await releaseReservations();   // liberar antes de redirigir a failure
          navigate("/pay/failure");
        }
      } catch (error: any) {
        console.error("❌ Error consultando confirmación:", error.response?.data || error.message);
        await releaseReservations();     // fallback también si hubo error de red
        navigate("/pay/failure");
      }
    };

    checkIfSaleWasConfirmed();
  }, [navigate, clearCart]);

  return (
    <div className={styles.successContent}>
      <div className={styles.loader}></div>
      <p className={styles.loadingText}>{loadingMessage}</p>
    </div>
  );
};

export default ProcessingPayment;
