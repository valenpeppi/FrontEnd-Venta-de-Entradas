
import React from 'react';
import { useNavigate } from 'react-router-dom';
const CarritoPage = () => {
  const navigate = useNavigate();

  return (
    <nav>
    <div>
      <h2>Carrito de compras</h2>
      <p>Aquí se mostrarán los items del carrito.</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">Volver a la tienda</button>
      <button onClick={() => navigate('/pay')} className="btn btn-success">Pagar</button>
      <button onClick={() => navigate('/')} className="btn btn-danger">Eliminar item</button>
      <p>Actualmente no hay items en el carrito.</p>
    </div>
    </nav>
  );
};

export default CarritoPage;
//componenente carrito que muestra los items del carrito de compras
//y que se puede navegar a esta página desde la barra de navegación
//agregar un botón para volver a la página de inicio
//y un botón para proceder al pago
//también se puede agregar un botón para eliminar un item del carrito
