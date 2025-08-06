import React, { useReducer } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Importa el nuevo archivo CSS

interface RegisterProps {
  onRegisterSuccess: () => void;
  setAppMessage: (message: string | null) => void;
}

interface RegisterState {
  dni: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  error: string | null;
  successMessage: string | null;
}

type RegisterAction =
  | { type: 'SET_FIELD'; payload: { field: keyof Omit<RegisterState, 'error' | 'successMessage'>; value: string } }
  | { type: 'SET_ERROR'; payload: { error: string | null } }
  | { type: 'SET_SUCCESS'; payload: { message: string | null } }
  | { type: 'RESET_FORM' };

const registerReducer = (state: RegisterState, action: RegisterAction): RegisterState => {
  switch (action.type) {
    case 'SET_FIELD': {
      return { ...state, [action.payload.field]: action.payload.value };
    }
    
    case 'SET_ERROR': {
      return { ...state, error: action.payload.error, successMessage: null };
    }
    
    case 'SET_SUCCESS': {
      return { ...state, successMessage: action.payload.message, error: null };
    }
    
    case 'RESET_FORM': {
      return {
        dni: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        error: null,
        successMessage: null
      };
    }
    
    default:
      return state;
  }
};

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, setAppMessage }) => {
  const [state, dispatch] = useReducer(registerReducer, {
    dni: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    error: null,
    successMessage: null
  });
  
  const navigate = useNavigate();

  const handleFieldChange = (field: keyof Omit<RegisterState, 'error' | 'successMessage'>, value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });
    dispatch({ type: 'SET_SUCCESS', payload: { message: null } });

    // Validaciones
    if (!state.dni || !state.fullName || !state.email || !state.password || !state.confirmPassword || !state.birthDate) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, completa todos los campos.' } });
      return;
    }

    if (state.password !== state.confirmPassword) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Las contraseñas no coinciden.' } });
      return;
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, introduce un email válido.' } });
      return;
    }

    // Dividir fullName en name y surname
    const nameParts = state.fullName.trim().split(' ');
    let name = '';
    let surname = '';

    if (nameParts.length > 1) {
      name = nameParts[0];
      surname = nameParts.slice(1).join(' '); // El resto es el apellido
    } else {
      name = state.fullName; // Si solo hay una palabra, se asume que es el nombre
      surname = ''; // El apellido queda vacío
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: state.dni,
          name, // Enviamos el nombre separado
          surname, // Enviamos el apellido separado
          mail: state.email, // El backend espera 'mail'
          password: state.password,
          birthDate: state.birthDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        dispatch({ type: 'SET_ERROR', payload: { error: errorData.message || 'Error al registrar el usuario.' } });
        return;
      }

      dispatch({ type: 'SET_SUCCESS', payload: { message: '¡Registro exitoso! Serás redirigido para iniciar sesión.' } });
      setTimeout(() => {
        onRegisterSuccess();
        navigate('/login');
      }, 2000);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Error de red o del servidor.' } });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card"> 
        <h2 className="register-title">Registrarse</h2>
        {state.error && (
          <div className="register-error-message">
            {state.error}
          </div>
        )}
        {state.successMessage && (
          <div className="register-success-message"> 
            {state.successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="register-form"> 
          <div className="register-form-group">
            <label htmlFor="dni" className="register-label">DNI:</label>
            <input
              type="text"
              id="dni"
              value={state.dni}
              onChange={(e) => handleFieldChange('dni', e.target.value)}
              className="register-input"
              placeholder="Ingresa tu DNI"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="fullName" className="register-label">Nombre completo:</label>
            <input
              type="text"
              id="fullName"
              value={state.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              className="register-input"
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email" className="register-label">Email:</label>
            <input
              type="email"
              id="email"
              value={state.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className="register-input"
              placeholder="Ingresa tu email"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="birthDate" className="register-label">Fecha de nacimiento:</label>
            <input
              type="date"
              id="birthDate"
              value={state.birthDate}
              onChange={(e) => handleFieldChange('birthDate', e.target.value)}
              className="register-input"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password" className="register-label">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={state.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              className="register-input"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="confirmPassword" className="register-label">Confirmar contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              value={state.confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              className="register-input"
              placeholder="Confirma tu contraseña"
            />
          </div>

          <button type="submit" className="register-button"> {/* Clase CSS para el botón */}
            Registrarse
          </button>
        </form>

        <div className="register-login-link"> {/* Clase CSS para el enlace de login */}
          ¿Ya tienes una cuenta? <Link to="/login" className="register-link">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
