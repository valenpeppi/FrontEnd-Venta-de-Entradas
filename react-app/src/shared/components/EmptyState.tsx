import React, { type ReactNode } from 'react';
import styles from './styles/EmptyState.module.css';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    children?: ReactNode; // For action buttons
    compact?: boolean; // For smaller versions like in search dropdowns or small lists
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, children, compact = false }) => {
    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
            {children && <div className={styles.actions}>{children}</div>}
        </div>
    );
};

export default EmptyState;
