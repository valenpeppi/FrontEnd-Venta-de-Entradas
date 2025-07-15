import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTickets.css';
// Eliminado: import Navbar from './Navbar';
// Eliminado: import Footer from './Footer';

// Componente para mostrar las entradas del usuario
const MyTickets: React.FC = () => {
  const navigate = useNavigate();

  return (
    // Eliminado: div que contenía Navbar y Footer
    <div className='my-tickets-container'>
      <h1>Mis Entradas</h1>
      <p>Aqui se mostraran todas tus entradas compradas.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">Volver a la página principal</button>
    </div>
    // Eliminado: div que contenía Footer
  );
};

export default MyTickets;
