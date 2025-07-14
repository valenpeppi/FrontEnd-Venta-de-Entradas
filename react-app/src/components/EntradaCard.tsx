import React from 'react';

export interface EntradaData {
  eventName: string;
  date: string;
  location: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const EntradaCard: React.FC<EntradaData> = ({ eventName, date, location, price, quantity, imageUrl }) => {
  return (
    <div className="entrada-card">
      <img src={imageUrl} alt={eventName} className="entrada-card-image" />
      <div className="entrada-card-content">
        <h3 className="entrada-card-title">{eventName}</h3>
        <p className="entrada-card-details">Fecha: {date}</p>
        <p className="entrada-card-details">Lugar: {location}</p>
        <p className="entrada-card-details">Precio: ${price.toFixed(2)}</p>
        <p className="entrada-card-details">Cantidad: {quantity}</p>
      </div>
    </div>
  );
};

export default EntradaCard; 