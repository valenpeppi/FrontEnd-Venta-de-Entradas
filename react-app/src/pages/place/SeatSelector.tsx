// pages/place/SeatSelector.tsx
import React from "react";
import type { Seat } from "../../shared/context/Interfaces";
import s from "./styles/SeatSelector.module.css";

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeats: number[];
  onChange: (selected: number[]) => void;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ seats, selectedSeats, onChange }) => {
  const toggleSeat = (id: number) => {
    if (selectedSeats.includes(id)) {
      onChange(selectedSeats.filter((s) => s !== id));
    } else {
      onChange([...selectedSeats, id]);
    }
  };

  return (
    <div className={s.seatGrid}>
      {seats.map((seat) => (
        <div
          key={seat.id}
          onClick={() => toggleSeat(seat.id)}
          className={`${s.seat} ${selectedSeats.includes(seat.id) ? s.selected : ""}`}
        >
          {seat.label || seat.id}
        </div>
      ))}
    </div>
  );
};

export default SeatSelector;
