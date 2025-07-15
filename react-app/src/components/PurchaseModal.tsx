import React, { useState, useEffect, useRef } from 'react';
import type { Ticket } from './HomePage'; // Asegúrate de que Ticket se importa correctamente desde HomePage

import './PurchaseModal.css';

// Interfaz para las props del componente PurchaseModal
export interface PurchaseModalProps {
  isOpen: boolean;
  selectedTicket: Ticket | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onCloseModal: () => void;
  errorMessage: string | null;
  onConfirmPurchase: (purchasedQuantity: number) => void; // Asegúrate de que esta línea esté correcta
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ // Asegúrate de que React.FC<PurchaseModalProps> esté aquí
  isOpen,
  selectedTicket,
  quantity,
  onQuantityChange,
  onCloseModal,
  errorMessage,
  onConfirmPurchase 
}) => {
  const [internalQuantity, setInternalQuantity] = useState<number>(quantity);
  const isSubmitting = useRef(false); 

  useEffect(() => {
    if (isOpen) {
      setInternalQuantity(quantity);
      isSubmitting.current = false;
      console.log('PurchaseModal: Modal abierto, internalQuantity reseteado a prop quantity. isSubmitting reseteado a false.');
    }
  }, [isOpen, quantity]);

  const handleConfirmPurchase = () => {
    if (isSubmitting.current) {
      console.log('PurchaseModal: Intento de doble clic detectado, ignorando.');
      return; 
    }
    isSubmitting.current = true;

    console.log('PurchaseModal: handleConfirmPurchase activado.');
    if (!selectedTicket) {
      console.log('PurchaseModal: No hay ticket seleccionado, retornando.');
      isSubmitting.current = false;
      return;
    }

    if (internalQuantity <= 0) {
      console.log('PurchaseModal: Cantidad <= 0, retornando.');
      isSubmitting.current = false;
      return;
    }
    if (internalQuantity > 3) { 
      console.log('PurchaseModal: Cantidad > 3, retornando.');
      isSubmitting.current = false;
      return; 
    }
    if (selectedTicket.availableTickets < internalQuantity) {
      console.log('PurchaseModal: No hay suficientes entradas disponibles, retornando.');
      isSubmitting.current = false;
      return;
    }

    console.log(`PurchaseModal: Llamando al callback onConfirmPurchase con cantidad: ${internalQuantity}`);
    onConfirmPurchase(internalQuantity); 

    console.log('PurchaseModal: Cerrando modal.');
    onCloseModal(); 
    isSubmitting.current = false;
  };

  if (!isOpen || !selectedTicket) {
    return null;
  }

  console.log('PurchaseModal: Renderizando. internalQuantity actual:', internalQuantity);

  return (
    <div className="purchase-modal-overlay">
      <div className="purchase-modal">
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
            min="1"
            max={Math.min(selectedTicket.availableTickets, 3)} 
            value={internalQuantity}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 1;
              const clampedValue = Math.max(1, Math.min(selectedTicket.availableTickets, newValue));
              setInternalQuantity(clampedValue);
              onQuantityChange(clampedValue);
              console.log('PurchaseModal: Cantidad del input cambiada a:', clampedValue);
            }}
            className="purchase-modal-quantity-input"
          />
        </div>
        {errorMessage && (
          <div className="purchase-modal-error">
            {errorMessage}
          </div>
        )}
        <div className="purchase-modal-actions">
          <button
            onClick={handleConfirmPurchase}
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
