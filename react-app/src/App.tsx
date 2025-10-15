import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Importa el ErrorBoundary
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

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.', 'success');
  };

  const handleCompanyLoginSuccess = (company: { companyName: string }, token: string) => {
    const companyUser: User = { name: company.companyName, role: 'company' };
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
          <Route path="/logincompany" element={<AuthRoute guestOnly><LoginCompany onLoginSuccess={handleCompanyLoginSuccess} /></AuthRoute>} />
          <Route path="/registercompany" element={<AuthRoute guestOnly><RegisterCompany onRegisterSuccess={handleCompanyRegisterSuccess} /></AuthRoute>} />

          {/* Rutas Protegidas para Usuarios */}
          <Route path="/cart" element={<AuthRoute allowedRoles={['user']}><Layout><CartPage /></Layout></AuthRoute>} />
          <Route path="/pay" element={<AuthRoute allowedRoles={['user']}><Layout><Pay /></Layout></AuthRoute>} />
          <Route path="/myTickets" element={<AuthRoute allowedRoles={['user']}><Layout><MyTickets /></Layout></AuthRoute>} />
          <Route path="/pay/processing" element={<AuthRoute allowedRoles={['user']}><Layout><ProcessingPayment /></Layout></AuthRoute>} />
          <Route path="/pay/success" element={<AuthRoute allowedRoles={['user']}><Layout><Success /></Layout></AuthRoute>} />
          <Route path="/pay/failure" element={<AuthRoute allowedRoles={['user']}><Layout><Failure /></Layout></AuthRoute>} />

          {/* Rutas Protegidas para Administradores */}
          <Route path="/admin" element={<AuthRoute allowedRoles={['admin']}><Layout><AdminHomePage /></Layout></AuthRoute>} />
          <Route path="/feature-events" element={<AuthRoute allowedRoles={['admin']}><Layout><FeatureEventsPage /></Layout></AuthRoute>} />

          {/* Rutas Protegidas para Empresas */}
          <Route path="/create-event" element={<AuthRoute allowedRoles={['company']}><Layout><CreateEventPage /></Layout></AuthRoute>} />
        </Routes>
      </ErrorBoundary>
      <ChatAssistant />
    </div>
  );
};

export default App;

