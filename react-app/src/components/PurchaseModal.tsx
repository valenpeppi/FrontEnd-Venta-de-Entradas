import React from 'react';
import type { Ticket } from './HomePage'; // Asegúrate de que Ticket se importa correctamente
import './PurchaseModal.css';

// Interfaz para las props del componente PurchaseModal
export interface PurchaseModalProps {
  isOpen: boolean;
  selectedTicket: Ticket | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onConfirmPurchase: () => void;
  onCloseModal: () => void;
  errorMessage: string | null;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  selectedTicket,
  quantity,
  onQuantityChange,
  onConfirmPurchase, // Asegúrate de que esta prop se desestructura
  onCloseModal,
  errorMessage
}) => {
  const handleAddToCart = () => {
    if (!selectedTicket) return;
    
    // Aquí puedes llamar a onConfirmPurchase que HomePage te pasa
    // y dentro de HomePage, manejar la lógica de addToCart del contexto
    onConfirmPurchase(); // Llama a la función que viene de HomePage
    onCloseModal(); // Cierra el modal después de la acción
  };

  if (!isOpen || !selectedTicket) {
    return null;
  }

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
            max={selectedTicket.availableTickets}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, Math.min(selectedTicket.availableTickets, parseInt(e.target.value) || 1)))}
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
            onClick={handleAddToCart}
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
