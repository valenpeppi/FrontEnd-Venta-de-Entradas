import type React from "react"
import { useReducer, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useMessage } from '../../context/MessageContext';
import axios from 'axios';
import './Login.css' 

interface LoginProps {
  onLoginSuccess: (userName: string, role?: string) => void;
}

interface LoginState {
  email: string;
  password: string;
  error: string | null;
}

type LoginAction =
  | { type: 'SET_EMAIL'; payload: { email: string } }
  | { type: 'SET_PASSWORD'; payload: { password: string } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'RESET_FORM' };

const loginReducer = (state: LoginState, action: LoginAction): LoginState => {
  switch (action.type) {
    case 'SET_EMAIL': {
      return { ...state, email: action.payload.email };
    }
    
    case 'SET_PASSWORD': {
      return { ...state, password: action.payload.password };
    }
    
    case 'SET_ERROR': {
      return { ...state, error: action.payload.error };
    }
    
    case 'RESET_FORM': {
      return {
        email: '',
        password: '',
        error: null
      };
    }
    
    default:
      return state;
  }
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [state, dispatch] = useReducer(loginReducer, {
    email: '',
    password: '',
    error: null
  });
  
  const navigate = useNavigate();
  const { clearMessages } = useMessage();

  // Limpia cualquier mensaje de la aplicación cuando el componente Login se monta
  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    try {
      console.log('Enviando login:', state.email, state.password);
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        mail: state.email, 
        password: state.password,
      });

      const data = response.data;
      console.log('Respuesta del backend:', data);

      // Llamar a onLoginSuccess con el nombre y rol del usuario
      onLoginSuccess(data.user?.name || data.user?.mail || 'Usuario', data.user?.role);

      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error('Error en login:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.message || 'Usuario o contraseña incorrectos.';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: { error: 'Error de red o del servidor.' } });
      }
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        {state.error && <div className="login-error-message">{state.error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="login-input"
              value={state.email}
              onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: { email: e.target.value } })}
              required
            />
          </div>
          <div className="login-field-password">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="login-input-password"
              value={state.password}
              onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: { password: e.target.value } })}
              required
            />
          </div>
          <button
            type="submit"
            className="login-btn-submit"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="login-register-link">
          ¿No tienes una cuenta? <Link to="/register" className="login-link">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
