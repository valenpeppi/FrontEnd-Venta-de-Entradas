import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../../shared/context/MessageContext';
import axios from 'axios';
import './styles/CreateEventPage.css';

interface CreateEventPageProps {
  // Removed setAppMessage prop
}

interface CreateEventState {
  eventName: string;
  description: string;
  date: string;
  time: string;
  eventType: string;
  place: string;
  price: string;
  error: string | null;
  image: File | null; // Nuevo campo para la imagen
}

type CreateEventAction =
  | { type: 'SET_FIELD'; payload: { field: keyof Omit<CreateEventState, 'error' | 'image'>; value: string } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'RESET_FORM' }
  | { type: 'SET_IMAGE'; payload: { image: File | null } };

const createEventReducer = (state: CreateEventState, action: CreateEventAction): CreateEventState => {
  switch (action.type) {
    case 'SET_FIELD': {
      return { ...state, [action.payload.field]: action.payload.value };
    }
    case 'SET_ERROR': {
      return { ...state, error: action.payload.error };
    }
    case 'RESET_FORM': {
      return {
        eventName: '',
        description: '',
        date: '',
        time: '',
        eventType: '',
        place: '',
        price: '',
        error: null,
        image: null // Resetear imagen
      };
    }
    case 'SET_IMAGE': {
      return { ...state, image: action.payload.image };
    }
    default:
      return state;
  }
};

const CreateEventPage: React.FC<CreateEventPageProps> = () => {
  const [state, dispatch] = useReducer(createEventReducer, {
    eventName: '',
    description: '',
    date: '',
    time: '',
    eventType: '',
    place: '',
    price: '',
    error: null,
    image: null
  });
  
  const navigate = useNavigate();
  const { setAppMessage } = useMessage();

  const handleFieldChange = (field: keyof Omit<CreateEventState, 'error' | 'image'>, value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    dispatch({ type: 'SET_IMAGE', payload: { image: file } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    if (!state.eventName || !state.description || !state.date || !state.time || !state.eventType || !state.place || !state.price) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, completa todos los campos.' } });
      return;
    }

    const formData = new FormData();
    formData.append('name', state.eventName);
    formData.append('description', state.description);
    formData.append('date', `${state.date}T${state.time}:00`);
    formData.append('eventType', state.eventType);
    formData.append('place', state.place);
    formData.append('price', state.price);
    if (state.image) {
      formData.append('image', state.image); 
    }

    try {
      await axios.post('http://localhost:3000/api/events/createEvent', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAppMessage('¡Evento creado exitosamente!');
      navigate('/');
    } catch (err) {
      console.error('Error al crear evento:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.message || 'Error al crear el evento.';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
        setAppMessage(`Error: ${errorMessage}`);
      } else {
        dispatch({ type: 'SET_ERROR', payload: { error: 'Error de red o del servidor al crear el evento.' } });
        setAppMessage('Error de red o del servidor al crear el evento.');
      }
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-card">
        <h1 className="create-event-title">Crear Nuevo Evento</h1>
        {state.error && <div className="create-event-error">{state.error}</div>}
        <form onSubmit={handleSubmit} className="create-event-form" encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="eventName">Nombre del Evento</label>
            <input
              type="text"
              id="eventName"
              value={state.eventName}
              onChange={(e) => handleFieldChange('eventName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={state.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Fecha</label>
              <input
                type="date"
                id="date"
                value={state.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventType">Tipo de Evento</label>
              <select
                id="eventType"
                value={state.eventType}
                onChange={(e) => handleFieldChange('eventType', e.target.value)}
                required
              >
                <option value="" disabled hidden>Selecciona un tipo de evento</option>
                <option value="concierto">Concierto</option>
                <option value="teatro">Stand up</option>
                <option value="deportivo">Jornada de lectura</option>
                <option value="conferencia">Fiesta</option>
                <option value="exposicion">Evento deportivo</option>
                <option value="arte">Arte</option>
              </select>
            </div>
            </div>

            <div className="form-group">
              <div>
              <label htmlFor="place">Lugar</label>
              <select
                id="place"
                value={state.place}
                onChange={(e) => handleFieldChange('place', e.target.value)}
                required
              >
                <option value="" disabled hidden>Selecciona un lugar</option>
                <option value="concierto">Anfiteatro</option>
                <option value="teatro">Estadio Gigante de Arroyito</option>
                <option value="deportivo">Bioceres</option>
                <option value="conferencia"> El Ateneo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Precio (ARS)</label>
            <input
              type="number"
              id="price"
              value={state.price}
              onChange={(e) => handleFieldChange('price', e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Foto del Evento</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="create-event-btn">
              Crear Evento
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cancel-btn"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
