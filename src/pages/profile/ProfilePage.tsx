import { useProfile } from '@/hooks/useProfile';
import styles from '@/pages/profile/styles/ProfilePage.module.css';
import globalStyles from '@/shared/styles/GlobalStyles.module.css';
import { FiUser, FiMail, FiSave, FiEdit2 } from 'react-icons/fi';
import ConfirmationModal from '@/shared/components/ConfirmationModal';
import ChangePasswordModal from './components/ChangePasswordModal';

const ProfilePage: React.FC = () => {
    const {
        user,
        loading,
        isEditing,
        setIsEditing,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        formState: {
            name, setName,
            surname, setSurname,
            birthDate, setBirthDate,
            phone, setPhone,
            address, setAddress
        },
        handleSubmit,
        handleDeleteAccount,
        resetForm
    } = useProfile();

    if (!user) {
        return <div className={styles.container}>Cargando perfil...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {(name || user.name || '').charAt(0).toUpperCase()}
                    </div>
                    <h1>Mi Perfil</h1>
                    <span className={styles.roleBadge}>
                        {user.role === 'company' ? 'Organizador' :
                            user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Nombre / Empresa */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FiUser className={styles.icon} /> Nombre {user.role === 'company' ? 'Empresa' : ''}
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

                    {/* Campos adicionales usuario */}
                    {user.role !== 'company' && (
                        <>
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
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <FiUser className={styles.icon} /> Fecha de Nacimiento
                                </label>
                                <input
                                    type="date"
                                    className={isEditing ? styles.input : styles.inputDisabled}
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <FiUser className={styles.icon} /> DNI
                                </label>
                                <input
                                    type="text"
                                    className={styles.inputDisabled}
                                    value={user.dni || ''}
                                    disabled
                                />
                                <span className={styles.helperText}>El DNI no se puede modificar</span>
                            </div>
                        </>
                    )}

                    {user.role === 'company' && (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    className={isEditing ? styles.input : styles.inputDisabled}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    className={isEditing ? styles.input : styles.inputDisabled}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    CUIL
                                </label>
                                <input
                                    type="text"
                                    className={styles.inputDisabled}
                                    value={user.cuil || ''}
                                    disabled
                                />
                                <span className={styles.helperText}>El CUIL no se puede modificar</span>
                            </div>
                        </>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <FiMail className={styles.icon} /> Email
                        </label>
                        <input
                            type="email"
                            className={styles.inputDisabled}
                            value={user.email || user.mail || user.contactEmail || ''}
                            disabled
                        />
                        <span className={styles.helperText}>El email no se puede modificar</span>
                    </div>

                    <div className={styles.actions}>
                        {!isEditing ? (
                            <button
                                type="button"
                                className={`${globalStyles.glowBtn} ${styles.actionBtn}`}
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
                                        resetForm();
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`${globalStyles.glowBtn} ${styles.actionBtn}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : <><FiSave /> Guardar Cambios</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.securitySection}>
                        <button
                            type="button"
                            className={styles.changePasswordBtn}
                            onClick={() => setIsChangePasswordModalOpen(true)}
                        >
                            Cambiar Contraseña
                        </button>
                    </div>

                    {user.role !== 'admin' && (
                        <div className={styles.dangerZone}>
                            <button
                                type="button"
                                className={styles.deleteAccountBtn}
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                Eliminar Cuenta
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="¿Eliminar Cuenta?"
                message="Esta acción es irreversible. ¿Estás seguro de que quieres eliminar tu cuenta permanentemente?"
                onConfirm={handleDeleteAccount}
                onCancel={() => setIsDeleteModalOpen(false)}
            />

            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
            />
        </div>
    );
};

export default ProfilePage;
