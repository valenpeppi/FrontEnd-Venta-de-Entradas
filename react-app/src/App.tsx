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
import CreateEventPage from './components/CreateEventPage.tsx';
import LoginCompany from './components/LoginCompany.tsx'; // Importa el nuevo componente
import RegisterCompany from './components/RegisterCompany.tsx'; // Importa el nuevo componente
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

  const handleLoginSuccess = (loggedInUserName: string, role?: string) => {
    setIsLoggedIn(true);
    setUserName(loggedInUserName);
    setUserRole(role || null); // <--- Guarda el rol
    setAppMessage(`¡Inicio de sesión exitoso como ${loggedInUserName}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(null);
    setUserRole(null);
    setAppMessage('Has cerrado sesión.');
  };

  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  // Nueva función para manejar el login exitoso de la empresa
  const handleCompanyLoginSuccess = (companyName: string) => {
    setIsLoggedIn(true); // Considera si quieres que el login de empresa también marque isLoggedIn
    setUserName(companyName); // Puedes usar el nombre de la empresa aquí
    setUserRole('company'); // Establece un rol específico para la empresa
    setAppMessage(`¡Inicio de sesión exitoso como organizador ${companyName}!`);
    navigate('/admin'); // O a una página específica para organizadores
  };

  // Nueva función para manejar el registro exitoso de la empresa
  const handleCompanyRegisterSuccess = () => {
    setAppMessage('¡Registro de organizador exitoso! Por favor, inicia sesión.');
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
              setAppMessage={setAppMessage}
            />
          }
        />
        <Route
          path="/register"
          element={
            <Register
              onRegisterSuccess={handleRegisterSuccess}
              setAppMessage={setAppMessage}
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
        <Route
          path="/create-event"
          element={
            <Layout
              isLoggedIn={isLoggedIn}
              userName={userName}
              onLogout={handleLogout}
              appMessage={appMessage}
              setAppMessage={setAppMessage}
            >
              <CreateEventPage setAppMessage={setAppMessage} />
            </Layout>
          }
        />
        
        <Route
          path="/logincompany"
          element={
            <LoginCompany
              onLoginSuccess={handleCompanyLoginSuccess}
              setAppMessage={setAppMessage}
            />
          }
        />
        <Route
          path="/registercompany"
          element={
            <RegisterCompany
              onRegisterSuccess={handleCompanyRegisterSuccess}
              setAppMessage={setAppMessage}
            />
          }
        />
      </Routes>

      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default App;
