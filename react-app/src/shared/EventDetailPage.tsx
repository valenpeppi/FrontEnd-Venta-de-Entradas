import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import { useMessage } from './context/MessageContext';
import styles from './styles/EventDetailPage.module.css';

interface Sector {
  idEvent: number;
  idSector: number;
  name: string;
  price: number;
  availableTickets: number;
  selected?: number;
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

        const summaryData = {
          ...summaryRes.data,
          imageUrl: summaryRes.data.imageUrl
            ? `${BASE_URL}${summaryRes.data.imageUrl}`
            : '/ticket.png'
        };

        setSummary(summaryData);

        if (summaryData.placeType.toLowerCase() !== 'nonenumerated') {
          setSectors(
            sectorsRes.data.map((s: Sector) => ({
              ...s,
              selected: 0
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
    let itemsToAdd = [];
  
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
      const selectedSectors = sectors.filter((s) => s.selected && s.selected > 0);
      totalSelected = selectedSectors.reduce(
        (sum, s) => sum + (s.selected || 0),
        0
      );
      itemsToAdd = selectedSectors.map(sec => ({
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
          time: new Date(summary.date).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit"
          }) + " hs"
        },
        quantity: sec.selected || 0
      }));
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
    const currentTotal = sectors.reduce((sum, s) => sum + (s.selected || 0), 0);
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
            <div key={sec.idSector} className={styles.sectorCard}>
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

