import { useEffect, useState } from 'react';
import { SalesService } from '@/services/SalesService';
import { useAuth } from '@/hooks/useAuth';
import { PdfService } from '@/services/PdfService';
import type { PurchasedTicket, PurchasedTicketGroup } from '@/types/purchase';

export const useMyTickets = () => {
    const { user, isLoggedIn, isLoading } = useAuth();
    const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            if (!isLoggedIn || !user?.dni) {
                if (!isLoading) {
                    setError("Debes iniciar sesión para ver tus entradas.");
                    setIsFetching(false);
                }
                return;
            }
            try {
                const data: PurchasedTicket[] = await SalesService.getMyTickets();
                setTickets(data);
            } catch (err) {
                console.error("Error al obtener las entradas:", err);
                setError("No se pudieron cargar tus entradas. Inténtalo de nuevo más tarde.");
            } finally {
                setIsFetching(false);
            }
        };

        if (!isLoading) fetchTickets();
    }, [isLoggedIn, user, isLoading]);

    const handleDownloadPDF = async (ticket: PurchasedTicket) => {
        const currentUser = user ? { name: user.name, dni: user.dni } : null;
        await PdfService.generateTicketPdf(ticket, currentUser);
    };

    const isNonEnumeratedGroup = (g: PurchasedTicketGroup) => {
        if (g.sectorType) return g.sectorType.toLowerCase() === 'nonenumerated';
        return g.tickets.every(t => t.seatNumber == null);
    };

    const normalizeSectorName = (name: string) =>
        (name || 'Sin sector').replace(/\s+/g, ' ').trim();

    const groupTicketsBySaleAndSector = (ts: PurchasedTicket[]): PurchasedTicketGroup[] => {
        const map = new Map<string, PurchasedTicketGroup>();

        for (const tk of ts) {
            const sector = normalizeSectorName(tk.sectorName);
            const key = `${tk.idSale}|${tk.eventId}|${sector}`;

            let grp = map.get(key);
            if (!grp) {
                grp = {
                    idSale: tk.idSale,
                    eventId: tk.eventId,
                    eventName: tk.eventName,
                    date: tk.date,
                    time: tk.time,
                    location: tk.location,
                    sectorName: sector,
                    sectorType: tk.sectorType,
                    tickets: [],
                };
                map.set(key, grp);
            }
            if (tk.sectorType && !grp.sectorType) grp.sectorType = tk.sectorType;
            grp.tickets.push(tk);
        }

        for (const g of map.values()) {
            g.tickets.sort((a: any, b: any) => {
                const av = Number.isFinite(a.seatNumber) ? a.seatNumber : Infinity;
                const bv = Number.isFinite(b.seatNumber) ? b.seatNumber : Infinity;
                return av - bv;
            });
        }

        return Array.from(map.values()).sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            if (da !== db) return da - db;
            if (a.idSale !== b.idSale) return a.idSale.localeCompare(b.idSale);
            return a.sectorName.localeCompare(b.sectorName);
        });
    };

    const ticketGroups = groupTicketsBySaleAndSector(tickets);

    return {
        tickets,
        isFetching,
        error,
        ticketGroups,
        handleDownloadPDF,
        isNonEnumeratedGroup
    };
};
