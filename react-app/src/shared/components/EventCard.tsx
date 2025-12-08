import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/EventCard.module.css';
import {
    MdLocationOn,
    MdCalendarToday,
    MdCategory,
    MdAttachMoney,
    MdAccessTime
} from 'react-icons/md';

export interface EventCardTicket {
    id: string;
    eventId: string;
    eventName: string;
    date: string;
    time: string;
    location: string;
    price: number;
    type: string;
    imageUrl?: string;
    agotado: boolean;
}

interface EventCardProps {
    ticket: EventCardTicket;
    index?: number;
}

const EventCard: React.FC<EventCardProps> = ({ ticket, index = 0 }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.card} style={{ animationDelay: `${index * 80}ms` }}>
            <img
                src={ticket.imageUrl || '/ticket.png'}
                alt={ticket.eventName}
                className={styles.image}
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/ticket.png';
                }}
            />
            <div className={styles.content}>
                <h3 className={styles.cardTitle}>{ticket.eventName}</h3>

                <p className={styles.infoRow}>
                    <MdLocationOn className={styles.icon} />
                    <span>{ticket.location}</span>
                </p>

                <p className={styles.infoRow}>
                    <MdCalendarToday className={styles.icon} />
                    <span>{ticket.date}</span>
                </p>

                <p className={styles.infoRow}>
                    <MdAccessTime className={styles.icon} />
                    <span>{ticket.time}</span>
                </p>

                <p className={styles.infoRow}>
                    <MdCategory className={styles.icon} />
                    <span>{ticket.type}</span>
                </p>

                <p className={styles.infoRow}>
                    <MdAttachMoney className={styles.icon} />
                    <span>Desde ${ticket.price.toLocaleString()}</span>
                </p>

                <button
                    onClick={() => navigate(`/event/${ticket.eventId}`)}
                    className={`${styles.button} ${ticket.agotado ? styles.disabledButton : ''}`}
                    disabled={ticket.agotado}
                >
                    {ticket.agotado ? 'Agotado' : 'Comprar'}
                </button>
            </div>
        </div>
    );
};

export default EventCard;
