import type { SectorListProps } from '../../../types/events';
import styles from './styles/SectorList.module.css';



const SectorList: React.FC<SectorListProps> = ({
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
                data-testid={`quantity-select-${sec.idSector}`}
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


