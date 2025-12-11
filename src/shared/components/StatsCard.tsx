import React from 'react';
import type { IconType } from 'react-icons';
import styles from '@/shared/components/styles/StatsCard.module.css';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    iconColorClass: string; // 'blue', 'green', 'purple', 'orange', etc.
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, iconColorClass }) => {
    return (
        <div className={styles.statCard}>
            <div className={`${styles.iconContainer} ${styles[iconColorClass] || styles.blue}`}>
                <Icon />
            </div>
            <div className={styles.statInfo}>
                <span className={styles.statLabel}>{title}</span>
                <span className={styles.statValue}>{value}</span>
            </div>
        </div>
    );
};

export default StatsCard;
