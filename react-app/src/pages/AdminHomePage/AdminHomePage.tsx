// AdminHomePage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

type PendingEvent = {
  id: number | string;
  name: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  typeId?: number;
  status?: string;
  createdAt?: string;
};

export default function AdminHomePage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/events/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data?.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'No se pudieron obtener los eventos pendientes');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  if (loading) return <div>Cargando eventos pendientes…</div>;
  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;
  if (!events.length) return <div>No hay eventos pendientes.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <h1>Eventos pendientes</h1>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {events.map(ev => (
          <li key={ev.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {ev.imageUrl ? (
                <img
                  src={`http://localhost:3000/${ev.imageUrl}`}
                  alt={ev.name}
                  style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div style={{ width: 96, height: 96, background: '#f3f4f6', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px' }}>{ev.name}</h3>
                {ev.description && (
                  <p style={{ margin: 0, color: '#6b7280' }}>{ev.description}</p>
                )}
                <div style={{ marginTop: 8, fontSize: 14, color: '#374151' }}>
                  {ev.date && <>Fecha: {new Date(ev.date).toLocaleString()}</>}
                  {ev.status && <span style={{ marginLeft: 12 }}>Estado: {ev.status}</span>}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
