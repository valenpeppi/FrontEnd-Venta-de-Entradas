/*
Recomendaciones de Santinelli Agustín:
1. Dividir en componentes más pequeños (EventInfo, SectorList, SeatSelector, ZoomControls).
2. Unificar todas las interfaces en un unico archivo de tipos.
(EventDetailPage es un archivo muy grande y complejo).
3. Armar un EventDetailContext para manejar el estado compartido.
4. Despues de todo esto, retomar el modelado -sino cada vez se va a volver mas dificil-.

-Quise hacer uno y dos en una rama aparte pero Codex me hizo cualquier cosa. Tener mucho cuidado.-
*/
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../shared/context/CartContext';
import { useMessage } from '../../shared/context/MessageContext';
import styles from './styles/EventDetailPage.module.css';
import SeatSelector from '../../components/SeatSelector';
import estadioArroyito from '../../assets/estadio-gigante-arroyito.png';

interface Sector {
  idEvent: number;
  idSector: number;
  name: string;
  price: number;
  availableTickets: number;
  selected?: number;
  enumerated?: boolean;
}

interface EventSummary {
  id: number;
  eventName: string;
  imageUrl: string;
  type: string;
  date: string;
  placeType: string;
  placeName: string;
  availableTickets: number;
  agotado: boolean;
  price?: number;
}

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setAppMessage } = useMessage();

  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalQuantity, setGeneralQuantity] = useState(0);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [seats, setSeats] = useState<{ id: number; label?: string }[]>([]);
  const [selectedSeatsMap, setSelectedSeatsMap] = useState<Record<number, number[]>>({});
  // Zoom del plano (mantener hooks antes de cualquier return)
  const [zoom, setZoom] = useState(1);
  const minZoom = 1;
  const maxZoom = 1.7;
  const stepZoom = 0.1;
  const zoomIn = () => setZoom(z => Math.min(maxZoom, parseFloat((z + stepZoom).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(minZoom, parseFloat((z - stepZoom).toFixed(2))));
  const resetZoom = () => setZoom(1);

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
  }, [selectedSector, sectors, summary]);

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
  
  const handleSectorQuantityChange = (sectorId: number, newQuantity: number) => {
    const currentTotal =
      sectors.reduce((sum, s) => sum + (s.selected || 0), 0);
    const sectorCurrentQuantity = sectors.find(s => s.idSector === sectorId)?.selected || 0;

    if (currentTotal - sectorCurrentQuantity + newQuantity > 6) {
      setAppMessage('No puedes seleccionar más de 6 entradas en total para este evento.', 'error');
      return;
    }

    setSectors(prev =>
      prev.map(s =>
        s.idSector === sectorId ? { ...s, selected: newQuantity } : s
      )
    );
  };

  const handleSeatsChange = (sectorId: number, seatsSel: number[]) => {
    setSelectedSeatsMap(prev => ({ ...prev, [sectorId]: seatsSel }));
    setSectors(prev =>
      prev.map(s =>
        s.idSector === sectorId ? { ...s, selected: seatsSel.length } : s
      )
    );
  };
  
  const handleGeneralQuantityChange = (newQuantity: number) => {
    if (newQuantity > 6) {
      setAppMessage('No puedes seleccionar más de 6 entradas.', 'error');
      return;
    }
    setGeneralQuantity(newQuantity);
  };

  return (
    <div className={styles.eventDetailContainer}>
        <div className={styles.eventDetailCard}>
          <div className={styles.eventImageContainer}>
            <img
              src={summary.imageUrl}
              alt={summary.eventName}
              className={styles.eventImage}
              onError={(e) => {
                e.currentTarget.src = '/ticket.png';
              }}
            />
          </div>

        <div className={styles.eventInfo}>
          <h1 className={styles.eventTitle}>{summary.eventName}</h1>
          <p>
            <strong>Fecha:</strong>{' '}
            {new Date(summary.date).toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p>
            <strong>Tipo:</strong> {summary.type}
          </p>
          <p>
            <strong>Lugar:</strong> {formatPlaceType(summary.placeType)}
          </p>
          <p><strong>Estadio:</strong> {summary.placeName}</p>
          <p>
            <strong>Entradas disponibles:</strong> {summary.availableTickets}
          </p>
        </div>
      </div>

      {summary.placeType.toLowerCase() !== 'nonenumerated' && (
        <div className={styles.stadiumPlanContainer}>
          <div className={styles.zoomToolbar}>
            <button type="button" className={styles.zoomBtn} onClick={zoomOut} aria-label="Alejar">
              {/* Lupa con signo menos */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
            <button type="button" className={styles.zoomBtn} onClick={resetZoom} aria-label="Restablecer zoom">1x</button>
            <button type="button" className={styles.zoomBtn} onClick={zoomIn} aria-label="Acercar">
              {/* Lupa con signo más */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>
          </div>
          <div className={styles.stadiumContent} style={{ transform: `scale(${zoom})` }}>
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
                onChange={(e) => handleGeneralQuantityChange(parseInt(e.target.value))}
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
        <div className={styles.sectorList}>
          {sectors.map((sec) => (
            <div
              key={sec.idSector}
              className={`${styles.sectorCard} ${selectedSector === sec.idSector ? styles.activeCard : ''}`}
            >
              <div className={styles.sectorInfo}>
                <h3 className={styles.sectorName}>{sec.name}</h3>
                <p>
                  <span className={styles.detailLabel}>Precio:</span> ${sec.price}
                </p>
                <p>
                  <span className={styles.detailLabel}>
                    Entradas disponibles:
                  </span>{' '}
                  {sec.availableTickets}
                </p>
              </div>

              {sec.enumerated ? (
                selectedSector === sec.idSector ? (
                  <SeatSelector
                    seats={seats}
                    selectedSeats={selectedSeatsMap[sec.idSector] || []}
                    onChange={(sel) => handleSeatsChange(sec.idSector, sel)}
                  />
                ) : (
                  <p className={styles.selectPrompt}>Seleccione el sector en el plano</p>
                )
              ) : (
                <div className={styles.sectorInput}>
                  <label htmlFor={`sector-${sec.idSector}`}>Cantidad</label>
                  <select
                    id={`sector-${sec.idSector}`}
                    value={sec.selected || 0}
                    onChange={(e) => handleSectorQuantityChange(sec.idSector, parseInt(e.target.value))}
                    className={styles.quantitySelect}
                  >
                    {[...Array(Math.min(6, sec.availableTickets) + 1).keys()].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
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
