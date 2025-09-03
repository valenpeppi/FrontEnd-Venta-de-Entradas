import React, { createContext, useReducer, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  name: string;
  role: string | null;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { name: string; role?: string } };

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
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
    case 'LOGIN': {
      return {
        isLoggedIn: true,
        user: action.payload.user
      };
    }
    case 'LOGOUT': {
      return {
        isLoggedIn: false,
        user: null
      };
    }
    case 'UPDATE_USER': {
      return {
        ...state,
        user: state.user ? {
          ...state.user,
          name: action.payload.name,
          role: action.payload.role || state.user.role
        } : null
      };
    }
    default:
      return state;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoggedIn: false,
    user: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        dispatch({ type: 'LOGIN', payload: { user } });
      } catch (e) {
        console.error("Error al parsear datos de usuario desde localStorage", e);
        localStorage.clear();
      }
    }
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
    <AuthContext.Provider value={{
      isLoggedIn: state.isLoggedIn,
      user: state.user,
      login,
      logout,
      updateUser
    }}>
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

