import React from 'react';
import styles from '@/shared/components/styles/LoadingSpinner.module.css';

interface LoadingSpinnerProps {
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = "Cargando..." }) => {
    return (
        <div className={styles.loadingState}>
            <div className={styles.loadingDots}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
            </div>
            <p className={styles.loadingStateText}>{text}</p>
        </div>
    );
};

export default LoadingSpinner;
