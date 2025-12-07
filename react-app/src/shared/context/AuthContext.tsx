import React, { createContext, useReducer, useContext, useEffect } from 'react';

import type { User, AuthState, AuthContextType, AuthProviderProps } from '../../types/auth'; // Import from new types
import { AuthService } from '../../services/AuthService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);


type AuthAction =
  | { type: 'INITIALIZE'; payload: { user: User | null } }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { name: string; role?: string } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isLoggedIn: !!action.payload.user,
        user: action.payload.user,
        isLoading: false,
      };
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload.user,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        user: null,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user
          ? {
            ...state.user,
            name: action.payload.name,
            role: action.payload.role || state.user.role,
          }
          : null,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoggedIn: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');

      if (token && userString) {
        try {
          const user = JSON.parse(userString);

          // Use AuthService instead of direct fetch
          await AuthService.validateToken();
          // Note: validateToken in original code didn't use the return value user content except for "ok",
          // it relied on local storage parsing.
          // If AuthService.validateToken throws, we go to catch.
          // If it returns, we assume valid.
          // Original code: if (res.ok) dispatch... else logout.
          // AuthService uses axios interceptor which rejects if 401.

          dispatch({ type: 'INITIALIZE', payload: { user } });

        } catch (e) {
          console.error("Error al validar token:", e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'INITIALIZE', payload: { user: null } });
      }
    };

    validateToken();

    // Listen for global logout events (from api interceptor 401s)
    const handleGlobalLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleGlobalLogout);

    return () => {
      window.removeEventListener('auth:logout', handleGlobalLogout);
    };
  }, []);


  const login = (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user } });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (name: string, role?: string) => {
    dispatch({ type: 'UPDATE_USER', payload: { name, role } });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
