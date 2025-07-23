import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateEventPage.css'; // Importa el CSS para este componente

interface CreateEventPageProps {
  setAppMessage: (message: string | null) => void;
}

const CreateEventPage: React.FC<CreateEventPageProps> = ({ setAppMessage }) => {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [eventType, setEventType] = useState('');
  const [place, setPlace] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!eventName || !description || !date || !time || !eventType || !place || !price) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const eventData = {
      name: eventName,
      description,
      date: `${date}T${time}:00`, // Combina fecha y hora para el formato datetime
      eventType,
      place,
      price: parseFloat(price),
      // Aquí podrías añadir un campo para el organizador si lo tienes en el backend
      // dniOrganiser: 'DNI_DEL_USUARIO_LOGUEADO',
    };

    try {
      // Reemplaza esta URL con tu endpoint de backend para crear eventos
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Si necesitas autenticación (token JWT), añádelo aquí:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear el evento.');
        setAppMessage(`Error: ${errorData.message || 'No se pudo crear el evento.'}`);
        return;
      }

      setAppMessage('¡Evento creado exitosamente!');
      navigate('/'); // Redirigir a la página principal o a una página de confirmación
    } catch (err) {
      console.error('Error al crear evento:', err);
      setError('Error de red o del servidor al crear el evento.');
      setAppMessage('Error de red o del servidor al crear el evento.');
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-card">
        <h1 className="create-event-title">Crear Nuevo Evento</h1>
        {error && <div className="create-event-error">{error}</div>}
        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="eventName">Nombre del Evento</label>
            <input
              type="text"
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time">Hora</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="eventType">Tipo de Evento</label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="Concierto">Concierto</option>
              <option value="Stand Up">Stand Up</option>
              <option value="Jornada de Lectura">Jornada de Lectura</option>
              <option value="Fiesta">Fiesta</option>
              <option value="Evento Deportivo">Evento Deportivo</option>
              <option value="Arte">Arte</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="place">Lugar</label>
            <select
              id="place"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
            >
              <option value="">Selecciona un lugar</option>
              <option value="Anfiteatro">Anfiteatro</option>
              <option value="Estadio Gigante de Arroyito">Estadio Gigante de Arroyito</option>
              <option value="Bioceres Arena">Bioceres Arena</option>
              <option value="El Ateneo">El Ateneo</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Precio</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              required
            />
          </div>

          <button type="submit" className="submit-btn">Crear Evento</button>
        </form>
        <button onClick={() => navigate(-1)} className="back-button">Volver</button>
      </div>
    </div>
  );
};

export default CreateEventPage;
