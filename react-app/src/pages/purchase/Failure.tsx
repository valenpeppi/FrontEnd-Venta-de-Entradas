import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/Pay.module.css";

const Failure: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.failureContent}>
      <div className={styles.failureIcon}>❌</div>
      <h1 className={styles.failureTitle}>Pago cancelado</h1>
      <p className={styles.failureMessage}>
        Hubo un problema al procesar tu pago o lo cancelaste.
      </p>
      <button
        onClick={() => navigate("/cart")}
        className={styles.failureButton}
      >
        Volver al carrito
      </button>
    </div>
  );
};

export default Failure;
