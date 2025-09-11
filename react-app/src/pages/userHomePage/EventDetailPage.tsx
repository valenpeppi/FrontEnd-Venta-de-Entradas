import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../shared/context/CartContext';
import { useMessage } from '../../shared/context/MessageContext';
import { useEventDetail } from '../../shared/context/EventDetailContext';
import type { Sector } from '../../shared/types';
import styles from './styles/EventDetailPage.module.css';
import EventInfo from '../seatSelector/EventInfo';
import SectorList from '../seatSelector/SectorList';
import ZoomControls from '../seatSelector/ZoomControls';
import estadioArroyito from '../../assets/estadio-gigante-arroyito.png';

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setAppMessage } = useMessage();
  
  const {
    summary,
    sectors,
    loading,
    generalQuantity,
    selectedSector,
    seats,
    selectedSeatsMap,
    zoom,
    setSummary,
    setSectors,
    setLoading,
    setSelectedSector,
    setSeats,
    handleSectorQuantityChange,
    handleSeatsChange,
    handleGeneralQuantityChange,
    zoomIn,
    zoomOut,
    resetZoom
  } = useEventDetail();

  const minZoom = 1;
  const maxZoom = 1.7;

  const stadiumImages: Record<string, string> = {
    'Estadio Gigante de Arroyito': estadioArroyito
  };

  // Pasamos estilos de sectores a CSS por nombre
  const getSectorOverlayClass = (sec: Sector) => {
    const name = sec.name.toLowerCase().trim();
    const nameToClass: Record<string, string> = {
      'tribuna norte': 'sector-1',
      'tribuna sur': 'sector-2',
      'popular': 'sector-3',
      'campo': 'sector-4'
    };
    const key = nameToClass[name] || `sector-${sec.idSector}`;
    const active = selectedSector === sec.idSector ? styles.activeSector : '';
    return `${styles.sectorArea} ${styles[key] || ''} ${active}`.trim();
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, sectorsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/events/events/${id}`),
          axios.get(`${BASE_URL}/api/events/events/${id}/sectors`)
        ]);

        const summaryData = summaryRes.data?.data; // 👈 ahora siempre en .data
        if (!summaryData) {
          setAppMessage('No se encontró el evento', 'error');
          navigate('/');
          return;
        }

        setSummary({
          ...summaryData,
          imageUrl: summaryData.imageUrl || "/ticket.png"
        });

        if (summaryData.placeType.toLowerCase() !== 'nonenumerated') {
          setSectors(
            (sectorsRes.data?.data ?? []).map((s: Sector) => ({
              ...s,
              selected: 0,
              enumerated: !['campo', 'popular'].includes(s.name.toLowerCase())
            }))
          );
        }
      } catch (e) {
        console.error('Error al cargar detalle del evento', e);
        setAppMessage('No se pudo cargar el evento', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, setAppMessage]);

  useEffect(() => {
    if (selectedSector !== null) {
      const sec = sectors.find(s => s.idSector === selectedSector);
      if (sec && sec.enumerated && summary) {
        axios
          .get(`${BASE_URL}/api/events/events/${summary.id}/sectors/${selectedSector}/seats`)
          .then(res => {
            const seatData = res.data?.data ?? [];
            setSeats(
              seatData.map((st: any) => ({
                id: st.id || st.idSeat || st.number,
                label: st.label || st.number?.toString() || String(st.id)
              }))
            );
          })
          .catch(err => console.error('Error al cargar asientos', err));
      } else {
        setSeats([]);
      }
    }
  }, [selectedSector, sectors, summary, setSeats]);

  if (loading) return <p>Cargando evento...</p>;
  if (!summary) return <p>Evento no encontrado</p>;

  const handleAddToCart = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAppMessage('Debes iniciar sesión para comprar entradas', 'error');
      navigate('/login');
      return;
    }
  
    let totalSelected = 0;
    let itemsToAdd: any[] = [];
    // La imagen del estadio se usa solo para el plano; en el carrito usamos la foto del evento

    if (summary.placeType.toLowerCase() === 'nonenumerated') {
      totalSelected = generalQuantity;
      if (totalSelected > 0) {
        itemsToAdd.push({
          ticket: {
            id: `${summary.id}-general`,
            eventId: String(summary.id),
            eventName: summary.eventName,
            date: summary.date,
            location: formatPlaceType(summary.placeType),
            placeName: summary.placeName,
            sectorName: 'Entrada General',
            price: summary.price || 0,
            availableTickets: summary.availableTickets,
            imageUrl: summary.imageUrl,
            type: summary.type,
            featured: false,
            time: new Date(summary.date).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit'
            }) + ' hs'
          },
          quantity: totalSelected
        });
      }
    } else {
      const nonEnum = sectors.filter(s => !s.enumerated && s.selected && s.selected > 0);
      const enumSectors = sectors.filter(s => s.enumerated && selectedSeatsMap[s.idSector]?.length);

      totalSelected =
        nonEnum.reduce((sum, s) => sum + (s.selected || 0), 0) +
        enumSectors.reduce((sum, s) => sum + selectedSeatsMap[s.idSector].length, 0);

      itemsToAdd = [
        ...nonEnum.map(sec => ({
          ticket: {
            id: `${summary.id}-${sec.idSector}`,
            eventId: String(summary.id),
            eventName: summary.eventName,
            date: summary.date,
            location: formatPlaceType(summary.placeType),
            placeName: summary.placeName,
            sectorName: sec.name,
            price: sec.price,
            availableTickets: sec.availableTickets,
            imageUrl: summary.imageUrl,
            type: summary.type,
            featured: false,
            time: new Date(summary.date).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit'
            }) + ' hs'
          },
          quantity: sec.selected || 0
        })),
        ...enumSectors.flatMap(sec =>
          selectedSeatsMap[sec.idSector].map(seatId => ({
            ticket: {
              id: `${summary.id}-${sec.idSector}-${seatId}`,
              eventId: String(summary.id),
              eventName: summary.eventName,
              date: summary.date,
              location: formatPlaceType(summary.placeType),
              placeName: summary.placeName,
              sectorName: `${sec.name} Asiento ${seatId}`,
              price: sec.price,
              availableTickets: sec.availableTickets,
              imageUrl: summary.imageUrl,
              type: summary.type,
              featured: false,
              time: new Date(summary.date).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit'
              }) + ' hs'
            },
            quantity: 1
          }))
        )
      ];
    }
  
    if (totalSelected === 0) {
      setAppMessage('Debes seleccionar al menos una entrada', 'error');
      return;
    }
  
    if (totalSelected > 6) {
      setAppMessage('Solo puedes comprar hasta 6 entradas en total para este evento.', 'error');
      return;
    }
  
    let allAddedSuccessfully = true;
    itemsToAdd.forEach(item => {
      const wasAdded = addToCart(item.ticket, item.quantity);
      if (!wasAdded) {
        allAddedSuccessfully = false;
      }
    });
  
    if (allAddedSuccessfully) {
      setAppMessage(
        `Has agregado ${totalSelected} entradas para ${summary.eventName}`,
        'success'
      );
      navigate('/cart');
    } else {
      setAppMessage('No puedes tener más de 6 entradas para este evento en tu carrito.', 'error');
    }
  };
  
  const formatPlaceType = (placeType: string) => {
    switch (placeType.toLowerCase()) {
      case 'hybrid':
        return 'Híbrido';
      case 'nonenumerated':
        return 'Único';
      case 'enumerated':
        return 'Enumerado';
      default:
        return placeType;
    }
  };

  return (
    <div className={styles.eventDetailContainer}>
      <EventInfo summary={summary} />

      {summary.placeType.toLowerCase() !== 'nonenumerated' && (
        <div className={styles.stadiumPlanContainer}>
          <ZoomControls
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={resetZoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
          />
          <div 
            className={styles.stadiumContent}
            data-zoom={zoom}
          >
            <div className={styles.imageFrame}>
              <img
                src={stadiumImages[summary.placeName] || '/ticket.png'}
                alt={`Plano del estadio ${summary.placeName}`}
                className={styles.stadiumImage}
                onError={(e) => {
                  e.currentTarget.src = '/ticket.png';
                }}
              />
              {sectors.map(sec => (
                <div
                  key={sec.idSector}
                  className={getSectorOverlayClass(sec)}
                  onClick={() => setSelectedSector(sec.idSector)}
                  title={sec.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className={styles.sectionTitle}>
        {summary.placeType.toLowerCase() === 'nonenumerated' ? 'Comprar Entradas' : 'Sectores Disponibles'}
      </h2>

      {summary.placeType.toLowerCase() === 'nonenumerated' ? (
        <div className={`${styles.sectorList} ${styles.centeredList}`}>
           <div className={styles.sectorCard}>
             <div className={styles.sectorInfo}>
               <h3 className={styles.sectorName}>Entrada General</h3>
               <p>
                 <span className={styles.detailLabel}>Precio:</span> ${summary.price?.toFixed(2)}
               </p>
               <p>
                 <span className={styles.detailLabel}>
                   Entradas disponibles:
                 </span>{' '}
                 {summary.availableTickets}
               </p>
             </div>
             <div className={styles.sectorInput}>
               <label htmlFor="general-quantity">Cantidad</label>
               <select
                 id="general-quantity"
                 value={generalQuantity}
                 onChange={(e) => handleGeneralQuantityChange(parseInt(e.target.value), setAppMessage)}
                 className={styles.quantitySelect}
               >
                 {[...Array(Math.min(6, summary.availableTickets) + 1).keys()].map(n => (
                   <option key={n} value={n}>{n}</option>
                 ))}
               </select>
             </div>
           </div>
        </div>
      ) : (
        <SectorList
          sectors={sectors}
          selectedSector={selectedSector}
          onQuantityChange={handleSectorQuantityChange}
          onSeatsChange={handleSeatsChange}
          selectedSeatsMap={selectedSeatsMap}
          seats={seats}
          setAppMessage={setAppMessage}
        />
      )}

      <div className={styles.actions}>
        <button onClick={handleAddToCart} className={styles.btnConfirm}>
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default EventDetailPage;
