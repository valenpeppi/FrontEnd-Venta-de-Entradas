import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '@/shared/layout/styles/Navbar.module.css';
import logoTicket from '@/assets/ticket.png';
import cartIcon from '@/assets/cart.png';
import { useCart } from '@/hooks/useCart';
import { EventService } from '@/services/EventService';
import { useAuth } from '@/hooks/useAuth';
import GradientText from '@/shared/layout/GradientText';
import { FiSearch, FiUser, FiLogOut, FiChevronDown, FiSettings, FiList, FiPlusCircle, FiMenu, FiX, FiPieChart } from 'react-icons/fi';


const Navbar: React.FC = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { cartCount, clearCart } = useCart();
  const { isLoggedIn, user, logout } = useAuth();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.length > 0) {
      try {
        const results = await EventService.searchEvents(term);

        if (Array.isArray(results)) {
          setSearchResults(results.slice(0, 5));
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
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();

    clearCart();

    localStorage.removeItem('ticket-cart');
    localStorage.removeItem('ticketGroups');
    localStorage.removeItem('dniClient');
    localStorage.removeItem('saleConfirmed');

    setShowLogoutConfirm(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const closeUserMenu = () => {

    setTimeout(() => setShowUserMenu(false), 200);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.brandWrapper}>
          <Link to={user?.role === 'company' ? "/company/dashboard" : user?.role === 'admin' ? "/admin/dashboard" : "/"} className={styles.navbarBrand} onClick={closeMobileMenu}>
            <img src={logoTicket} alt="TicketApp Logo" className={styles.image1} />
            <GradientText>TicketApp</GradientText>
          </Link>
          <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {!isAdmin && user?.role !== 'company' && (
          <div className={`${styles.navbarSearch} ${isMobileMenuOpen ? styles.hiddenMobile : ''}`}>
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

        <div className={styles.navLinksContainer}>
          <ul className={styles.navbarMenu}>
            {!isAdmin && user?.role !== 'company' && <li><Link to="/help" className={styles.navbarMenuItem}>Ayuda</Link></li>}
            {isLoggedIn && user?.role === 'user' && <li><Link to="/myTickets" className={styles.navbarMenuItem}>Mis Entradas</Link></li>}
            {isAdmin && (
              <>
                <li><Link to="/admin/dashboard" className={styles.navbarMenuItem}>Dashboard</Link></li>
                <li><Link to="/admin/messages" className={styles.navbarMenuItem}>Mensajes</Link></li>
              </>
            )}
            {(isLoggedIn && user?.role === 'company') || (isLoggedIn && user?.role === 'admin') ? (
              <>
                {user?.role === 'company' && <li><Link to="/company/dashboard" className={styles.navbarMenuItem}>Dashboard</Link></li>}
                <li><Link to="/company/my-events" className={styles.navbarMenuItem}>Mis Eventos</Link></li>
                <li><Link to="/create-event" className={styles.navbarMenuItem}>Crear Evento</Link></li>
              </>
            ) : null}
          </ul>

          <div className={styles.navbarAuthSection}>
            {isLoggedIn ? (
              <div className={styles.userMenuContainer} onBlur={closeUserMenu}>
                <button
                  className={styles.userMenuTrigger}
                  onClick={toggleUserMenu}
                  aria-expanded={showUserMenu}
                >
                  <div className={styles.userAvatar}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>Hola, {user?.name}</span>
                  <FiChevronDown className={`${styles.chevron} ${showUserMenu ? styles.rotate : ''}`} />
                </button>

                {showUserMenu && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownRole}>{user?.role === 'company' ? 'Organizador' : user?.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                      <p className={styles.dropdownEmail}>{user?.mail || 'usuario@email.com'}</p>
                    </div>

                    <ul className={styles.dropdownList}>
                      <li>
                        <Link to="/profile" className={styles.dropdownItem}>
                          <FiUser /> Editar mi perfil
                        </Link>
                      </li>

                      {user?.role === 'user' && (
                        <li>
                          <Link to="/myTickets" className={styles.dropdownItem}>
                            <FiList /> Mis Entradas
                          </Link>
                        </li>
                      )}

                      {user?.role === 'company' && (
                        <>
                          <li>
                            <Link to="/company/dashboard" className={styles.dropdownItem}>
                              <FiPieChart /> Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link to="/company/my-events" className={styles.dropdownItem}>
                              <FiList /> Mis Eventos
                            </Link>
                          </li>
                          <li>
                            <Link to="/create-event" className={styles.dropdownItem}>
                              <FiPlusCircle /> Crear Evento
                            </Link>
                          </li>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <li>
                          <Link to="/admin/dashboard" className={styles.dropdownItem}>
                            <FiSettings /> Panel Admin
                          </Link>
                        </li>
                      )}

                      <li className={styles.dropdownDivider}></li>

                      <li>
                        <button onClick={handleLogoutClick} className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                          <FiLogOut /> Cerrar Sesión
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.navbarAuthButtons}>
                <Link to="/login" state={{ from: location }} className={styles.navbarLoginBtn}>Iniciar Sesión</Link>
                <Link to="/register" className={styles.navbarRegisterBtn}>Registrarse</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu}>
            <div className={styles.mobileMenuContent} onClick={e => e.stopPropagation()}>
              <div className={styles.mobileMenuHeader}>
                <h2>Menú</h2>
                <button className={styles.mobileCloseBtn} onClick={closeMobileMenu}>
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
                    <Link to="/profile" className={styles.mobileUserActionBtn} onClick={closeMobileMenu}>
                      <FiUser /> Mi Perfil
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/dashboard" className={`${styles.mobileUserActionBtn} ${styles.primaryAction}`} onClick={closeMobileMenu}>
                        <FiSettings /> Panel Admin
                      </Link>
                    )}
                    {user.role === 'company' && (
                      <Link to="/company/dashboard" className={`${styles.mobileUserActionBtn} ${styles.primaryAction}`} onClick={closeMobileMenu}>
                        <FiPieChart /> Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.mobileAuthButtons}>
                  <Link to="/login" className={styles.mobileLoginBtn} onClick={closeMobileMenu}>Iniciar Sesión</Link>
                  <Link to="/register" className={styles.mobileRegisterBtn} onClick={closeMobileMenu}>Registrarse</Link>
                </div>
              )}

              <ul className={styles.mobileNavList}>
                {!isAdmin && user?.role !== 'company' && (
                  <li>
                    <Link to="/help" className={styles.mobileNavItem} onClick={closeMobileMenu}>
                      <FiList /> Ayuda
                    </Link>
                  </li>
                )}

                {isLoggedIn && user?.role === 'user' && (
                  <li>
                    <Link to="/myTickets" className={styles.mobileNavItem} onClick={closeMobileMenu}>
                      <FiList /> Mis Entradas
                    </Link>
                  </li>
                )}

                {isAdmin && (
                  <>
                    <li>
                      <Link to="/admin/dashboard" className={styles.mobileNavItem} onClick={closeMobileMenu}>
                        <FiSettings /> Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/messages" className={styles.mobileNavItem} onClick={closeMobileMenu}>
                        <FiList /> Mensajes
                      </Link>
                    </li>
                  </>
                )}

                {user?.role === 'company' && (
                  <>
                    <li>
                      <Link to="/company/my-events" className={styles.mobileNavItem} onClick={closeMobileMenu}>
                        <FiList /> Mis Eventos
                      </Link>
                    </li>
                    <li>
                      <Link to="/create-event" className={styles.mobileNavItem} onClick={closeMobileMenu}>
                        <FiPlusCircle /> Crear Evento
                      </Link>
                    </li>
                  </>
                )}

                {isLoggedIn && (
                  <li className={styles.mobileLogoutContainer}>
                    <button onClick={handleLogoutClick} className={styles.mobileLogoutBtn}>
                      <FiLogOut /> Cerrar Sesión
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

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
