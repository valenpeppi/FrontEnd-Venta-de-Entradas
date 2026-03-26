import React from 'react';
import styles from '@/shared/components/styles/LoadingSpinner.module.css';
import type { LoadingSpinnerProps } from '@/types/common';


const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Cargando...", className = "" }) => {
    return (
        <div className={`${styles.loadingState} ${className}`}>
            <div className={styles.loader}></div>
            <p className={styles.loadingStateText}>{text}</p>
        </div>
    );
};

export default LoadingSpinner;
