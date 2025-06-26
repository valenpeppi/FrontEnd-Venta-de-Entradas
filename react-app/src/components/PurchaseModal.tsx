import React from 'react';
import type { Ticket } from './HomePage';
import './PurchaseModal.css';

interface PurchaseModalProps {
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
  onConfirmPurchase,
  onCloseModal,
  errorMessage
}) => {
  if (!isOpen || !selectedTicket) {
    return null;
  }

  return (
    <div className="modal-bg">
      <div className="modal">
        <h3 className="modal-title">Comprar Entradas</h3>
        <div className="modal-info">
          <p className="modal-event">
            Evento: <span className="modal-event-name">{selectedTicket.eventName}</span>
          </p>
          <p className="modal-price">
            Precio por entrada: <span className="modal-price-value">${selectedTicket.price.toFixed(2)}</span>
          </p>
          <p className="modal-available">
            Entradas disponibles: <span className="modal-available-value">{selectedTicket.availableTickets}</span>
          </p>
        </div>
        <div className="modal-quantity-row">
          <label htmlFor="quantity" className="modal-quantity-label">Cantidad:</label>
          <input
            type="number"
            id="quantity"
            min="1"
            max={selectedTicket.availableTickets}
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, Math.min(selectedTicket.availableTickets, parseInt(e.target.value) || 1)))}
            className="modal-quantity-input"
          />
        </div>
        {errorMessage && (
          <div className="modal-error-message">
            {errorMessage}
          </div>
        )}
        <div className="modal-btn-row">
          <button
            onClick={onConfirmPurchase}
            className="modal-btn-confirm"
          >
            Confirmar Compra
          </button>
          <button
            onClick={onCloseModal}
            className="modal-btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal; 