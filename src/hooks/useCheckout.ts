
import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/shared/context/CartContext.tsx';
import { useAuth } from '@/shared/context/AuthContext.tsx';
import { useMessage } from '@/shared/context/MessageContext';
import { PaymentService } from '@/services/PaymentService';
import { StorageService } from '@/services/StorageService';
import type { PaymentTicketGroup as TicketGroup, GroupedByEvent } from '@/types/purchase.ts';

export const useCheckout = () => {
    const { cartItems } = useCart();
    const { user } = useAuth();
    const { setAppMessage } = useMessage();
    const [isProcessing, setIsProcessing] = useState(false);

    // Auto-release stale reservations (e.g., from Back button navigation)
    useEffect(() => {
        const checkPendingReservations = async () => {
            const ticketGroupsRaw = StorageService.getItem('ticketGroups');
            if (ticketGroupsRaw) {
                try {
                    const ticketGroups = JSON.parse(ticketGroupsRaw);
                    if (Array.isArray(ticketGroups) && ticketGroups.length > 0) {
                        console.log('Releasing stale reservations from previous attempt...');
                        await PaymentService.releaseReservations(ticketGroups);
                    }
                } catch (e) {
                    console.error('Error auto-releasing reservations:', e);
                } finally {
                    StorageService.removeItem('ticketGroups');
                    StorageService.removeItem('dniClient');
                }
            }
        };

        checkPendingReservations();
    }, []);

    const calculateTotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);

    const ticketGroups = useMemo((): TicketGroup[] => {
        const map: Record<
            string,
            { idEvent: string; idPlace: string; idSector: number; ids: number[]; quantity: number }
        > = {};

        for (const item of cartItems) {
            const idEvent = String(item.eventId);
            const idPlace = String(item.idPlace);
            const idSector = Number(item.idSector);

            const hasSeatIds = Array.isArray(item.ticketIds) && item.ticketIds.length > 0;

            const key = `${idEvent} -${idPlace} -${idSector} `;
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
    }, [cartItems]);

    const groupedEvents = useMemo((): GroupedByEvent[] => {
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
    }, [cartItems]);

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

    const handleStripePayment = async () => {
        if (!user || !user.dni || !user.mail) {
            setAppMessage('Debes iniciar sesión con un usuario válido para pagar con Stripe.', 'error');
            return;
        }

        const validation = validateCartForPayment();
        if (!validation.valid) {
            setAppMessage(validation.reason || 'Hay datos inválidos en el carrito.', 'error');
            return;
        }

        setIsProcessing(true);

        try {
            const items = cartItems.map(item => ({
                name: `${item.eventName} — ${item.sectorName} `,
                amount: Math.round(item.price * 100),
                quantity: item.quantity,
            }));

            const data = await PaymentService.stripeCheckout({
                items,
                ticketGroups,
                dniClient: user.dni,
                customerEmail: user.mail,
            });

            if (data.url) {
                StorageService.setItem('ticketGroups', JSON.stringify(ticketGroups));
                StorageService.setItem('dniClient', String(user.dni));
                StorageService.setItem('ticket-cart', JSON.stringify(cartItems));

                window.location.href = data.url;
            } else {
                setAppMessage('Respuesta inválida de Stripe.', 'error');
                setIsProcessing(false);
            }
        } catch (error: any) {
            setAppMessage('Error inesperado al procesar el pago.', 'error');
            setIsProcessing(false);
        }
    };

    return {
        cartItems,
        user,
        groupedEvents,
        calculateTotal,
        handleStripePayment,
        isProcessing
    };
};
