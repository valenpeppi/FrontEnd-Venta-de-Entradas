import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventService } from '../../services/EventService';
import CompanyEventCard from '../../shared/components/CompanyEventCard';
import styles from './styles/MyEventsPage.module.css';
import { useMessage } from '../../shared/context/MessageContext';
import { useAuth } from '../../shared/context/AuthContext';

const MyEventsPage: React.FC = () => {
    const { setAppMessage } = useMessage();
    const { logout } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await EventService.getCompanyEvents();
                setEvents(data);
            } catch (err: any) {
                console.error('Error fetching company events:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.');
                    // Optionally redirect or allow user to click a link
                } else {
                    setError('No se pudieron cargar tus eventos. Inténtalo de nuevo más tarde.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleDeleteEvent = async (id: number) => {
        try {
            await EventService.deleteEvent(id);
            setEvents(events.filter(e => e.idEvent !== id));
            // Optional: Success message
            // setAppMessage('Evento eliminado correctamente', 'success'); 
        } catch (err: any) {
            console.error('Error deleting event:', err);
            const msg = err?.response?.data?.message || 'Error al eliminar el evento.';
            setAppMessage(msg, 'error');
        }
    };

    if (loading) return <div className={styles.loading}>Cargando eventos...</div>;
    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                {(error.includes('sesión') || error.includes('permisos')) && (
                    <button
                        onClick={() => { logout(); window.location.href = '/login'; }}
                        className={styles.createButton}
                        style={{ marginTop: '1rem', display: 'inline-block' }}
                    >
                        Iniciar Sesión nuevamente
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Mis Eventos</h1>
                <p className={styles.subtitle}>Gestiona y monitorea el estado de tus eventos</p>
            </div>

            {events.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🎉</div>
                    <h2 className={styles.emptyTitle}>¡Aún no tienes eventos creados!</h2>
                    <p className={styles.emptyDescription}>
                        Parece que todavía no has organizado ningún evento.<br />
                        ¡Es el momento perfecto para empezar! Crea tu primer evento y compártelo con el mundo.
                    </p>
                    <div className={styles.createButtonContainer}>
                        <Link to="/create-event" className={styles.createButton}>
                            Crear mi primer evento
                        </Link>
                    </div>
                </div>
            ) : (
                <div className={styles.grid}>
                    {events.map((event) => (
                        <CompanyEventCard
                            key={event.idEvent}
                            event={event}
                            onDelete={handleDeleteEvent}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyEventsPage;
