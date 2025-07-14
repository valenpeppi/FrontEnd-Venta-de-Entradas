import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.tsx'; 
import Register from './components/Register.tsx'; 
import HomePage from './components/HomePage.tsx'; // Importa HomePage
import './App.css';
import CarritoPage from './components/CarritoPage.tsx';
import Pay from './components/Pay.tsx';
import MyTickets from './components/MyTickets.tsx';
import Help from './components/Help.tsx';

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
        {/* HomePage ahora recibe props de autenticación */}
        <Route 
          path="/" 
          element={
            <HomePage 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout} 
            />
          } 
        />
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
        <Route path="/cart" element={<CarritoPage />} />
        <Route path="/pay" element={<Pay />} />
        <Route path="/myTickets" element={<MyTickets />} />
        <Route path="/help" element={<Help />} />
      </Routes>
      
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default App;
