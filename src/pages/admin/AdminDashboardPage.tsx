import React, { useEffect, useState } from 'react';
import { AdminService } from '@/services/AdminService';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import StatsCard from '@/shared/components/StatsCard';
import {
    FaMoneyBillWave,
    FaTicketAlt,
    FaCalendarCheck,
    FaChartLine
} from 'react-icons/fa';
import styles from '@/pages/admin/styles/AdminDashboardPage.module.css';
import type { DashboardStats } from '@/types/admin';

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminService.getDashboardStats();
                setStats(data);
            } catch (err: any) {
                console.error('Error fetching admin stats', err);
                setError('No se pudieron cargar las estadísticas.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner text="Cargando reporte..." />;

    if (error) {
        return (
            <div className={styles.dashboardContainer}>
                <div className={styles.errorCard}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Panel de Control</h1>
                <p className={styles.subtitle}>Resumen de actividad del día de hoy</p>
            </header>

            <div className={styles.statsGrid}>
                <StatsCard
                    title="Ingresos Hoy"
                    value={`$${stats?.revenueToday.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                    icon={FaMoneyBillWave}
                    iconColorClass="blue"
                />
                <StatsCard
                    title="Tickets Vendidos"
                    value={stats?.ticketsToday || 0}
                    icon={FaTicketAlt}
                    iconColorClass="green"
                />
                <StatsCard
                    title="Ventas Realizadas"
                    value={stats?.salesToday || 0}
                    icon={FaChartLine}
                    iconColorClass="purple"
                />
                <StatsCard
                    title="Eventos Pendientes"
                    value={stats?.pendingEvents || 0}
                    icon={FaCalendarCheck}
                    iconColorClass="orange"
                />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
