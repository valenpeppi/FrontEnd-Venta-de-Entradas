import React from 'react';
import type { ZoomControlsProps } from '../../shared/types';
import styles from './styles/ZoomControls.module.css';

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minZoom,
  maxZoom
}) => {
  return (
    <div className={styles.zoomToolbar}>
      <button 
        type="button" 
        className={styles.zoomBtn} 
        onClick={onZoomOut} 
        aria-label="Alejar"
        disabled={zoom <= minZoom}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      
      <button 
        type="button" 
        className={styles.zoomBtn} 
        onClick={onResetZoom} 
        aria-label="Restablecer zoom"
      >
        {zoom.toFixed(1)}x
      </button>
      
      <button 
        type="button" 
        className={styles.zoomBtn} 
        onClick={onZoomIn} 
        aria-label="Acercar"
        disabled={zoom >= maxZoom}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
    </div>
  );
};

export default ZoomControls;
