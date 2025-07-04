import React from 'react';
import './MessageDisplay.css';

interface MessageDisplayProps {
  message: string | null;
  type: 'success' | 'error' | 'info';
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
  if (!message) return null;

  return (
    <div className={`notification-message notification-message--${type}`}>
      {message}
    </div>
  );
};

export default MessageDisplay; 