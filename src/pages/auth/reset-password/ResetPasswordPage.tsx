import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/shared/components/AuthLayout';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import { AuthService } from '@/services/AuthService';
import PasswordStrengthBar from '@/shared/components/PasswordStrengthBar';
import styles from '@/pages/auth/login/styles/LoginPage.module.css';

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!token) {
            setMessage({ text: 'Token inválido o faltante.', type: 'error' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ text: 'Las contraseñas no coinciden.', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            await AuthService.resetPassword(token, password);
            setMessage({ text: 'Contraseña restablecida exitosamente.', type: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error: any) {
            console.error('Error resetting password:', error);
            setMessage({
                text: error.response?.data?.message || 'Error al restablecer contraseña.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout title="Restablecer Contraseña" backButton>
                <div className={styles.loginErrorMessage}>
                    Enlace inválido o expirado.
                </div>
                <Button onClick={() => navigate('/login')} fullWidth>Ir al Login</Button>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Restablecer Contraseña"
            footerText="¿Recuerdas tu contraseña?"
            footerLinkText="Iniciar Sesión"
            footerLinkTo="/login"
            backButton
        >
            <p style={{ color: '#6b7280', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
                Ingresa tu nueva contraseña.
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
                    id="password"
                    name="password"
                    type="password"
                    label="Nueva Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                />
                <PasswordStrengthBar password={password} />

                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirmar Contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ marginTop: '1rem' }}
                />

                <div style={{ marginTop: '1.5rem' }}>
                    <Button type="submit" fullWidth isLoading={loading}>
                        Cambiar Contraseña
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPasswordPage;
