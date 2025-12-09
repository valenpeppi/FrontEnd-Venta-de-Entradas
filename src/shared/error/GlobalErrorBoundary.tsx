import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import FatalErrorPage from '@/shared/error/FatalErrorPage';

interface GlobalErrorBoundaryProps {
    children: React.ReactNode;
}

/**
 * Envoltorio global para capturar errores de renderizado no controlados.
 * Muestra una página dedicada (FatalErrorPage) cuando ocurre un crash.
 */
const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ children }) => {
    return (
        <ErrorBoundary
            FallbackComponent={FatalErrorPage}
            onReset={() => {
                // Acciones opcionales al resetear el error (ej: limpiar cache, estado global)
                console.log("App has been reset from error boundary");
            }}
            onError={(error, info) => {
                // Aquí podríamos enviar el error a un servicio de logging (Sentry, etc)
                console.error("Uncaught error:", error, info);
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

export default GlobalErrorBoundary;
