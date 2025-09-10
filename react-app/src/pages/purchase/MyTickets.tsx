import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, type CartItem } from '../../shared/context/CartContext'; // Importamos el hook y el tipo del carrito
import styles from './styles/MyTickets.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MyTickets: React.FC = () => {
  const navigate = useNavigate();

  const { cartItems } = useCart();

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate; 
    }
    // Formato de fecha larga
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'full',
      timeZone: 'UTC' 
    }).format(date);
  };

  const handleDownloadPDF = (ticket: CartItem) => {
    const ticketElement = document.getElementById(`ticket-${ticket.id}`);
    if (ticketElement) {

      const button = ticketElement.querySelector(`.${styles.ticketActionButton}`) as HTMLElement | null;
      if (button) {
        button.style.display = 'none';
      }

      html2canvas(ticketElement, { scale: 2 }) 
        .then(canvas => {
          if (button) {
            button.style.display = 'block';
          }

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4' // tamaño estandarizado
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          let y = 40;

          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Entrada de Evento', pageWidth / 2, y, { align: 'center' });

          y += 30;

          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Evento: ${ticket.eventName}`, 40, y);
          y += 20;
          pdf.text(`Fecha: ${ticket.date}`, 40, y);
          y += 20;
          pdf.text(`Lugar: ${ticket.placeName}`, 40, y);
          y += 20;
          pdf.text(`Sector: ${ticket.sectorName || 'General'}`, 40, y);
          y += 20;
          pdf.text(`Hora: ${ticket.time}`, 40, y);
          y += 20;
          pdf.text(`Cantidad: ${ticket.quantity}`, 40, y);

          y += 30;

          // 🖼 Insertar la captura del ticket como referencia visual
          const imgWidth = pageWidth - 80;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 40, y, imgWidth, imgHeight);

          pdf.save(`entrada-${ticket.eventName.replace(/\s+/g, '-')}.pdf`);
        })
        .catch(err => {
          console.error("Error al generar el PDF:", err);
          if (button) {
            button.style.display = 'block';
          }
        });
    }
  };


  return (
    <div className={styles.myTicketsContainer}>
      {/* Nota: Este título es temporal para indicar que muestra datos del carrito */}
      <h1 className={styles.myTicketsTitle}>Mis Entradas</h1>

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

