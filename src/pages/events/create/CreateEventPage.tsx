import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '@/shared/context/MessageContext';
import { EventService } from '@/services/EventService';
import { PlaceService } from '@/services/PlaceService';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import styles from '@/pages/events/create/styles/CreateEventPage.module.css';

import type { EventType, Sector } from '@/types/events';
import type { Place, CreateEventState, CreateEventAction } from '@/types/company';

const createEventReducer = (state: CreateEventState, action: CreateEventAction): CreateEventState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'SET_ERROR':
      return { ...state, error: action.payload.error };
    case 'SET_OCCUPIED_DATES':
      return { ...state, occupiedDates: action.payload.dates };
    case 'RESET_FORM':
      return {
        eventName: '',
        description: '',
        date: '',
        time: '',
        idEventType: '',
        error: null,
        image: null,
        idPlace: '',
        occupiedDates: [],
        sectorPrices: {},
      };
    case 'SET_IMAGE':
      return { ...state, image: action.payload.image };
    case 'SET_LOADING':
      return { ...state, loading: action.payload.loading };
    default:
      return state;
  }
};

const CreateEventPage: React.FC = () => {
  const [state, dispatch] = useReducer(createEventReducer, {
    eventName: '',
    description: '',
    date: '',
    time: '',
    idEventType: '',
    error: null,
    image: null,
    idPlace: '',
    occupiedDates: [],
    sectorPrices: {},
    loading: false,
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [types, setTypes] = useState<EventType[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const { setAppMessage } = useMessage();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [typesRes, placesRes] = await Promise.all([
          EventService.getEventTypes(),
          PlaceService.getAllPlaces(),
        ]);
        setTypes(typesRes);
        setPlaces(placesRes);
      } catch (e) {
        console.error("Error al cargar datos iniciales:", e);
        setAppMessage('No se pudieron cargar los datos para crear el evento.', 'error');
      }
    };
    fetchInitialData();
  }, [setAppMessage]);

  useEffect(() => {
    const fetchSectorsAndDates = async () => {
      if (state.idPlace) {
        try {
          const [sectorsRes, datesRes] = await Promise.all([
            PlaceService.getPlaceSectors(state.idPlace),
            PlaceService.getAvailableDates(state.idPlace)
          ]);
          setSectors(sectorsRes);
          dispatch({ type: 'SET_OCCUPIED_DATES', payload: { dates: datesRes } });
          dispatch({ type: 'SET_FIELD', payload: { field: 'sectorPrices', value: {} } });
        } catch (e) {
          console.error("Error al cargar sectores o fechas:", e);
          setAppMessage('No se pudieron cargar los detalles del lugar.', 'error');
        }
      } else {
        setSectors([]);
      }
    };
    fetchSectorsAndDates();
  }, [state.idPlace, setAppMessage]);

  const handleFieldChange = (field: keyof CreateEventState, value: any) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const handlePriceChange = (sectorId: number, price: string) => {
    dispatch({
      type: 'SET_FIELD',
      payload: {
        field: 'sectorPrices',
        value: { ...state.sectorPrices, [sectorId]: price }
      }
    });
  };

  const handleImageChange = (file: File | null) => {
    dispatch({ type: 'SET_IMAGE', payload: { image: file } });
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    if (file) {
      const newPreviewUrl = URL.createObjectURL(file);
      setImagePreview(newPreviewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file);
    } else {
      setAppMessage('Por favor, suelta un archivo de imagen válido.', 'error');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    if (!state.eventName || !state.description || !state.date || !state.time || !state.idEventType || !state.idPlace) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, completá todos los campos.' } });
      return;
    }

    const sectorsWithPrices = sectors.map(sector => ({
      idSector: sector.idSector,
      price: parseFloat(state.sectorPrices[sector.idSector] || '0')
    }));

    for (const item of sectorsWithPrices) {
      if (isNaN(item.price) || item.price <= 0) {
        dispatch({ type: 'SET_ERROR', payload: { error: `El precio para el sector "${sectors.find(s => s.idSector === item.idSector)?.name}" no es válido.` } });
        return;
      }
    }

    if (!state.image) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'La imagen es obligatoria.' } });
      return;
    }

    const datetime = new Date(`${state.date}T${state.time}:00`).toISOString();

    const formData = new FormData();
    formData.append('name', state.eventName);
    formData.append('description', state.description);
    formData.append('date', datetime);
    formData.append('idEventType', state.idEventType);
    formData.append('idPlace', state.idPlace);
    formData.append('sectors', JSON.stringify(sectorsWithPrices));
    formData.append('image', state.image);

    try {
      dispatch({ type: 'SET_LOADING', payload: { loading: true } });
      await EventService.createEvent(formData);

      setAppMessage('¡Evento creado exitosamente!', 'success');
      dispatch({ type: 'RESET_FORM' });
      navigate('/');
    } catch (err: any) {
      console.error('Error al crear evento:', err);
      const errorMessage = (err?.response?.data as any)?.message || 'Error al crear el evento.';
      dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
      setAppMessage(`Error: ${errorMessage}`, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loading: false } });
    }
  };

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
                  onChange={(e) => {
                    if (state.occupiedDates.includes(e.target.value)) {
                      handleFieldChange('date', '');
                      setAppMessage('Esa fecha no está disponible', 'error');
                    } else {
                      handleFieldChange('date', e.target.value);
                    }
                  }}
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
                  required
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



