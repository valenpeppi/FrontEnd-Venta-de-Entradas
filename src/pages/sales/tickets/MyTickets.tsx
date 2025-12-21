import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '@/pages/sales/tickets/styles/MyTickets.module.css';
import { formatLongDate, formatTime } from '@/shared/utils/dateFormatter';
import EmptyState from '@/shared/components/EmptyState';
import { FaTicketAlt } from 'react-icons/fa';
import { useMyTickets } from '@/hooks/useMyTickets';

const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const {
    isFetching,
    error,
    ticketGroups,
    handleDownloadPDF,
    isNonEnumeratedGroup
  } = useMyTickets();

  if (isFetching) {
    return (
      <div className={styles.myTicketsContainer}>
        <p>Cargando tus entradas...</p>
      </div>
    );
  }

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