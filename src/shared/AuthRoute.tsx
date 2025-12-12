import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { useMessage } from '@/shared/context/MessageContext';

interface AuthRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
  guestOnly?: boolean;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, allowedRoles, guestOnly }) => {
  const { isLoggedIn, user, isLoading } = useAuth();
  const { setAppMessage } = useMessage();
  const location = useLocation();


  if (isLoading) {
    return null;
  }


  const RedirectWithMessage: React.FC<{ to: string; message: string; type: 'info' | 'error' }> = ({ to, message, type }) => {
    React.useEffect(() => {
      setAppMessage(message, type);
    }, [message, type, setAppMessage]);
    return <Navigate to={to} state={{ from: location }} replace />;
  };

   
  if (guestOnly) {
    if (isLoggedIn) {
      const redirectTo = user?.role === 'admin' ? '/admin/dashboard' : (user?.role === 'company' ? '/company/dashboard' : '/');
      return <RedirectWithMessage to={redirectTo} message="Ya has iniciado sesión." type="info" />;
    }
    return children;
  }

   
  if (allowedRoles) {
    if (!isLoggedIn) {
      return <RedirectWithMessage to="/login" message="Debes iniciar sesión para acceder a esta página." type="error" />;
    }

    if (!user?.role || !allowedRoles.includes(user.role)) {
      let roleMessage = 'No tienes permiso para acceder a esta página.';
      if (allowedRoles.includes('admin')) {
        roleMessage = 'Acceso denegado. Se requiere rol de Administrador.';
      } else if (allowedRoles.includes('company')) {
        roleMessage = 'Acceso denegado. Debes ser un Organizador.';
      } else if (allowedRoles.includes('user')) {
        roleMessage = 'Acceso denegado. Debes ser un usuario registrado.';
      }
      return <RedirectWithMessage to="/" message={roleMessage} type="error" />;
    }

    return children;
  }

  return children;
};

export default AuthRoute;
