import { useEffect, useMemo, useState } from "react";
import { AdminService } from "../../services/AdminService";
import styles from "./styles/AdminHomePage.module.css";
import globalStyles from "../../shared/styles/GlobalStyles.module.css";
import { FaStar, FaRegStar, FaCheck, FaTimes, FaInbox } from "react-icons/fa";
import StatusBadge from "../../shared/components/StatusBadge";
import EmptyState from "../../shared/components/EmptyState";

import type { AdminEvent } from '../../types/admin';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'featured';

export default function AdminHomePage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    let result = events;

    // 1. Text Search
    const v = q.trim().toLowerCase();
    if (v) {
      result = result.filter((e) =>
        [e.name, e.description].some((t) => (t || "").toLowerCase().includes(v))
      );
    }

    // 2. Status/Feature Filter
    switch (filter) {
      case 'pending':
        return result.filter(e => e.state === 'Pending');
      case 'approved':
        return result.filter(e => e.state === 'Approved');
      case 'rejected':
        return result.filter(e => e.state === 'Rejected');
      case 'featured':
        return result.filter(e => e.featured);
      case 'all':
      default:
        return result;
    }
  }, [q, events, filter]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await AdminService.getAllEvents();
        setEvents(data);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
          "No se pudieron obtener los eventos."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleAction = async (id: number | string, action: "approve" | "reject") => {
    // Optimistic update
    setEvents(prev => prev.map(e => {
      if (e.idEvent === id) {
        return { ...e, state: action === 'approve' ? 'Approved' : 'Rejected' };
      }
      return e;
    }));

    try {
      if (action === 'approve') {
        await AdminService.approveEvent(id);
      } else {
        await AdminService.rejectEvent(id);
      }
    } catch (e: any) {
      alert(
        e?.response?.data?.message ||
        `No se pudo ${action === "approve" ? "aprobar" : "rechazar"}`
      );
    }
  };

  const toggleFeature = async (id: number | string) => {
    setEvents(prevEvents =>
      prevEvents.map(e =>
        e.idEvent === id ? { ...e, featured: !e.featured } : e
      )
    );

    try {
      await AdminService.toggleFeature(id);
    } catch (e: any) {
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.idEvent === id ? { ...e, featured: !e.featured } : e
        )
      );
      alert(
        e?.response?.data?.message ||
        `No se pudo actualizar el estado de destacado.`
      );
    }
  };

  const counts = useMemo(() => {
    return {
      all: events.length,
      pending: events.filter(e => e.state === 'Pending').length,
      approved: events.filter(e => e.state === 'Approved').length,
      rejected: events.filter(e => e.state === 'Rejected').length,
      featured: events.filter(e => e.featured).length,
    };
  }, [events]);

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
      <header className={styles.adminHeader}>
        <h1>Panel de Administración</h1>

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
            placeholder="Buscar por nombre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className={styles.adminCounter}>
            {filtered.length} evento(s)
          </span>
        </div>
      </header>

      {filtered.length === 0 ? (
        <EmptyState
          title="No se encontraron eventos"
          description="Intenta cambiar los filtros o la búsqueda."
          icon={<FaInbox />}
          compact
        />
      ) : (
        <ul className={styles.masonry}>
          {filtered.map((ev) => (
            <li key={ev.idEvent} className={styles.card}>
              <div className={styles.mediaWrap}>
                {ev.image ? (
                  <img
                    src={`${BASE_URL}${ev.image}`}
                    alt={ev.name}
                    className={styles.media}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className={styles.mediaPlaceholder} />
                )}

                <button
                  className={`${styles.featureBtn} ${ev.featured ? styles.featured : ''}`}
                  onClick={() => toggleFeature(ev.idEvent)}
                  title={ev.featured ? 'Quitar de destacados' : 'Destacar evento'}
                >
                  {ev.featured ? <FaStar /> : <FaRegStar />}
                </button>

                <div className={styles.badges}>
                  <StatusBadge status={ev.state || 'Pending'} />
                </div>
              </div>

              <div className={styles.body}>
                <h3 className={styles.title} title={ev.name}>
                  {ev.name}
                </h3>
                {ev.description && (
                  <p className={styles.desc} title={ev.description}>
                    {ev.description}
                  </p>
                )}
              </div>

              <div className={styles.actions}>
                {ev.state === 'Pending' && (
                  <>
                    <button
                      className={`${styles.btn} ${styles.btnApprove}`}
                      onClick={() => handleAction(ev.idEvent, "approve")}
                      title="Aprobar"
                    >
                      <FaCheck /> Aprobar
                    </button>
                    <button
                      className={`${styles.btn} ${styles.btnReject}`}
                      onClick={() => handleAction(ev.idEvent, "reject")}
                      title="Rechazar"
                    >
                      <FaTimes /> Rechazar
                    </button>
                  </>
                )}
                {/* Removed Reject button for Approved events */}
                {ev.state === 'Rejected' && (
                  <button
                    className={`${styles.btn} ${styles.btnApprove}`}
                    onClick={() => handleAction(ev.idEvent, "approve")}
                    title="Re-aprobar"
                  >
                    <FaCheck /> Aprobar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
