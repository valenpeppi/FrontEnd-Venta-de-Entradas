import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from "@/services/AuthService";

export const useRegisterUser = (onRegisterSuccess?: () => void) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        dni: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
    });

    const [errors, setErrors] = useState<Partial<typeof formData>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof typeof formData, boolean>>>({});
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setFormData(prev => ({ ...prev, email: location.state.email }));
        }
    }, [location.state]);

    const validateField = (name: keyof typeof formData, value: string) => {
        let errorMsg = '';
        switch (name) {
            case 'dni':
                if (!/^\d{7,8}$/.test(value)) errorMsg = 'El DNI debe tener 7 u 8 dígitos.';
                break;
            case 'fullName':
                if (value.trim().split(' ').length < 2) errorMsg = 'Ingresa nombre y apellido.';
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Email inválido.';
                break;
            case 'password':
                if (value.length < 8) errorMsg = 'La contraseña debe tener al menos 8 caracteres.';
                else if (!/[a-z]/.test(value)) errorMsg = 'Debe incluir minúsculas.';
                else if (!/[A-Z]/.test(value)) errorMsg = 'Debe incluir mayúsculas.';
                else if (!/\d/.test(value)) errorMsg = 'Debe incluir números.';
                break;
            case 'confirmPassword':
                if (value !== formData.password) errorMsg = 'Las contraseñas no coinciden.';
                break;
            case 'birthDate':
                if (!value) errorMsg = 'La fecha es obligatoria.';
                else if (new Date(value) > new Date()) errorMsg = 'La fecha no puede ser futura.';
                break;
            default:
                break;
        }
        setErrors(prev => ({ ...prev, [name]: errorMsg || undefined }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: keyof typeof formData, value: string };
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target as { name: keyof typeof formData, value: string };
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);
        setSuccessMessage(null);

        const formKeys = Object.keys(formData) as (keyof typeof formData)[];
        formKeys.forEach(fieldName => {
            validateField(fieldName, formData[fieldName]);
        });

        const hasErrors = formKeys.some(key => {
            let errorMsg = '';
            const value = formData[key];
            switch (key) {
                case 'dni': if (!/^\d{7,8}$/.test(value)) errorMsg = 'x'; break;
                case 'fullName': if (value.trim().split(' ').length < 2) errorMsg = 'x'; break;
                case 'email': if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'x'; break;
                case 'password': if (value.length < 8) errorMsg = 'x'; break;
                case 'confirmPassword': if (value !== formData.password) errorMsg = 'x'; break;
                case 'birthDate': if (!value || new Date(value) > new Date()) errorMsg = 'x'; break;
            }
            return !!errorMsg;
        });

        if (hasErrors || Object.values(formData).some(val => val === '')) {
            setServerError('Por favor, corrige los errores antes de continuar.');
            return;
        }

        if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaValue) {
            setServerError('Por favor, verifica que no eres un robot.');
            return;
        }

        setIsLoading(true);
        const nameParts = formData.fullName.trim().split(' ');
        const name = nameParts.length > 1 ? nameParts[0] : formData.fullName;
        const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        try {
            await AuthService.registerUser({
                dni: formData.dni,
                name,
                surname,
                mail: formData.email,
                password: formData.password,
                birthDate: formData.birthDate,
                captchaToken: captchaValue,
            });

            setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
            setTimeout(() => {
                if (onRegisterSuccess) onRegisterSuccess();
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 'Error de red o del servidor.';
            setServerError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const labelMap: Record<keyof typeof formData, string> = {
        dni: 'DNI',
        fullName: 'Nombre completo',
        email: 'Email',
        birthDate: 'Fecha de nacimiento',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
    };

    const getInputType = (field: keyof typeof formData) => {
        if (field.toLowerCase().includes('password')) return 'password';
        if (field === 'email') return 'email';
        if (field === 'birthDate') return 'date';
        return 'text';
    };

    return {
        formData,
        errors,
        touched,
        serverError,
        successMessage,
        isLoading,
        handleChange,
        handleBlur,
        handleSubmit,
        setCaptchaValue,
        labelMap,
        getInputType,
        showCaptcha: !!import.meta.env.VITE_RECAPTCHA_SITE_KEY
    };
};
