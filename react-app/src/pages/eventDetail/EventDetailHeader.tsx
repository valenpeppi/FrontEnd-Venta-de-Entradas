import React from 'react';
import {
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdAudiotrack,
  MdConfirmationNumber,
} from "react-icons/md";
import { formatLongDate, formatTime } from '../../shared/utils/dateFormatter';
import type { EventDetailHeaderProps } from '../../types/events';
import styles from './styles/EventDetailPage.module.css';

const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({ summary }) => (

  <div className={styles.eventSummaryCard}>
    <img
      src={summary.imageUrl || "/ticket.png"}
      alt={summary.eventName}
      className={styles.eventImage}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = "/ticket.png";
      }}
    />
    <div className={styles.eventInfo}>
      <h1 className={styles.eventTitle}>{summary.eventName}</h1>
      <p className={styles.infoRow}>
        <span>{summary.description}</span>
      </p>
      <p className={styles.infoRow}>
        <MdCalendarToday className={styles.icon} />
        <span><strong>Fecha:</strong> {formatLongDate(summary.date)}</span>
      </p>
      <p className={styles.infoRow}>
        <MdAccessTime className={styles.icon} />
        <span><strong>Hora:</strong> {formatTime(summary.date)}</span>
      </p>
      <p className={styles.infoRow}>
        <MdAudiotrack className={styles.icon} />
        <span><strong>Tipo:</strong> {summary.type}</span>
      </p>
      <p className={styles.infoRow}>
        <MdLocationOn className={styles.icon} />
        <span><strong>Estadio:</strong> {summary.placeName}</span>
      </p>
      <p className={styles.infoRow}>
        <MdConfirmationNumber className={styles.icon} />
        <span><strong>Entradas disponibles:</strong> {summary.availableTickets}</span>
      </p>
    </div>
  </div>
);

export default EventDetailHeader;
