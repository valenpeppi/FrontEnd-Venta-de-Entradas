import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext.tsx';
import { useAuth } from '../../shared/context/AuthContext.tsx'; // Importamos el hook de autenticación
import styles from './styles/Pay.module.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth(); // Obtenemos el usuario directamente del contexto
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  useEffect(() => {
    // Inicializamos Mercado Pago solo una vez
    initMercadoPago("APP_USR-cd78e2e4-b7ee-4b1d-ad89-e90d69693f9c", {
      locale: "es-AR",
      advancedFraudPrevention: false,
    });
  }, []);

  useEffect(() => {
    console.log("👤 Usuario desde AuthContext:", user);
    console.log("🛒 Items del carrito:", cartItems);
  }, [user, cartItems]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Función para confirmar la venta (usada por Stripe para simulación)
  const confirmSaleManually = async () => {
    if (!user || !user.dni) {
        console.error("No se puede confirmar la venta sin un DNI de cliente.");
        return;
    }
    try {
      const ticketGroupsMap: Record<string, {
        idEvent: number;
        idPlace: number;
        idSector: number;
        ids: number[];
      }> = {};

      for (const item of cartItems) {
        const key = `${item.eventId}-${item.idPlace}-${item.idSector}`;
        if (!ticketGroupsMap[key]) {
          ticketGroupsMap[key] = {
            idEvent: Number(item.eventId),
            idPlace: Number(item.idPlace),
            idSector: Number(item.idSector),
            ids: [],
          };
        }

        if (item.ticketIds && item.ticketIds.length > 0) {
          ticketGroupsMap[key].ids.push(...item.ticketIds.map(Number));
        }
      }

      const ticketGroups = Object.values(ticketGroupsMap);

      const response = await fetch("http://localhost:3000/api/sales/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dniClient: user.dni, // Usamos el DNI del contexto
          tickets: ticketGroups
        }),
      });

      if (response.ok) {
        console.log("✅ Venta confirmada exitosamente (manual).");
        localStorage.removeItem('ticket-cart');
        window.location.href = '/pay/success';
      } else {
        const error = await response.text();
        console.error("❌ Error confirmando venta (manual):", error);
      }
    } catch (error) {
      console.error("❌ Error en confirmación manual:", error);
    }
  };

  // --- Lógica para MERCADO PAGO ---
  const handlePayment = async () => {
    if (!user) {
      alert("Debes iniciar sesión para pagar con Mercado Pago.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/payments/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: (item.ticketIds && item.ticketIds[0])?.toString() || item.id,
            title: item.eventName,
            unit_price: item.price,
            quantity: item.quantity,
          })),
          payer: {
            email: user.mail,
            name: user.name,
            surname: user.surname,
          },
        }),
      });

      const data = await response.json();
      if (data.id) {
        setPreferenceId(data.id);
      } else {
        console.error("No se recibió preferenceId:", data);
      }
    } catch (error) {
      console.error("Error al generar preferencia de pago:", error);
    }
  };

  // --- Lógica para STRIPE ---
  const handleStripePayment = async () => {
    if (!user || !user.dni || !user.mail) {
      alert("Debes iniciar sesión con un usuario válido para pagar con Stripe.");
      return;
    }

    try {
      const items = cartItems.map(item => ({
        name: item.eventName,
        amount: Math.round(item.price * 100),
        quantity: item.quantity,
      }));

      const ticketGroupsMap: Record<string, {
        idEvent: number;
        idPlace: number;
        idSector: number;
        ids: number[];
      }> = {};

      for (const item of cartItems) {
        const key = `${item.eventId}-${item.idPlace}-${item.idSector}`;
        if (!ticketGroupsMap[key]) {
          ticketGroupsMap[key] = {
            idEvent: Number(item.eventId),
            idPlace: Number(item.idPlace),
            idSector: Number(item.idSector),
            ids: [],
          };
        }
        if (item.ticketIds && item.ticketIds.length > 0) {
          ticketGroupsMap[key].ids.push(...item.ticketIds.map(Number));
        }
      }
      const ticketGroups = Object.values(ticketGroupsMap);
      
      const missingData = cartItems.some(item => !item.ticketIds || item.ticketIds.length === 0 || item.idPlace == null || item.idSector == null);
      if (missingData) {
        alert("Faltan datos en algunos ítems del carrito. Por favor, vuelve a seleccionar las entradas.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          ticketGroups,
          dniClient: user.dni,
          customerEmail: user.mail, // Usamos el mail del contexto
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error en respuesta de Stripe:", errorText);
        alert("Hubo un error al procesar el pago con Stripe. Revisa la consola.");
        return;
      }

      const data = await response.json();

      if (data.url) {
        // Guardar datos en localStorage ANTES de redirigir
        localStorage.setItem("ticketGroups", JSON.stringify(ticketGroups));
        localStorage.setItem("dniClient", String(user.dni));
        
        localStorage.setItem("ticket-cart", JSON.stringify(cartItems));
        
        // En desarrollo, simulamos el pago exitoso. En producción, esto es manejado por webhooks.
        setTimeout(() => {
          confirmSaleManually();
        }, 3000);
        window.location.href = data.url;
      } else {
        console.error("❌ Error en Stripe Checkout, respuesta inválida:", data);
        alert("Respuesta inválida de Stripe.");
      }
    } catch (error) {
      console.error("❌ Error en Stripe Checkout:", error);
      alert("Error inesperado. Ver consola.");
    }
  };

  // Agrupamos items para mostrar en el resumen
  const groupedItems = cartItems.reduce((acc, item) => {
    const key = `${item.eventName}-${item.price}`;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }
    acc[key].quantity += item.quantity;
    return acc;
  }, {} as Record<string, typeof cartItems[0]>);
  const groupedArray = Object.values(groupedItems);

  return (
    <div className={styles.payContainer}>
      <h1 className={styles.payTitle}>Finalizar compra</h1>
  
      {cartItems.length > 0 ? (
        <>
          <div className={styles.paySummarySection}>
            <h2>Resumen de tu compra</h2>
            {groupedArray.map(item => (
              <div key={`${item.eventName}-${item.price}`} className={styles.paySummaryItem}>
                <span>{item.eventName} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.paySummaryTotal}>
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>
  
          <div className={styles.payButtons}>
            {!preferenceId ? (
              <button onClick={handlePayment} className={styles.btnPay}>
                Pagar con Mercado Pago
              </button>
            ) : (
              <Wallet initialization={{ preferenceId }} />
            )}
  
            <button
              onClick={handleStripePayment}
              className={styles.btnStripe}
              disabled={!user?.dni} // Deshabilitado si no hay usuario o DNI
            >
              Pagar con Stripe {!user?.dni ? "(requiere login)" : ""}
            </button>
            <div className={styles.payActions}>
              <button onClick={() => navigate('/cart')} className={styles.btnBack}>
                Volver al carrito
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.paySummarySection}>
          <p className={styles.payCartEmpty}>Tu carrito está vacío.</p>
          <div className={`${styles.payActions} ${styles.payActionsMargin}`}>
            <button onClick={() => navigate('/')} className={styles.btnBack}>
              Ir a la tienda
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
  
export default Pay;
