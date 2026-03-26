import { useEffect, useMemo, useState } from "react";
import { AdminService } from "@/services/AdminService";
import { useMessage } from "@/hooks/useMessage";
import type { AdminEvent } from '@/types/admin';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'featured';

export const useAdminPanel = () => {
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<FilterType>('all');
    const { setAppMessage } = useMessage();

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await AdminService.getAllEvents();
                setEvents(data);
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

    const filteredEvents = useMemo(() => {
        let result = events;

        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (normalizedQuery) {
            result = result.filter((event) =>
                (event.name).toLowerCase().includes(normalizedQuery)
            );
        }

        switch (filter) {
            case 'pending':
                return result.filter(event => event.state === 'Pending');
            case 'approved':
                return result.filter(event => event.state === 'Approved');
            case 'rejected':
                return result.filter(event => event.state === 'Rejected');
            case 'featured':
                return result.filter(event => event.featured);
            case 'all':
            default:
                return result;
        }
    }, [searchQuery, events, filter]);

    const handleAction = async (id: number | string, action: "approve" | "reject" | "delete") => {
        if (action === "delete") {
            setEvents(prev => prev.filter(e => e.idEvent !== id));
        } else {
            setEvents(prev => prev.map(e => {
                if (e.idEvent === id) {
                    return { ...e, state: action === 'approve' ? 'Approved' : 'Rejected' };
                }
                return e;
            }));
        }

        try {
            if (action === 'approve') {
                await AdminService.approveEvent(id);
                setAppMessage('Evento aprobado con éxito', 'success');
            } else if (action === 'reject') {
                await AdminService.rejectEvent(id);
                setAppMessage('Evento rechazado', 'success');
            } else if (action === 'delete') {
                await AdminService.deleteEventState(id);
                setAppMessage('Evento eliminado con éxito', 'success');
            }
        } catch (e: any) {
            if (action === "delete") {
                const msg = e?.response?.data?.message || e.message || "No se pudo eliminar el evento.";
                setAppMessage(`${msg} Recargando...`, 'error');
                setTimeout(() => window.location.reload(), 1500);
                return;
            }

            setAppMessage(
                e?.response?.data?.message ||
                `No se pudo completar la acción: ${action}`,
                'error'
            );
        }
    };

    const toggleFeature = async (id: number | string) => {
        setEvents(prevEvents =>
            prevEvents.map(e =>
                e.idEvent === id ? { ...e, featured: !e.featured } : e
            )
        );

        try {
            await AdminService.toggleFeature(id);
        } catch (e: any) {
            setEvents(prevEvents =>
                prevEvents.map(e =>
                    e.idEvent === id ? { ...e, featured: !e.featured } : e
                )
            );
            setAppMessage(
                e?.response?.data?.message ||
                `No se pudo actualizar el estado de destacado.`,
                'error'
            );
        }
    };

    const counts = useMemo(() => {
        return {
            all: events.length,
            pending: events.filter(e => e.state === 'Pending').length,
            approved: events.filter(e => e.state === 'Approved').length,
            rejected: events.filter(e => e.state === 'Rejected').length,
            featured: events.filter(e => e.featured).length,
        };
    }, [events]);

    return {
        events,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        filter,
        setFilter,
        filteredEvents,
        handleAction,
        toggleFeature,
        counts
    };
};
