import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../shared/context/CartContext.tsx';
import { useAuth } from '../../shared/context/AuthContext.tsx'; 
import styles from './styles/Pay.module.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth(); 
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  interface GroupedBySector {
    sectorName: string;
    totalQuantity: number;
    totalPrice: number;
    seatNumbers: string[];
  }

  interface GroupedByEvent {
    eventId: string;
    eventName: string;
    date: string;
    time: string;
    placeName?: string;
    sectors: GroupedBySector[];
  }
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

      const response = await axios.post("http://localhost:3000/api/sales/confirm", {
        dniClient: user.dni,
        tickets: ticketGroups
      });

      if (response.status === 200) {
        console.log("✅ Venta confirmada exitosamente (manual).");
        localStorage.removeItem('ticket-cart');
        window.location.href = '/pay/success';
      }
    } catch (error: any) {
      console.error("❌ Error en confirmación manual:", error.response?.data || error.message);
    }
  };

  // --- Lógica para MERCADO PAGO ---
  const handlePayment = async () => {
    if (!user) {
      alert("Debes iniciar sesión para pagar con Mercado Pago.");
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:3000/api/payments/create_preference", {
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
      });

      if (data.id) {
        setPreferenceId(data.id);
      } else {
        console.error("No se recibió preferenceId:", data);
      }
    } catch (error: any) {
      console.error("Error al generar preferencia de pago:", error.response?.data || error.message);
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

      const { data } = await axios.post("http://localhost:3000/api/stripe/checkout", {
        items,
        ticketGroups,
        dniClient: user.dni,
        customerEmail: user.mail,
      });

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
    } catch (error: any) {
      console.error("❌ Error en Stripe Checkout:", error.response?.data || error.message);
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

  const groupCartByEventSector = (): GroupedByEvent[] => {
    const eventMap = new Map<string, GroupedByEvent>();

    for (const item of cartItems) {
      // Agrupamos por evento
      let eventGroup = eventMap.get(item.eventId);
      if (!eventGroup) {
        eventGroup = {
          eventId: item.eventId,
          eventName: item.eventName,
          date: item.date,
          time: item.time,
          placeName: item.placeName,
          sectors: [],
        };
        eventMap.set(item.eventId, eventGroup);
      }

      // Normalizamos sector (quitamos "Asiento xx")
      const baseSectorName = (item.sectorName || 'Sin sector').replace(/Asiento\s*\d+/gi, '').trim();

      // Buscamos si ese sector ya existe dentro del evento
      let sectorGroup = eventGroup.sectors.find(s => s.sectorName === baseSectorName);
      if (!sectorGroup) {
        sectorGroup = {
          sectorName: baseSectorName,
          totalQuantity: 0,
          totalPrice: 0,
          seatNumbers: [],
        };
        eventGroup.sectors.push(sectorGroup);
      }

      // Sumamos cantidad y precio
      sectorGroup.totalQuantity += item.quantity;
      sectorGroup.totalPrice += item.price * item.quantity;

      // Añadimos los asientos si existen
      if (item.sectorName) {
        const match = item.sectorName.match(/Asiento\s*(\d+)/i);
        if (match) {
          sectorGroup.seatNumbers.push(match[1]);
        }
      }
    }

    return Array.from(eventMap.values());
  };



  const groupedEvents = groupCartByEventSector();
  
  return (
    <div className={styles.payContainer}>
      <h1 className={styles.payTitle}>Finalizar compra</h1>

      {cartItems.length > 0 ? (
        <>
          <div className={styles.paySummarySection}>
            <h2>Resumen de tu compra</h2>

            {groupedEvents.map(event => (
              <div key={event.eventId} className={styles.payEventGroup}>
                <div className={styles.payEventHeader}>
                  {event.eventName} 
                </div>

                {event.placeName && (
                  <div className={styles.payEventPlace}>
                    Estadio: {event.placeName}
                  </div>
                )}

                <div className={styles.paySectorsList}>
                  {event.sectors.map(sector => (
                    <div key={sector.sectorName} className={styles.paySectorGroup}>
                      <div className={styles.paySectorHeader}>
                        <span>{sector.sectorName} (x{sector.totalQuantity})</span>
                        <span className={styles.paySectorPrice}>
                          ${sector.totalPrice.toFixed(2)}
                        </span>
                      </div>

                      {sector.seatNumbers.length > 0 && (
                        <div className={styles.paySeatList}>
                          Asientos: {sector.seatNumbers.sort((a, b) => Number(a) - Number(b)).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
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
              disabled={!user?.dni}
            >
              Pagar con Stripe{!user?.dni ? " (requiere login)" : ""}
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
