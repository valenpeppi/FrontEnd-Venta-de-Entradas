import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../shared/context/MessageContext';
import axios from 'axios';
import styles from './styles/CreateEventPage.module.css';

interface EventType {
  idType: number;
  name: string;
}

interface CreateEventState {
  eventName: string;
  description: string;
  date: string;
  time: string;
  idEventType: string;
  error: string | null;
  image: File | null;
}

type CreateEventAction =
  | { type: 'SET_FIELD'; payload: { field: keyof CreateEventState; value: string } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'RESET_FORM' }
  | { type: 'SET_IMAGE'; payload: { image: File | null } };

const createEventReducer = (state: CreateEventState, action: CreateEventAction): CreateEventState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'SET_ERROR':
      return { ...state, error: action.payload.error };
    case 'RESET_FORM':
      return {
        eventName: '',
        description: '',
        date: '',
        time: '',
        idEventType: '',
        error: null,
        image: null,
      };
    case 'SET_IMAGE':
      return { ...state, image: action.payload.image };
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
  });

  const [types, setTypes] = useState<EventType[]>([]);
  const navigate = useNavigate();
  const { setAppMessage } = useMessage();

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        const { data } = await axios.get<EventType[]>('http://localhost:3000/api/events/types');
        setTypes(data);
      } catch (e) {
        console.error("Error al cargar los tipos de evento:", e);
        setAppMessage('No se pudieron cargar los tipos de evento.', 'error');
      }
    };
    fetchEventTypes();
  }, [setAppMessage]);

  const handleFieldChange = (field: keyof CreateEventState, value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    dispatch({ type: 'SET_IMAGE', payload: { image: file } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    if (!state.eventName || !state.description || !state.date || !state.time || !state.idEventType) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, completá todos los campos.' } });
      return;
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
    formData.append('image', state.image as Blob);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAppMessage('No estás autenticado. Por favor, inicia sesión de nuevo.', 'error');
        navigate('/logincompany');
        return;
      }

      await axios.post('http://localhost:3000/api/events/createEvent', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      setAppMessage('¡Evento creado exitosamente!', 'success');
      dispatch({ type: 'RESET_FORM' });
      navigate('/');
    } catch (err) {
      console.error('Error al crear evento:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = (err.response.data as any)?.message || 'Error al crear el evento.';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        setAppMessage(`Error: ${errorMessage}`, 'error');
      } else {
        dispatch({ type: 'SET_ERROR', payload: { error: 'Error de red o del servidor.' } });
        setAppMessage('Error de red o del servidor.', 'error');
      }
    }
  };

  return (
    <div className={styles.createEventContainer}>
      <div className={styles.createEventCard}>
        <h1 className={styles.createEventTitle}>Crear Nuevo Evento</h1>
        {state.error && <div className={styles.createEventError}>{state.error}</div>}

        <form onSubmit={handleSubmit} className={styles.createEventForm} encType="multipart/form-data">
          <div className={styles.formGroup}>
            <label htmlFor="eventName">Nombre del Evento</label>
            <input
              type="text"
              id="eventName"
              value={state.eventName}
              onChange={(e) => handleFieldChange('eventName', e.target.value)}
              required
              maxLength={45}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={state.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              required
              maxLength={60}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="date">Fecha</label>
              <input
                type="date"
                id="date"
                value={state.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time">Hora</label>
              <input
                type="time"
                id="time"
                value={state.time}
                onChange={(e) => handleFieldChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="idEventType">Tipo de Evento</label>
            <select
              id="idEventType"
              value={state.idEventType}
              onChange={(e) => handleFieldChange('idEventType', e.target.value)}
              required
            >
              <option value="" disabled hidden>Seleccioná un tipo</option>
              {types.map((t) => (
                <option key={t.idType} value={t.idType}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image">Foto del Evento</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.createEventBtn}>Crear Evento</button>
            <button type="button" onClick={() => navigate('/')} className={styles.cancelBtn}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
