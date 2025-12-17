import React, { createContext, useReducer, useContext, useEffect } from 'react';

import type { User, AuthState, AuthContextType, AuthProviderProps } from '@/types/auth';
import { AuthService } from '@/services/AuthService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


type AuthAction =
  | { type: 'INITIALIZE'; payload: { user: User | null } }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

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
            ...action.payload,
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


          const data = await AuthService.validateToken();

          if (data && data.valid && data.user) {
            const freshUser = data.user;

            localStorage.setItem('user', JSON.stringify(freshUser));
            dispatch({ type: 'INITIALIZE', payload: { user: freshUser } });
          } else {


            dispatch({ type: 'INITIALIZE', payload: { user } });
          }

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

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
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


