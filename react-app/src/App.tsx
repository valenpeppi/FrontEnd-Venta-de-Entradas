import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.tsx'; 
import Register from './components/Register.tsx'; 
import HomePage from './components/HomePage.tsx';
import './App.css';

// Definición de la interfaz para una entrada
interface Ticket {
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

  const handleLoginSuccess = () => {
    setAppMessage('¡Inicio de sesión exitoso!');

  };

  // Función para manejar el registro 
  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={<HomePage />} />
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
