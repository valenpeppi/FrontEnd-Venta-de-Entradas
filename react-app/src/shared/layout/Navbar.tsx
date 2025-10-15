import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles/Navbar.module.css';
import logoTicket from '../../assets/ticket.png';
import cartIcon from '../../assets/cart.png';
import { useCart } from '../../shared/context/CartContext';
import { useAuth } from '../../shared/context/AuthContext';
import GradientText from './GradientText';
import { FiSearch } from 'react-icons/fi';


const Navbar: React.FC = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const { cartCount, clearCart } = useCart();
  const { isLoggedIn, user, logout } = useAuth();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.length > 0) {
      try {
        const res = await fetch(`http://localhost:3000/api/events/search?query=${encodeURIComponent(term)}`);
        const json = await res.json();
        if (json.ok) {
          setSearchResults(json.data.slice(0, 5));
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error al buscar eventos:', err);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  const handleSearchItemClick = (term: string) => {
    navigate(`/searchedEvents?query=${encodeURIComponent(term)}`);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      navigate(`/searchedEvents?query=${encodeURIComponent(searchTerm.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();

    clearCart(); //  limpia el estado del contexto inmediatamente

    // 3) limpiar claves relacionadas en localStorage (por si quedaron)
    localStorage.removeItem('ticket-cart');
    localStorage.removeItem('ticketGroups');
    localStorage.removeItem('dniClient');
    localStorage.removeItem('saleConfirmed');

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
          <GradientText>TicketApp</GradientText>
        </Link>

        {!isAdmin && (
          <div className={styles.navbarSearch}>
            <input
              type="text"
              placeholder="Buscar eventos..."
              className={styles.navbarSearchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchTerm.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
            />
            <FiSearch className={styles.searchIcon} />
            {showDropdown && (
              <div className={styles.searchDropdownContainer}>
                <ul className={styles.searchDropdownList}>
                  {searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <li
                        key={result.idEvent ?? result.id}
                        className={styles.searchDropdownItem}
                        onMouseDown={() => handleSearchItemClick(result.name)}
                      >
                        {result.name}
                        {result.agotado && (
                          <span className={styles.agotadoBadge}> (Agotado)</span>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className={`${styles.searchDropdownItem} ${styles.noResults}`}>
                      No hay resultados
                    </li>
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
