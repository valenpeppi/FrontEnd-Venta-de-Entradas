import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './Layout';

/**
 * Este componente actúa como un layout persistente.
 * Renderiza el Layout principal una sola vez y utiliza <Outlet>
 * para renderizar el componente de la ruta hija activa.
 */
const LayoutWrapper: React.FC = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default LayoutWrapper;
