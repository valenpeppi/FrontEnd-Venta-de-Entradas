import React from 'react';
import styles from '@/shared/components/styles/StatsCard.module.css';
import type { StatsCardProps } from '@/types/common';


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
