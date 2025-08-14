import type React from "react"
import { useReducer, useEffect } from "react" 
import { useNavigate, Link } from "react-router-dom"
import { useMessage } from '../../shared/context/MessageContext';
import axios from 'axios';
import MessageDisplay from "../../shared/MessageDisplay";
import styles from './styles/LoginUser.module.css' 

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
  const { messages, clearMessages } = useMessage(); 

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        mail: state.email, 
        password: state.password,
      });

      const data = response.data;
      const role= data.user?.role;
      onLoginSuccess(data.user?.name || data.user?.mail || 'Usuario', data.user?.role);

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.message || 'Usuario o contraseña incorrectos.';
        dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: { error: 'Error de red o del servidor.' } });
      }
    }
  };

  return (
    <>
      {messages.map(message => (
        <MessageDisplay 
          key={message.id}
          message={message.text} 
          type={message.type} 
        />
      ))}
      <div className={styles.loginRoot}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Iniciar Sesión</h2>
          {state.error && <div className={styles.loginErrorMessage}>{state.error}</div>}
          <form onSubmit={handleSubmit}>
            <div className={styles.loginField}>
              <label htmlFor="email" className={styles.loginLabel}>
                Email
              </label>
              <input
                type="email"
                id="email"
                className={styles.loginInput}
                value={state.email}
                onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: { email: e.target.value } })}
                required
              />
            </div>
            <div className={styles.loginFieldPassword}>
              <label htmlFor="password" className={styles.loginLabel}>
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className={styles.loginInputPassword}
                value={state.password}
                onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: { password: e.target.value } })}
                required
              />
            </div>
            <button
              type="submit"
              className={styles.loginBtnSubmit}
            >
              Iniciar Sesión
            </button>
          </form>
          <div className={styles.loginRegisterLink}>
            ¿No tienes una cuenta? <Link to="/register" className={styles.loginLink}>Regístrate aquí</Link>
          </div>
          <div className={styles.loginForgotPasswordLink}>
          <Link to="/forgot-password" className={styles.loginLink}>¿Olvidaste tu contraseña?</Link>
          </div>
          <div className={styles.back}>
            <button
              type="button"
              className={styles.backToLoginBtn}
              onClick={() => navigate('/')}
            >
            Volver
            </button>
            </div>          
      </div>
      </div>
    </>
  );
};

export default Login;
