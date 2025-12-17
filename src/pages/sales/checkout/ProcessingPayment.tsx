import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from '@/hooks/useCart';
import { PaymentService } from '@/services/PaymentService';
import { StorageService } from '@/services/StorageService';
import styles from '@/pages/sales/checkout/styles/Pay.module.css';

const ProcessingPayment = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loadingMessage, setLoadingMessage] = useState("Procesando tu pago...");

  useEffect(() => {
    const releaseReservations = async () => {
      try {
        const ticketGroupsRaw = StorageService.getItem("ticketGroups");
        if (!ticketGroupsRaw) return;

        const ticketGroups = JSON.parse(ticketGroupsRaw);
        if (!Array.isArray(ticketGroups) || ticketGroups.length === 0) return;

        console.log("🔄 Liberando reservas (fallback front)...", ticketGroups);
        await PaymentService.releaseReservations(ticketGroups);
      } catch (e) {
        console.warn("⚠️ No se pudieron liberar reservas desde el front (fallback).", e);
      }
    };

    const qs = new URLSearchParams(window.location.search);
    const sessionId = qs.get("session_id");


    const confirmByStripeSession = async (sid: string) => {
      try {
        setLoadingMessage("Confirmando pago con Stripe...");
        const data = await PaymentService.confirmStripeSession(sid);
        return !!data?.confirmed;
      } catch {
        return false;
      }
    };



    const pollSaleConfirmation = async () => {
      const dniClient = StorageService.getItem("dniClient");
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
          StorageService.removeItem("ticket-cart");
          StorageService.removeItem("ticketGroups");
          StorageService.removeItem("dniClient");
          navigate("/pay/success");
          return;
        }
      }


      setLoadingMessage("Verificando confirmación de venta...");
      const MAX_ATTEMPTS = 8;
      const DELAY_MS = 1500;

      for (let i = 1; i <= MAX_ATTEMPTS; i++) {
        try {
          const data = await PaymentService.checkSaleStatus(dniClient);
          if (data?.confirmed) {
            setLoadingMessage("¡Venta confirmada!");
            clearCart();
            StorageService.removeItem("ticket-cart");
            StorageService.removeItem("ticketGroups");
            StorageService.removeItem("dniClient");
            navigate("/pay/success");
            return;
          }
        } catch { }
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



