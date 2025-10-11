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

    const getSessionId = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get("session_id");
    };

    const confirmBySession = async (sessionId: string) => {
      try {
        setLoadingMessage("Confirmando pago con Stripe...");
        const { data } = await axios.get(
          `http://localhost:3000/api/stripe/confirm-session`,
          { params: { session_id: sessionId } }
        );
        return !!data?.confirmed;
      } catch {
        return false;
      }
    };

    const pollSaleConfirmation = async () => {
      const dniClient = localStorage.getItem("dniClient");

      if (!dniClient) {
        console.warn("❌ Faltan datos para verificar venta.");
        await releaseReservations();
        navigate("/pay/failure");
        return;
      }

      // Confirmar usando el session_id (fallback fuerte)
      const sessionId = getSessionId();
      if (sessionId) {
        const ok = await confirmBySession(sessionId);
        if (ok) {
          setLoadingMessage("¡Venta confirmada!");
          clearCart();
          localStorage.removeItem("ticket-cart");
          localStorage.removeItem("ticketGroups");
          localStorage.removeItem("dniClient");
          navigate("/pay/success");
          return;
        }
      }

      // Si aún no, hacemos polling a /sales/check por si el webhook llega con delay
      setLoadingMessage("Verificando confirmación de venta...");
      const MAX_ATTEMPTS = 8;
      const DELAY_MS = 1500;

      for (let i = 1; i <= MAX_ATTEMPTS; i++) {
        try {
          const { data } = await axios.get(`http://localhost:3000/api/sales/check?dniClient=${dniClient}`);
          if (data?.confirmed) {
            setLoadingMessage("¡Venta confirmada!");
            clearCart();
            localStorage.removeItem("ticket-cart");
            localStorage.removeItem("ticketGroups");
            localStorage.removeItem("dniClient");
            navigate("/pay/success");
            return;
          }
        } catch (error: any) {
          console.error("❌ Error consultando confirmación:", error.response?.data || error.message);
        }
        await new Promise(res => setTimeout(res, DELAY_MS));
      }

      // Si nada confirmó, liberamos y fallamos
      await releaseReservations();
      navigate("/pay/failure");
    };

    pollSaleConfirmation();
  }, [navigate, clearCart]);

  return (
    <div className={styles.successContent}>
      <div className={styles.loader}></div>
      <p className={styles.loadingText}>{loadingMessage}</p>
    </div>
  );
};

export default ProcessingPayment;
