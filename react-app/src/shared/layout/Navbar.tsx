import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles/Navbar.module.css';
import logoTicket from '../../assets/ticket.png';
import cartIcon from '../../assets/cart.png';
import { useCart } from '../../shared/context/CartContext';
import { useAuth } from '../../shared/context/AuthContext';

const Navbar: React.FC = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      setSearchResults([
        { id: '1', name: 'Concierto de Verano' },
        { id: '2', name: 'Festival de Jazz' },
      ]);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchItemClick = (id: string) => {
    navigate(`/event/${id}`);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <Link to="/" className={styles.navbarBrand}>
          <img src={logoTicket} alt="TicketApp Logo" className={styles.image1} />
          TicketApp
        </Link>

        {!isAdmin && (
          <div className={styles.navbarSearch}>
            <input
              type="text"
              placeholder="Buscar eventos..."
              className={styles.navbarSearchInput}
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
            />
            <i className={`fas fa-search ${styles.searchIcon}`}></i>
            {showDropdown && (
              <div className={styles.searchDropdownContainer}>
                <ul className={styles.searchDropdownList}>
                  {searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <li
                        key={result.id}
                        className={styles.searchDropdownItem}
                        onMouseDown={() => handleSearchItemClick(result.id)}
                      >
                        {result.name}
                      </li>
                    ))
                  ) : (
                    <li className={`${styles.searchDropdownItem} ${styles.noResults}`}>No hay resultados</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <ul className={styles.navbarMenu}>
          {!isAdmin && <li><Link to="/help" className={styles.navbarMenuItem}>Ayuda</Link></li>}
          {isLoggedIn && user?.role === 'user' && <li><Link to="/myTickets" className={styles.navbarMenuItem}>Mis Entradas</Link></li>}
          {isLoggedIn && user?.role === 'company' && (
            <li><Link to="/create-event" className={styles.navbarMenuItem}>Crear Evento</Link></li>
          )}
          {isAdmin && (
            <>
              <li><Link to="/admin" className={styles.navbarMenuItem}>Aprobar Eventos</Link></li>
              <li><Link to="/feature-events" className={styles.navbarMenuItem}>Destacar Eventos</Link></li>
            </>
          )}
        </ul>

        {isLoggedIn && user?.role === 'user' && (
          <div className={styles.navbarCartContainer}>
            <Link to="/cart" className={styles.navbarMenuItem}>
              <img src={cartIcon} alt="Carrito de compras" className={styles.navbarCart} />
              {cartCount > 0 && (
                <span className={styles.cartCount}>{cartCount}</span>
              )}
            </Link>
          </div>
        )}

        <div className={styles.navbarAuthSection}>
          {isLoggedIn ? (
            <div className={styles.navbarUserSection}>
              <span className={styles.navbarUsername}>Hola, {user?.name}</span>
              <button onClick={handleLogoutClick} className={styles.navbarLogoutBtn}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className={styles.navbarAuthButtons}>
              <Link to="/login" className={styles.navbarLoginBtn}>Iniciar Sesión</Link>
              <Link to="/register" className={styles.navbarRegisterBtn}>Registrarse</Link>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className={styles.logoutModalOverlay} onClick={cancelLogout}>
          <div className={styles.logoutModal} onClick={e => e.stopPropagation()}>
            <h3>¿Estás seguro de que quieres cerrar sesión?</h3>
            <div className={styles.logoutModalButtons}>
              <button onClick={confirmLogout} className={styles.logoutConfirmBtn}>
                Sí, cerrar sesión
              </button>
              <button onClick={cancelLogout} className={styles.logoutCancelBtn}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

