import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './shared/layout/Layout';
import HomePage from './pages/userHomePage/UserHomePage';
import CarritoPage from './pages/purchase/CarritoPage';
import Pay from './pages/purchase/Pay';
import AdminHomePage from './pages/adminHomePage/AdminHomePage';
import MyTickets from './pages/purchase/MyTickets';
import Help from './pages/support/Help';
import EventDetailPage from './shared/EventDetailPage';
import About from './pages/support/About';
import Login from './pages/login/LoginUser';
import Register from './pages/register/RegisterUser';
import CreateEventPage from './pages/companyHomePage/CreateEventPage';
import LoginCompany from './pages/login/LoginCompany';
import RegisterCompany from './pages/register/RegisterCompany';
import NewsLetter from './pages/support/NewsLetter';
import { useAuth, type User } from './shared/context/AuthContext';
import { useMessage } from './shared/context/MessageContext';
import styles from './shared/styles/App.module.css';
import FeatureEventsPage from './pages/adminHomePage/FeatureEventsPage';

export interface Ticket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  price: number;
  availableTickets: number;
  imageUrl: string;
  time: string;
  type: string;
  featured: boolean;
  agotado?: boolean;
}

const App: React.FC = () => {
  const { isLoggedIn, user, login } = useAuth();
  const { setAppMessage } = useMessage();
  const navigate = useNavigate();

  useEffect(() => {
    // No redirigir aquí para permitir que el admin navegue a otras páginas.
  }, [isLoggedIn, user?.role, navigate]);

  const handleLoginSuccess = (user: { name: string, role?: string }, token: string) => {
    const userToLogin: User = {
      name: user.name,
      role: user.role || null
    };
    login(userToLogin, token);
    setAppMessage(`¡Inicio de sesión exitoso como ${user.name}!`);
  };

  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  const handleCompanyLoginSuccess = (company: { companyName: string }, token: string) => {
    login({ name: company.companyName, role: 'company' }, token);
    setAppMessage(`¡Inicio de sesión exitoso como organizador ${company.companyName}!`);
    navigate('/create-event');
  };

  const handleCompanyRegisterSuccess = () => {
    setAppMessage('¡Registro de organizador exitoso! Por favor, inicia sesión.');
  };

  return (
    <div className={styles.appRoot}>
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
          path="/feature-events"
          element={
            <Layout>
              <FeatureEventsPage />
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
          path="/newsletter"
          element={<NewsLetter />}
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

