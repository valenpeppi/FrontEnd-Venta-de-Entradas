import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// # 1. Importa el ErrorBoundary
import ErrorBoundary from './shared/ErrorBoundary';

// Layout y Componentes
import Layout from './shared/layout/Layout';
import HomePage from './pages/userHomePage/UserHomePage';
import SearchedEvents from './pages/userHomePage/SearchedEvents';
import CartPage from './pages/purchase/CartPage';
import Pay from './pages/purchase/Pay';
import AdminHomePage from './pages/adminHomePage/AdminHomePage';
import MyTickets from './pages/purchase/MyTickets';
import Help from './pages/support/Help';
import EventDetailPage from './pages/eventDetail/EventDetailPage';
import About from './pages/support/About';
import Login from './pages/login/LoginUser';
import Register from './pages/register/RegisterUser';
import CreateEventPage from './pages/companyHomePage/CreateEventPage';
import LoginCompany from './pages/login/LoginCompany';
import RegisterCompany from './pages/register/RegisterCompany';
import NewsLetter from './pages/support/NewsLetter';
import AuthRoute from './shared/AuthRoute';
import Contact from './pages/support/Contact';
import Privacy from './pages/support/Privacy';
import Terms from './pages/support/Terms';
import Faq from './pages/support/Faq';
import Success from './pages/purchase/Success';
import ProcessingPayment from './pages/purchase/ProcessingPayment';
import Failure from './pages/purchase/Failure';
import ChatAssistant from './pages/support/ChatAssistant';
import FeatureEventsPage from './pages/adminHomePage/FeatureEventsPage';

// Hooks y Contexto
import { useAuth, type User } from './shared/context/AuthContext.tsx';
import { useMessage } from './shared/context/MessageContext';

// Estilos
import styles from './shared/styles/App.module.css';
import globalStyles from './shared/styles/GlobalStyles.module.css';

const App: React.FC = () => {
  const { login } = useAuth();
  const { setAppMessage } = useMessage();
  const navigate = useNavigate();

  const handleLoginSuccess = (user: User, token: string) => {
    login(user, token);
    setAppMessage(`¡Inicio de sesión exitoso como ${user.name}!`, 'success');

    if (user.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.', 'success');
  };

  const handleCompanyLoginSuccess = (company: { companyName: string }, token: string) => {
    // # Aseguramos que el objeto 'user' que se pasa a login coincida con el tipo User
    const companyUser: User = { name: company.companyName, role: 'COMPANY' };
    login(companyUser, token);
    setAppMessage(`¡Inicio de sesión exitoso como organizador ${company.companyName}!`, 'success');
    navigate('/create-event');
  };

  const handleCompanyRegisterSuccess = () => {
    setAppMessage('¡Registro de organizador exitoso! Por favor, inicia sesión.', 'success');
  };

  return (
    <div className={`${styles.appRoot} ${globalStyles.appRoot}`}>
      {/* # 2. Envuelve el componente Routes con ErrorBoundary */}
      <ErrorBoundary>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/help" element={<Layout><Help /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />
          <Route path="/faq" element={<Layout><Faq /></Layout>} />
          <Route path="/event/:id" element={<Layout><EventDetailPage /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/newsletter" element={<NewsLetter />} />
          <Route path="/searchedEvents" element={<Layout><SearchedEvents /></Layout>} />

          {/* Rutas para Invitados (no logueados) */}
          <Route path="/login" element={<AuthRoute guestOnly><Login onLoginSuccess={handleLoginSuccess} /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute guestOnly><Register onRegisterSuccess={handleRegisterSuccess} /></AuthRoute>} />
          <Route path="/login-company" element={<AuthRoute guestOnly><LoginCompany onLoginSuccess={handleCompanyLoginSuccess} /></AuthRoute>} />
          <Route path="/register-company" element={<AuthRoute guestOnly><RegisterCompany onRegisterSuccess={handleCompanyRegisterSuccess} /></AuthRoute>} />

          {/* Rutas Protegidas para Usuarios */}
          <Route path="/cart" element={<AuthRoute allowedRoles={['USER']}><Layout><CartPage /></Layout></AuthRoute>} />
          <Route path="/pay" element={<AuthRoute allowedRoles={['USER']}><Layout><Pay /></Layout></AuthRoute>} />
          <Route path="/my-tickets" element={<AuthRoute allowedRoles={['USER']}><Layout><MyTickets /></Layout></AuthRoute>} />
          <Route path="/processing-payment" element={<AuthRoute allowedRoles={['USER']}><Layout><ProcessingPayment /></Layout></AuthRoute>} />
          <Route path="/success" element={<AuthRoute allowedRoles={['USER']}><Layout><Success /></Layout></AuthRoute>} />
          <Route path="/failure" element={<AuthRoute allowedRoles={['USER']}><Layout><Failure /></Layout></AuthRoute>} />

          {/* Rutas Protegidas para Administradores */}
          <Route path="/admin" element={<AuthRoute allowedRoles={['ADMIN']}><Layout><AdminHomePage /></Layout></AuthRoute>} />
          <Route path="/feature-events" element={<AuthRoute allowedRoles={['ADMIN']}><Layout><FeatureEventsPage /></Layout></AuthRoute>} />

          {/* Rutas Protegidas para Empresas */}
          <Route path="/create-event" element={<AuthRoute allowedRoles={['COMPANY']}><Layout><CreateEventPage /></Layout></AuthRoute>} />
        </Routes>
      </ErrorBoundary>
      <ChatAssistant />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet" />
    </div>
  );
};

export default App;

