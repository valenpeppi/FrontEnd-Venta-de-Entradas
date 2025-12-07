import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { AuthService } from '../../services/AuthService';
import { useMessage } from '../../shared/context/MessageContext';
import styles from './styles/ProfilePage.module.css';
import globalStyles from '../../shared/styles/GlobalStyles.module.css';
import { FiUser, FiMail, FiSave, FiEdit2 } from 'react-icons/fi';
import ConfirmationModal from '../../shared/components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { user, updateUser, logout } = useAuth();
    const { setAppMessage } = useMessage();
    const navigate = useNavigate();

    // Local state for form
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setSurname(user.surname || '');
        }
    }, [user]);

    if (!user) {
        return <div className={styles.container}>Cargando perfil...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await AuthService.updateUser({ name, surname });
            updateUser(name); // Update local context
            setAppMessage('Perfil actualizado correctamente', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setAppMessage('Error al actualizar el perfil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await AuthService.deleteAccount();
            logout();
            setAppMessage('Tu cuenta ha sido eliminada.', 'success');
            navigate('/');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al eliminar la cuenta.';
            setAppMessage(msg, 'error');
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <h1>Mi Perfil</h1>
                    <span className={styles.roleBadge}>
                        {user.role === 'company' ? 'Organizador' :
                            user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FiUser className={styles.icon} /> Nombre
                        </label>
                        <input
                            type="text"
                            className={isEditing ? styles.input : styles.inputDisabled}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    {user.role !== 'company' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <FiUser className={styles.icon} /> Apellido
                            </label>
                            <input
                                type="text"
                                className={isEditing ? styles.input : styles.inputDisabled}
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FiMail className={styles.icon} /> Email
                        </label>
                        <input
                            type="email"
                            className={styles.inputDisabled}
                            value={user.mail || ''} // Handle both potential properties
                            disabled
                        />
                        <span className={styles.helperText}>El email no se puede modificar</span>
                    </div>

                    <div className={styles.actions}>
                        {!isEditing ? (
                            <button
                                type="button"
                                className={`${globalStyles.glowBtn} ${styles.editBtn}`}
                                onClick={() => setIsEditing(true)}
                            >
                                <FiEdit2 /> Editar Información
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => {
                                        setIsEditing(false);
                                        setName(user.name || '');
                                        setSurname(user.surname || '');
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={globalStyles.glowBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : <><FiSave /> Guardar Cambios</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.dangerZone}>
                        <button
                            type="button"
                            className={styles.deleteAccountBtn}
                            onClick={() => setIsDeleteModalOpen(true)}
                        >
                            Eliminar Cuenta
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="¿Eliminar Cuenta?"
                message="Esta acción es irreversible. ¿Estás seguro de que quieres eliminar tu cuenta permanentemente?"
                onConfirm={handleDeleteAccount}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};

export default ProfilePage;
