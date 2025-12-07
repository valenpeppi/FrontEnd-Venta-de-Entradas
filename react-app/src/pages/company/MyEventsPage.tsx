import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventService } from '../../services/EventService';
import CompanyEventCard from './components/CompanyEventCard';
import styles from './MyEventsPage.module.css';

const MyEventsPage: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await EventService.getCompanyEvents();
                setEvents(data);
            } catch (err) {
                console.error('Error fetching company events:', err);
                setError('No se pudieron cargar tus eventos. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <div className={styles.loading}>Cargando eventos...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Mis Eventos</h1>
                <p className={styles.subtitle}>Gestiona y monitorea el estado de tus eventos</p>
            </div>

            {events.length === 0 ? (
                <div className={styles.empty}>
                    <p>Aún no has creado ningún evento.</p>
                    <div className={styles.createButtonContainer}>
                        <Link to="/create-event" className={styles.createButton}>
                            Crear mi primer evento
                        </Link>
                    </div>
                </div>
            ) : (
                <div className={styles.grid}>
                    {events.map((event) => (
                        <CompanyEventCard key={event.idEvent} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyEventsPage;
