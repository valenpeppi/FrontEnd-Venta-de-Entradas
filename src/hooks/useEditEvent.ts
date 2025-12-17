import { useReducer, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMessage } from '@/hooks/useMessage';
import { useImageUpload } from '@/hooks/useImageUpload';
import { EventService } from '@/services/EventService';
import { PlaceService } from '@/services/PlaceService';
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

export const useEditEvent = () => {
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
    const [loading, setLoading] = useState(true);

    const {
        image,
        setImage,
        preview: imagePreview,
        setPreview: setImagePreview,
        isDragging,
        handleImageChange: originalHandleImageChange,
        handleDragEvents,
        handleDrop
    } = useImageUpload();

    useEffect(() => {
        dispatch({ type: 'SET_IMAGE', payload: { image } });
    }, [image]);

    const handleImageChange = (file: File | null) => {
        originalHandleImageChange(file);
    };

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
    }, [id, setAppMessage, navigate, setImagePreview]);

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
            }
        };
        if (!loading) {
            fetchSectorsAndDates();
        }
    }, [state.idPlace, loading]);

    const handleFieldChange = (field: keyof CreateEventState, value: any) => {
        dispatch({ type: 'SET_FIELD', payload: { field, value } });
    };

    const handleDateChange = (value: string) => {
        if (state.occupiedDates.includes(value)) {
            handleFieldChange('date', '');
            setAppMessage('Esa fecha no está disponible', 'error');
        } else {
            handleFieldChange('date', value);
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
        if (image) {
            formData.append('image', image);
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

    return {
        state,
        places,
        types,
        imagePreview,
        isDragging,
        loading,
        navigate,
        handleFieldChange,
        handleImageChange,
        handleDateChange,
        handleDragEvents,
        handleDrop,
        handleSubmit
    };
};
