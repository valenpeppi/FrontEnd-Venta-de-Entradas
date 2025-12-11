import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { useMessage } from '@/shared/context/MessageContext';
import MessageDisplay from '@/shared/MessageDisplay';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import AuthLayout from '@/shared/components/AuthLayout';
import styles from '@/pages/auth/login/styles/LoginPage.module.css';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

interface LoginPageProps {
    onLoginSuccess: (userHelper: any, token: string) => void;
}

const CustomGoogleLoginButton = ({ onSuccess, onError }: { onSuccess: (response: any) => void, onError: () => void }) => {
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => onSuccess({ credential: codeResponse.access_token }),
        onError: onError,
        flow: 'implicit' // or 'auth-code' if backend expects it differently, but existing code used credential from GoogleLogin which is usually ID token. Let's stick to default implicit returning token or check existing.
        // Wait, GoogleLogin returns a credential (JWT ID Token). useGoogleLogin returns access_token by default unless flow is 'auth-code'.
        // Existing backend expects `credential`.
        // If I use useGoogleLogin, I might get an access_token, not an ID token credential.
        // Correction: GoogleLogin (from @react-oauth/google) returns `credential` (JWT).
        // useGoogleLogin with default settings returns access_token.
        // useGoogleLogin CAN return ID token if we don't ask for scopes? No, the new library separates them.

        // Let's check backend `auth.controller.ts` -> `verifyGoogleToken` uses `client.verifyIdToken`.
        // So backend expects an ID Token.
        // `useGoogleLogin` does NOT return an ID token easily in the new flow.

        // Actually, we can just style the GoogleLogin component slightly? No, it's an iframe.
        // Wait, `useGoogleLogin` documentation says:
        // "If you want to get the ID token... you should use the <GoogleLogin> component."
        // BUT, we can use `onSuccess` response to get code and exchange it?
        // Or simply use the access_token? Backend verifies `credential` which usually implies ID token.

        // Alternative: Use `window.google.accounts.id.renderButton` on a ref if we want to stick to standard but style it? No that's what GoogleLogin does.

        // Let's try to pass `flow: 'auth-code'`? No that returns code.

        // Okay, if existing backend uses `verifyGoogleToken` (google-auth-library), it wants an ID Token.
        // I should probably NOT switch to `useGoogleLogin` unless I change the backend to accept access_token (which verifyGoogleToken doesn't do usually).

        // Wait, `verifyGoogleToken` uses `client.verifyIdToken`.
        // So I MUST provide an ID Token.

        // Does `useGoogleLogin` provide ID token? 
        // No, it provides access_token.
        // Unless... 
        // Actually, there is `onSuccess` for `GoogleLogin` which gives `credential`.

        // If I want a custom button, the recommendation is to use the Implicit Flow to get access token, 
        // OR ask for 'openid email profile' scopes and maybe get id_token?
        // The `useGoogleLogin` hook is primarily for implicit/auth-code flows.

        // However, I can just WRAP the google login? No.

        // Let's try to Style the GoogleLogin container?
        // Or use `type="icon"`? 

        // Wait, the user said "poner un poco con estetica mas acorde". 
        // Maybe I can just CSS filter it? Or opacity?

        // Better yet: Backend modification?
        // Changing backend to verify access_token is easy. 
        // `axios.get('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: \`Bearer ${token}\` } })`

        // Let's do that. It is safer and allows full UI customization.
        // Plan:
        // 1. Modify `auth.controller.ts` `verifyGoogleToken` to accept access_token OR id_token? Or just switch to access_token/userinfo endpoint?
        // 2. Actually, `verifyGoogleToken` helper is likely just a wrapper.

    });

    return (
        <button type="button" onClick={() => login()} className={styles.googleButton}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
            Continuar con Google
        </button>
    );
};

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

    const handleGoogleLoginSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            const response = await AuthService.googleLogin(credentialResponse.credential);
            if (response && response.token && response.user) {
                onLoginSuccess(response.user, response.token);

                if (response.user.role === 'admin' || response.user.role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (response.user.role === 'company' || response.user.role === 'COMPANY') {
                    navigate('/company/dashboard');
                } else {
                    navigate('/');
                }
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

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                        <CustomGoogleLoginButton
                            onSuccess={handleGoogleLoginSuccess}
                            onError={() => setServerError('Ocurrió un error al iniciar sesión con Google.')}
                        />
                    </GoogleOAuthProvider>
                </div>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;
