import { MdCheckCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../../shared/context/CartContext";
import styles from "./styles/Pay.module.css";

const Success = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  useEffect(() => {
    localStorage.removeItem("saleConfirmed");
  }, []);

  useEffect(() => {
    clearCart();
    localStorage.removeItem("ticket-cart");
    localStorage.removeItem("ticketGroups");
    localStorage.removeItem("dniClient");
  }, [clearCart]);

  return (
    <div className={styles.successContent}>
      <div className={styles.successIcon}>
        <MdCheckCircle size={64} color="#059669" />
      </div>
      <h1 className={styles.successTitle}>¡Pago exitoso!</h1>
      <p className={styles.successMessage}>
        Tu compra se procesó correctamente. <br />
        Haz clic en el botón de abajo para ver tus entradas.
      </p>

      <button
        onClick={() => navigate("/myTickets")}
        className={styles.successButton}
      >
        Ver mis tickets
      </button>

      <button
        onClick={() => navigate("/")}
        className={styles.failureButton}
      >
        Volver a la tienda
      </button>
    </div>
  );
};

export default Success;
