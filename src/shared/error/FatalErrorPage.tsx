import React from 'react';
import styles from '@/shared/error/styles/FatalErrorPage.module.css';

interface FatalErrorPageProps {
    error?: Error;
    resetErrorBoundary?: () => void;
}

 
const FatalErrorPage: React.FC<FatalErrorPageProps> = ({ error, resetErrorBoundary }) => {
    const handleRetry = () => {
         
        if (resetErrorBoundary) {
            resetErrorBoundary();
        }
         
        window.location.href = '/';
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>¡Oops! Algo salió mal</h1>
                <p className={styles.message}>
                    Ha ocurrido un error inesperado y la aplicación no puede continuar.
                </p>

                {error && (
                    <div className={styles.errorDetails}>
                        <p>Detalle técnico (para desarrolladores):</p>
                        <code>{error.message}</code>
                    </div>
                )}

                <button onClick={handleRetry} className={styles.retryButton}>
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default FatalErrorPage;
