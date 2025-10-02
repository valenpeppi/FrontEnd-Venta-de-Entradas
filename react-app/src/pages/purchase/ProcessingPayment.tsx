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

          setTimeout(() => {
            navigate("/pay/success");
          }, 3000);
          return;
        }

        const response = await axios.post("http://localhost:3000/api/sales/confirm", {
          dniClient: Number(dniClient),
          tickets: JSON.parse(ticketGroups),
        });

        console.log("Venta confirmada:", response.data);

        setTimeout(() => {
          navigate("/pay/success");
        }, 3000);

      } catch (error) {
        console.error("Error al confirmar la venta:", error);

        setTimeout(() => {
          navigate("/pay/failure");
        }, 3000);
      }
    };

    confirmSale();
  }, [clearCart, navigate]);

  return (
    <div className={styles.successContent}>
      <div className={styles.loader}></div>
      <p className={styles.loadingText}>{loadingMessage}</p>
    </div>
  );
};

export default ProcessingPayment;