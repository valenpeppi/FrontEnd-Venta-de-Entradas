import React, { useEffect, useState } from 'react';
import './MessageDisplay.css';

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
      }, 3000); // El mensaje desaparece después de 3 segundos
      return () => clearTimeout(timer); // Limpia el timer si el componente se desmonta o el mensaje cambia
    } else {
      setIsVisible(false); // Oculta el mensaje si no hay mensaje
    }
  }, [message]); // Se ejecuta cada vez que el mensaje cambia

  // Si no está visible, no renderiza nada
  if (!isVisible && !message) { // Asegura que no se renderice si no hay mensaje o no está visible
    return null;
  }

  // Clases CSS dinámicas para el tipo de mensaje y la visibilidad
  const visibilityClass = isVisible ? 'notification-message--visible' : 'notification-message--hidden';

  return (
    <div className={`notification-message notification-message--${type} ${visibilityClass}`}>
      {message}
    </div>
  );
};

export default MessageDisplay;
