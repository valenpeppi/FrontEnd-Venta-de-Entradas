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
  availableTickets: number;
  agotado: boolean;
}

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setAppMessage } = useMessage();

  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, sectorsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/events/events/${id}`),
          axios.get(`${BASE_URL}/api/events/events/${id}/sectors`)
        ]);
        setSummary(summaryRes.data);
        setSectors(sectorsRes.data);
      } catch (e) {
        console.error("Error al cargar detalle del evento", e);
        setAppMessage("No se pudo cargar el evento", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, setAppMessage]);

  if (loading) return <p>Cargando evento...</p>;
  if (!summary) return <p>Evento no encontrado</p>;

  const handleQuantityChange = (sectorId: number, qty: number) => {
    setSectors(prev =>
      prev.map(s => s.idSector === sectorId ? { ...s, selected: qty } : s)
    );
  };

  const handleAddToCart = () => {
    const selectedSectors = sectors.filter(s => s.selected && s.selected > 0);
    const totalSelected = selectedSectors.reduce((sum, s) => sum + (s.selected || 0), 0);

    if (totalSelected === 0) {
      setAppMessage("Debes seleccionar al menos una entrada", "error");
      return;
    }
    if (totalSelected > 3) {
      setAppMessage("Solo puedes comprar hasta 3 entradas por evento", "error");
      return;
    }

    selectedSectors.forEach(sec => {
      addToCart({
        id: `${summary.id}-${sec.idSector}`,
        eventName: summary.eventName,
        date: summary.date,
        location: summary.placeType,
        price: sec.price,
        availableTickets: sec.availableTickets,
        imageUrl: summary.imageUrl,
        type: summary.type,
        featured: false,
        time: new Date(summary.date).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' hs'
      }, sec.selected || 0);
            
    });

    setAppMessage(`Has agregado ${totalSelected} entradas al carrito para ${summary.eventName}`, "success");
    navigate('/cart');
  };

  return (
    <div className={styles.detailContainer}>
      <h1>{summary.eventName}</h1>
      <img src={summary.imageUrl} alt={summary.eventName} className={styles.detailImage}/>
      <p><strong>Fecha:</strong> {summary.date}</p>
      <p><strong>Tipo:</strong> {summary.type}</p>
      <p><strong>Lugar:</strong> {summary.placeType}</p>
      <p><strong>Entradas disponibles:</strong> {summary.availableTickets}</p>

      {sectors.length > 0 && (
        <div className={styles.sectorList}>
          <h2>Sectores</h2>
          {sectors.map(sec => (
            <div key={sec.idSector} className={styles.sectorCard}>
              <span>{sec.name}</span>
              <span>${sec.price.toFixed(2)}</span>
              <span>{sec.availableTickets} libres</span>
              <select
                aria-label={`Cantidad de entradas en ${sec.name}`}
                value={sec.selected || 0}
                onChange={e => handleQuantityChange(sec.idSector, parseInt(e.target.value))}
              >
                <option value={0}>0</option>
                {[1,2,3].map(n => (
                  <option key={n} value={n} disabled={n > sec.availableTickets}>{n}</option>
                ))}
              </select>

            </div>
          ))}
        </div>
      )}

      <button onClick={handleAddToCart} className={styles.btnConfirm}>
        Agregar al Carrito
      </button>
    </div>
  );
};

export default EventDetailPage;
