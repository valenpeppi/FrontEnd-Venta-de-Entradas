import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';
import styles from './styles/MyTickets.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Definimos un tipo para la estructura de la entrada que esperamos del backend
interface PurchasedTicket {
  id: string;
  eventId: number;
  eventName: string;
  date: string;
  time: string;
  location: string;
  sectorName: string;
  seatNumber?: number;
  imageUrl: string;
  idTicket: number;
}

const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTickets = async () => {
      if (!isLoggedIn || !user?.dni) {
        if (!isLoading) {
          setError("Debes iniciar sesión para ver tus entradas.");
          setIsFetching(false);
        }
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/api/sales/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(response.data.data || []);
      } catch (err) {
        console.error("Error al obtener las entradas:", err);
        setError("No se pudieron cargar tus entradas. Inténtalo de nuevo más tarde.");
      } finally {
        setIsFetching(false);
      }
    };

    if (!isLoading) {
      fetchTickets();
    }
  }, [isLoggedIn, user, isLoading]);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(date);
  };

  const handleDownloadPDF = (ticket: PurchasedTicket) => {
    const ticketElement = document.getElementById(`ticket-${ticket.id}`);
    if (ticketElement) {
      html2canvas(ticketElement, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 80;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 40, 40, imgWidth, imgHeight);
        pdf.save(`entrada-${ticket.eventName.replace(/\s+/g, '-')}-${ticket.idTicket}.pdf`);
      });
    }
  };

  if (isFetching) {
    return <div className={styles.myTicketsContainer}><p>Cargando tus entradas...</p></div>;
  }

  return (
    <div className={styles.myTicketsContainer}>
      <h1 className={styles.myTicketsTitle}>Mis Entradas</h1>

      {error && <p className={styles.noTickets}>{error}</p>}

      {!error && tickets.length > 0 ? (
        <div className={styles.ticketsGrid}>
          {tickets.map((ticket) => (
            <div key={ticket.id} id={`ticket-${ticket.id}`} className={styles.ticketCard}>
              <div className={styles.ticketHeader}>
                <h2 className={styles.ticketEventName}>{ticket.eventName}</h2>
                <span className={styles.ticketDate}>{formatDate(ticket.date)}</span>
              </div>
              <div className={styles.ticketBody}>
                <div className={styles.ticketInfo}>
                  <p><strong>Lugar:</strong> {ticket.location}</p>
                  <p><strong>Sector:</strong> {ticket.sectorName}</p>
                  {ticket.seatNumber && <p><strong>Asiento:</strong> {ticket.seatNumber}</p>}
                  <p><strong>Hora:</strong> {ticket.time}</p>
                </div>
                <div className={styles.ticketQRCode}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=evento:${ticket.eventId}-ticket:${ticket.idTicket}`}
                    alt="Código QR de la entrada"
                  />
                </div>
              </div>
              <div className={styles.ticketFooter}>
                <button
                  onClick={() => handleDownloadPDF(ticket)}
                  className={styles.ticketActionButton}
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isFetching && !error && (
          <div className={styles.noTickets}>
            <p>No tienes ninguna entrada comprada.</p>
            <button
              onClick={() => navigate('/')}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Explorar eventos
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default MyTickets;

