import React, { useRef } from 'react';
import SectorList from '../seats/SectorList';
import SeatSelector from '../seats/SeatSelector';
import modalStyles from '../seats/styles/SeatModal.module.css';
import styles from './styles/EventDetailPage.module.css';
import type { Sector, EventDetailBodyProps } from '../../../types/events';
import estadioArroyito from '../../../assets/estadio-gigante-arroyito.png';
import bioceresArena from '../../../assets/bioceres-arena.jpg';
import elCirculo from '../../../assets/el-circulo.png';

const SECTOR_LAYOUT_CONFIG: Record<string, Record<string, number>> = {
  'Estadio Gigante de Arroyito': { 'Tribuna Norte': 4, 'Tribuna Sur': 4 },
  'Bioceres Arena': { VIP: 10 },
  'El Circulo': { 'Sala Principal': 5, 'Tribuna Superior': 5 },
};

const stadiumImages: Record<string, string> = {
  'Estadio Gigante de Arroyito': estadioArroyito,
  'Bioceres Arena': bioceresArena,
  'El Circulo': elCirculo,
};

const EventDetailBody: React.FC<EventDetailBodyProps> = ({

  summary,
  sectors,
  seats,
  selectedSector,
  selectedSeatsMap,
  generalQuantity,
  handleSectorQuantityChange,
  handleGeneralQuantityChange,
  handleSeatsChange,
  handleAddToCart,
  openSeatModal,
  closeModal,
  isModalOpen,
  isModalClosing,
  setAppMessage,
}) => {
  const sectorListRef = useRef<HTMLDivElement>(null);

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
                src={stadiumImages[summary.placeName] || '/ticket.png'}
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


