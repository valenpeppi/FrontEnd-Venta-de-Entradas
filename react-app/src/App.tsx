import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './shared/layout/Layout';
import HomePage from './pages/home/UserHomePage';
import SearchedEvents from './pages/events/search/SearchedEvents';
import CartPage from './pages/sales/checkout/CartPage';
import Pay from './pages/sales/checkout/Pay';
import AdminHomePage from './pages/admin/AdminHomePage';
import MyTickets from './pages/sales/tickets/MyTickets';
import Help from './pages/support/Help';
import EventDetailPage from './pages/events/detail/EventDetailPage';
import About from './pages/support/About';
import LoginPage from './pages/auth/login/LoginPage';
import Register from './pages/auth/register/RegisterUser';
import CreateEventPage from './pages/events/create/CreateEventPage';
import EditEventPage from './pages/events/edit/EditEventPage';
import MyEventsPage from './pages/company/MyEventsPage';
import RegisterCompany from './pages/auth/register/RegisterCompany';
import { useAuth } from './shared/context/AuthContext';
import type { User } from './types/auth';
import { useMessage } from './shared/context/MessageContext';
import styles from './shared/styles/App.module.css';
import globalStyles from './shared/styles/GlobalStyles.module.css';
import FeatureEventsPage from './pages/admin/FeatureEventsPage';
import AuthRoute from './shared/AuthRoute';
import Contact from './pages/support/Contact';
import Privacy from './pages/support/Privacy';
import Terms from './pages/support/Terms';
import Faq from './pages/support/Faq';
import Success from './pages/sales/checkout/Success';
import ProcessingPayment from './pages/sales/checkout/ProcessingPayment';
import Failure from './pages/sales/checkout/Failure';
import ChatAssistant from './pages/support/ChatAssistant';
import FatalErrorPage from './shared/error/FatalErrorPage';




const App: React.FC = () => {
  const { login } = useAuth();
  const { setAppMessage } = useMessage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = (user: User, token: string) => {
    login(user, token);
    setAppMessage(`¡Inicio de sesión exitoso como ${user.name}!`);

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    }
  };

  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  const handleCompanyLoginSuccess = (company: { companyName: string }, token: string) => {
    login({ name: company.companyName, role: 'company' }, token);
    setAppMessage(`¡Inicio de sesión exitoso como organizador ${company.companyName}!`);
    navigate('/company/my-events');
  };

  const handleCompanyRegisterSuccess = () => {
    setAppMessage('¡Registro de organizador exitoso! Por favor, inicia sesión.');
  };

  return (
    <div className={`${styles.appRoot} ${globalStyles.appRoot}`}>
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
        <Route path="/searchedEvents" element={<Layout><SearchedEvents /></Layout>} />

        {/* Rutas para Invitados (no logueados) */}
        <Route path="/login" element={<AuthRoute guestOnly><LoginPage onLoginSuccess={(userOrCompany, token) => {
          if (userOrCompany.role === 'company') {
            handleCompanyLoginSuccess({ companyName: userOrCompany.name, ...userOrCompany }, token);
          } else {
            handleLoginSuccess(userOrCompany, token);
          }
        }} /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute guestOnly><Register onRegisterSuccess={handleRegisterSuccess} /></AuthRoute>} />
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

        {/* Rutas Protegidas para Empresas y Admin */}
        <Route path="/create-event" element={<AuthRoute allowedRoles={['company', 'admin']}><Layout><CreateEventPage /></Layout></AuthRoute>} />
        <Route path="/edit-event/:id" element={<AuthRoute allowedRoles={['company', 'admin']}><Layout><EditEventPage /></Layout></AuthRoute>} />
        <Route path="/company/my-events" element={<AuthRoute allowedRoles={['company', 'admin']}><Layout><MyEventsPage /></Layout></AuthRoute>} />

        {/* Ruta para visualizar la página de error (Solo desarrollo/demo) */}
        <Route path="/test-error" element={<FatalErrorPage error={new Error("Este es un error de prueba simulado para verificar el diseño.")} resetErrorBoundary={() => window.location.href = '/'} />} />
      </Routes>
      <ChatAssistant />
    </div>
  );
};

export default App;