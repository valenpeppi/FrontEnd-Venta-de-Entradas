import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesService } from '@/services/SalesService';
import { useAuth } from '@/shared/context/AuthContext';
import styles from '@/pages/sales/tickets/styles/MyTickets.module.css';
import { PdfService } from '@/services/PdfService';
import { formatLongDate, formatTime } from '@/shared/utils/dateFormatter';
import EmptyState from '@/shared/components/EmptyState';
import { FaTicketAlt } from 'react-icons/fa';

import type { PurchasedTicket, PurchasedTicketGroup } from '@/types/purchase';

const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isNonEnumeratedGroup = (g: PurchasedTicketGroup) => {
    if (g.sectorType) return g.sectorType.toLowerCase() === 'nonenumerated';
    return g.tickets.every(t => t.seatNumber == null);
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
        const data: PurchasedTicket[] = await SalesService.getMyTickets();
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

  const handleDownloadPDF = async (ticket: PurchasedTicket) => {

    const currentUser = user ? { name: user.name, dni: user.dni } : null;
    await PdfService.generateTicketPdf(ticket, currentUser);
  };


  const normalizeSectorName = (name: string) =>
    (name || 'Sin sector').replace(/\s+/g, ' ').trim();

  const groupTicketsBySaleAndSector = (ts: PurchasedTicket[]): PurchasedTicketGroup[] => {
    const map = new Map<string, PurchasedTicketGroup>();

    for (const tk of ts) {
      const sector = normalizeSectorName(tk.sectorName);
      const key = `${tk.idSale}|${tk.eventId}|${sector}`;

      let grp = map.get(key);
      if (!grp) {
        grp = {
          idSale: tk.idSale,
          eventId: tk.eventId,
          eventName: tk.eventName,
          date: tk.date,
          time: tk.time,
          location: tk.location,
          sectorName: sector,
          sectorType: tk.sectorType,
          tickets: [],
        };
        map.set(key, grp);
      }
      if (tk.sectorType && !grp.sectorType) grp.sectorType = tk.sectorType;
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
      if (a.idSale !== b.idSale) return a.idSale.localeCompare(b.idSale);
      return a.sectorName.localeCompare(b.sectorName);
    });
  };

  if (isFetching) {
    return (
      <div className={styles.myTicketsContainer}>
        <p>Cargando tus entradas...</p>
      </div>
    );
  }

  const ticketGroups = groupTicketsBySaleAndSector(tickets);

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
          <EmptyState
            title="No tienes ninguna entrada comprada."
            description="Explora los eventos disponibles y asegura tu lugar."
            icon={<FaTicketAlt size={48} color="#9ca3af" />}
          >
            <button
              onClick={() => navigate('/')}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Explorar eventos
            </button>
          </EmptyState>
        )
      )}
    </div>
  );
};

export default MyTickets;


