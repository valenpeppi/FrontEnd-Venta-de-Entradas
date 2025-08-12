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
  setAppMessage: (message: string | null) => void; // Para compatibilidad con el código existente
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
    dispatch({ type: 'ADD_MESSAGE', payload: { text, type } });
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
      const messageId = state.messages[state.messages.length - 1]?.id;
      if (messageId) {
        removeMessage(messageId);
      }
    }, 5000);
  };

  const removeMessage = (id: string) => {
    dispatch({ type: 'REMOVE_MESSAGE', payload: { id } });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  // Función de compatibilidad con el código existente
  const setAppMessage = (message: string | null) => {
    if (message) {
      const type = message.includes('exitoso') || message.includes('comprado') || message.includes('agregado') 
        ? 'success' as const 
        : 'error' as const;
      addMessage(message, type);
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