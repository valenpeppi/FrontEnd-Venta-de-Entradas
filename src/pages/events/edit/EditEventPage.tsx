import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMessage } from '@/shared/context/MessageContext';
import { EventService } from '@/services/EventService';
import { PlaceService } from '@/services/PlaceService';
import styles from '@/pages/events/create/styles/CreateEventPage.module.css';

import type { EventType } from '@/types/events';
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
        default:
            return state;
    }
};

const EditEventPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setAppMessage } = useMessage();

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
    });

    const [places, setPlaces] = useState<Place[]>([]);
    const [types, setTypes] = useState<EventType[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(true);

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
                setAppMessage('No se pudieron cargar los datos.', 'error');
            }
        };
        fetchInitialData();
    }, [setAppMessage]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!id) return;
            try {
                const event = await EventService.getEventById(id);

                dispatch({ type: 'SET_FIELD', payload: { field: 'eventName', value: event.eventName } });
                dispatch({ type: 'SET_FIELD', payload: { field: 'description', value: event.description } });
                dispatch({ type: 'SET_FIELD', payload: { field: 'idEventType', value: event.idEventType } });
                dispatch({ type: 'SET_FIELD', payload: { field: 'idPlace', value: event.idPlace } });

                const eventDate = new Date(event.date);
                dispatch({ type: 'SET_FIELD', payload: { field: 'date', value: eventDate.toISOString().split('T')[0] } });
                dispatch({ type: 'SET_FIELD', payload: { field: 'time', value: eventDate.toTimeString().slice(0, 5) } });

                if (event.imageUrl) {
                    setImagePreview(`${event.imageUrl}`);
                }

            } catch (e) {
                console.error("Error al cargar el evento:", e);
                setAppMessage('Error al cargar el evento.', 'error');
                navigate('/company/my-events');
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [id, setAppMessage, navigate]);

    useEffect(() => {
        const fetchSectorsAndDates = async () => {
            if (state.idPlace) {
                try {
                    const [, datesRes] = await Promise.all([
                        PlaceService.getPlaceSectors(state.idPlace),
                        PlaceService.getAvailableDates(state.idPlace)
                    ]);


                    dispatch({ type: 'SET_OCCUPIED_DATES', payload: { dates: datesRes } });




                } catch (e) {
                    console.error("Error al cargar sectores o fechas:", e);
                }
            } else {

            }
        };
        if (!loading) {
            fetchSectorsAndDates();
        }
    }, [state.idPlace, loading]);


    const handleFieldChange = (field: keyof CreateEventState, value: any) => {
        dispatch({ type: 'SET_FIELD', payload: { field, value } });
    };

    const handleImageChange = (file: File | null) => {
        dispatch({ type: 'SET_IMAGE', payload: { image: file } });
        if (imagePreview && !imagePreview.startsWith('http') && !imagePreview.startsWith('/')) {
            URL.revokeObjectURL(imagePreview);
        }
        if (file) {
            const newPreviewUrl = URL.createObjectURL(file);
            setImagePreview(newPreviewUrl);
        } else {


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

        const datetime = new Date(`${state.date}T${state.time}:00`).toISOString();

        const formData = new FormData();
        formData.append('name', state.eventName);
        formData.append('description', state.description);
        formData.append('date', datetime);
        formData.append('idEventType', String(state.idEventType));
        formData.append('idPlace', String(state.idPlace));
        if (state.image) {
            formData.append('image', state.image);
        }



        try {
            if (id) {
                await EventService.updateEvent(String(id), formData);
                setAppMessage('¡Evento actualizado exitosamente!', 'success');
                navigate('/company/my-events');
            }
        } catch (err: any) {
            console.error('Error al actualizar evento:', err);
            const errorMessage = (err?.response?.data as any)?.message || 'Error al actualizar el evento.';
            dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
            setAppMessage(`Error: ${errorMessage}`, 'error');
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className={styles.createEventContainer}>
            <div className={styles.createEventCard}>
                <h1 className={styles.createEventTitle}>Editar Evento</h1>
                {state.error && <div className={styles.createEventError}>{state.error}</div>}

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
                                    { }
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

                    { }

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
                                    <strong>Haz clic para subir</strong> o arrastra una nueva imagen
                                </span>
                            )}
                        </label>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.createEventBtn}>Guardar Cambios</button>
                        <button type="button" onClick={() => navigate('/company/my-events')} className={styles.cancelBtn}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEventPage;
