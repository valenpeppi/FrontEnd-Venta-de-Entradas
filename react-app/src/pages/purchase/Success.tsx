import { MdCheckCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../../shared/context/CartContext";
import styles from "./styles/Pay.module.css";

const Success = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiamos carrito y storage
    clearCart();
    localStorage.removeItem("ticket-cart");
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
