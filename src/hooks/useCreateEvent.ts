import { useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '@/hooks/useMessage';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/useImageUpload';
import { EventService } from '@/services/EventService';
import { PlaceService } from '@/services/PlaceService';
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

export const useCreateEvent = () => {
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

    const navigate = useNavigate();
    const { setAppMessage } = useMessage();
    const { user } = useAuth();

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

        if (!image) {
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
        formData.append('image', image);

        try {
            dispatch({ type: 'SET_LOADING', payload: { loading: true } });
            await EventService.createEvent(formData);

            setAppMessage('¡Evento creado exitosamente!', 'success');
            dispatch({ type: 'RESET_FORM' });
            setImage(null);
            setImagePreview(null);

            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }

        } catch (err: any) {
            console.error('Error al crear evento:', err);
            const errorMessage = (err?.response?.data as any)?.message || 'Error al crear el evento.';
            dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
            setAppMessage(`Error: ${errorMessage}`, 'error');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: { loading: false } });
        }
    };

    return {
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
    };
};
