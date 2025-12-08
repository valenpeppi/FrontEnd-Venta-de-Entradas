import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../../services/AuthService';
import { useMessage } from '../../../shared/context/MessageContext';
import MessageDisplay from '../../../shared/MessageDisplay';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import AuthLayout from '../../../shared/components/AuthLayout';
import styles from './styles/LoginPage.module.css';

interface LoginPageProps {
    onLoginSuccess: (userHelper: any, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
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
                // Navigation is usually handled by parent or verify here if specific
                if (response.user.role === 'admin' || response.user.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (response.user.role === 'company' || response.user.role === 'COMPANY') {
                    navigate('/company/dashboard');
                } else {
                    navigate('/');
                }
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

    return (
        <AuthLayout
            title="Iniciar Sesión"
            footerText="¿No tienes una cuenta?"
            footerLinkText="Regístrate aquí"
            footerLinkTo="/register"
            backButton
        >
            {messages.map((m) => (
                <MessageDisplay key={m.id} message={m.text} type={m.type} />
            ))}
            {serverError && <div className={styles.loginErrorMessage}>{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                    required
                    autoFocus
                />

                <Input
                    id="password"
                    name="password"
                    type="password"
                    label="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password}
                    touched={touched.password}
                    required
                />

                <Link to="/forgot-password" className={styles.loginForgotPasswordLink}>
                    ¿Olvidaste tu contraseña?
                </Link>

                <div style={{ marginTop: '1.5rem' }}>
                    <Button
                        type="submit"
                        fullWidth
                        isLoading={loading}
                    >
                        Iniciar Sesión
                    </Button>
                </div>

                <div className={styles.loginRegisterLink}>
                    ¿Sos organizador?{" "}
                    <Link to="/registercompany" className={styles.loginLink}>
                        Creá tu cuenta
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
