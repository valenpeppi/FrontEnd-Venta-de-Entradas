//pago
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pay.css';
import Navbar from './Navbar';
import Footer from './Footer';
const Pay: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
    <div><Navbar /></div>
    <div className="pay-container">
      <h2>Proceder al Pago</h2>
      <p>Aquí puedes completar tu compra.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">Volver a la tienda</button>
      <button onClick={() => navigate('/cart')} className="btn btn-secondary">Volver al carrito</button>
    </div>
    <div><Footer /></div>
    </div>
  );
};

export default Pay;
