import React, { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';

interface User {
  name: string;
  role: string | null;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { name: string; role?: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { name: string; role?: string } };

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (name: string, role?: string) => void;
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
        user: {
          name: action.payload.name,
          role: action.payload.role || null
        }
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

  const login = (name: string, role?: string) => {
    dispatch({ type: 'LOGIN', payload: { name, role } });
  };

  const logout = () => {
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