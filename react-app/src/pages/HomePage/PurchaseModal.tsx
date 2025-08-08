import React, { useState, useEffect, useRef } from 'react';
import type { Ticket } from './HomePage';

import './PurchaseModal.css';

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

  useEffect(() => {
    if (isOpen) {
      setInternalQuantity(quantity);
      setLocalErrorMessage(null);
      isSubmitting.current = false;
      console.log('PurchaseModal: Modal abierto, internalQuantity reseteado a prop quantity. isSubmitting reseteado a false.');
    }
  }, [isOpen, quantity]);

  const handleConfirm = () => {
    if (isSubmitting.current) {
      console.log('PurchaseModal: Intento de doble clic detectado, ignorando.');
      return; 
    }
    isSubmitting.current = true;
    setLocalErrorMessage(null);

    console.log('PurchaseModal: handleConfirm activado.');
    if (!selectedTicket) {
      setLocalErrorMessage('Ha ocurrido un error. Por favor, intente de nuevo.');
      isSubmitting.current = false;
      return;
    }

    if (internalQuantity <= 0) {
      setLocalErrorMessage('La cantidad debe ser al menos 1.');
      isSubmitting.current = false;
      return;
    }

    if (internalQuantity > 3) {
      setLocalErrorMessage('No puedes comprar más de 3 entradas a la vez.');
      return;
    }

    if (selectedTicket.availableTickets < internalQuantity) {
      setLocalErrorMessage('No hay suficientes entradas disponibles para tu solicitud.');
      isSubmitting.current = false;
      return;
    }

    onConfirmPurchase(internalQuantity); 
    isSubmitting.current = false; 
  };

  if (!isOpen || !selectedTicket) {
    return null;
  }

  console.log('PurchaseModal: Renderizando. internalQuantity actual:', internalQuantity);

  return (
    <div className="purchase-modal-overlay" onClick={onCloseModal}>
      <div className="purchase-modal" onClick={e => e.stopPropagation()}>
        <h3 className="purchase-modal-header">Agregar Entradas al Carrito</h3>
        <div className="purchase-modal-info">
          <p className="purchase-modal-info-item">
            Evento: <span className="purchase-modal-info-value">{selectedTicket.eventName}</span>
          </p>
          <p className="purchase-modal-info-item">
            Precio por entrada: <span className="purchase-modal-info-value">${selectedTicket.price.toFixed(2)}</span>
          </p>
          <p className="purchase-modal-info-item">
            Entradas disponibles: <span className="purchase-modal-info-value">{selectedTicket.availableTickets}</span>
          </p>
        </div>
        <div className="purchase-modal-quantity-section">
          <label htmlFor="quantity" className="purchase-modal-quantity-label">Cantidad:</label>
          <input
            type="number"
            id="quantity"
            max={Math.min(selectedTicket.availableTickets, 3)} 
            value={internalQuantity === 0 ? '' : internalQuantity}
            onChange={(e) => {
              const value = e.target.value;
              const newValue = value === '' ? 0 : parseInt(value);
              
              if (isNaN(newValue) && value !== '') {
                return;
              }

              const clampedValue = isNaN(newValue) ? 0 : Math.max(0, Math.min(selectedTicket.availableTickets, newValue));
              
              setInternalQuantity(clampedValue);
              onQuantityChange(clampedValue);
              setLocalErrorMessage(null);
              console.log('PurchaseModal: Cantidad del input cambiada a:', clampedValue);
            }}
            className="purchase-modal-quantity-input"
          />
        </div>
        {(errorMessage || localErrorMessage) && (
          <div className="purchase-modal-error">
            {errorMessage || localErrorMessage}
          </div>
        )}
        <div className="purchase-modal-actions">
          <button
            onClick={handleConfirm}
            className="btn-confirm"
          >
            Agregar al Carrito
          </button>
          <button
            onClick={onCloseModal}
            className="btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
