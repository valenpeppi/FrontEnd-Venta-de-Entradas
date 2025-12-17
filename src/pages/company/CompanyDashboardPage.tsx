import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminService } from '@/services/AdminService';
import StatsCard from '@/shared/components/StatsCard';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import {
    FaMoneyBillWave,
    FaTicketAlt,
    FaCalendarCheck,
    FaCalendarPlus,
    FaList,
    FaUserEdit
} from 'react-icons/fa';
import styles from '@/pages/company/styles/CompanyDashboardPage.module.css';
import { useAuth } from '@/hooks/useAuth';

interface CompanyStats {
    activeEvents: number;
    ticketsSold: number;
    totalRevenue: number;
}
import { useAuth } from '@/shared/context/AuthContext';
import type { CompanyStats } from '@/types/company';

const CompanyDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminService.getCompanyStats();
                setStats(data);
            } catch (err: any) {
                console.error('Error fetching company stats', err);
                setError('No se pudieron cargar las estadísticas.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner text="Cargando tu panel..." />;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Hola, {user?.name}</h1>
                <p className={styles.subtitle}>Bienvenido a tu panel de control de organizador</p>
            </header>

            {error ? (
                <div className={styles.errorCard}>{error}</div>
            ) : (
                <div className={styles.statsGrid}>
                    <StatsCard
                        title="Ingresos Totales"
                        value={`$${stats?.totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                        icon={FaMoneyBillWave}
                        iconColorClass="blue"
                    />
                    <StatsCard
                        title="Entradas Vendidas"
                        value={stats?.ticketsSold || 0}
                        icon={FaTicketAlt}
                        iconColorClass="green"
                    />
                    <StatsCard
                        title="Eventos Activos"
                        value={stats?.activeEvents || 0}
                        icon={FaCalendarCheck}
                        iconColorClass="purple"
                    />
                </div>
            )}

            <section className={styles.actionsSection}>
                <h2 className={styles.sectionTitle}>Accesos Rápidos</h2>
                <div className={styles.actionsGrid}>
                    <Link to="/create-event" className={styles.actionCard}>
                        <div className={`${styles.iconContainer} ${styles.orange}`}>
                            <FaCalendarPlus />
                        </div>
                        <h3>Crear Nuevo Evento</h3>
                        <p>Publica un nuevo espectáculo o actividad.</p>
                    </Link>

                    <Link to="/company/my-events" className={styles.actionCard}>
                        <div className={`${styles.iconContainer} ${styles.indigo}`}>
                            <FaList />
                        </div>
                        <h3>Mis Eventos</h3>
                        <p>Administra tus eventos creados y ve detalles.</p>
                    </Link>

                    <Link to="/profile" className={styles.actionCard}>
                        <div className={`${styles.iconContainer} ${styles.teal}`}>
                            <FaUserEdit />
                        </div>
                        <h3>Mi Perfil</h3>
                        <p>Edita la información de tu empresa.</p>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default CompanyDashboardPage;
