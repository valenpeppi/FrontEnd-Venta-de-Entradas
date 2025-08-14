import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useMessage } from '../../shared/context/MessageContext';
import type { Ticket } from '../../App';
import styles from './styles/PurchaseModal.module.css';

export interface PurchaseModalProps {
  isOpen: boolean;
  selectedTicket: Ticket | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onCloseModal: () => void;
  errorMessage: string | null;
  onConfirmPurchase: (purchasedQuantity: number) => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  selectedTicket,
  quantity,
  onQuantityChange,
  onCloseModal,
  errorMessage,
  onConfirmPurchase 
}) => {
  const [internalQuantity, setInternalQuantity] = useState<number>(quantity);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);
  const isSubmitting = useRef(false); 
  const { isLoggedIn } = useAuth();
  const { setAppMessage } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const initialQuantity = selectedTicket && selectedTicket.availableTickets > 0 ? 1 : 0;
      setInternalQuantity(initialQuantity);
      onQuantityChange(initialQuantity);
      setLocalErrorMessage(null);
      isSubmitting.current = false;
    }
  }, [isOpen, selectedTicket, onQuantityChange]);

  const handleConfirm = () => {
    if (isSubmitting.current) return;
    
    if (!isLoggedIn) {
      setAppMessage('Inicia sesión para poder comprar una entrada', 'info');
      navigate('/login');
      onCloseModal();
      return;
    }

    isSubmitting.current = true;
    setLocalErrorMessage(null);

    if (!selectedTicket || internalQuantity <= 0) {
      setLocalErrorMessage('La cantidad debe ser al menos 1.');
      isSubmitting.current = false;
      return;
    }

    if (selectedTicket.availableTickets < internalQuantity) {
      setLocalErrorMessage('No hay suficientes entradas disponibles.');
      isSubmitting.current = false;
      return;
    }

    onConfirmPurchase(internalQuantity); 
    isSubmitting.current = false; 
  };

  if (!isOpen || !selectedTicket) {
    return null;
  }
  
  const maxQuantity = Math.min(selectedTicket.availableTickets, 3);
  const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => i + 1);

  return (
    <div className={styles.purchaseModalOverlay} onClick={onCloseModal}>
      <div className={styles.purchaseModal} onClick={e => e.stopPropagation()}>
        <h3 className={styles.purchaseModalHeader}>Agregar Entradas al Carrito</h3>
        <div className={styles.purchaseModalInfo}>
          <p className={styles.purchaseModalInfoItem}>
            Evento: <span className={styles.purchaseModalInfoValue}>{selectedTicket.eventName}</span>
          </p>
          <p className={styles.purchaseModalInfoItem}>
            Precio por entrada: <span className={styles.purchaseModalInfoValue}>${selectedTicket.price.toFixed(2)}</span>
          </p>
          <p className={styles.purchaseModalInfoItem}>
            Entradas disponibles: <span className={styles.purchaseModalInfoValue}>{selectedTicket.availableTickets}</span>
          </p>
        </div>
        <div className={styles.purchaseModalQuantitySection}>
          <label htmlFor="quantity-select" className={styles.purchaseModalQuantityLabel}>Cantidad:</label>
          <select
            id="quantity-select"
            value={internalQuantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value, 10);
              setInternalQuantity(newQuantity);
              onQuantityChange(newQuantity);
              setLocalErrorMessage(null);
            }}
            className={styles.purchaseModalQuantitySelect}
            disabled={selectedTicket.availableTickets === 0}
          >
            {quantityOptions.length > 0 ? (
              quantityOptions.map(num => (
                <option 
                  key={num} 
                  value={num}
                >
                  {num}
                </option>
              ))
            ) : (
              <option disabled value={0}>Agotado</option>
            )}
          </select>
        </div>
        {(errorMessage || localErrorMessage) && (
          <div className={styles.purchaseModalError}>
            {errorMessage || localErrorMessage}
          </div>
        )}
        <div className={styles.purchaseModalActions}>
          <button
            onClick={handleConfirm}
            className={styles.btnConfirm}
            disabled={selectedTicket.availableTickets === 0}
          >
            Agregar al Carrito
          </button>
          <button
            onClick={onCloseModal}
            className={styles.btnCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
