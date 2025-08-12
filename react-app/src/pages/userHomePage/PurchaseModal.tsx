import React, { useState, useEffect, useRef } from 'react';
import type { Ticket } from '../../App';

import '../styles/PurchaseModal.css';

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
      // Al abrir, la cantidad inicial es 1, siempre que haya tickets.
      const initialQuantity = selectedTicket && selectedTicket.availableTickets > 0 ? 1 : 0;
      setInternalQuantity(initialQuantity);
      onQuantityChange(initialQuantity);
      setLocalErrorMessage(null);
      isSubmitting.current = false;
    }
  }, [isOpen, selectedTicket]);

  const handleConfirm = () => {
    if (isSubmitting.current) {
      return; 
    }
    isSubmitting.current = true;
    setLocalErrorMessage(null);

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
  
  // --- MODIFICACIÓN AQUÍ ---
  // El máximo de opciones es 3, pero limitado por las entradas disponibles.
  const maxQuantity = Math.min(selectedTicket.availableTickets, 3);
  const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => i + 1);

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
          <label htmlFor="quantity-select" className="purchase-modal-quantity-label">Cantidad:</label>
          <select
            id="quantity-select"
            value={internalQuantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value, 10);
              setInternalQuantity(newQuantity);
              onQuantityChange(newQuantity);
              setLocalErrorMessage(null);
            }}
            className="purchase-modal-quantity-select"
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
          <div className="purchase-modal-error">
            {errorMessage || localErrorMessage}
          </div>
        )}
        <div className="purchase-modal-actions">
          <button
            onClick={handleConfirm}
            className="btn-confirm"
            disabled={selectedTicket.availableTickets === 0}
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
