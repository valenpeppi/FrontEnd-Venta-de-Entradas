import { useAdminPanel } from "@/hooks/useAdminPanel";
import styles from "@/pages/admin/styles/AdminPanel.module.css";
import globalStyles from "@/shared/styles/GlobalStyles.module.css";
import { FaStar as StarFilledIcon, FaRegStar as StarOutlineIcon, FaCheck as CheckIcon, FaTimes as CrossIcon, FaInbox as InboxIcon } from "react-icons/fa";
import StatusBadge from "@/shared/components/StatusBadge";
import EmptyState from "@/shared/components/EmptyState";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function AdminPanel() {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    filteredEvents,
    handleAction,
    toggleFeature,
    counts
  } = useAdminPanel();

  if (loading)
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
        <p className={styles.loadingStateText}>Cargando eventos...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.adminContainer}>
        <EmptyState title="Error" description={error} compact />
      </div>
    );

  return (
    <div className={styles.adminContainer}>
      <AdminDashboardPage />

      <header className={styles.adminHeader}>
        <div className={styles.filterTabs}>
          <button
            className={`${filter === 'all' ? globalStyles.littleGlowBtnInverse : globalStyles.littleGlowBtn}`}
            onClick={() => setFilter('all')}
          >
            Todos <span className={styles.tabCount}>{counts.all}</span>
          </button>
          <button
            className={`${filter === 'pending' ? globalStyles.littleGlowBtnInverse : globalStyles.littleGlowBtn}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes <span className={styles.tabCount}>{counts.pending}</span>
          </button>
          <button
            className={`${filter === 'approved' ? globalStyles.littleGlowBtnInverse : globalStyles.littleGlowBtn}`}
            onClick={() => setFilter('approved')}
          >
            Aprobados <span className={styles.tabCount}>{counts.approved}</span>
          </button>
          <button
            className={`${filter === 'featured' ? globalStyles.littleGlowBtnInverse : globalStyles.littleGlowBtn}`}
            onClick={() => setFilter('featured')}
          >
            Destacados <span className={styles.tabCount}>{counts.featured}</span>
          </button>
          <button
            className={`${filter === 'rejected' ? globalStyles.littleGlowBtnInverse : globalStyles.littleGlowBtn}`}
            onClick={() => setFilter('rejected')}
          >
            Rechazados <span className={styles.tabCount}>{counts.rejected}</span>
          </button>
        </div>

        <div className={styles.adminTools}>
          <input
            className={styles.adminSearch}
            placeholder="Buscar por descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.adminCounter}>
            {filteredEvents.length} evento(s)
          </span>
        </div>
      </header>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No se encontraron eventos"
          description="Intenta cambiar los filtros o la búsqueda."
          icon={<InboxIcon />}
          compact
        />
      ) : (
        <ul className={styles.masonry}>
          {filteredEvents.map((event) => (
            <li key={event.idEvent} className={styles.card}>
              <div className={styles.mediaWrap}>
                {event.image ? (
                  <img
                    src={`${BASE_URL}${event.image}`}
                    alt={event.name}
                    className={styles.media}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className={styles.mediaPlaceholder} />
                )}

                <button
                  className={`${styles.featureBtn} ${event.featured ? styles.featured : ''}`}
                  onClick={() => toggleFeature(event.idEvent)}
                  title={event.featured ? 'Quitar de destacados' : 'Destacar evento'}
                >
                  {event.featured ? <StarFilledIcon /> : <StarOutlineIcon />}
                </button>

                <div className={styles.badges}>
                  <StatusBadge status={event.state || 'Pending'} />
                </div>
              </div>

              <div className={styles.body}>
                <h3 className={styles.title} title={event.name}>
                  {event.name}
                </h3>
                {event.description && (
                  <p className={styles.desc} title={event.description}>
                    {event.description}
                  </p>
                )}

                {event.state === 'Pending' && (
                  <div className={styles.metaInfo}>
                    <p className={styles.organiserInfo}>
                      <strong>Organizador:</strong> {event.organiser?.companyName || "Administrador"}
                    </p>
                  </div>
                )}
              </div>

              {(event.state === 'Pending' || event.state === 'Rejected') && (
                <div className={styles.actions}>
                  {event.state === 'Pending' && (
                    <>
                      <button
                        className={`${styles.btn} ${styles.btnApprove}`}
                        onClick={() => handleAction(event.idEvent, "approve")}
                        title="Aprobar"
                      >
                        <CheckIcon /> Aprobar
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnReject}`}
                        onClick={() => handleAction(event.idEvent, "reject")}
                        title="Rechazar"
                      >
                        <CrossIcon /> Rechazar
                      </button>
                    </>
                  )}
                  {event.state === 'Rejected' && (
                    <button
                      className={`${styles.btn} ${styles.btnApprove}`}
                      onClick={() => handleAction(event.idEvent, "approve")}
                      title="Re-aprobar"
                    >
                      <CheckIcon /> Aprobar
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
