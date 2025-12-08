import React, { useState } from 'react';
import styles from './styles/CompanyEventCard.module.css';
import { FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../shared/components/ConfirmationModal';
import StatusBadge from '../../shared/components/StatusBadge';

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
    onDelete?: (id: number) => void;
}

const CompanyEventCard: React.FC<CompanyEventCardProps> = ({ event, onDelete }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const dateObj = new Date(event.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Approved': return 'Aprobado';
            case 'Rejected': return 'Rechazado';
            default: return 'Pendiente';
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (onDelete) {
            onDelete(event.idEvent);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/edit-event/${event.idEvent}`);
    };

    return (
        <>
            <div className={styles.card}>
                <div className={styles.imageContainer}>
                    <img
                        src={event.imageUrl || '/ticket.png'}
                        alt={event.name}
                        className={styles.image}
                    />
                    <div className={styles.overlayActions}>
                        <button onClick={handleEdit} className={styles.actionBtn} title="Editar">
                            <FaEdit />
                        </button>
                        {onDelete && (
                            <button onClick={handleDeleteClick} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Eliminar">
                                <FaTrash />
                            </button>
                        )}
                    </div>
                </div>
                <div className={styles.content}>
                    <h3 className={styles.title}>{event.name}</h3>
                    <span className={styles.date}>
                        <FaCalendarAlt style={{ marginRight: '5px' }} />
                        {formattedDate}
                    </span>

                    <div className={styles.statusContainer}>
                        <StatusBadge status={event.state || 'Pending'} label={getStatusLabel(event.state || 'Pending')} />
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
            <ConfirmationModal
                isOpen={isModalOpen}
                title="Eliminar Evento"
                message="¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default CompanyEventCard;
