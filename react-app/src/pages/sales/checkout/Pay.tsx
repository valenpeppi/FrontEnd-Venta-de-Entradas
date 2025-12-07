import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../shared/context/CartContext.tsx';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import styles from './styles/Pay.module.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { PaymentService } from '../../../services/PaymentService';

import type { PaymentTicketGroup as TicketGroup, GroupedByEvent } from '../../../types/purchase.ts';

const Pay: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  useEffect(() => {
    initMercadoPago('APP_USR-cd78e2e4-b7ee-4b1d-ad89-e90d69693f9c', {
      locale: 'es-AR',
      advancedFraudPrevention: false,
    });
  }, []);

  useEffect(() => {
    console.log('👤 Usuario desde AuthContext:', user);
    console.log('🛒 Items del carrito:', cartItems);
  }, [user, cartItems]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const buildTicketGroups = (): TicketGroup[] => {
    const map: Record<
      string,
      { idEvent: number; idPlace: number; idSector: number; ids: number[]; quantity: number }
    > = {};

    for (const item of cartItems) {
      const idEvent = Number(item.eventId);
      const idPlace = Number(item.idPlace);
      const idSector = Number(item.idSector);

      const hasSeatIds = Array.isArray(item.ticketIds) && item.ticketIds.length > 0;

      const key = `${idEvent}-${idPlace}-${idSector}`;
      if (!map[key]) {
        map[key] = { idEvent, idPlace, idSector, ids: [], quantity: 0 };
      }

      if (hasSeatIds) {
        const cleanIds = Array.isArray(item.ticketIds)
          ? item.ticketIds
            .map((n: any) => Number(n))
            .filter((n) => Number.isFinite(n) && n > 0)
          : [];

        const seen = new Set(map[key].ids);
        for (const id of cleanIds) {
          if (!seen.has(id)) {
            map[key].ids.push(id);
            seen.add(id);
          }
        }
        map[key].quantity += Number(item.quantity) || 0;
      } else {
        map[key].quantity += Number(item.quantity) || 0;
      }
    }

    const groups: TicketGroup[] = [];
    for (const k of Object.keys(map)) {
      const g = map[k];
      if (g.ids.length > 0) {
        groups.push({
          idEvent: g.idEvent,
          idPlace: g.idPlace,
          idSector: g.idSector,
          ids: g.ids,
          quantity: g.quantity || g.ids.length,
        });
      } else {
        if (g.quantity > 0) {
          groups.push({
            idEvent: g.idEvent,
            idPlace: g.idPlace,
            idSector: g.idSector,
            quantity: g.quantity,
          });
        }
      }
    }

    return groups;
  };

  const validateCartForPayment = (): { valid: boolean; reason?: string } => {
    for (const item of cartItems) {
      const idSector = Number(item.idSector);
      const isGeneral = idSector === 0;

      if (item.idPlace == null || item.idSector == null) {
        return { valid: false, reason: 'Faltan datos del lugar o sector.' };
      }

      if (isGeneral) {
        if (!item.quantity || item.quantity <= 0) {
          return { valid: false, reason: 'Cantidad inválida para entradas generales.' };
        }
      } else {
        if (!item.ticketIds || item.ticketIds.length === 0) {
          return { valid: false, reason: 'Faltan asientos seleccionados para sector enumerado.' };
        }
      }
    }
    return { valid: true };
  };

  const handleMPPayment = async () => {
    if (!user || !user.dni || !user.mail) {
      alert('Debes iniciar sesión para pagar con Mercado Pago.');
      return;
    }

    const validation = validateCartForPayment();
    if (!validation.valid) {
      alert(validation.reason || 'Hay datos inválidos en el carrito.');
      return;
    }

    try {
      const items = cartItems.map((item, index) => ({
        id: item.ticketIds?.[0]?.toString() || item.id?.toString() || String(index),
        name: item.eventName,
        amount: Math.round(item.price * 100),
        quantity: item.quantity,
      }));

      const ticketGroups = buildTicketGroups();

      const data = await PaymentService.mpCheckout({
        items,
        dniClient: user.dni,
        customerEmail: user.mail,
        ticketGroups,
      });

      if (data.preferenceId) {
        setPreferenceId(data.preferenceId);
        localStorage.setItem('ticketGroups', JSON.stringify(ticketGroups));
        localStorage.setItem('dniClient', String(user.dni));
        localStorage.setItem('ticket-cart', JSON.stringify(cartItems));
      } else {
        console.error('❌ No se recibió preferenceId:', data);
        alert('No se pudo generar la preferencia de pago.');
      }
    } catch (error: any) {
      console.error('❌ Error al generar preferencia de pago:', error.response?.data || error.message);
      alert('Error al generar la preferencia. Ver consola.');
    }
  };

  const handleStripePayment = async () => {
    if (!user || !user.dni || !user.mail) {
      alert('Debes iniciar sesión con un usuario válido para pagar con Stripe.');
      return;
    }

    const validation = validateCartForPayment();
    if (!validation.valid) {
      alert(validation.reason || 'Hay datos inválidos en el carrito.');
      return;
    }

    try {
      const items = cartItems.map(item => ({
        name: `${item.eventName} — ${item.sectorName}`,
        amount: Math.round(item.price * 100),
        quantity: item.quantity,
      }));

      const ticketGroups = buildTicketGroups();

      const data = await PaymentService.stripeCheckout({
        items,
        ticketGroups,
        dniClient: user.dni,
        customerEmail: user.mail,
      });

      if (data.url) {
        localStorage.setItem('ticketGroups', JSON.stringify(ticketGroups));
        localStorage.setItem('dniClient', String(user.dni));
        localStorage.setItem('ticket-cart', JSON.stringify(cartItems));

        window.location.href = data.url;
      } else {
        console.error('❌ Error en Stripe Checkout, respuesta inválida:', data);
        alert('Respuesta inválida de Stripe.');
      }
    } catch (error: any) {
      console.error('❌ Error en Stripe Checkout:', error.response?.data || error.message);
      alert('Error inesperado. Ver consola.');
    }
  };

  /*
    const groupedItems = cartItems.reduce((acc, item) => {
      const key = `${item.eventName}-${item.price}`;
      if (!acc[key]) {
        acc[key] = { ...item, quantity: 0 };
      }
      acc[key].quantity += item.quantity;
      return acc;
    }, {} as Record<string, typeof cartItems[0]>);
  */

  // const groupedArray = Object.values(groupedItems); // Unused

  const groupCartByEventSector = (): GroupedByEvent[] => {
    const eventMap = new Map<string, GroupedByEvent>();

    for (const item of cartItems) {
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

      const baseSectorName = (item.sectorName || 'Sin sector').replace(/Asiento\s*\d+/gi, '').trim();

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

      sectorGroup.totalQuantity += item.quantity;
      sectorGroup.totalPrice += item.price * item.quantity;

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
                <div className={styles.payEventHeader}>{event.eventName}</div>

                {event.placeName && <div className={styles.payEventPlace}>Estadio: {event.placeName}</div>}

                <div className={styles.paySectorsList}>
                  {event.sectors.map(sector => (
                    <div key={sector.sectorName} className={styles.paySectorGroup}>
                      <div className={styles.paySectorHeader}>
                        <span>
                          {sector.sectorName} (x{sector.totalQuantity})
                        </span>
                        <span className={styles.paySectorPrice}>${sector.totalPrice.toFixed(2)}</span>
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

            <div className={styles.paySummaryTotal}>Total: ${calculateTotal().toFixed(2)}</div>
          </div>

          <div className={styles.payButtons}>
            {!preferenceId ? (
              <button onClick={handleMPPayment} className={styles.btnPay}>
                Pagar con Mercado Pago
              </button>
            ) : (
              <Wallet initialization={{ preferenceId }} />
            )}

            <button onClick={handleStripePayment} className={styles.btnStripe} disabled={!user?.dni}>
              Pagar con Stripe{!user?.dni ? ' (requiere login)' : ''}
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


