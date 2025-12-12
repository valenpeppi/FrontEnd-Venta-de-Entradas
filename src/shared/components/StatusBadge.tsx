import React from 'react';
import styles from '@/shared/components/styles/StatusBadge.module.css';

interface StatusBadgeProps {
    status: string; // 'Approved', 'Rejected', 'Pending', or others
    label?: string; // Optional custom label, otherwise uses status
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
    const getStatusClass = (s: string) => {
        switch (s.toLowerCase()) {
            case 'approved':
            case 'aprobado':
            case 'active':
                return styles.approved;
            case 'rejected':
            case 'rechazado':
            case 'inactive':
                return styles.rejected;
            case 'pending':
            case 'pendiente':
            case 'unread':
                return styles.pending;
            case 'answered':
            case 'respondido':
                return styles.approved;
            case 'exhausted':
            case 'agotado':
            case 'sold out':
                return styles.soldOut;
            default:
                return styles.default;
        }
    };

    const displayText = label || status;

    return (
        <span className={`${styles.badge} ${getStatusClass(status)}`}>
            {displayText}
        </span>
    );
};

export default StatusBadge;
