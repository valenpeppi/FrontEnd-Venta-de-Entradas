import React, { useState } from 'react';
import AuthLayout from '@/shared/components/AuthLayout';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import { AuthService } from '@/services/AuthService';
import styles from '@/pages/auth/login/styles/LoginPage.module.css';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!email) return;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage({ text: 'Formato de email inválido', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            await AuthService.forgotPassword(email);
            setMessage({
                text: 'Si el correo está registrado, recibirás un enlace de recuperación.',
                type: 'success'
            });
        } catch (error) {
            setMessage({
                text: 'Ocurrió un error. Inténtalo de nuevo más tarde.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Recuperar Contraseña"
            footerText="¿Ya tienes cuenta?"
            footerLinkText="Iniciar Sesión"
            footerLinkTo="/login"
            backButton
        >
            <p className={styles.forgotPasswordText}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {message && (
                <div className={styles.loginErrorMessage} style={{
                    backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#b91c1c'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="ejemplo@correo.com"
                />

                <div style={{ marginTop: '1.5rem' }}>
                    <Button type="submit" fullWidth isLoading={loading}>
                        Enviar Enlace
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
