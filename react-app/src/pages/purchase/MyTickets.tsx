import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/MyTickets.module.css';

const MyTickets: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.myTicketsContainer}>
      <h1>Mis Entradas</h1>
      <p>Aqui se mostraran todas tus entradas compradas.</p>
      <button onClick={() => navigate('/')} className={styles.btn + ' ' + styles.btnPrimary}>Volver a la página principal</button>
    </div>
  );
};

export default MyTickets;
