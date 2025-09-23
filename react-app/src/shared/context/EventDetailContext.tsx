import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { EventDetailContextType, EventSummary, Sector, Seat } from '../types';

const EventDetailContext = createContext<EventDetailContextType | undefined>(undefined);

interface EventDetailProviderProps {
  children: ReactNode;
}

export const EventDetailProvider: React.FC<EventDetailProviderProps> = ({ children }) => {
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalQuantity, setGeneralQuantity] = useState(0);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatsMap, setSelectedSeatsMap] = useState<Record<number, number[]>>({});

  const handleSectorQuantityChange = useCallback((sectorId: number, newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => {
    const currentTotal = sectors.reduce((sum, s) => sum + (s.selected || 0), 0);
    const sectorCurrentQuantity = sectors.find(s => s.idSector === sectorId)?.selected || 0;

    if (currentTotal - sectorCurrentQuantity + newQuantity > 6) {
      setAppMessage?.('No puedes seleccionar más de 6 entradas en total para este evento.', 'error');
      return;
    }

    setSectors(prev =>
      prev.map(s =>
        s.idSector === sectorId ? { ...s, selected: newQuantity } : s
      )
    );
  }, [sectors]);

  const handleSeatsChange = useCallback((sectorId: number, seatsSel: number[]) => {
    setSelectedSeatsMap(prev => ({ ...prev, [sectorId]: seatsSel }));
    setSectors(prev =>
      prev.map(s =>
        s.idSector === sectorId ? { ...s, selected: seatsSel.length } : s
      )
    );
  }, []);

  const handleGeneralQuantityChange = useCallback((newQuantity: number, setAppMessage?: (message: string, type: 'success' | 'error') => void) => {
    if (newQuantity > 6) {
      setAppMessage?.('No puedes seleccionar más de 6 entradas.', 'error');
      return;
    }
    setGeneralQuantity(newQuantity);
  }, []);

  const value: EventDetailContextType = {
    summary,
    sectors,
    loading,
    generalQuantity,
    selectedSector,
    seats,
    selectedSeatsMap,
    setSummary,
    setSectors,
    setLoading,
    setGeneralQuantity,
    setSelectedSector,
    setSeats,
    setSelectedSeatsMap,
    handleSectorQuantityChange,
    handleSeatsChange,
    handleGeneralQuantityChange,
  };

  return (
    <EventDetailContext.Provider value={value}>
      {children}
    </EventDetailContext.Provider>
  );
};

export const useEventDetail = (): EventDetailContextType => {
  const context = useContext(EventDetailContext);
  if (context === undefined) {
    throw new Error('useEventDetail debe ser usado dentro de un EventDetailProvider');
  }
  return context;
};
