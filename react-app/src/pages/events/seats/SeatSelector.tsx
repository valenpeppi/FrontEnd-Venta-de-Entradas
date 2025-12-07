import React from 'react';
import type { SeatSelectorProps } from '../../../types/events';
import styles from './styles/SeatSelector.module.css';


const SeatSelector: React.FC<SeatSelectorProps> = ({ seats, selectedSeats, onChange, setAppMessage, enumerated = false, columns }) => {
  const toggleSeat = (id: number) => {
    const seat = seats.find(s => s.id === id);
    if (!seat || seat.state !== 'available') {
      return;
    }

    if (selectedSeats.includes(id)) {
      onChange(selectedSeats.filter(s => s !== id));
    } else {
      if (selectedSeats.length >= 6) {
        if (setAppMessage) {
          setAppMessage('No puedes seleccionar más de 6 asientos.', 'error');
        }
        return;
      }
      onChange([...selectedSeats, id]);
    }
  };

  const gridStyle = enumerated && columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : {};

  return (
    <div className={styles.seatSelector}>
      <div
        className={`${styles.seatGrid} ${enumerated ? styles.verticalGrid : styles.defaultGrid}`}
        style={gridStyle}
      >
        {seats.map(seat => (
          <div
            key={seat.id}
            onClick={() => toggleSeat(seat.id)}
            className={[
              styles.seat,
              seat.state === 'reserved' || seat.state === 'sold'
                ? styles.reserved
                : styles.available,
              selectedSeats.includes(seat.id) ? styles.selected : '',
            ].join(' ')}
            data-testid={seat.state === 'available' ? `seat-available-${seat.id}` : `seat-${seat.id}`}
            title={seat.state === 'reserved' ? 'Asiento no disponible' : `Asiento ${seat.label}`}
          >
            {seat.label || seat.id}
          </div>

        ))}
      </div>
      {selectedSeats.length > 0 && (
        <div className={styles.selectionInfo}>
          <span>Asientos seleccionados: {selectedSeats.length}</span>
        </div>
      )}
    </div>
  );
};

export default SeatSelector;



