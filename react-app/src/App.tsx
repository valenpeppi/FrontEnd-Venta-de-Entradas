import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.tsx'; 
import Register from './components/Register.tsx'; 
import HomePage from './components/HomePage.tsx';
import CarritoPage from './components/CarritoPage.tsx';
import Pay from './components/Pay.tsx';
import MyTickets from './components/MyTickets.tsx';
import Help from './components/Help.tsx';
import Layout from './components/Layout.tsx'; // Importa el nuevo componente Layout

import './App.css';

// Definición de la interfaz para una entrada
export interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
}

const App: React.FC = () => {
  // Estado para mensajes globales de la aplicación
  const [appMessage, setAppMessage] = useState<string | null>(null);

  // Estado para la autenticación
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);

  const handleLoginSuccess = (loggedInUserName: string) => {
    setIsLoggedIn(true);
    setUserName(loggedInUserName);
    setAppMessage(`¡Inicio de sesión exitoso como ${loggedInUserName}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(null);
    setAppMessage('Has cerrado sesión.');
    // Aquí podrías añadir lógica para limpiar tokens o datos de sesión
  };

  // Función para manejar el registro 
  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  return (
    <div className="app-root">
      <Routes>
        {/* Rutas que usan el Layout */}
        <Route 
          path="/" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage} // Pasa el mensaje global
              setAppMessage={setAppMessage} // Pasa la función para establecerlo
            >
              <HomePage />
            </Layout>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <CarritoPage />
            </Layout>
          } 
        />
        <Route 
          path="/pay" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <Pay />
            </Layout>
          } 
        />
        <Route 
          path="/myTickets" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <MyTickets />
            </Layout>
          } 
        />
        <Route 
          path="/help" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <Help />
            </Layout>
          } 
        />

        {/* Rutas que NO usan el Layout (ej. Login y Register) */}
        <Route 
          path="/login" 
          element={
            <Login 
              onLoginSuccess={handleLoginSuccess} 
            />
          } 
        />
        <Route 
          path="/register" 
          element={
            <Register 
              onRegisterSuccess={handleRegisterSuccess} 
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default App;
