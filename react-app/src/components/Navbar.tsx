import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

// Añade props para el estado de autenticación
interface NavbarProps {
  isLoggedIn: boolean;
  userName: string | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, userName, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
