import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventDetail } from '@/hooks/useEventDetail';
import { useCart } from '@/hooks/useCart';
import { useMessage } from '@/hooks/useMessage';
import { EventService } from '@/services/EventService';
import type { Sector } from '@/types/events';
import type { CartItem } from '@/types/cart';
import styles from '@/pages/events/detail/styles/EventDetailPage.module.css';

export const useEventDetailActions = () => {
    const navigate = useNavigate();
    const { addToCart, canAddTicketsToEvent } = useCart();
    const { setAppMessage } = useMessage();
    const sectorListRef = useRef<HTMLDivElement>(null);

    const {
        summary,
        sectors,
        seats,
        selectedSector,
        selectedSeatsMap,
        generalQuantity,
        handleSectorQuantityChange,
        handleGeneralQuantityChange,
        handleSeatsChange,
        setSelectedSector,
        setSeats,
    } = useEventDetail();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalClosing, setIsModalClosing] = useState(false);
    const [seatTicketMap, setSeatTicketMap] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!summary) return;
        const fetchTicketMap = async () => {
            if (!summary?.id) return;
            try {
                const res = await EventService.getEventTicketMap(summary.id);
                setSeatTicketMap(res || {});
            } catch (err) {
                console.error('❌ Error al cargar mapa de tickets', err);
                setSeatTicketMap({});
            }
        };
        fetchTicketMap();
    }, [summary]);

    useEffect(() => {
        if (selectedSector === null || !summary) return;
        const sec = sectors.find((s) => s.idSector === selectedSector);
        if (!sec || !sec.enumerated) return;

        EventService.getEventSeats(summary.id, selectedSector)
            .then((res) => setSeats(res ?? []))
            .catch((err) => {
                console.error('Error al cargar asientos', err);
                setAppMessage('No se pudieron cargar los asientos para este sector.', 'error');
            });
    }, [selectedSector, sectors, summary, setSeats, setAppMessage]);

    const openSeatModal = (sectorId: number) => {
        setSelectedSector(sectorId);
        setIsModalOpen(true);
        setIsModalClosing(false);
    };

    const closeModal = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setSelectedSector(null);
            setSeats([]);
        }, 300);
    };

    const handleAddToCart = async () => {
        if (!summary) {
            setAppMessage('Error: No se ha cargado la información del evento.', 'error');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setAppMessage('Debes iniciar sesión para comprar entradas', 'error');
            navigate('/login');
            return;
        }

        let totalSelected = 0;
        const itemsToAdd: Array<{ ticket: Omit<CartItem, 'quantity'>; quantity: number }> = [];

        if (summary.placeType.toLowerCase() === 'nonenumerated') {
            totalSelected = generalQuantity;
            if (totalSelected > 0) {
                const tempTicketIds = Array.from({ length: totalSelected }, (_, i) => i + 1);
                itemsToAdd.push({
                    ticket: {
                        id: `${summary.id}-general`,
                        eventId: String(summary.id),
                        eventName: summary.eventName,
                        date: summary.date,
                        location: summary.placeType,
                        placeName: summary.placeName,
                        sectorName: 'Entrada General',
                        price: summary.price || 0,
                        availableTickets: summary.availableTickets,
                        imageUrl: summary.imageUrl,
                        type: summary.type,
                        featured: false,
                        time:
                            new Date(summary.date).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            }) + ' hs',
                        idPlace: summary.idPlace,
                        idSector: sectors.length > 0 ? sectors[0].idSector : 0,
                        ticketIds: tempTicketIds,
                    },
                    quantity: totalSelected,
                });
            }
        } else {
            const nonEnum = sectors.filter((s) => !s.enumerated && s.selected && s.selected > 0);
            const enumSectors = sectors.filter((s) => s.enumerated && selectedSeatsMap[s.idSector]?.length);

            totalSelected =
                nonEnum.reduce((sum, s) => sum + (s.selected || 0), 0) +
                enumSectors.reduce((sum, s) => sum + (selectedSeatsMap[s.idSector] || []).length, 0);


            nonEnum.forEach((sec) => {
                const tempTicketIds = Array.from({ length: sec.selected || 0 }, (_, i) =>
                    `${summary.idPlace}-${sec.idSector}-temp-${i}`,
                ).map((id) => parseInt(id.split('-').pop() || '0'));

                itemsToAdd.push({
                    ticket: {
                        id: `${summary.id}-${sec.idSector}`,
                        eventId: String(summary.id),
                        eventName: summary.eventName,
                        date: summary.date,
                        location: summary.placeType,
                        placeName: summary.placeName,
                        sectorName: sec.name,
                        price: sec.price,
                        availableTickets: sec.availableTickets,
                        imageUrl: summary.imageUrl,
                        type: summary.type,
                        featured: false,
                        time:
                            new Date(summary.date).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                            }) + ' hs',
                        idPlace: summary.idPlace,
                        idSector: sec.idSector,
                        ticketIds: tempTicketIds,
                    },
                    quantity: sec.selected || 0,
                });
            });


            enumSectors.forEach((sec) => {
                (selectedSeatsMap[sec.idSector] || []).forEach((seatId) => {
                    const ticketKey = `${summary.idPlace}-${sec.idSector}-${seatId}`;
                    const ticketId = seatTicketMap[ticketKey];
                    itemsToAdd.push({
                        ticket: {
                            id: ticketKey,
                            eventId: String(summary.id),
                            eventName: summary.eventName,
                            date: summary.date,
                            location: summary.placeType,
                            placeName: summary.placeName,
                            sectorName: `${sec.name} Asiento ${seatId}`,
                            price: sec.price,
                            availableTickets: 1,
                            imageUrl: summary.imageUrl,
                            type: summary.type,
                            featured: false,
                            time:
                                new Date(summary.date).toLocaleTimeString('es-AR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) + ' hs',
                            idPlace: summary.idPlace,
                            idSector: sec.idSector,
                            ticketIds: ticketId ? [ticketId] : [],
                        },
                        quantity: 1,
                    });
                });
            });
        }

        if (totalSelected === 0) {
            setAppMessage('Debes seleccionar al menos una entrada', 'error');
            return;
        }

        const allowed = await canAddTicketsToEvent(summary.id, totalSelected);

        if (!allowed) {
            setAppMessage(
                'Solo puedes tener hasta 6 entradas en total para este evento (carrito + compradas).',
                'error',
            );
            return;
        }

        let allAddedSuccessfully = true;
        itemsToAdd.forEach((item) => {
            const wasAdded = addToCart(item.ticket, item.quantity);
            if (!wasAdded) allAddedSuccessfully = false;
        });

        if (allAddedSuccessfully) {
            setAppMessage(`Has agregado ${totalSelected} entrada(s) para ${summary.eventName}`, 'success');
            navigate('/cart');
        } else {
            setAppMessage('No puedes tener más de 6 entradas para este evento en tu carrito.', 'error');
        }
    };

    const getSectorOverlayClass = (sec: Sector) => {
        const name = sec.name.toLowerCase().trim();
        const nameToClass: Record<string, string> = {
            'tribuna norte': styles['sectorTribunaNorte'],
            'tribuna sur': styles['sectorTribunaSur'],
            popular: styles['sectorPopular'],
            campo: styles['sectorCampo'],
            vip: styles['sectorVip'],
            general: styles['sectorGeneral'],
            'sala principal': styles['sectorSalaPrincipal'],
            'tribuna superior': styles['sectorTribunaSuperior'],
        };
        const key = nameToClass[name] || `sector-${sec.idSector}`;
        const active = selectedSector === sec.idSector ? styles.activeSector : '';
        return `${styles.sectorArea} ${key} ${active}`.trim();
    };

    return {
        summary,
        sectors,
        seats,
        selectedSector,
        selectedSeatsMap,
        generalQuantity,
        isModalOpen,
        isModalClosing,
        sectorListRef,
        handleSectorQuantityChange,
        handleGeneralQuantityChange,
        handleSeatsChange,
        openSeatModal,
        closeModal,
        handleAddToCart,
        getSectorOverlayClass,
        setAppMessage
    };
};
