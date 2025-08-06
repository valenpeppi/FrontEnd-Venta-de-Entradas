import React, { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../context/MessageContext';
import './CreateEventPage.css';

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
}

type CreateEventAction =
  | { type: 'SET_FIELD'; payload: { field: keyof Omit<CreateEventState, 'error'>; value: string } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'RESET_FORM' };

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
        error: null
      };
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
    error: null
  });
  
  const navigate = useNavigate();
  const { setAppMessage } = useMessage();

  const handleFieldChange = (field: keyof Omit<CreateEventState, 'error'>, value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    // Validaciones básicas
    if (!state.eventName || !state.description || !state.date || !state.time || !state.eventType || !state.place || !state.price) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, completa todos los campos.' } });
      return;
    }

    const eventData = {
      name: state.eventName,
      description: state.description,
      date: `${state.date}T${state.time}:00`,
      eventType: state.eventType,
      place: state.place,
      price: parseFloat(state.price),
    };

    try {
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dispatch({ type: 'SET_ERROR', payload: { error: errorData.message || 'Error al crear el evento.' } });
        setAppMessage(`Error: ${errorData.message || 'No se pudo crear el evento.'}`);
        return;
      }

      setAppMessage('¡Evento creado exitosamente!');
      navigate('/');
    } catch (err) {
      console.error('Error al crear evento:', err);
      dispatch({ type: 'SET_ERROR', payload: { error: 'Error de red o del servidor al crear el evento.' } });
      setAppMessage('Error de red o del servidor al crear el evento.');
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-card">
        <h1 className="create-event-title">Crear Nuevo Evento</h1>
        {state.error && <div className="create-event-error">{state.error}</div>}
        <form onSubmit={handleSubmit} className="create-event-form">
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
                <option value="">Selecciona un tipo</option>
                <option value="concierto">Concierto</option>
                <option value="teatro">Teatro</option>
                <option value="deportivo">Deportivo</option>
                <option value="conferencia">Conferencia</option>
                <option value="exposicion">Exposición</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="place">Lugar</label>
              <input
                type="text"
                id="place"
                value={state.place}
                onChange={(e) => handleFieldChange('place', e.target.value)}
                required
              />
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
