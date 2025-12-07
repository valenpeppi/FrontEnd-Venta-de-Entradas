import { useEffect, useMemo, useState } from "react";
import { AdminService } from "../../services/AdminService";
import styles from "./styles/AdminHomePage.module.css";

import type { PendingEvent } from '../../types/admin';

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function AdminHomePage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const v = q.trim().toLowerCase();
    if (!v) return events;
    return events.filter((e) =>
      [e.name, e.description].some((t) => (t || "").toLowerCase().includes(v))
    );
  }, [q, events]);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await AdminService.getPendingEvents();
        setEvents(data);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ||
          "No se pudieron obtener los eventos pendientes"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const act = async (id: number | string, action: "approve" | "reject") => {
    const prev = events;
    setEvents((list) => list.filter((e) => e.idEvent !== id));

    try {
      if (action === 'approve') {
        await AdminService.approveEvent(id);
      } else {
        await AdminService.rejectEvent(id);
      }
    } catch (e: any) {
      setEvents(prev);
      alert(
        e?.response?.data?.message ||
        `No se pudo ${action === "approve" ? "aprobar" : "rechazar"}`
      );
    }
  };

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
        <div className={`${styles.adminStatus} ${styles.error}`}>{error}</div>
      </div>
    );

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1>Eventos pendientes</h1>
        <div className={styles.adminTools}>
          <input
            className={styles.adminSearch}
            placeholder="Buscar por nombre o descripción…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className={styles.adminCounter}>
            {filtered.length} resultado(s)
          </span>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className={styles.adminStatus}>No hay eventos pendientes.</div>
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
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles.badgePending}`}>
                    {ev.state || "PENDING"}
                  </span>
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
                <button
                  className={`${styles.btn} ${styles.btnReject}`}
                  onClick={() => act(ev.idEvent, "reject")}
                  title="Rechazar evento"
                >
                  Rechazar
                </button>
                <button
                  className={`${styles.btn} ${styles.btnApprove}`}
                  onClick={() => act(ev.idEvent, "approve")}
                  title="Aprobar evento"
                >
                  Aprobar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
