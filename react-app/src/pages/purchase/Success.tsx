import { MdCheckCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../shared/context/CartContext";
import axios from "axios";
import styles from "./styles/Pay.module.css";

const Success = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  // Esta función ahora será llamada por el botón "Ver mis tickets"
  const handleConfirmAndSeeTickets = async () => {
    try {
        console.log("entrando al try...");
      // Recuperar info guardada antes del checkout
      const ticketGroups = localStorage.getItem("ticketGroups");
      const dniClient = localStorage.getItem("dniClient");

      if (!ticketGroups || !dniClient) {
        console.warn("⚠️ No hay datos para confirmar la venta. Es posible que ya se haya procesado.");
        // Aunque no haya datos, limpiamos por si acaso y navegamos.
        clearCart();
        localStorage.removeItem("ticket-cart");
        navigate('/myTickets');
        return;
      }

      console.log("📩 Enviando confirmSale al backend...");

      const res = await axios.post(`http://localhost:3000/api/sales/confirm`, {
        dniClient: Number(dniClient),
        tickets: JSON.parse(ticketGroups),
      });

      console.log("✅ Venta confirmada:", res.data);
    } catch (err) {
      console.error("❌ Error confirmando venta:", err);
      // Opcional: Mostrar un mensaje de error al usuario.
    } finally {
      // Limpiar el carrito y los datos temporales después de intentar la confirmación
      clearCart();
      localStorage.removeItem("ticket-cart");
      localStorage.removeItem("ticketGroups");
      localStorage.removeItem("dniClient");
      
      // Navegar a la página de tickets
      navigate('/myTickets');
    }
  };

  const handleGoHome = () => {
    // Si el usuario solo quiere volver al inicio, limpiamos los datos sin confirmar.
    localStorage.removeItem("ticketGroups");
    localStorage.removeItem("dniClient");
    navigate("/");
  };

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
      
      {/* Botón principal que confirma y redirige */}
      <button
        onClick={handleConfirmAndSeeTickets}
        className={styles.successButton} // Puedes crear un estilo específico si quieres
      >
        Ver mis tickets
      </button>

      {/* Botón secundario para volver al inicio */}
      <button
        onClick={handleGoHome}
        className={styles.failureButton} // Reutilizamos un estilo de botón secundario
        style={{ marginTop: '10px' }} // Agregamos un pequeño margen
      >
        Volver a la tienda
      </button>
    </div>
  );
};

export default Success;