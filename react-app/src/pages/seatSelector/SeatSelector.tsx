import React from 'react';
import type { SeatSelectorProps } from '../../shared/types';
import styles from './styles/SeatSelector.module.css';

const SeatSelector: React.FC<SeatSelectorProps> = ({ seats, selectedSeats, onChange }) => {
  const toggleSeat = (id: number) => {
    if (selectedSeats.includes(id)) {
      onChange(selectedSeats.filter(s => s !== id));
    } else {
      onChange([...selectedSeats, id]);
    }
  };

  return (
    <div className={styles.seatSelector}>
      <div className={styles.seatGrid}>
        {seats.map(seat => (
          <div
            key={seat.id}
            onClick={() => toggleSeat(seat.id)}
            className={`${styles.seat} ${selectedSeats.includes(seat.id) ? styles.selected : ''}`}
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
