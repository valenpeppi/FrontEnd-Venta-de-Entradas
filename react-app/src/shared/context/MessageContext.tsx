// src/shared/context/MessageContext.tsx
import React, { createContext, useReducer, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import errorService from '../errorService'; // # Importamos el servicio

// --- Interfaces y Reducer (sin cambios) ---
interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
  id: string;
}
interface MessageState {
  messages: Message[];
}
type MessageAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'REMOVE_MESSAGE'; payload: { id: string } };

const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            // Evita mensajes duplicados exactos al mismo tiempo
            if (state.messages.some(msg => msg.text === action.payload.text)) {
                return state;
            }
            return { ...state, messages: [...state.messages, action.payload] };
        case 'REMOVE_MESSAGE':
            return { ...state, messages: state.messages.filter(msg => msg.id !== action.payload.id) };
        default:
            return state;
    }
};
// -----------------------------------------

interface MessageContextType {
  messages: Message[];
  addMessage: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, { messages: [] });

  const addMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`; // # ID más robusto
    dispatch({ type: 'ADD_MESSAGE', payload: { text, type, id } });
    
    setTimeout(() => {
      dispatch({ type: 'REMOVE_MESSAGE', payload: { id } });
    }, 3000);
  }, []);
  
  // # CONEXIÓN CON EL ERROR SERVICE
  // Este efecto se ejecuta una sola vez cuando el provider se monta.
  useEffect(() => {
    // Nos suscribimos para escuchar los mensajes que emita el errorService.
    const handleShowMessage = (message: string, type: 'success' | 'error' | 'info') => {
      addMessage(message, type);
    };

    errorService.subscribe(handleShowMessage);

    // Es una buena práctica "limpiar" la suscripción cuando el componente se desmonte,
    // aunque en un Provider de alto nivel no sea estrictamente necesario.
    return () => {
      errorService.subscribe(() => {}); // Remueve el listener
    };
  }, [addMessage]); // Dependemos de addMessage por si cambia (aunque no lo hará).

  return (
    <MessageContext.Provider value={{ messages: state.messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage debe ser usado dentro de un MessageProvider');
  }
  return context;
};