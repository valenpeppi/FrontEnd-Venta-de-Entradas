import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./styles/AdminHomePage.module.css"; 
import { FaStar, FaRegStar } from "react-icons/fa";


type Event = {
  idEvent: number | string;
  name: string;
  description?: string;
  date?: string;
  image?: string;
  idEventType?: number;
  state?: string;
  idOrganiser?: string;
  featured: boolean;
};

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function FeatureEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
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
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/events/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data?.data ?? []);
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

  const toggleFeature = async (id: number | string) => {
    const token = localStorage.getItem("token");
    
    // Optimistic update
    setEvents(prevEvents => 
      prevEvents.map(e => 
        e.idEvent === id ? { ...e, featured: !e.featured } : e
      )
    );

    try {
      await axios.patch(
        `${BASE_URL}/api/events/${id}/feature`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e: any) {
      // Revert on error
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

  if (loading)
    return (
      <div className={styles.adminContainer}>
        <div className={styles.adminStatus}>Cargando eventos...</div>
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
        <h1>Destacar Eventos</h1>
        <div className={styles.adminTools}>
          <input
            className={styles.adminSearch}
            placeholder="Buscar por nombre o descripción..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className={styles.adminCounter}>
            {filtered.length} resultado(s)
          </span>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className={styles.adminStatus}>No hay eventos para mostrar.</div>
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
                  <span className={styles.visuallyHidden}>
                    {ev.featured ? 'Quitar de destacados' : 'Destacar evento'}
                  </span>
                </button>

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
            </li>
          ))}
        </ul> 
      )}
    </div>
  );
}

