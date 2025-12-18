import React from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiUser, FiSettings, FiPieChart, FiList, FiPlusCircle, FiLogOut } from 'react-icons/fi';
import styles from '@/shared/layout/styles/Navbar.module.css';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    isAdmin: boolean;
    isLoggedIn: boolean;
    handleLogout: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    user,
    isAdmin,
    isLoggedIn,
    handleLogout
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.mobileMenuOverlay} onClick={onClose}>
            <div className={styles.mobileMenuContent} onClick={e => e.stopPropagation()}>
                <div className={styles.mobileMenuHeader}>
                    <h2>Menú</h2>
                    <button className={styles.mobileCloseBtn} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                {isLoggedIn && user ? (
                    <div className={styles.mobileUserCard}>
                        <div className={styles.mobileUserInfo}>
                            <div className={styles.mobileUserAvatar}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className={styles.mobileUserName}>{user.name}</h3>
                                <span className={styles.mobileUserRole}>
                                    {user.role === 'company' ? 'ORGANIZADOR' : user.role === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.mobileUserActions}>
                            <Link to="/profile" className={styles.mobileUserActionBtn} onClick={onClose}>
                                <FiUser /> Mi Perfil
                            </Link>
                            {isAdmin && (
                                <Link to="/admin/dashboard" className={`${styles.mobileUserActionBtn} ${styles.primaryAction}`} onClick={onClose}>
                                    <FiSettings /> Panel Admin
                                </Link>
                            )}
                            {user.role === 'company' && (
                                <Link to="/company/dashboard" className={`${styles.mobileUserActionBtn} ${styles.primaryAction}`} onClick={onClose}>
                                    <FiPieChart /> Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.mobileAuthButtons}>
                        <Link to="/login" className={styles.mobileLoginBtn} onClick={onClose}>Iniciar Sesión</Link>
                        <Link to="/register" className={styles.mobileRegisterBtn} onClick={onClose}>Registrarse</Link>
                    </div>
                )}

                <ul className={styles.mobileNavList}>
                    {!isAdmin && user?.role !== 'company' && (
                        <li>
                            <Link to="/help" className={styles.mobileNavItem} onClick={onClose}>
                                <FiList /> Ayuda
                            </Link>
                        </li>
                    )}

                    {isLoggedIn && user?.role === 'user' && (
                        <li>
                            <Link to="/myTickets" className={styles.mobileNavItem} onClick={onClose}>
                                <FiList /> Mis Entradas
                            </Link>
                        </li>
                    )}

                    {isAdmin && (
                        <>
                            <li>
                                <Link to="/admin/dashboard" className={styles.mobileNavItem} onClick={onClose}>
                                    <FiSettings /> Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/messages" className={styles.mobileNavItem} onClick={onClose}>
                                    <FiList /> Mensajes
                                </Link>
                            </li>
                        </>
                    )}

                    {user?.role === 'company' && (
                        <>
                            <li>
                                <Link to="/company/my-events" className={styles.mobileNavItem} onClick={onClose}>
                                    <FiList /> Mis Eventos
                                </Link>
                            </li>
                            <li>
                                <Link to="/create-event" className={styles.mobileNavItem} onClick={onClose}>
                                    <FiPlusCircle /> Crear Evento
                                </Link>
                            </li>
                        </>
                    )}

                    {isLoggedIn && (
                        <li className={styles.mobileLogoutContainer}>
                            <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                                <FiLogOut /> Cerrar Sesión
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MobileMenu;
