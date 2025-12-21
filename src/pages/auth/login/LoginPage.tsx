import React from 'react';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useLogin } from '@/hooks/useLogin';
import MessageDisplay from '@/shared/MessageDisplay';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import AuthLayout from '@/shared/components/AuthLayout';
import styles from '@/pages/auth/login/styles/LoginPage.module.css';
import type { LoginProps } from '@/types/auth';


const CustomGoogleLoginButton = ({ onSuccess, onError }: { onSuccess: (response: any) => void, onError: () => void }) => {
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => onSuccess({ credential: codeResponse.access_token }),
        onError: onError,
        flow: 'implicit'
    });

    return (
        <button type="button" onClick={() => login()} className={styles.googleButton}>
            <img src="/src/assets/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
            Continuar con Google
        </button>
    );
};

const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const {
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
    } = useLogin(onLoginSuccess);

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
                    <Button type="submit" fullWidth isLoading={loading}>
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
                            onError={handleGoogleError}
                        />
                    </GoogleOAuthProvider>
                </div>
            </form>
        </AuthLayout>
    );
};

export default LoginPage;