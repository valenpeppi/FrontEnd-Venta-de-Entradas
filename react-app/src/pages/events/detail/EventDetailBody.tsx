import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectorList from '../seats/SectorList';
import SeatSelector from '../seats/SeatSelector';
import modalStyles from '../seats/styles/SeatModal.module.css';
import styles from './styles/EventDetailPage.module.css';
import type { Sector } from '../../../types/events';
import type { CartItem } from '../../../types/cart';
import { SECTOR_LAYOUT_CONFIG, STADIUM_IMAGES } from '../../../shared/data/stadiums';
import { useEventDetail } from '../../../shared/context/EventDetailContext';
import { useCart } from '../../../shared/context/CartContext';
import { useMessage } from '../../../shared/context/MessageContext';
import { EventService } from '../../../services/EventService';

const EventDetailBody: React.FC = () => {
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

  // Fetch Ticket Map logic moved here
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

  // Fetch Seats logic needs to be triggered when sector is selected
  // The context exposes setSeats.
  // The original page had this logic. We replicate it here.
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

      // No enumeradas
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

  if (!summary) return null;

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

  const currentSelectedSector = sectors.find((s) => s.idSector === selectedSector);

  const columns =
    summary && currentSelectedSector?.enumerated
      ? SECTOR_LAYOUT_CONFIG[summary.placeName]?.[currentSelectedSector.name]
      : undefined;

  return (
    <div className={styles.eventDetailContainer}>
      {summary.placeType.toLowerCase() !== 'nonenumerated' && (
        <div className={styles.stadiumPlanContainer}>
          <div className={styles.stadiumContent}>
            <div className={styles.imageFrame}>
              <img
                src={STADIUM_IMAGES[summary.placeName] || '/ticket.png'}
                alt={`Plano del estadio ${summary.placeName}`}
                className={styles.stadiumImage}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/ticket.png';
                }}
              />

              {sectors.map((sec) => (
                <div
                  key={sec.idSector}
                  className={getSectorOverlayClass(sec)}
                  onClick={() => {
                    if (sec.enumerated) {
                      openSeatModal(sec.idSector);
                    } else {
                      sectorListRef.current?.scrollIntoView({ behavior: 'smooth' });
                      const card = document.getElementById(`sector-card-${sec.idSector}`);
                      card?.classList.add(styles.activeCard);
                      setTimeout(() => card?.classList.remove(styles.activeCard), 1500);
                    }
                  }}
                  title={sec.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div ref={sectorListRef}>
        <h2 className={styles.sectionTitle}>
          {summary.placeType.toLowerCase() === 'nonenumerated'
            ? 'Comprar Entradas'
            : 'Sectores Disponibles'}
        </h2>

        {summary.placeType.toLowerCase() === 'nonenumerated' ? (
          <div className={`${styles.sectorList} ${styles.centeredList}`}>
            <div className={styles.sectorCard} id="sector-card-general">
              <div className={styles.sectorInfo}>
                <h3 className={styles.sectorName}>Entrada General</h3>
                <p>
                  <span className={styles.detailLabel}>Precio:</span> $
                  {summary.price?.toFixed(2)}
                </p>
                <p>
                  <span className={styles.detailLabel}>Disponibles:</span>{' '}
                  {summary.availableTickets}
                </p>
              </div>
              <div className={styles.sectorInput}>
                <label htmlFor="general-quantity">Cantidad</label>
                <select
                  id="general-quantity"
                  data-testid="general-quantity"
                  value={generalQuantity}
                  onChange={(e) =>
                    handleGeneralQuantityChange(parseInt(e.target.value), setAppMessage)
                  }
                  className={styles.quantitySelect}
                >
                  {[...Array(Math.min(6, summary.availableTickets) + 1).keys()].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
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
        <div
          className={`${modalStyles.modalOverlay} ${isModalClosing ? modalStyles.modalClosing : modalStyles.modalOpen
            }`}
          onClick={closeModal}
          data-testid="seat-modal"
        >
          <div
            className={`${modalStyles.modalContent} ${isModalClosing ? modalStyles.modalClosing : modalStyles.modalOpen
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modalStyles.modalHeader}>
              <h2 className={modalStyles.modalTitle}>{currentSelectedSector.name}</h2>
              <button onClick={closeModal} className={modalStyles.closeButton}>
                &times;
              </button>
            </div>
            <div className={modalStyles.modalBody}>
              <div className={modalStyles.stage}>ESCENARIO</div>
              <div className={modalStyles.seatLegend}>
                <div className={modalStyles.legendItem}>
                  <span className={`${modalStyles.seatDemo} ${modalStyles.available}`}></span>{' '}
                  Libres
                </div>
                <div className={modalStyles.legendItem}>
                  <span className={`${modalStyles.seatDemo} ${modalStyles.occupied}`}></span>{' '}
                  Ocupados
                </div>
                <div className={modalStyles.legendItem}>
                  <span className={`${modalStyles.seatDemo} ${modalStyles.selected}`}></span>{' '}
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
                onClick={handleAddToCart}
                className={`${modalStyles.btn} ${modalStyles.btnConfirm}`}
                data-testid="add-to-cart"
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
        <button
          onClick={handleAddToCart}
          className={styles.btnConfirm}
          data-testid="page-add-to-cart"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default EventDetailBody;


