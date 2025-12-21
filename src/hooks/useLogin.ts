import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { useMessage } from '@/hooks/useMessage';
import type { User } from '@/types/auth';


export const useLogin = (onLoginSuccess: (user: User, token: string) => void) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { messages, clearMessages } = useMessage();


    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(() => {
                clearMessages();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [messages, clearMessages]);

    const validate = (name: string, value: string) => {
        let error = "";
        if (name === "email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                error = "Formato de email inválido";
            }
        } else if (name === "password") {
            if (value.length < 4) {
                error = "La contraseña debe tener al menos 4 caracteres";
            }
        }
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (touched[name]) {
            validate(name, value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        validate(name, value);
    };

    const handleNavigation = (user: User) => {
        if (user.role === 'admin' || user.role === 'ADMIN') {
            navigate('/admin/dashboard');
        } else if (user.role === 'company' || user.role === 'COMPANY') {
            navigate('/company/dashboard');
        } else {
            navigate('/');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        const passwordError = formData.password.length < 4;

        if (emailError || passwordError) {
            setTouched({ email: true, password: true });
            validate("email", formData.email);
            validate("password", formData.password);
            return;
        }

        setLoading(true);
        try {
            const response = await AuthService.login({
                email: formData.email,
                password: formData.password,
            });

            if (response && response.token && response.user) {
                onLoginSuccess(response.user, response.token);
                handleNavigation(response.user);
            } else {
                setServerError('Respuesta inválida del servidor.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response && error.response.status === 401) {
                setServerError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else {
                setServerError('Ocurrió un error al iniciar sesión. Inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            const response = await AuthService.googleLogin(credentialResponse.credential);
            if (response && response.token && response.user) {
                onLoginSuccess(response.user, response.token);
                handleNavigation(response.user);
            }
        } catch (error: any) {
            console.error('Google Login Error:', error);
            if (error.response?.status === 404 && error.response?.data?.code === 'USER_NOT_FOUND') {
                const email = error.response.data.email;
                setServerError('Usuario no registrado. Redirigiendo al registro...');
                setTimeout(() => {
                    navigate('/register', { state: { email } });
                }, 2000);
            } else {
                setServerError('Error al iniciar sesión con Google.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setServerError('Ocurrió un error al iniciar sesión con Google.');
    };

    return {
        formData,
        errors,
        touched,
        serverError,
        loading,
        messages,
        handleChange,
        handleBlur,
        handleSubmit,
        handleGoogleLoginSuccess,
        handleGoogleError
    };
};