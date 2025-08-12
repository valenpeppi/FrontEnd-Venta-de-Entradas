import React, { useEffect, useState } from 'react';
import './styles/AdminHomePage.css';

interface EventRequest {
  id: string;
  eventName: string;
  requester: string;
  date: string;
  status: 'pendiente' | 'aceptado' | 'rechazado';
}

const mockRequests: EventRequest[] = [
  { id: '1', eventName: 'Fiesta Universitaria', requester: 'Juan Pérez', date: '2025-08-15', status: 'pendiente' },
  { id: '2', eventName: 'Concierto Rock', requester: 'Ana Gómez', date: '2025-09-10', status: 'pendiente' },
];

const AdminHomePage: React.FC = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);

  // Cargar las solicitudes mock al inicio
  useEffect(() => {
    setRequests(mockRequests);
  }, []);

  const handleDecision = (id: string, decision: 'aceptado' | 'rechazado') => {
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: decision } : req
      )
    );
  };

  return (
    <div className="admin-home-container">
      <h1>Solicitudes de Eventos</h1>
      {requests.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        requests.map(req => (
          <div className="event-card" key={req.id}>
            <div className="event-title">{req.eventName}</div>
            <div className="event-info">Solicitante: <b>{req.requester}</b></div>
            <div className="event-info">Fecha: {req.date}</div>
            <div className={`event-status ${req.status}`}>Estado: {req.status}</div>
            <div className="event-actions">
              {req.status === 'pendiente' && (
                <>
                  <button onClick={() => handleDecision(req.id, 'aceptado')}>Aceptar</button>
                  <button onClick={() => handleDecision(req.id, 'rechazado')}>Rechazar</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminHomePage;
