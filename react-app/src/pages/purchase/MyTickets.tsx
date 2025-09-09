import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, type CartItem } from '../../shared/context/CartContext'; // Importamos el hook y el tipo del carrito
import styles from './styles/MyTickets.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  // Usamos el hook para obtener los items del carrito
  const { cartItems } = useCart();

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate; // Fallback por si la fecha no es válida
    }
    // Formato de fecha larga
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'full',
      timeZone: 'UTC' // Asumimos que las fechas de la API vienen en UTC
    }).format(date);
  };

  const handleDownloadPDF = (ticket: CartItem) => {
    const ticketElement = document.getElementById(`ticket-${ticket.id}`);
    if (ticketElement) {
        // Ocultar el botón de descarga para que no aparezca en el PDF
        const button = ticketElement.querySelector(`.${styles.ticketActionButton}`) as HTMLElement | null;
        if (button) {
            button.style.display = 'none';
        }

        html2canvas(ticketElement, { scale: 2 }) // Aumentamos la escala para mejor calidad
            .then(canvas => {
                // Volvemos a mostrar el botón después de la captura
                if (button) {
                    button.style.display = 'block';
                }

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait', // O 'landscape'
                    unit: 'px',
                    // Usamos el tamaño del canvas para el formato del PDF
                    format: [canvas.width, canvas.height]
                });
                
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`entrada-${ticket.eventName.replace(/\s+/g, '-')}.pdf`);
            })
            .catch(err => {
                console.error("Error al generar el PDF:", err);
                 // Asegurarse de que el botón se muestre de nuevo si hay un error
                if (button) {
                    button.style.display = 'block';
                }
            });
    }
  };

  return (
    <div className={styles.myTicketsContainer}>
      {/* Nota: Este título es temporal para indicar que muestra datos del carrito */}
      <h1 className={styles.myTicketsTitle}>Mis Entradas (Temporalmente desde Carrito)</h1>

      {cartItems.length > 0 ? (
        <div className={styles.ticketsGrid}>
          {cartItems.map((ticket) => (
            <div key={ticket.id} id={`ticket-${ticket.id}`} className={styles.ticketCard}>
              <div className={styles.ticketHeader}>
                <h2 className={styles.ticketEventName}>{ticket.eventName} ({ticket.quantity}x)</h2>
                {/* Usamos la nueva función para formatear solo la fecha */}
                <span className={styles.ticketDate}>{formatDate(ticket.date)}</span>
              </div>
              <div className={styles.ticketBody}>
                <div className={styles.ticketInfo}>
                  <p><strong>Lugar:</strong> {ticket.placeName}</p>
                  <p><strong>Sector:</strong> {ticket.sectorName || 'General'}</p>
                  {/* Volvemos a mostrar la hora aquí */}
                  <p><strong>Hora:</strong> {ticket.time}</p>
                </div>
                <div className={styles.ticketQRCode}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=evento:${ticket.eventId}-ticket:${ticket.id}`} 
                    alt="Código QR" 
                  />
                </div>
              </div>
              <div className={styles.ticketFooter}>
                {/* El botón ahora llama a la función de descarga */}
                <button onClick={() => handleDownloadPDF(ticket)} className={styles.ticketActionButton}>Descargar PDF</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noTickets}>
          <p>Aún no tienes entradas en tu carrito.</p>
          <button onClick={() => navigate('/')} className={`${styles.btn} ${styles.btnPrimary}`}>
            Explorar eventos
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTickets;

