import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import CarritoPage from './components/CarritoPage';
import Pay from './components/Pay';
import AdminHomePage from './components/AdminHomePage';
import MyTickets from './components/MyTickets';
import Help from './components/Help';
import EventDetailPage from './components/EventDetailPage';
import About from './components/About';
import Login from './components/Login';
import Register from './components/Register';
import UsersList from './components/UsersList';
import CreateEventPage from './components/CreateEventPage';
import LoginCompany from './components/LoginCompany';
import RegisterCompany from './components/RegisterCompany';
import { useAuth } from './context/AuthContext';
import { useMessage } from './context/MessageContext';
import './App.css';

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
  const { isLoggedIn, user, login, logout } = useAuth();
  const { setAppMessage } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isLoggedIn, user?.role, navigate]);

  const handleLoginSuccess = (loggedInUserName: string, role?: string) => {
    login(loggedInUserName, role);
    setAppMessage(`¡Inicio de sesión exitoso como ${loggedInUserName}!`);
  };



  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  const handleCompanyLoginSuccess = (companyName: string) => {
    login(companyName, 'company');
    setAppMessage(`¡Inicio de sesión exitoso como organizador ${companyName}!`);
    navigate('/admin');
  };

  const handleCompanyRegisterSuccess = () => {
    setAppMessage('¡Registro de organizador exitoso! Por favor, inicia sesión.');
  };

  return (
    <div className="app-root">
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/cart"
          element={
            <Layout>
              <CarritoPage />
            </Layout>
          }
        />
        <Route
          path="/pay"
          element={
            <Layout>
              <Pay />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminHomePage />
            </Layout>
          }
        />
        <Route
          path="/myTickets"
          element={
            <Layout>
              <MyTickets />
            </Layout>
          }
        />
        <Route
          path="/help"
          element={
            <Layout>
              <Help />
            </Layout>
          }
        />
        <Route
          path="/event/:id"
          element={
            <Layout>
              <EventDetailPage />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
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
            <Layout>
              <UsersList />
            </Layout>
          }
        />
        <Route
          path="/create-event"
          element={
            <Layout>
              <CreateEventPage />
            </Layout>
          }
        />
        <Route
          path="/logincompany"
          element={
            <LoginCompany
              onLoginSuccess={handleCompanyLoginSuccess}
            />
          }
        />
        <Route
          path="/registercompany"
          element={
            <RegisterCompany
              onRegisterSuccess={handleCompanyRegisterSuccess}
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
