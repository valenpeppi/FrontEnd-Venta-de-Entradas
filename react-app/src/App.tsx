import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login.tsx'; 
import Register from './components/Register.tsx'; 
import HomePage from './components/HomePage.tsx';
import AdminHomePage from './components/AdminHomePage.tsx';
import CarritoPage from './components/CarritoPage.tsx';
import Pay from './components/Pay.tsx';
import MyTickets from './components/MyTickets.tsx';
import Help from './components/Help.tsx';
import EventDetailPage from './components/EventDetailPage.tsx';
import Layout from './components/Layout.tsx';
import About from './components/About.tsx';
import UsersList from './components/UsersList.tsx';
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
  time: string;
}

const App: React.FC = () => {
  const [appMessage, setAppMessage] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && userRole === 'admin') {
      navigate('/admin');
    }
  }, [isLoggedIn, userRole, navigate]);

  const handleLoginSuccess = (loggedInUserName: string, role: string) => {
    setIsLoggedIn(true);
    setUserName(loggedInUserName);
    setUserRole(role);
    setAppMessage(`¡Inicio de sesión exitoso como ${loggedInUserName}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(null);
    setAppMessage('Has cerrado sesión.');
  };

  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  return (
    <div className="app-root">
      <Routes>
        <Route 
          path="/" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
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
          path="/admin"
          element={
            <Layout
              isLoggedIn={isLoggedIn}
              userName={userName}
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <AdminHomePage />
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
        <Route 
          path="/event/:id" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <EventDetailPage setAppMessage={setAppMessage} />
            </Layout>
          } 
        />
        <Route 
          path="/about" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <About />
            </Layout>
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
        <Route 
          path="/userslist" 
          element={
            <Layout 
              isLoggedIn={isLoggedIn} 
              userName={userName} 
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <UsersList />
            </Layout>
          }
        />
      </Routes>
      
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default App;
