import React from 'react';
import './MyTickets.css';
import Navbar from './Navbar';
import Footer from './Footer';
// Componente para mostrar las entradas del usuario

const MyTickets: React.FC = () => {
  return (
    <div>
    <div><Navbar /></div>
    <div className='my-tickets-container'>
      <h1>Mis Entradas</h1>
      <p>Aqui se mostraran todas tus entradas compradas.</p>
    </div>
    <div><Footer /></div>
    </div>
  );
};

export default MyTickets;