import React from 'react';
import styles from './CompanyEventCard.module.css';

interface CompanyEventCardProps {
    event: {
        idEvent: number;
        name: string;
        date: string;
        imageUrl?: string;
        state: string;
        soldPercentage: number;
        soldSeats: number;
        totalSeats: number;
    };
}

const CompanyEventCard: React.FC<CompanyEventCardProps> = ({ event }) => {
    const dateObj = new Date(event.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Approved': return styles.approved;
            case 'Rejected': return styles.rejected;
            default: return styles.pending;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Approved': return 'Aprobado';
            case 'Rejected': return 'Rechazado';
            default: return 'Pendiente';
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img
                    src={event.imageUrl || '/ticket.png'}
                    alt={event.name}
                    className={styles.image}
                />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{event.name}</h3>
                <span className={styles.date}>{formattedDate}</span>

                <div className={styles.statusContainer}>
                    <span className={`${styles.badge} ${getStatusClass(event.state)}`}>
                        {getStatusLabel(event.state)}
                    </span>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statsText}>
                        <span>Vendidas: {event.soldSeats} / {event.totalSeats}</span>
                        <span>{event.soldPercentage}%</span>
                    </div>
                    <div className={styles.progressBarContainer}>
                        <div
                            className={styles.progressBarFill}
                            style={{ width: `${event.soldPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyEventCard;
