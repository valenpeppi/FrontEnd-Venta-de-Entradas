import React from 'react';
import type { Sector } from '../../shared/types';
import styles from './styles/SectorList.module.css';

interface CustomSectorListProps {
  sectors: Sector[];
  onQuantityChange: (sectorId: number, quantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => void;
  onSelectSeatsClick: (sectorId: number) => void;
  setAppMessage?: (message: string, type: 'success' | 'error') => void;
}


const SectorList: React.FC<CustomSectorListProps> = ({
  sectors,
  onQuantityChange,
  onSelectSeatsClick,
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
          id={`sector-card-${sec.idSector}`}
          className={styles.sectorCard}
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
            <div className={styles.sectorInput}>
                <button 
                    onClick={() => onSelectSeatsClick(sec.idSector)}
                    className={styles.selectSeatsBtn}
                >
                    Seleccionar Asientos
                </button>
            </div>
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
