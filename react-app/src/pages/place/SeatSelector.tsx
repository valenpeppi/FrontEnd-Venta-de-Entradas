import React from 'react';

interface Seat {
  id: number;
  label?: string;
}

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: number[];
  onChange: (selected: number[]) => void;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ seats, selectedSeats, onChange }) => {
  const toggleSeat = (id: number) => {
    if (selectedSeats.includes(id)) {
      onChange(selectedSeats.filter(s => s !== id));
    } else {
      onChange([...selectedSeats, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {seats.map(seat => (
        <div
          key={seat.id}
          onClick={() => toggleSeat(seat.id)}
          style={{
            padding: '6px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            background: selectedSeats.includes(seat.id) ? '#10b981' : '#f9fafb',
            color: selectedSeats.includes(seat.id) ? '#fff' : '#111',
            userSelect: 'none'
          }}
        >
          {seat.label || seat.id}
        </div>
      ))}
    </div>
  );
};

export default SeatSelector;
