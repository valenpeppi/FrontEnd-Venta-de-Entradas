import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../shared/context/CartContext.tsx';
import { useMessage } from '../../shared/context/MessageContext.tsx';
import { useEventDetail } from '../../shared/context/EventDetailContext.tsx';
import type { Sector, CartItem } from '../../shared/types.ts';
import styles from './styles/EventDetailPage.module.css';
import modalStyles from '../seatSelector/styles/SeatModal.module.css';
import SectorList from '../seatSelector/SectorList.tsx';
import estadioArroyito from '../../assets/estadio-gigante-arroyito.png';
import bioceresArena from '../../assets/bioceres-arena.jpg';
import elCirculo from '../../assets/el-circulo.png';
import SeatSelector from '../seatSelector/SeatSelector.tsx';
import { formatLongDate, formatTime } from '../../shared/utils/dateFormatter';

import {
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdLocationCity,
  MdAudiotrack,
  MdConfirmationNumber,
} from "react-icons/md";

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface ItemToAdd {
  ticket: Omit<CartItem, 'quantity'>;
  quantity: number;
  seats?: (string | number)[];
}

const SECTOR_LAYOUT_CONFIG: Record<string, Record<string, number>> = {
  'Estadio Gigante de Arroyito': { 'Tribuna Norte': 4, 'Tribuna Sur': 4 },
  'Bioceres Arena': { 'VIP': 10 },
  'El Circulo': { 'Sala Principal': 5, 'Tribuna Superior': 5 }
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems, canAddTicketsToEvent } = useCart();
  const { setAppMessage } = useMessage();
  const sectorListRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const [seatTicketMap, setSeatTicketMap] = useState<Record<string, number>>({});

  const {
    summary, sectors, loading, generalQuantity, selectedSector, seats,
    selectedSeatsMap, setSummary, setSectors, setLoading,
    setSelectedSector, setSeats, handleSectorQuantityChange, handleSeatsChange,
    handleGeneralQuantityChange
  } = useEventDetail();

  const stadiumImages: Record<string, string> = {
    'Estadio Gigante de Arroyito': estadioArroyito,
    'Bioceres Arena': bioceresArena,
    'El Circulo': elCirculo,
  };

  useEffect(() => {
    if (!summary) return;
    const fetchTicketMap = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/events/events/${summary.id}/tickets/map`);
        setSeatTicketMap(res.data?.data || {});
      } catch (err) {
        console.error("❌ Error al cargar mapa de tickets", err);
        setSeatTicketMap({});
      }
    };
    fetchTicketMap();
  }, [summary]);

  const getSectorOverlayClass = (sec: Sector) => {
    const name = sec.name.toLowerCase().trim();
    const nameToClass: Record<string, string> = {
      'tribuna norte': styles.sectorTribunaNorte,
      'tribuna sur': styles.sectorTribunaSur,
      'popular': styles.sectorPopular,
      'campo': styles.sectorCampo,
      'vip': styles.sectorVip,
      'general': styles.sectorGeneral,
      'sala principal': styles.sectorSalaPrincipal,
      'tribuna superior': styles.sectorTribunaSuperior,
    };
    const key = nameToClass[name] || `sector-${sec.idSector}`;
    const active = selectedSector === sec.idSector ? styles.activeSector : '';
    return `${styles.sectorArea} ${key || ''} ${active}`.trim();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
          imageUrl: summaryData.imageUrl || "/ticket.png"
        });

        if (summaryData.placeType.toLowerCase() !== 'nonenumerated') {
          setSectors(
            (sectorsRes.data?.data ?? []).map((s: Sector) => ({
              ...s,
              selected: 0,
              enumerated: s.enumerated,
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
  }, [id]);


  useEffect(() => {
    if (selectedSector !== null) {
      const sec = sectors.find(s => s.idSector === selectedSector);
      if (sec && sec.enumerated && summary) {
        axios.get(`${BASE_URL}/api/events/events/${summary.id}/sectors/${selectedSector}/seats`)
          .then(res => setSeats(res.data?.data ?? []))
          .catch(err => {
            console.error('Error al cargar asientos', err);
            setAppMessage('No se pudieron cargar los asientos para este sector.', 'error');
          });
      }
    }
  }, [selectedSector, sectors, summary, setSeats, setAppMessage, id]);

  const openSeatModal = (sectorId: number) => {
    const sector = sectors.find(s => s.idSector === sectorId);
    if (sector?.enumerated) {
      setSelectedSector(sectorId);
      setIsModalOpen(true);
      setIsModalClosing(false);
    }
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedSector(null);
      setSeats([]);
    }, 300);
  };

  const handleAddToCartInModal = () => {
    handleAddToCart();
    closeModal();
  };

  const handleAddToCart = () => {
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
    let itemsToAdd: ItemToAdd[] = [];

    if (summary.placeType.toLowerCase() === 'nonenumerated') {
      totalSelected = generalQuantity;
      if (totalSelected > 0) {
        // Para entrada general, generar IDs temporales
        const tempTicketIds = Array.from({ length: totalSelected }, (_, i) => i + 1);
        
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
            time: new Date(summary.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs',
            idPlace: summary.idPlace,
            idSector: 0,
            ticketIds: tempTicketIds,
          },
          quantity: totalSelected
        });
      }
    } else {
      const nonEnum = sectors.filter(s => !s.enumerated && s.selected && s.selected > 0);
      const enumSectors = sectors.filter(s => s.enumerated && selectedSeatsMap[s.idSector]?.length);

      totalSelected =
        nonEnum.reduce((sum, s) => sum + (s.selected || 0), 0) +
        enumSectors.reduce((sum, s) => sum + (selectedSeatsMap[s.idSector] || []).length, 0);

      itemsToAdd = [
        ...nonEnum.map(sec => {
          // Para sectores no enumerados, generar IDs temporales basados en la cantidad
          const tempTicketIds = Array.from({ length: sec.selected || 0 }, (_, i) => 
            `${summary.idPlace}-${sec.idSector}-temp-${i}`
          ).map(id => parseInt(id.split('-').pop() || '0'));
          
          return {
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
              time: new Date(summary.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs',
              idPlace: summary.idPlace,
              idSector: sec.idSector,
              ticketIds: tempTicketIds,
            },
            quantity: sec.selected || 0
          };
        }),
        ...enumSectors.flatMap(sec =>
          (selectedSeatsMap[sec.idSector] || []).map(seatId => {
            const ticketKey = `${summary.idPlace}-${sec.idSector}-${seatId}`;
            const ticketId = seatTicketMap[ticketKey];
            return {
              ticket: {
                id: ticketKey,
                eventId: String(summary.id),
                eventName: summary.eventName,
                date: summary.date,
                location: formatPlaceType(summary.placeType),
                placeName: summary.placeName,
                sectorName: `${sec.name} Asiento ${seatId}`,
                price: sec.price,
                availableTickets: 1,
                imageUrl: summary.imageUrl,
                type: summary.type,
                featured: false,
                time: new Date(summary.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs',
                idPlace: summary.idPlace,
                idSector: sec.idSector,
                ticketIds: ticketId ? [ticketId] : [],
              },
              quantity: 1,
              seats: [seatId],
            };
          })
        )
      ];
    }

    if (totalSelected === 0) {
      setAppMessage('Debes seleccionar al menos una entrada', 'error');
      return;
    }
  const allowed = canAddTicketsToEvent(summary.id, totalSelected);

    if (!allowed) {
      setAppMessage('Solo puedes tener hasta 6 entradas en total para este evento (carrito + compradas).', 'error');
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
      setAppMessage(`Has agregado ${totalSelected} entrada(s) para ${summary.eventName}`, 'success');
      navigate('/cart');
    } else {
      setAppMessage('No puedes tener más de 6 entradas para este evento en tu carrito.', 'error');
    }
  };


  const formatPlaceType = (placeType: string) => {
    switch (placeType.toLowerCase()) {
      case 'hybrid': return 'Híbrido';
      case 'nonenumerated': return 'Único';
      case 'enumerated': return 'Enumerado';
      default: return placeType;
    }
  };

  if (loading) return (
    <div className={styles.loadingState}>
    <div className={styles.loadingDots}>
      <span className={styles.dot}></span>
      <span className={styles.dot}></span>
      <span className={styles.dot}></span>
    </div>
    <p className={styles.loadingStateText}>Cargando evento...</p>
  </div>);
  if (!summary) return <p>Evento no encontrado</p>;

  const currentSelectedSector = sectors.find(s => s.idSector === selectedSector);

  const getSectorColumns = () => {
    if (summary && currentSelectedSector && currentSelectedSector.enumerated) {
      return SECTOR_LAYOUT_CONFIG[summary.placeName]?.[currentSelectedSector.name];
    }
    return undefined;
  };

  const columns = getSectorColumns();
  const handleSectorClick = (sector: Sector) => {
    if (sector.enumerated) {
      openSeatModal(sector.idSector);
    } else {
      sectorListRef.current?.scrollIntoView({ behavior: 'smooth' });
      const sectorCard = document.getElementById(`sector-card-${sector.idSector}`);
      sectorCard?.classList.add(styles.activeCard);
      setTimeout(() => {
        sectorCard?.classList.remove(styles.activeCard);
      }, 1500);
    }
  };


  return (
    <div className={styles.eventDetailContainer}>
      <div className={styles.eventSummaryCard}>
        <img
          src={summary.imageUrl || "/ticket.png"}
          alt={summary.eventName}
          className={styles.eventImage}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/ticket.png";
          }}
        />
        <div className={styles.eventInfo}>
          <h1 className={styles.eventTitle}>{summary.eventName}</h1>
          <p className={styles.infoRow}>
            <span>
              {summary.description}
            </span>
          </p>
          <p className={styles.infoRow}>
            <MdCalendarToday className={styles.icon} />
            <span>
              <strong>Fecha:</strong> {formatLongDate(summary.date)}
            </span>
          </p>
          <p className={styles.infoRow}>
            <MdAccessTime className={styles.icon} />
            <span>
              <strong>Hora:</strong> {formatTime(summary.date)}
            </span>
          </p>
          <p className={styles.infoRow}>
            <MdAudiotrack className={styles.icon} />
            <span>
              <strong>Tipo:</strong> {summary.type}
            </span>
          </p>

          <p className={styles.infoRow}>
            <MdLocationOn className={styles.icon} />
            <span>
              <strong>Estadio:</strong> {summary.placeName}
            </span>
          </p>

          <p className={styles.infoRow}>
            <MdConfirmationNumber className={styles.icon} />
            <span>
              <strong>Entradas disponibles:</strong> {summary.availableTickets}
            </span>
          </p>

        </div>
      </div>

      {summary.placeType.toLowerCase() !== "nonenumerated" && (
        <div className={styles.stadiumPlanContainer}>
          <div className={styles.stadiumContent}>
            <div className={styles.imageFrame}>
              <img
                src={stadiumImages[summary.placeName] || "/ticket.png"}
                alt={`Plano del estadio ${summary.placeName}`}
                className={styles.stadiumImage}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/ticket.png";
                }}
              />
              {sectors.map((sec) => (
                <div
                  key={sec.idSector}
                  className={getSectorOverlayClass(sec)}
                  onClick={() => handleSectorClick(sec)}
                  title={sec.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={sectorListRef}>
        <h2 className={styles.sectionTitle}>
          {summary.placeType.toLowerCase() === "nonenumerated"
            ? "Comprar Entradas"
            : "Sectores Disponibles"}
        </h2>

        {summary.placeType.toLowerCase() === "nonenumerated" ? (
          <div className={`${styles.sectorList} ${styles.centeredList}`}>
            <div className={styles.sectorCard} id="sector-card-general">
              <div className={styles.sectorInfo}>
                <h3 className={styles.sectorName}>Entrada General</h3>
                <p>
                  <span className={styles.detailLabel}>Precio:</span> $
                  {summary.price?.toFixed(2)}
                </p>
                <p>
                  <span className={styles.detailLabel}>Disponibles:</span>{" "}
                  {summary.availableTickets}
                </p>
              </div>
              <div className={styles.sectorInput}>
                <label htmlFor="general-quantity">Cantidad</label>
                <select
                  id="general-quantity"
                  value={generalQuantity}
                  onChange={(e) =>
                    handleGeneralQuantityChange(
                      parseInt(e.target.value),
                      setAppMessage
                    )
                  }
                  className={styles.quantitySelect}
                >
                  {[...Array(Math.min(6, summary.availableTickets) + 1).keys()].map(
                    (n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <SectorList
            sectors={sectors}
            onQuantityChange={handleSectorQuantityChange}
            onSelectSeatsClick={openSeatModal}
            setAppMessage={setAppMessage}
          />
        )}
      </div>

      {isModalOpen && currentSelectedSector?.enumerated && (
         <div className={`${modalStyles.modalOverlay} ${isModalClosing ? modalStyles.modalClosing : modalStyles.modalOpen}`} onClick={closeModal}>
          <div
            className={`${modalStyles.modalContent} ${isModalClosing ? modalStyles.modalClosing : modalStyles.modalOpen}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.modalHeader}>
              <h2 className={modalStyles.modalTitle}>
                {currentSelectedSector.name}
              </h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                &times;
              </button>
            </div>
            <div className={modalStyles.modalBody}>
              <div className={modalStyles.stage}>ESCENARIO</div>
              <div className={modalStyles.seatLegend}>
                <div className={modalStyles.legendItem}>
                  <span
                    className={`${modalStyles.seatDemo} ${modalStyles.available}`}
                  ></span>{" "}
                  Libres
                </div>
                <div className={modalStyles.legendItem}>
                  <span
                    className={`${modalStyles.seatDemo} ${modalStyles.occupied}`}
                  ></span>{" "}
                  Ocupados
                </div>
                <div className={modalStyles.legendItem}>
                  <span
                    className={`${modalStyles.seatDemo} ${modalStyles.selected}`}
                  ></span>{" "}
                  Seleccionados
                </div>
              </div>
              <SeatSelector
                seats={seats}
                selectedSeats={selectedSeatsMap[selectedSector!] || []}
                onChange={(sel: number[]) => handleSeatsChange(selectedSector!, sel)}
                setAppMessage={setAppMessage}
                sectorName={currentSelectedSector.name}
                enumerated={currentSelectedSector.enumerated}
                columns={columns}
              />
            </div>
            <div className={modalStyles.modalFooter}>
              <button
                onClick={handleAddToCartInModal}
                className={`${modalStyles.btn} ${modalStyles.btnConfirm}`}
              >
                Agregar al carrito
              </button>
              <button
                onClick={closeModal}
                className={`${modalStyles.btn} ${modalStyles.btnCancel}`}
              >
                Cerrar
              </button>
            </div>
          </div>
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

