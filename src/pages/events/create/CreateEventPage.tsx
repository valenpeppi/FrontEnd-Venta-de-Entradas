import React from 'react';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import styles from '@/pages/events/create/styles/CreateEventPage.module.css';
import { useCreateEvent } from '@/hooks/useCreateEvent';

const CreateEventPage: React.FC = () => {
  const {
    state,
    places,
    sectors,
    types,
    imagePreview,
    isDragging,
    navigate,
    handleFieldChange,
    handlePriceChange,
    handleImageChange,
    handleDateChange,
    handleDragEvents,
    handleDrop,
    handleSubmit
  } = useCreateEvent();

  return (
    <div className={styles.createEventContainer}>
      <div className={styles.createEventCard}>
        <h1 className={styles.createEventTitle}>Crear Nuevo Evento</h1>
        {state.error && <div className={styles.createEventError}>{state.error}</div>}

        {state.loading ? (
          <LoadingSpinner text="Validando con IA..." />
        ) : (
          <form onSubmit={handleSubmit} className={styles.createEventForm} encType="multipart/form-data">
            <div className={styles.formGroup}>
              <label htmlFor="eventName">Nombre del Evento</label>
              <input
                type="text" id="eventName" value={state.eventName}
                onChange={(e) => handleFieldChange('eventName', e.target.value)}
                required maxLength={45}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description" value={state.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={3} required maxLength={255}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="idPlace">Lugar del evento</label>
              <select
                id="idPlace" value={state.idPlace}
                onChange={(e) => handleFieldChange('idPlace', e.target.value)}
                required
              >
                <option value="" disabled>Seleccioná un lugar</option>
                {places.map((p) => (
                  <option key={p.idPlace} value={p.idPlace}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date">Fecha</label>
                <input
                  type="date" id="date" value={state.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required disabled={!state.idPlace}
                  min={new Date().toISOString().split("T")[0]}
                />
                {state.idPlace && state.occupiedDates.length > 0 && (
                  <div className={styles.occupiedDatesContainer}>
                    <strong>Fechas no disponibles:</strong>
                    <ul>
                      {state.occupiedDates.map(date => (
                        <li key={date}>{new Date(date + 'T00:00:00').toLocaleDateString()}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="time">Hora</label>
                <input type="time" id="time" value={state.time} onChange={(e) => handleFieldChange('time', e.target.value)} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="idEventType">Tipo de Evento</label>
              <select
                id="idEventType" value={state.idEventType}
                onChange={(e) => handleFieldChange('idEventType', e.target.value)} required
              >
                <option value="" disabled>Seleccioná un tipo</option>
                {types.map((t) => (
                  <option key={t.idType} value={t.idType}>{t.name}</option>
                ))}
              </select>
            </div>

            {sectors.length > 0 && (
              <div className={styles.sectorsContainer}>
                <h3>Precios por Sector</h3>
                {sectors.map(sector => (
                  <div className={styles.formGroup} key={sector.idSector}>
                    <label htmlFor={`price-${sector.idSector}`}>{sector.name}</label>
                    <input
                      type="number"
                      id={`price-${sector.idSector}`}
                      className={styles.priceInput}
                      value={state.sectorPrices[sector.idSector] || ''}
                      onChange={(e) => handlePriceChange(sector.idSector, e.target.value)}
                      placeholder="Ej: 40000.00"
                      required min="0" step="0.01"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="image">Foto del Evento</label>
              <label
                htmlFor="image-upload"
                className={`${styles.fileInputContainer} ${isDragging ? styles.dragOver : ''}`}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDrop={handleDrop}
              >
                <input
                  id="image-upload"
                  className={styles.fileInputButton}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Vista previa" className={styles.imagePreview} />
                ) : (
                  <span className={styles.fileInputText}>
                    <strong>Haz clic para subir</strong> o arrastra una imagen
                  </span>
                )}
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.createEventBtn} disabled={state.loading}>
                {state.loading ? 'Validando con IA...' : 'Crear Evento'}
              </button>
              <button type="button" onClick={() => navigate('/')} className={styles.cancelBtn}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateEventPage;
