import { useState, useEffect, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventService } from '@/services/EventService';
import type { EventType } from '@/types/events';
import type { Ticket } from '@/types/cart';

export const useUserHome = () => {
    const { featuredEvents, approvedEvents } = useEvents();
    const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
    const [allEventTypes, setAllEventTypes] = useState<EventType[]>([]);
    const [selectedType, setSelectedType] = useState<string>('Todos');

    useEffect(() => {
        const fetchEventTypes = async () => {
            try {
                const data = await EventService.getEventTypes();
                setAllEventTypes(data);
            } catch (error) {
                console.error("Error fetching event types:", error);
            }
        };
        fetchEventTypes();
    }, []);

    useEffect(() => {
        if (featuredEvents.length > 0 && currentEventIndex >= featuredEvents.length) {
            setCurrentEventIndex(0);
        }
    }, [featuredEvents, currentEventIndex]);

    const goToPreviousEvent = () => {
        if (featuredEvents.length === 0) return;
        setCurrentEventIndex(prevIndex =>
            prevIndex === 0 ? featuredEvents.length - 1 : prevIndex - 1
        );
    };

    const goToNextEvent = () => {
        if (featuredEvents.length === 0) return;
        setCurrentEventIndex(prevIndex =>
            prevIndex === featuredEvents.length - 1 ? 0 : prevIndex + 1
        );
    };

    const eventCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        for (const event of approvedEvents) {
            counts[event.type] = (counts[event.type] || 0) + 1;
        }
        return counts;
    }, [approvedEvents]);

    const filteredEvents = selectedType === 'Todos'
        ? approvedEvents
        : approvedEvents.filter(event => event.type === selectedType);

    const eventsByType = useMemo(() => {
        const groups: { [key: string]: Ticket[] } = {};
        filteredEvents.forEach(event => {
            if (!groups[event.type]) {
                groups[event.type] = [];
            }
            groups[event.type].push(event);
        });
        return groups;
    }, [filteredEvents]);

    return {
        featuredEvents,
        approvedEvents,
        currentEventIndex,
        allEventTypes,
        selectedType,
        setSelectedType,
        goToPreviousEvent,
        goToNextEvent,
        eventCounts,
        eventsByType
    };
};
