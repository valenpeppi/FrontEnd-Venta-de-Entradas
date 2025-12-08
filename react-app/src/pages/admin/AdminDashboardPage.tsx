import React, { useEffect, useState } from 'react';
import { AdminService } from '../../services/AdminService';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { FaMoneyBillWave, FaTicketAlt, FaCalendarCheck, FaChartLine } from 'react-icons/fa';
import styles from './styles/AdminDashboardPage.module.css';

interface DashboardStats {
    salesToday: number;
    ticketsToday: number;
    revenueToday: number;
    pendingEvents: number;
}

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
                <div className={styles.statCard}>
                    <div className={`${styles.iconContainer} ${styles.blue}`}>
                        <FaMoneyBillWave />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Ingresos Hoy</span>
                        <span className={styles.statValue}>
                            ${stats?.revenueToday.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconContainer} ${styles.green}`}>
                        <FaTicketAlt />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Tickets Vendidos</span>
                        <span className={styles.statValue}>{stats?.ticketsToday}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconContainer} ${styles.purple}`}>
                        <FaChartLine />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Ventas Realizadas</span>
                        <span className={styles.statValue}>{stats?.salesToday}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.iconContainer} ${styles.orange}`}>
                        <FaCalendarCheck />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Eventos Pendientes</span>
                        <span className={styles.statValue}>{stats?.pendingEvents}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
