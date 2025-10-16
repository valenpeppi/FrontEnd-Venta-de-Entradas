import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../shared/context/AuthContext';
import styles from './styles/MyTickets.module.css';
import jsPDF from 'jspdf';
import React, { useEffect, useState, useMemo } from 'react';
import { formatLongDate, formatTime } from '../../shared/utils/dateFormatter';

interface PurchasedTicket {
  id: string;
  idSale: number;
  eventId: number;
  eventName: string;
  date: string;
  time: string;
  location: string;
  sectorName: string;
  sectorType?: 'enumerated' | 'nonEnumerated' | string;
  seatNumber?: number;
  imageUrl: string;
  idTicket: number;
}

interface TicketGroup {
  idSale: number;
  eventId: number;
  eventName: string;
  date: string;
  time: string;
  location: string;
  sectorName: string;
  sectorType?: 'enumerated' | 'nonEnumerated' | string;
  tickets: PurchasedTicket[];
}

const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = async (ticket: PurchasedTicket) => {
    const nonEnum = isNonEnumeratedTicket(ticket);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 60;

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(79, 70, 229);
    pdf.text('TicketApp - Entrada Oficial', pageWidth / 2, y, { align: 'center' });
    y += 25;

    pdf.setDrawColor(79, 70, 229);
    pdf.setLineWidth(1);
    pdf.line(40, y, pageWidth - 40, y);
    y += 35;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(ticket.eventName, pageWidth / 2, y, { align: 'center' });
    y += 20;

    pdf.setDrawColor(79, 70, 229);
    pdf.setLineWidth(0.8);
    const titleWidth = pdf.getTextWidth(ticket.eventName);
    pdf.line(pageWidth / 2 - titleWidth / 2 - 5, y, pageWidth / 2 + titleWidth / 2 + 5, y);
    y += 30;

    const printLabel = (label: string, value: string | number) => {
      const xStart = 60;
      const gap = 7; 
      const labelText = `${label}:`;
      const labelWidth = pdf.getTextWidth(labelText);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229);
      pdf.text(labelText, xStart, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(value), xStart + labelWidth + gap, y);

      y += 22;
    };

    printLabel('Fecha', formatLongDate(ticket.date));
    printLabel('Hora', formatTime(ticket.date));
    printLabel('Lugar', ticket.location);
    printLabel('Sector', ticket.sectorName);

    // En no enumeradas: NO mostrar Asiento ni ID Ticket
    if (!nonEnum) {
      printLabel('Asiento', ticket.seatNumber ?? 'Sin asignar');
      printLabel('ID Ticket', ticket.idTicket);
    }

    y += 20;

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(40, y, pageWidth - 40, y);
    y += 25;

    if (ticket.imageUrl) {
      try {
        const imgData = await fetch(ticket.imageUrl)
          .then(res => res.blob())
          .then(blob => new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }));

        const imgWidth = pageWidth - 100;
        const imgHeight = 160;
        pdf.addImage(imgData, 'JPEG', 50, y, imgWidth, imgHeight);
        y += imgHeight + 30;
      } catch (error) {
        console.warn('Error al cargar imagen para PDF:', error);
      }
    }

    // QR: no exponer idTicket si no enumerada
    const qrData = nonEnum
      ? `venta:${ticket.idSale}-evento:${ticket.eventId}`
      : `ticket:${ticket.idTicket}-venta:${ticket.idSale}`;

    const qrImg = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrData)}`)
      .then(res => res.blob())
      .then(blob => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }));

    pdf.addImage(qrImg, 'PNG', pageWidth / 2 - 70, y, 140, 140);
    y += 170;

    pdf.setDrawColor(79, 70, 229);
    pdf.setLineWidth(0.8);
    pdf.line(40, y, pageWidth - 40, y);
    y += 40;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(79, 70, 229);
    pdf.text('¡Gracias por tu compra!', pageWidth / 2, y, { align: 'center' });
    y += 25;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    if (user?.name) {
      pdf.text(`Usuario: ${user.name}   DNI: ${user.dni}`, pageWidth / 2, y, { align: 'center' });
      y += 20;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(90, 90, 90);
    pdf.text('Conserva este PDF como comprobante oficial de tu entrada.', pageWidth / 2, y, { align: 'center' });

    pdf.save(`entrada-${ticket.eventName.replace(/\s+/g, '-')}-${ticket.idSale}${nonEnum ? '' : `-${ticket.idTicket}`}.pdf`);
  };

  const isNonEnumeratedTicket = (tk: PurchasedTicket) => {
    if (tk.sectorType) return tk.sectorType.toLowerCase() === 'nonenumerated';
    return tk.seatNumber == null;
  };

  const isNonEnumeratedGroup = (g: TicketGroup) => {
    if (g.sectorType) return g.sectorType.toLowerCase() === 'nonenumerated';
    return g.tickets.every(t => t.seatNumber == null);
  };

  const normalizeSectorName = (name: string) =>
    (name || 'Sin sector')
      .replace(/Asiento\s*\d+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

  const groupTicketsBySaleAndSector = (ts: PurchasedTicket[]): TicketGroup[] => {
    const map = new Map<string, TicketGroup>();

    for (const tk of ts) {
      const nonEnum = isNonEnumeratedTicket(tk);
      const sectorNorm = normalizeSectorName(tk.sectorName);
      const sectorKey = nonEnum ? (sectorNorm || 'Entrada General') : sectorNorm;

      const key = `${tk.idSale}|${tk.eventId}|${nonEnum ? 'NONENUM' : 'ENUM'}|${sectorKey}`;

      let grp = map.get(key);
      if (!grp) {
        grp = {
          idSale: tk.idSale,
          eventId: tk.eventId,
          eventName: tk.eventName,
          date: tk.date,
          time: tk.time,
          location: tk.location,
          sectorName: sectorKey,
          sectorType: nonEnum ? 'nonEnumerated' : 'enumerated',
          tickets: [],
        };
        map.set(key, grp);
      }
      grp.tickets.push(tk);
    }

    for (const g of map.values()) {
      g.tickets.sort((a, b) => {
        const av = Number.isFinite(a.seatNumber as number) ? (a.seatNumber as number) : Infinity;
        const bv = Number.isFinite(b.seatNumber as number) ? (b.seatNumber as number) : Infinity;
        return av - bv;
      });
    }

    return Array.from(map.values()).sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (da !== db) return da - db;
      if (a.idSale !== b.idSale) return a.idSale - b.idSale;
      return a.sectorName.localeCompare(b.sectorName);
    });
  };

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
        const data: PurchasedTicket[] = response.data.data || [];
        setTickets(data);
      } catch (err) {
        console.error("Error al obtener las entradas:", err);
        setError("No se pudieron cargar tus entradas. Inténtalo de nuevo más tarde.");
      } finally {
        setIsFetching(false);
      }
    };

    if (!isLoading) fetchTickets();
  }, [isLoggedIn, user, isLoading]);

  const ticketGroups = useMemo(
    () => groupTicketsBySaleAndSector(tickets),
    [tickets]
  );


  return (
    <div className={styles.myTicketsContainer}>
      <h1 className={styles.myTicketsTitle}>Mis Entradas</h1>

      {error && <p className={styles.noTickets}>{error}</p>}

      {!error && ticketGroups.length > 0 ? (
        <div className={styles.ticketsGrid}>
          {ticketGroups.map(group => {
            const nonEnum = isNonEnumeratedGroup(group);
            return (
              <div
                key={`${group.idSale}-${group.eventId}-${group.sectorName}`}
                id={`ticketGroup-${group.idSale}-${group.eventId}-${group.sectorName}`}
                className={styles.ticketCard}
              >
                <div className={styles.ticketHeader}>
                  <h2 className={styles.ticketEventName}>{group.eventName}</h2>
                  <span className={styles.ticketDate}>{formatLongDate(group.date)}</span>
                </div>

                <div className={styles.ticketBody}>
                  <div className={styles.ticketInfo}>
                    <p><strong>Lugar:</strong> {group.location}</p>
                    <p><strong>Sector:</strong> {group.sectorName} (x{group.tickets.length})</p>

                    {!nonEnum && group.tickets.length > 0 && (
                      <p>
                        <strong>Asientos:</strong>{' '}
                        {group.tickets
                          .map(tk => tk.seatNumber ?? 'Sin asignar')
                          .join(', ')}
                      </p>
                    )}

                    <p><strong>Hora:</strong> {formatTime(group.date)}</p>
                  </div>
                  <div className={styles.ticketQRCode}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=venta:${group.idSale}-sector:${encodeURIComponent(group.sectorName)}`}
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
            );
          })}
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
