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

    const qs = new URLSearchParams(window.location.search);
    const sessionId = qs.get("session_id");    
    const paymentId = qs.get("payment_id");    

    const confirmByStripeSession = async (sid: string) => {
      try {
        setLoadingMessage("Confirmando pago con Stripe...");
        const { data } = await axios.get("http://localhost:3000/api/stripe/confirm-session", {
          params: { session_id: sid },
        });
        return !!data?.confirmed;
      } catch {
        return false;
      }
    };

    const confirmByMercadoPago = async (pid: string) => {
      try {
        setLoadingMessage("Confirmando pago con Mercado Pago...");
        const { data } = await axios.get("http://localhost:3000/api/mp/confirm-payment", {
          params: { payment_id: pid },
        });
        return !!data?.confirmed;
      } catch {
        return false;
      }
    };

    const pollSaleConfirmation = async () => {
      const dniClient = localStorage.getItem("dniClient");
      if (!dniClient) {
        await releaseReservations();
        navigate("/pay/failure");
        return;
      }

      if (sessionId) {
        const ok = await confirmByStripeSession(sessionId);
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
      if (paymentId) {
        const ok = await confirmByMercadoPago(paymentId);
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

      setLoadingMessage("Verificando confirmación de venta...");
      const MAX_ATTEMPTS = 8;
      const DELAY_MS = 1500;

      for (let i = 1; i <= MAX_ATTEMPTS; i++) {
        try {
          const { data } = await axios.get(
            `http://localhost:3000/api/sales/check?dniClient=${dniClient}`
          );
        if (data?.confirmed) {
            setLoadingMessage("¡Venta confirmada!");
            clearCart();
            localStorage.removeItem("ticket-cart");
            localStorage.removeItem("ticketGroups");
            localStorage.removeItem("dniClient");
            navigate("/pay/success");
            return;
          }
        } catch {}
        await new Promise((res) => setTimeout(res, DELAY_MS));
      }

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
