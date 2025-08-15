import React, { useEffect, useState } from 'react';
import styles from './styles/MessageDisplay.module.css';

interface MessageDisplayProps {
  message: string | null;
  type: 'success' | 'error' | 'info';
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  if (!isVisible && !message) {
    return null;
  }

  // Corregido: Nombres de clase que coinciden con el CSS module
  const typeClass = styles[`messageContainer${type.charAt(0).toUpperCase() + type.slice(1)}`];
  const visibilityClass = isVisible ? styles.messageVisible : styles.messageHidden;

  return (
    <div className={`${styles.messageContainer} ${typeClass} ${visibilityClass}`}>
      {message}
    </div>
  );
};

export default MessageDisplay;
