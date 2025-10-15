import React from 'react';
import styles from './styles/ErrorDisplay.module.css';

interface ErrorDisplayProps {
  error?: Error;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <h1 className={styles.errorTitle}>Algo salió mal</h1>
        <p className={styles.errorMessage}>
          Ocurrió un error inesperado en la aplicación. Nuestro equipo ha sido notificado.
        </p>
        {/* # CORREGIDO: Se utiliza 'import.meta.env.MODE' para entornos Vite en lugar de 'process.env'. */}
        {import.meta.env.MODE === 'development' && error && (
          <pre className={styles.errorDetails}>
            {error.name}: {error.message}
          </pre>
        )}
        <button onClick={handleReload} className={styles.reloadButton}>
          Recargar la página
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;

