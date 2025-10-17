import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../shared/context/CartContext';
import { useMessage } from '../../shared/context/MessageContext';
import { useEventDetail } from '../../shared/context/EventDetailContext';
import type { Sector, CartItem } from '../../shared/types';
import EventDetailHeader from './EventDetailHeader';
import EventDetailBody from './EventDetailBody';
import styles from './styles/EventDetailPage.module.css';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

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

  // Cargar evento y sectores
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingLocal(true);

        const summaryRes = await axios.get(`${BASE_URL}/api/events/events/${id}`);
        const sectorsRes = await axios.get(`${BASE_URL}/api/events/events/${id}/sectors`);

        const summaryData = summaryRes.data?.data;
        if (!summaryData) {
          setAppMessage('No se encontró el evento', 'error');
          navigate('/');
          return;
        }

        setSummary({
          ...summaryData,
          imageUrl: summaryData.imageUrl || '/ticket.png',
        });
        const sectorsList: Sector[] = (sectorsRes.data?.data ?? []).map((s: any) => ({
          // ids/base
          idSector: Number(s.idSector),
          idPlace: Number(s.idPlace ?? summaryData.idPlace),
          name: String(s.name ?? 'Sector'),
          enumerated:
            typeof s.enumerated === 'boolean'
              ? s.enumerated
              : String(s.sectorType || '').toLowerCase() === 'enumerated',
          availableTickets: Number(
            s.availableTickets ?? s.available ?? s.capacity ?? 0
          ),
          price: Number(
            s.price ??
              s.eventSector?.price ??
              summaryData.price ??
              0
          ),
          // UI
          selected: 0,
        }));

        setSectors(sectorsList);
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
      try {
        const res = await axios.get(`${BASE_URL}/api/events/events/${summary.id}/tickets/map`);
        setSeatTicketMap(res.data?.data || {});
      } catch (err) {
        console.error('❌ Error al cargar mapa de tickets', err);
        setSeatTicketMap({});
      }
    };
    fetchTicketMap();
  }, [summary]);

  // Cargar asientos del sector seleccionado
  useEffect(() => {
    if (selectedSector === null || !summary) return;
    const sec = sectors.find((s) => s.idSector === selectedSector);
    if (!sec || !sec.enumerated) return;

    axios
      .get(`${BASE_URL}/api/events/events/${summary.id}/sectors/${selectedSector}/seats`)
      .then((res) => setSeats(res.data?.data ?? []))
      .catch((err) => {
        console.error('Error al cargar asientos', err);
        setAppMessage('No se pudieron cargar los asientos para este sector.', 'error');
      });
  }, [selectedSector, sectors, summary]);

  // Modal
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
        let generalSector = sectors.find(
          (s) => !s.enumerated && Number(s.idPlace) === Number(summary.idPlace)
        );
        if (!generalSector) {
          try {
            const { data } = await axios.get(
              `${BASE_URL}/api/events/events/${summary.id}/sectors`
            );
            const fetched: Sector[] = (data?.data ?? []).map((s: any) => ({
              idSector: Number(s.idSector),
              idPlace: Number(s.idPlace ?? summary.idPlace),
              name: String(s.name ?? 'Sector'),
              enumerated:
                typeof s.enumerated === 'boolean'
                  ? s.enumerated
                  : String(s.sectorType || '').toLowerCase() === 'enumerated',
              availableTickets: Number(s.availableTickets ?? s.available ?? s.capacity ?? 0),
              price: Number(s.price ?? s.eventSector?.price ?? summary.price ?? 0),
              selected: 0,
            }));
            setSectors(fetched);
            generalSector = fetched.find(
              (s) => !s.enumerated && Number(s.idPlace) === Number(summary.idPlace)
            );
          } catch {
          }
        }

        if (!generalSector) {
          setAppMessage('No se encontró el sector general para este evento.', 'error');
          return;
        }

        itemsToAdd.push({
          ticket: {
            id: `${summary.id}-general-${generalSector.idSector}`,
            eventId: String(summary.id),
            eventName: summary.eventName,
            date: summary.date,
            location: summary.placeType,
            placeName: summary.placeName,
            sectorName: 'Entrada General',
            price: Number(summary.price || generalSector.price || 0),
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
            idSector: generalSector.idSector,
            ticketIds: [],
          },
          quantity: totalSelected,
        });
      }
    } else {
      const nonEnum = sectors.filter((s) => !s.enumerated && s.selected && s.selected > 0);
      const enumSectors = sectors.filter(
        (s) => s.enumerated && selectedSeatsMap[s.idSector]?.length
      );

      totalSelected =
        nonEnum.reduce((sum, s) => sum + (s.selected || 0), 0) +
        enumSectors.reduce((sum, s) => sum + (selectedSeatsMap[s.idSector] || []).length, 0);
      nonEnum.forEach((sec) => {
        const tempTicketIds = Array.from({ length: sec.selected || 0 }, (_, i) =>
          `${summary.idPlace}-${sec.idSector}-temp-${i}`
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
            price: Number(sec.price),
            availableTickets: Number(sec.availableTickets),
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

      // Enumeradas
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
              price: Number(sec.price),
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
        'error'
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
        setSelectedSector={setSelectedSector}
        setSeats={setSeats}
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
