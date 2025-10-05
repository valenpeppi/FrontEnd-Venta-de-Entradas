import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';
import styles from './styles/MyTickets.module.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PurchasedTicket {
  id: string;
  idSale: number;         // ahora obligatorio para agrupar por venta
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

// Un grupo de tickets pertenecientes a la misma venta
interface TicketGroup {
  idSale: number;
  eventId: number;
  eventName: string;
  date: string;
  time: string;
  location: string;
  sectorName: string;
  tickets: PurchasedTicket[];
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
        const data = response.data.data || [];
        setTickets(data);
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
    const formatted = new Intl.DateTimeFormat('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(date);

    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return capitalized.replace(',', '');
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

  // Agrupa tickets por idSale
  const groupTicketsBySale = (tickets: PurchasedTicket[]): TicketGroup[] => {
    const map = new Map<number, TicketGroup>();
    for (const tk of tickets) {
      const saleId = tk.idSale;
      let grp = map.get(saleId);
      if (!grp) {
        grp = {
          idSale: saleId,
          eventId: tk.eventId,
          eventName: tk.eventName,
          date: tk.date,
          time: tk.time,
          location: tk.location,
          sectorName: tk.sectorName,
          tickets: [],
        };
        map.set(saleId, grp);
      }
      grp.tickets.push(tk);
    }
    return Array.from(map.values());
  };

  if (isFetching) {
    return (
      <div className={styles.myTicketsContainer}>
        <p>Cargando tus entradas...</p>
      </div>
    );
  }

  const ticketGroups = groupTicketsBySale(tickets);

  return (
    <div className={styles.myTicketsContainer}>
      <h1 className={styles.myTicketsTitle}>Mis Entradas</h1>

      {error && <p className={styles.noTickets}>{error}</p>}

      {!error && ticketGroups.length > 0 ? (
        <div className={styles.ticketsGrid}>
          {ticketGroups.map(group => (
            <div
              key={group.idSale}
              id={`ticketGroup-${group.idSale}`}
              className={styles.ticketCard}
            >
              <div className={styles.ticketHeader}>
                <h2 className={styles.ticketEventName}>{group.eventName}</h2>
                <span className={styles.ticketDate}>{formatDate(group.date)}</span>
              </div>

              <div className={styles.ticketBody}>
                <div className={styles.ticketInfo}>
                  <p><strong>Lugar:</strong> {group.location}</p>
                  <p><strong>Sector:</strong> {group.sectorName} (x{group.tickets.length})</p>
                  {group.tickets.length > 0 && (
                    <p>
                      <strong>Asientos:</strong>{' '}
                      {group.tickets
                        .map(tk => tk.seatNumber ?? 'Sin asignar')
                        .sort((a, b) => Number(a) - Number(b))
                        .join(', ')}
                    </p>
                  )}
                  <p><strong>Hora:</strong> {group.time}</p>
                </div>
                <div className={styles.ticketQRCode}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=venta:${group.idSale}`}
                    alt="Código QR de la entrada"
                  />
                </div>
              </div>

              <div className={styles.ticketFooter}>
                <button
                  onClick={() => group.tickets.forEach(tk => handleDownloadPDF(tk))}
                  className={styles.ticketActionButton}
                >
                  Descargar PDFs
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
