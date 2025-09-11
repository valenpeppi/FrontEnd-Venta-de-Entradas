import React, { createContext, useContext, useState } from "react";

interface EventDetailContextType {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  selectedSector: number | null;
  setSelectedSector: (id: number | null) => void;
}

const EventDetailContext = createContext<EventDetailContextType | undefined>(undefined);

interface EventDetailProviderProps {
  children: React.ReactNode;
}

export const EventDetailProvider: React.FC<EventDetailProviderProps> = ({ children }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <EventDetailContext.Provider
      value={{ zoom, zoomIn, zoomOut, resetZoom, selectedSector, setSelectedSector }}
    >
      {children}
    </EventDetailContext.Provider>
  );
};

export const useEventDetail = (): EventDetailContextType => {
  const ctx = useContext(EventDetailContext);
  if (!ctx) throw new Error("useEventDetail debe usarse dentro de un EventDetailProvider");
  return ctx;
};
