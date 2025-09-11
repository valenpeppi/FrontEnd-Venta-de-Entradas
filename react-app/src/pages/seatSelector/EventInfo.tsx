import React from 'react';
import type { EventInfoProps } from '../../shared/types';
import styles from './styles/EventInfo.module.css';

const EventInfo: React.FC<EventInfoProps> = ({ summary }) => {
  const formatPlaceType = (placeType: string) => {
    switch (placeType.toLowerCase()) {
      case 'hybrid':
        return 'Híbrido';
      case 'nonenumerated':
        return 'Único';
      case 'enumerated':
        return 'Enumerado';
      default:
        return placeType;
    }
  };

  return (
    <div className={styles.eventDetailCard}>
      <div className={styles.eventImageContainer}>
        <img
          src={summary.imageUrl}
          alt={summary.eventName}
          className={styles.eventImage}
          onError={(e) => {
            e.currentTarget.src = '/ticket.png';
          }}
        />
      </div>

      <div className={styles.eventInfo}>
        <h1 className={styles.eventTitle}>{summary.eventName}</h1>
        <p>
          <strong>Fecha:</strong>{' '}
          {new Date(summary.date).toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <p>
          <strong>Tipo:</strong> {summary.type}
        </p>
        <p>
          <strong>Lugar:</strong> {formatPlaceType(summary.placeType)}
        </p>
        <p><strong>Estadio:</strong> {summary.placeName}</p>
        <p>
          <strong>Entradas disponibles:</strong> {summary.availableTickets}
        </p>
      </div>
    </div>
  );
};

export default EventInfo;
