import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

type CartItemGroupKey = string;

export const useCartPage = () => {
    const { cartItems, removeItem, updateItemQuantity, canAddTicketsToEvent } = useCart();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        console.log('useCartPage: Items en el carrito:', cartItems);
    }, [cartItems]);

    const getSectorGroupName = (sectorName: string | undefined): string => {
        if (!sectorName) return 'Otro';
        return sectorName.replace(/Asiento\s*\d+/gi, '').trim();
    };

    const extractSeatNumber = (sectorName: string | undefined): string | null => {
        if (!sectorName) return null;
        const match = sectorName.match(/Asiento\s*(\d+)/i);
        return match ? match[1] : null;
    };

    const groupCartItems = () => {
        const groups = new Map<CartItemGroupKey, any>();

        for (const item of cartItems) {
            const sectorGroup = getSectorGroupName(item.sectorName);
            const seatNumber = extractSeatNumber(item.sectorName);
            const key = `${item.eventName}-${item.date}-${item.time}-${item.location}-${sectorGroup}-${item.price}`;

            if (!groups.has(key)) {
                groups.set(key, {
                    ...item,
                    ids: [item.id],
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity,
                    groupedSectorName: sectorGroup,
                    seatNumbers: seatNumber ? [seatNumber] : [],
                });
            } else {
                const group = groups.get(key);
                group.quantity += item.quantity;
                group.totalPrice += item.price * item.quantity;
                group.ids.push(item.id);
                if (seatNumber) group.seatNumbers.push(seatNumber);
            }
        }

        return Array.from(groups.values());
    };

    const groupedItems = groupCartItems();

    const calculateTotal = () => {
        return groupedItems.reduce((total, group) => total + group.totalPrice, 0);
    };

    const handleQuantityChange = async (groupIds: string[], value: string) => {
        const newQuantity = parseInt(value, 10);
        if (isNaN(newQuantity)) return;

        const ticket = cartItems.find(item => item.id === groupIds[0]);
        if (!ticket) return;

        const eventId = ticket.eventId;

        const delta = newQuantity - ticket.quantity;
        if (delta <= 0) {
            const wasUpdated = updateItemQuantity(groupIds[0], newQuantity);
            if (!wasUpdated) {
                setErrorMsg('Error al actualizar cantidad.');
            } else {
                setErrorMsg(null);
            }
            return;
        }

        if (groupIds.length === 1) {
            const canAdd = await canAddTicketsToEvent(eventId, delta);
            if (!canAdd) {
                setErrorMsg('No puedes tener más de 6 entradas por evento (compradas + carrito).');
                return;
            }

            const wasUpdated = updateItemQuantity(groupIds[0], newQuantity);
            if (!wasUpdated) {
                setErrorMsg('No puedes tener más de 6 entradas por evento en tu carrito.');
            } else {
                setErrorMsg(null);
            }
        } else {
            setErrorMsg('No se puede editar la cantidad de entradas agrupadas con asiento. Elimina y vuelve a agregar.');
        }
    };

    const handleRemoveGroup = (groupIds: string[]) => {
        groupIds.forEach(id => removeItem(id));
    };

    return {
        groupedItems,
        calculateTotal,
        handleQuantityChange,
        handleRemoveGroup,
        errorMsg
    };
};
