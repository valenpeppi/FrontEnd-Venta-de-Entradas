import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/MyTickets.css';

const MyTickets: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='my-tickets-container'>
      <h1>Mis Entradas</h1>
      <p>Aqui se mostraran todas tus entradas compradas.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">Volver a la página principal</button>
    </div>
  );
};

export default MyTickets;
