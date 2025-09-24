import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../shared/context/CartContext"; 
import styles from "./styles/Pay.module.css";

const Success: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart(); // ✅ vacía el carrito al entrar
  }, [clearCart]);

  return (
    <div className={styles.successContent}>
      <div className={styles.successIcon}>✅</div>
      <h1 className={styles.successTitle}>¡Pago exitoso!</h1>
      <p className={styles.successMessage}>
        Tu compra se procesó correctamente. <br />
        Gracias por confiar en nosotros 🎉
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
