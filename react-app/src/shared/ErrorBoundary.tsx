import React, { Component } from 'react';
// # CORREGIDO: Se usa 'import type' para importar solo tipos, como lo requiere la configuración de TypeScript.
import type { ErrorInfo, ReactNode } from 'react';
import ErrorDisplay from './ErrorDisplay.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error no controlado capturado por ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

