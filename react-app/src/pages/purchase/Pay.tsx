import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext';
import styles from './styles/Pay.module.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ email: string; name: string; surname: string; dni: number | null; }>({ email: '', name: '', surname: '', dni: null });

  useEffect(() => {
    console.log("🚀 Pay component inicializando...");
    
    initMercadoPago("APP_USR-cd78e2e4-b7ee-4b1d-ad89-e90d69693f9c", {
      locale: "es-AR",
      advancedFraudPrevention: false,
    });

    const storedUser = localStorage.getItem('user');
    console.log("👤 Usuario almacenado:", storedUser);
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("👤 Usuario parseado:", user);
        setUserData({
          email: user.mail || user.email || '',
          name: user.name || 'Usuario',
          surname: user.surname || '',
          dni: user.dni ? Number(user.dni) : null,
        });
        console.log("✅ UserData configurado");
      } catch (e) {
        console.error("❌ Error parseando user de localStorage:", e);
      }
    } else {
      console.warn("⚠️ No hay usuario en localStorage");
    }
  }, []);

  useEffect(() => {
    console.log("👤 UserData actualizado:", userData);
  }, [userData]);

  useEffect(() => {
    console.log("🛒 CartItems actualizado:", cartItems);
  }, [cartItems]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // MERCADO PAGO
  const handlePayment = async () => {
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
            email: userData.email,
            name: userData.name,
            surname: userData.surname,
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

  // STRIPE
  const handleStripePayment = async () => {
    console.log("👉 handleStripePayment ejecutado");
    console.log("👤 User data:", userData);
    console.log("🛒 Cart items:", cartItems);

    if (!userData.dni) {
      alert("Debes iniciar sesión con un usuario válido para pagar con Stripe");
      return;
    }

    try {
      const items = cartItems.map(item => ({
        name: item.eventName,
        amount: Math.round(item.price * 100),
        quantity: item.quantity,
      }));

      console.log("💰 Items procesados para Stripe:", items);

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
        } else {
          console.warn("⚠️ Este item no tiene ticketIds:", item);
        }
      }

      const ticketGroups = Object.values(ticketGroupsMap);

      console.log('🔁 Enviando a Stripe:', {
        items,
        ticketGroups,
        dniClient: userData.dni,
        customerEmail: userData.email,
      });

      console.log('📊 TicketGroups detallado:', ticketGroups.map(tg => ({
        idEvent: tg.idEvent,
        idPlace: tg.idPlace,
        idSector: tg.idSector,
        ids: tg.ids,
        idsLength: tg.ids.length
      })));
      
      const missingData = cartItems.filter(item => 
        !item.ticketIds || 
        item.ticketIds.length === 0 || 
        !item.idPlace || 
        !item.idSector
      );
      
      if (missingData.length > 0) {
        console.warn("🧨 Ítems con datos faltantes:", missingData);
        alert("Faltan datos necesarios para algunos ítems del carrito. Por favor, vuelve a seleccionar las entradas.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          ticketGroups,
          dniClient: userData.dni,
          customerEmail: userData.email,
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
        localStorage.setItem("ticket-cart", JSON.stringify(cartItems));
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
      <h1 className={styles.payTitle}>Finalizar Compra</h1>

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
              onClick={() => {
                console.log("🖱️ Botón de Stripe clickeado");
                console.log("👤 userData.dni:", userData.dni);
                console.log("🛒 cartItems.length:", cartItems.length);
                handleStripePayment();
              }}
              className={styles.btnStripe}
              disabled={!userData.dni}
            >
              Pagar con Stripe {!userData.dni ? "(Requiere login)" : ""}
            </button>
          </div>

          <div className={styles.payActions}>
            <button onClick={() => navigate('/cart')} className={styles.btnBack}>
              Volver al Carrito
            </button>
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
