import React from 'react';
import { useEventDetail } from '../context/EventDetailContext';
import s from './StadiumPlan.module.css';

interface SectorLite {
  idSector: number;
  name: string;
  enumerated?: boolean;
}

interface Props {
  placeName: string;
  sectors: SectorLite[];
  imageSrc: string;
}

const nameToClass: Record<string, string> = {
  'tribuna norte': 'sector-1',
  'tribuna sur': 'sector-2',
  'popular': 'sector-3',
  'campo': 'sector-4'
};

const StadiumPlan: React.FC<Props> = ({ placeName, sectors, imageSrc }) => {
  const { zoom, zoomIn, zoomOut, resetZoom, selectedSector, setSelectedSector } = useEventDetail();

  const getOverlayClass = (sec: SectorLite) => {
    const key = nameToClass[sec.name.toLowerCase().trim()] || `sector-${sec.idSector}`;
    const active = selectedSector === sec.idSector ? s.activeSector : '';
    return `${s.sectorArea} ${s[key] || ''} ${active}`.trim();
  };

  return (
    <div className={s.stadiumPlanContainer}>
      <div className={s.zoomToolbar}>
        <button type="button" className={s.zoomBtn} onClick={zoomOut} aria-label="Alejar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button type="button" className={s.zoomBtn} onClick={resetZoom} aria-label="Restablecer zoom">{zoom.toFixed(1)}x</button>
        <button type="button" className={s.zoomBtn} onClick={zoomIn} aria-label="Acercar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
      </div>
      <div className={s.stadiumContent} style={{ transform: `scale(${zoom})` }}>
        <div className={s.imageFrame}>
          <img
            src={imageSrc}
            alt={`Plano del estadio ${placeName}`}
            className={s.stadiumImage}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/ticket.png'; }}
          />
          {sectors.map(sec => (
            <div
              key={sec.idSector}
              className={getOverlayClass(sec)}
              onClick={() => setSelectedSector(sec.idSector)}
              title={sec.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StadiumPlan;

