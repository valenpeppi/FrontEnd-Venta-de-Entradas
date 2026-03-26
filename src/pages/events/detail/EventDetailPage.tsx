import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '@/services/EventService';
import { useMessage } from '@/hooks/useMessage';
import { useEventDetail } from '@/hooks/useEventDetail';
import type { Sector } from '@/types/events';
import EventDetailHeader from '@/pages/events/detail/EventDetailHeader';
import EventDetailBody from '@/pages/events/detail/EventDetailBody';
import styles from '@/pages/events/detail/styles/EventDetailPage.module.css';
import ticketPlaceholder from '@/assets/ticket.png';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setAppMessage } = useMessage();

  const {
    setSummary,
    setSectors,
    setLoading,
    resetEventDetail,
  } = useEventDetail();

  const [loadingLocal, setLoadingLocal] = useState(true);

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
          imageUrl: summaryData.imageUrl || ticketPlaceholder,
        });

        const sectorsList: Sector[] = (Array.isArray(sectorsData) ? sectorsData : []).map((s: Sector) => ({
          ...s,
          selected: 0,
          enumerated: s.enumerated,
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

    return () => {
      resetEventDetail();
    };
  }, [id]);


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

  return (
    <>
      <EventDetailHeader />
      <EventDetailBody />
    </>
  );
};

export default EventDetailPage;


