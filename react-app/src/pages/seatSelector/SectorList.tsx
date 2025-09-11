import React from 'react';
import type { SectorListProps } from '../../shared/types';
import SeatSelector from './SeatSelector';
import styles from './styles/SectorList.module.css';

const SectorList: React.FC<SectorListProps> = ({
  sectors,
  selectedSector,
  onQuantityChange,
  onSeatsChange,
  selectedSeatsMap,
  seats,
  setAppMessage
}) => {
  const order = ['tribuna norte', 'tribuna sur', 'popular', 'campo'];
  const orderedSectors = [...sectors].sort((a, b) => {
    const ia = order.indexOf(a.name.toLowerCase());
    const ib = order.indexOf(b.name.toLowerCase());
    return ia - ib;
  });

  return (
    <div className={styles.sectorList}>
      {orderedSectors.map((sec) => (
        <div
          key={sec.idSector}
          className={`${styles.sectorCard} ${
            selectedSector === sec.idSector ? styles.activeCard : ''
          }`}
        >
          <div className={styles.sectorInfo}>
            <h3 className={styles.sectorName}>{sec.name}</h3>
            <p>
              <span className={styles.detailLabel}>Precio:</span> ${sec.price}
            </p>
            <p>
              <span className={styles.detailLabel}>Entradas disponibles:</span>{' '}
              {sec.availableTickets}
            </p>
          </div>

          {sec.enumerated ? (
            selectedSector === sec.idSector ? (
              <SeatSelector
                seats={seats}
                selectedSeats={selectedSeatsMap[sec.idSector] || []}
                onChange={(sel) => onSeatsChange(sec.idSector, sel)}
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
                onChange={(e) =>
                  onQuantityChange(sec.idSector, parseInt(e.target.value), setAppMessage)
                }
                className={styles.quantitySelect}
              >
                {[...Array(Math.min(6, sec.availableTickets) + 1).keys()].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SectorList;
