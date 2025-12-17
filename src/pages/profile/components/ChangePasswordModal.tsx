import React, { useState } from 'react';
import styles from './styles/ChangePasswordModal.module.css';
import globalStyles from '@/shared/styles/GlobalStyles.module.css';
import { FiX, FiLock, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { AuthService } from '@/services/AuthService';
import { useMessage } from '@/hooks/useMessage';
import PasswordStrengthBar from '@/shared/components/PasswordStrengthBar';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const { setAppMessage } = useMessage();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden');
            return;
        }

        if (newPassword === currentPassword) {
            setError('La nueva contraseña no puede ser igual a la actual');
            return;
        }

        setLoading(true);
        try {
            await AuthService.changePassword({
                currentPassword,
                newPassword
            });
            setAppMessage('Contraseña actualizada correctamente', 'success');
            onClose();

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al cambiar la contraseña';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
                    <FiX />
                </button>

                <h2 className={styles.title}>Cambiar Contraseña</h2>

                {error && (
                    <div className={styles.errorAlert}>
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FiLock className={styles.icon} /> Contraseña Actual
                        </label>
                        <input
                            type="password"
                            className={styles.input}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FiLock className={styles.icon} /> Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            className={styles.input}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <PasswordStrengthBar password={newPassword} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FiCheck className={styles.icon} /> Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`${globalStyles.glowBtn} ${styles.submitBtn}`}
                            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                        >
                            {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
