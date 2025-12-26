import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/shared/layout/Layout';
import HomePage from '@/pages/home/UserHomePage';
import SearchedEvents from '@/pages/events/search/SearchedEvents';
import CartPage from '@/pages/sales/checkout/CartPage';
import Pay from '@/pages/sales/checkout/Pay';
import AdminPanel from '@/pages/admin/AdminPanel';
import { AdminMessages } from '@/pages/admin/AdminMessages';
import MyTickets from '@/pages/sales/tickets/MyTickets';
import Help from '@/pages/support/Help';
import EventDetailPage from '@/pages/events/detail/EventDetailPage';
import About from '@/pages/support/About';
import LoginPage from '@/pages/auth/login/LoginPage';
import Register from '@/pages/auth/register/RegisterUser';
import CreateEventPage from '@/pages/events/create/CreateEventPage';
import EditEventPage from '@/pages/events/edit/EditEventPage';
import MyEventsPage from '@/pages/company/MyEventsPage';
import RegisterCompany from '@/pages/auth/register/RegisterCompany';
import ForgotPasswordPage from '@/pages/auth/forgot-password/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/reset-password/ResetPasswordPage';
import CompanyDashboardPage from '@/pages/company/CompanyDashboardPage';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/auth';
import { useMessage } from '@/hooks/useMessage';
import styles from '@/shared/styles/App.module.css';
import globalStyles from '@/shared/styles/GlobalStyles.module.css';
import AuthRoute from '@/shared/AuthRoute';
import RestrictCompanyRoute from '@/shared/RestrictCompanyRoute';
import Contact from '@/pages/support/Contact';
import Privacy from '@/pages/support/Privacy';
import Terms from '@/pages/support/Terms';
import Faq from '@/pages/support/Faq';
import Success from '@/pages/sales/checkout/Success';
import ProcessingPayment from '@/pages/sales/checkout/ProcessingPayment';
import Failure from '@/pages/sales/checkout/Failure';
import ChatAssistant from '@/pages/support/ChatAssistant';
import FatalErrorPage from '@/shared/error/FatalErrorPage';
import ProfilePage from '@/pages/profile/ProfilePage';

const App: React.FC = () => {
  const { login } = useAuth();
  const { setAppMessage } = useMessage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = (user: User, token: string) => {
    login(user, token);
    setAppMessage(`¡Inicio de sesión exitoso como ${user.name}!`);

    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    }
  };

  const handleRegisterSuccess = () => {
    setAppMessage('¡Registro exitoso! Por favor, inicia sesión.');
  };

  const handleCompanyLoginSuccess = (company: any, token: string) => {
    const companyUser: User = {
      ...company,
      name: company.name || company.companyName,
      role: 'company'
    };
    login(companyUser, token);
    setAppMessage(`¡Inicio de sesión exitoso como organizador ${company.companyName}!`);
    navigate('/company/dashboard');
  };

  const handleCompanyRegisterSuccess = () => {
    setAppMessage('¡Registro de organizador exitoso! Por favor, inicia sesión.');
  };

  return (
    <div className={`${styles.appRoot} ${globalStyles.appRoot}`}>
      <Routes>
        { }
        <Route path="/" element={<RestrictCompanyRoute><Layout><HomePage /></Layout></RestrictCompanyRoute>} />
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/faq" element={<Layout><Faq /></Layout>} />
        <Route path="/event/:id" element={<RestrictCompanyRoute><Layout><EventDetailPage /></Layout></RestrictCompanyRoute>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/searchedEvents" element={<RestrictCompanyRoute><Layout><SearchedEvents /></Layout></RestrictCompanyRoute>} />

        { }
        <Route path="/login" element={<AuthRoute guestOnly><LoginPage onLoginSuccess={(userOrCompany, token) => {
          if (userOrCompany.role === 'company') {
            handleCompanyLoginSuccess(userOrCompany, token);
          } else {
            handleLoginSuccess(userOrCompany, token);
          }
        }} /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute guestOnly><Register onRegisterSuccess={handleRegisterSuccess} /></AuthRoute>} />
        <Route path="/registercompany" element={<AuthRoute guestOnly><RegisterCompany onRegisterSuccess={handleCompanyRegisterSuccess} /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute guestOnly><ForgotPasswordPage /></AuthRoute>} />
        <Route path="/auth/reset-password" element={<AuthRoute guestOnly><ResetPasswordPage /></AuthRoute>} />

        { }
        <Route path="/cart" element={<AuthRoute allowedRoles={['user']}><Layout><CartPage /></Layout></AuthRoute>} />
        <Route path="/pay" element={<AuthRoute allowedRoles={['user']}><Layout><Pay /></Layout></AuthRoute>} />
        <Route path="/myTickets" element={<AuthRoute allowedRoles={['user']}><Layout><MyTickets /></Layout></AuthRoute>} />
        <Route path="/pay/processing" element={<AuthRoute allowedRoles={['user']}><Layout><ProcessingPayment /></Layout></AuthRoute>} />
        <Route path="/pay/success" element={<AuthRoute allowedRoles={['user']}><Layout><Success /></Layout></AuthRoute>} />
        <Route path="/pay/failure" element={<AuthRoute allowedRoles={['user']}><Layout><Failure /></Layout></AuthRoute>} />

        { }
        <Route path="/admin/dashboard" element={<AuthRoute allowedRoles={['admin']}><Layout><AdminPanel /></Layout></AuthRoute>} />
        <Route path="/admin/messages" element={<AuthRoute allowedRoles={['admin']}><Layout><AdminMessages /></Layout></AuthRoute>} />

        { }
        <Route path="/company/dashboard" element={<AuthRoute allowedRoles={['company']}><Layout><CompanyDashboardPage /></Layout></AuthRoute>} />
        <Route path="/company/my-events" element={<AuthRoute allowedRoles={['company', 'admin']}><Layout><MyEventsPage /></Layout></AuthRoute>} />
        <Route path="/create-event" element={<AuthRoute allowedRoles={['company', 'admin']}><Layout><CreateEventPage /></Layout></AuthRoute>} />
        <Route path="/edit-event/:id" element={<AuthRoute allowedRoles={['company', 'admin']}><Layout><EditEventPage /></Layout></AuthRoute>} />

        { }
        <Route path="/test-error" element={<FatalErrorPage error={new Error("Este es un error de prueba simulado para verificar el diseño.")} resetErrorBoundary={() => window.location.href = '/'} />} />

        { }
        <Route path="/profile" element={<AuthRoute><Layout><ProfilePage /></Layout></AuthRoute>} />
      </Routes>
      <ChatAssistant />
    </div>
  );
};

export default App;