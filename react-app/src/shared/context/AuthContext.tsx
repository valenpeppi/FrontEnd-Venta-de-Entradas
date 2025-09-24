import React, { createContext, useReducer, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  name: string;
  role: string | null;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'INITIALIZE'; payload: { user: User | null } }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { name: string; role?: string } };

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (name: string, role?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

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

          // Verifica el token con backend
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/auth/validate`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            dispatch({ type: 'INITIALIZE', payload: { user } });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
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
  }, []);


  useEffect(() => {
    let user: User | null = null;
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        user = JSON.parse(userString);
      } catch (e) {
        console.error("Error al parsear datos de usuario desde localStorage", e);
        localStorage.clear();
      }
    }
    dispatch({ type: 'INITIALIZE', payload: { user } });
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
