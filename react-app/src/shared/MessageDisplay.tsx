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

  const typeClass = styles[`notificationMessage--${type}`];
  const visibilityClass = isVisible ? styles.notificationMessageVisible : styles.notificationMessageHidden;

  return (
    <div className={`${styles.notificationMessage} ${typeClass} ${visibilityClass}`}>
      {message}
    </div>
  );
};

export default MessageDisplay;
