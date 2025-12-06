import React, { createContext, useReducer, useContext } from 'react';


import type { Message, MessageState, MessageAction, MessageContextType, MessageProviderProps } from '../../types/common';

const MessageContext = createContext<MessageContextType | undefined>(undefined);


const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const newMessage: Message = {
        text: action.payload.text,
        type: action.payload.type,
        id: action.payload.id
      };
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
    dispatch({ type: 'ADD_MESSAGE', payload: { text, type, id } });

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

  const setAppMessage = (message: string | null, type: 'success' | 'error' | 'info' = 'info') => {
    clearMessages();
    if (message) {
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