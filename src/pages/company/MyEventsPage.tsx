import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventService } from '@/services/EventService';
import CompanyEventCard from '@/shared/components/CompanyEventCard';
import EmptyState from '@/shared/components/EmptyState';
import styles from '@/pages/company/styles/MyEventsPage.module.css';
import { useMessage } from '@/shared/context/MessageContext';
import { useAuth } from '@/shared/context/AuthContext';
import { FaCalendarPlus } from 'react-icons/fa';

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

                } else {
                    setError('No se pudieron cargar tus eventos. Inténtalo de nuevo más tarde.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleDeleteEvent = async (id: string) => {
        try {
            await EventService.deleteEvent(id);
            setEvents(events.filter(e => e.idEvent !== id));


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
                <EmptyState
                    title="Error de sesión"
                    description={error || undefined}
                    compact
                >
                    {(error.includes('sesión') || error.includes('permisos')) && (
                        <button
                            onClick={() => { logout(); window.location.href = '/login'; }}
                            className={styles.createButton}
                        >
                            Iniciar Sesión nuevamente
                        </button>
                    )}
                </EmptyState>
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
                <EmptyState
                    title="¡Aún no tienes eventos creados!"
                    description="Parece que todavía no has organizado ningún evento. ¡Es el momento perfecto para empezar!"
                    icon={<FaCalendarPlus size={50} color="#9ca3af" />}
                >
                    <Link to="/create-event" className={styles.createButton}>
                        Crear mi primer evento
                    </Link>
                </EmptyState>
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
