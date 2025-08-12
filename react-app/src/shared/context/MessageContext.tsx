import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';

interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

interface MessageState {
  messages: Message[];
}

type MessageAction =
  | { type: 'ADD_MESSAGE'; payload: { text: string; type: 'success' | 'error' | 'info' } }
  | { type: 'REMOVE_MESSAGE'; payload: { id: string } }
  | { type: 'CLEAR_MESSAGES' };

interface MessageContextType {
  messages: Message[];
  addMessage: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setAppMessage: (message: string | null, type?: 'success' | 'error' | 'info') => void; // Modificado para aceptar tipo
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: ReactNode;
}

const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const newMessage: Message = {
        text: action.payload.text,
        type: action.payload.type,
        id: Date.now().toString()
      };
      // Evita mensajes duplicados
      if (state.messages.some(msg => msg.text === newMessage.text)) {
        return state;
      }
      return {
        ...state,
        messages: [...state.messages, newMessage]
      };
    }
    
    case 'REMOVE_MESSAGE': {
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload.id)
      };
    }
    
    case 'CLEAR_MESSAGES': {
      return {
        ...state,
        messages: []
      };
    }
    
    default:
      return state;
  }
};

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, {
    messages: []
  });

  const addMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    dispatch({ type: 'ADD_MESSAGE', payload: { text, type } });
    
    // Auto-remove message after 3 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_MESSAGE', payload: { id } });
    }, 3000);
  };

  const removeMessage = (id: string) => {
    dispatch({ type: 'REMOVE_MESSAGE', payload: { id } });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  // --- MODIFICACIÓN AQUÍ ---
  const setAppMessage = (message: string | null, type?: 'success' | 'error' | 'info') => {
    if (message) {
      // Si se provee un tipo, se usa. Si no, se determina automáticamente.
      const messageType = type || (message.includes('exitoso') || message.includes('agregado') 
        ? 'success' as const 
        : 'error' as const);
      addMessage(message, messageType);
    }
  };

  return (
    <MessageContext.Provider value={{
      messages: state.messages,
      addMessage,
      removeMessage,
      clearMessages,
      setAppMessage
    }}>
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
