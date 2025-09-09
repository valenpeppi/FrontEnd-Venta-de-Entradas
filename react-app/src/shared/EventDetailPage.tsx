import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './context/CartContext';
import { useMessage } from './context/MessageContext';
import styles from './styles/EventDetailPage.module.css';

interface Seat {
  idSeat: number;
  state: string; 
}

interface Sector {
  idEvent: number;
  idSector: number;
  name: string;
  price: number;
  availableTickets: number;
  seats?: Seat[];
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

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setAppMessage } = useMessage();

  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<{ sectorId: number; seatId: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, sectorsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/events/events/${id}`),
          axios.get(`${BASE_URL}/api/events/events/${id}/sectors`)
        ]);
        setSummary(summaryRes.data);
        setSectors(sectorsRes.data.map((s: Sector) => ({ ...s, selected: 0 })));
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

  const toggleSeatSelection = (sectorId: number, seatId: number, state: string) => {
    if (state !== 'available') return;

    const exists = selectedSeats.find(s => s.sectorId === sectorId && s.seatId === seatId);

    if (exists) {
      setSelectedSeats(selectedSeats.filter(s => !(s.sectorId === sectorId && s.seatId === seatId)));
    } else {
      if (selectedSeats.length >= 3) {
        setAppMessage('Solo puedes seleccionar hasta 3 entradas por evento', 'error');
        return;
      }
      setSelectedSeats([...selectedSeats, { sectorId, seatId }]);
    }
  };

  const handleAddToCart = () => {
    if (selectedSeats.length === 0) {
      setAppMessage('Debes seleccionar al menos una entrada', 'error');
      return;
    }

    selectedSeats.forEach(sel => {
      const sector = sectors.find(s => s.idSector === sel.sectorId);
      if (sector) {
        addToCart({
          id: `${summary.id}-${sector.idSector}-${sel.seatId}`,
          eventName: summary.eventName,
          date: summary.date,
          location: summary.placeType,
          price: sector.price,
          availableTickets: sector.availableTickets,
          imageUrl: summary.imageUrl,
          type: summary.type,
          featured: false,
          time: new Date(summary.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs'
        }, 1);
      }
    });

    setAppMessage(`Has agregado ${selectedSeats.length} entradas para ${summary.eventName}`, 'success');
    navigate('/cart');
  };

  return (
    <div className={styles.eventDetailContainer}>
      <div className={styles.eventDetailCard}>
        <div className={styles.eventImageContainer}>
          <img
            src={summary.imageUrl}
            alt={summary.eventName}
            className={styles.eventImage}
            onError={(e) => { e.currentTarget.src = "/ticket.png"; }}
          />
        </div>

        <div className={styles.eventInfo}>
          <h1 className={styles.eventTitle}>{summary.eventName}</h1>
          <div className={styles.eventDetails}>
            <p><span className={styles.detailLabel}>Fecha:</span> {summary.date}</p>
            <p><span className={styles.detailLabel}>Tipo:</span> {summary.type}</p>
            <p><strong>Lugar:</strong> {summary.placeType.toLowerCase() === "hybrid" ? "Híbrido" : summary.placeType}</p>
            <p><span className={styles.detailLabel}>Entradas disponibles:</span> {summary.availableTickets}</p>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Sectores disponibles</h2>
      <div className={styles.sectorList}>
        {sectors.map((sec) => (
          <div key={sec.idSector} className={styles.sectorCard}>
            <div className={styles.sectorInfo}>
              <h3 className={styles.sectorName}>{sec.name}</h3>
              <p><span className={styles.detailLabel}>Precio:</span> ${sec.price}</p>
              <p><span className={styles.detailLabel}>Entradas disponibles:</span> {sec.availableTickets}</p>
            </div>

            {/* Input de cantidad */}
            <div className={styles.sectorInput}>
              <label htmlFor={`sector-${sec.idSector}`}>Cantidad</label>
              <input
                id={`sector-${sec.idSector}`}
                type="number"
                min={0}
                max={Math.min(3, sec.availableTickets)}
                value={sec.selected || 0}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 0;

                  const totalSelected = sectors.reduce(
                    (sum, s) => sum + (s.selected || 0),
                    0
                  ) - (sec.selected || 0) + qty;

                  if (totalSelected > 3) {
                    setAppMessage("Solo puedes comprar hasta 3 entradas en total", "error");
                    return;
                  }

                  setSectors((prev) =>
                    prev.map((s) =>
                      s.idSector === sec.idSector ? { ...s, selected: qty } : s
                    )
                  );
                }}
              />

            </div>
          </div>
        ))}
      </div>


      <div className={styles.actions}>
        <button onClick={handleAddToCart} className={styles.btnConfirm}>
          Agregar al Carrito
        </button>
      </div>
    </div>
  );

};

export default EventDetailPage;
