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
    const checkIfSaleWasConfirmed = async () => {
      const dniClient = localStorage.getItem("dniClient");

      if (!dniClient) {
        console.warn("❌ Faltan datos para verificar venta.");
        navigate("/pay/failure");
        return;
      }

      try {
        setLoadingMessage("Verificando confirmación de venta...");

        // Lógica recomendada: pedir al backend una lista de ventas recientes del usuario
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
          // Reintentar más tarde o redirigir a página de espera
          await new Promise(res => setTimeout(res, 4000));
          navigate("/pay/failure");
        }

      } catch (error: any) {
        console.error("❌ Error consultando confirmación:", error.response?.data || error.message);
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
