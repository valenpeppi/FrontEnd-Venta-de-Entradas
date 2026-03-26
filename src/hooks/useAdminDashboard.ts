import { useState, useEffect } from 'react';
import { AdminService } from '@/services/AdminService';
import type { DashboardStats } from '@/types/admin';

export const useAdminDashboard = () => {
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

    return { stats, loading, error };
};