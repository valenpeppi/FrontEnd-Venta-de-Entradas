import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../../services/EventService';
import { useCart } from '../../shared/context/CartContext';
import { useMessage } from '../../shared/context/MessageContext';
import { useEventDetail } from '../../shared/context/EventDetailContext';
import type { Sector } from '../../types/events';
import type { CartItem } from '../../types/cart';
import EventDetailHeader from './EventDetailHeader';
import EventDetailBody from './EventDetailBody';
import styles from './styles/EventDetailPage.module.css';



const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, canAddTicketsToEvent } = useCart();
  const { setAppMessage } = useMessage();

  const {
    summary,
    sectors,
    seats,
    selectedSector,
    selectedSeatsMap,
    generalQuantity,
    setSummary,
    setSectors,
    setLoading,
    setSelectedSector,
    setSeats,
    handleSectorQuantityChange,
    handleGeneralQuantityChange,
    handleSeatsChange,
  } = useEventDetail();

  const [loadingLocal, setLoadingLocal] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [seatTicketMap, setSeatTicketMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingLocal(true);

        const summaryData = await EventService.getEventById(id!);
        const sectorsData = await EventService.getEventSectors(id!);
        if (!summaryData) {
          setAppMessage('No se encontró el evento', 'error');
          navigate('/');
          return;
        }

        setSummary({
          ...summaryData,
          imageUrl: summaryData.imageUrl || '/ticket.png',
        });

        if (summaryData.placeType.toLowerCase() !== 'nonenumerated') {
          const sectorsList: Sector[] = (sectorsData.data ?? []).map((s: Sector) => ({
            ...s,
            selected: 0,
            enumerated: s.enumerated,
          }));
          setSectors(sectorsList);
        }
      } catch (err) {
        console.error('Error al cargar detalle del evento', err);
        setAppMessage('No se pudo cargar el evento', 'error');
        navigate('/');
      } finally {
        setLoading(false);
        setLoadingLocal(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!summary) return;
    const fetchTicketMap = async () => {
      if (!summary?.id) return;
      try {
        const res = await EventService.getEventTicketMap(summary.id);
        setSeatTicketMap(res.data || {});
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
      .then((res) => setSeats(res.data ?? []))
      .catch((err) => {
        console.error('Error al cargar asientos', err);
        setAppMessage('No se pudieron cargar los asientos para este sector.', 'error');
      });
  }, [selectedSector, sectors, summary]);

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

  if (loadingLocal) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
        <p className={styles.loadingStateText}>Cargando evento...</p>
      </div>
    );
  }

  if (!summary) return <p>Evento no encontrado</p>;

  return (
    <>
      <EventDetailHeader summary={summary} />
      <EventDetailBody
        summary={summary}
        sectors={sectors}
        seats={seats}
        selectedSector={selectedSector}
        selectedSeatsMap={selectedSeatsMap}
        generalQuantity={generalQuantity}
        handleSectorQuantityChange={handleSectorQuantityChange}
        handleGeneralQuantityChange={handleGeneralQuantityChange}
        handleSeatsChange={handleSeatsChange}
        handleAddToCart={handleAddToCart}
        openSeatModal={openSeatModal}
        closeModal={closeModal}
        isModalOpen={isModalOpen}
        isModalClosing={isModalClosing}
        seatTicketMap={seatTicketMap}
        setAppMessage={setAppMessage}
        canAddTicketsToEvent={canAddTicketsToEvent}
        addToCart={addToCart}
      />
    </>
  );
};

export default EventDetailPage;
