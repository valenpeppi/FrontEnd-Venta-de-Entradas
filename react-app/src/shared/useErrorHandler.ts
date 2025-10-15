import { useCallback } from 'react';
// # CORREGIDO: Se añade la extensión .tsx para asegurar la correcta resolución del módulo.
import { useMessage } from './context/MessageContext.tsx';
import axios, { type AxiosError } from 'axios';

// Interfaz para la estructura esperada de errores de la API
interface ApiErrorResponse {
  message: string;
  // Se pueden añadir otros campos como 'statusCode' o 'details' si la API los devuelve
}

/**
 * Hook centralizado para manejar errores en toda la aplicación.
 * Discrimina entre errores de API, errores críticos de cliente y otros tipos de error.
 */
export const useErrorHandler = () => {
  const { addMessage } = useMessage();

  const handleError = useCallback((error: unknown) => {
    // # 1. Manejar errores específicos de Axios (errores de red/servidor)
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      // Intentamos obtener el mensaje de error específico de la respuesta de la API
      const errorMessage = axiosError.response?.data?.message || 'No se pudo conectar con el servidor. Por favor, intenta de nuevo.';
      addMessage(errorMessage, 'error');
      return; // El error fue manejado, no es necesario que lo capture el ErrorBoundary
    }

    // # 2. Manejar errores de cliente que deben ser mostrados en la UI
    if (error instanceof Error) {
        // Errores que no son de Axios pero son instancias de Error.
        // Se consideran críticos y deben ser capturados por el ErrorBoundary para evitar que la app se rompa.
        // Ej: Un error de renderizado o de lógica interna.
        throw error;
    }

    // # 3. Manejar cualquier otro tipo de error no esperado
    addMessage('Ocurrió un error inesperado.', 'error');
    console.error('Error desconocido manejado:', error);

  }, [addMessage]);

  return { handleError };
};

