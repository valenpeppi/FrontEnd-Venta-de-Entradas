import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import FatalErrorPage from '@/shared/error/FatalErrorPage';

interface GlobalErrorBoundaryProps {
    children: React.ReactNode;
}

 
const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ children }) => {
    return (
        <ErrorBoundary
            FallbackComponent={FatalErrorPage}
            onReset={() => {
                 
                console.log("App has been reset from error boundary");
            }}
            onError={(error, info) => {
                 
                console.error("Uncaught error:", error, info);
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

export default GlobalErrorBoundary;
