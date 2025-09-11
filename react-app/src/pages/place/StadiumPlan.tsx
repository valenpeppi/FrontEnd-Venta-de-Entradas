// pages/place/StadiumPlan.tsx
import React from "react";
import { useEventDetail } from "../../shared/context/EventDetailContext";
import type { EventSector } from "../../shared/context/Interfaces";
import s from "./styles/StadiumPlan.module.css";

interface Props {
  placeName: string;
  sectors: EventSector[];
  imageSrc: string;
}

const nameToClass: Record<string, string> = {
  "tribuna norte": "sector-1",
  "tribuna sur": "sector-2",
  popular: "sector-3",
  campo: "sector-4",
};

const StadiumPlan: React.FC<Props> = ({ placeName, sectors, imageSrc }) => {
  const { zoom, zoomIn, zoomOut, resetZoom, selectedSector, setSelectedSector } =
    useEventDetail();

  const getOverlayClass = (sec: EventSector) => {
    const key = nameToClass[sec.name.toLowerCase().trim()] || `sector-${sec.idSector}`;
    const active = selectedSector === sec.idSector ? s.activeSector : "";
    return `${s.sectorArea} ${s[key] || ""} ${active}`.trim();
  };

  return (
    <div className={s.stadiumPlanContainer}>
      {/* Controles de zoom */}
      <div className={s.zoomToolbar}>
        <button type="button" className={s.zoomBtn} onClick={zoomOut}>
          -
        </button>
        <button type="button" className={s.zoomBtn} onClick={resetZoom}>
          {zoom.toFixed(1)}x
        </button>
        <button type="button" className={s.zoomBtn} onClick={zoomIn}>
          +
        </button>
      </div>

      {/* Imagen + sectores */}
      <div className={s.stadiumContent} style={{ transform: `scale(${zoom})` }}>
        <div className={s.imageFrame}>
          <img
            src={imageSrc}
            alt={`Plano del estadio ${placeName}`}
            className={s.stadiumImage}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/ticket.png";
            }}
          />
          {sectors.map((sec) => (
            <div
              key={sec.idSector}
              className={getOverlayClass(sec)}
              onClick={() => setSelectedSector(sec.idSector)}
              title={`${sec.name} - $${sec.price} (${sec.availableTickets} disponibles)`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StadiumPlan;
