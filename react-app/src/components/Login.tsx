import type React from "react"
import { useReducer, useEffect } from "react" // Importa useEffect
import { useNavigate, Link } from "react-router-dom"
import './Login.css' 

// Definición de las props que el componente Login recibirá
interface LoginProps {
  onLoginSuccess: (userName: string) => void; // Función que se llamará al iniciar sesión con éxito
  setAppMessage: (message: string | null) => void; // Nueva prop para limpiar mensajes de la aplicación
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

const Login: React.FC<LoginProps> = ({ onLoginSuccess, setAppMessage }) => {
  const [state, dispatch] = useReducer(loginReducer, {
    email: '',
    password: '',
    error: null
  });
  
  const navigate = useNavigate()

  // Limpia cualquier mensaje de la aplicación cuando el componente Login se monta
  useEffect(() => {
    setAppMessage(null);
  }, [setAppMessage]); // Se ejecuta una vez al montar, dependiendo de setAppMessage

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });

    try {
      console.log('Enviando login:', state.email, state.password);
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: state.email, 
          password: state.password,
        }),
      });

      if (!response.ok) {
        // Si la respuesta no es 2xx, lanza error
        const errorData = await response.json();
        dispatch({ type: 'SET_ERROR', payload: { error: errorData.message || 'Usuario o contraseña incorrectos.' } });
        return;
      }

      const data = await response.json();
      console.log('Respuesta del backend:', data);

       // Usar el nombre real si viene
      
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error('Error en login:', err);
      dispatch({ type: 'SET_ERROR', payload: { error: 'Error de red o del servidor.' } });
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
