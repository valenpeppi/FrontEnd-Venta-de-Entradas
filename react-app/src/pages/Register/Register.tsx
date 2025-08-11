import React, { useReducer, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import './Register.css';

interface RegisterProps {
  onRegisterSuccess: () => void;
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
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    case 'SET_ERROR':
      return { ...state, error: action.payload.error, successMessage: null };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload.message, error: null };
    case 'RESET_FORM':
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
    default:
      return state;
  }
};

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
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
  
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFieldChange = (field: keyof Omit<RegisterState, 'error' | 'successMessage'>, value: string) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_ERROR', payload: { error: null } });
    dispatch({ type: 'SET_SUCCESS', payload: { message: null } });

    if (!captchaValue) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, verifica que no eres un robot.' } });
      return;
    }

    if (!state.dni || !state.fullName || !state.email || !state.password || !state.confirmPassword || !state.birthDate) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, completa todos los campos.' } });
      return;
    }

    if (state.password !== state.confirmPassword) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Las contraseñas no coinciden.' } });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) {
      dispatch({ type: 'SET_ERROR', payload: { error: 'Por favor, introduce un email válido.' } });
      return;
    }

    const nameParts = state.fullName.trim().split(' ');
    let name = nameParts.length > 1 ? nameParts[0] : state.fullName;
    let surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        dni: state.dni,
        name,
        surname,
        mail: state.email,
        password: state.password,
        birthDate: state.birthDate,
        captchaToken: captchaValue,
      });

      dispatch({ type: 'SET_SUCCESS', payload: { message: '¡Registro exitoso! Serás redirigido para iniciar sesión.' } });
      setTimeout(() => {
        onRegisterSuccess();
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error de red o del servidor.';
      dispatch({ type: 'SET_ERROR', payload: { error: errorMsg } });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Registrarse</h2>
        {state.error && <div className="register-error-message">{state.error}</div>}
        {state.successMessage && <div className="register-success-message">{state.successMessage}</div>}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-group">
            <label htmlFor="dni" className="register-label">DNI:</label>
            <input type="text" id="dni" value={state.dni} onChange={(e) => handleFieldChange('dni', e.target.value)} className="register-input" placeholder="Ingresa tu DNI" />
          </div>
          <div className="register-form-group">
            <label htmlFor="fullName" className="register-label">Nombre completo:</label>
            <input type="text" id="fullName" value={state.fullName} onChange={(e) => handleFieldChange('fullName', e.target.value)} className="register-input" placeholder="Ingresa tu nombre completo" />
          </div>
          <div className="register-form-group">
            <label htmlFor="email" className="register-label">Email:</label>
            <input type="email" id="email" value={state.email} onChange={(e) => handleFieldChange('email', e.target.value)} className="register-input" placeholder="Ingresa tu email" />
          </div>
          <div className="register-form-group">
            <label htmlFor="birthDate" className="register-label">Fecha de nacimiento:</label>
            <input type="date" id="birthDate" value={state.birthDate} onChange={(e) => handleFieldChange('birthDate', e.target.value)} className="register-input" />
          </div>
          <div className="register-form-group">
            <label htmlFor="password" className="register-label">Contraseña:</label>
            <input type="password" id="password" value={state.password} onChange={(e) => handleFieldChange('password', e.target.value)} className="register-input" placeholder="Ingresa tu contraseña" />
          </div>
          <div className="register-form-group">
            <label htmlFor="confirmPassword" className="register-label">Confirmar contraseña:</label>
            <input type="password" id="confirmPassword" value={state.confirmPassword} onChange={(e) => handleFieldChange('confirmPassword', e.target.value)} className="register-input" placeholder="Confirma tu contraseña" />
          </div>
          <div className="captcha-container">
            <ReCAPTCHA
              sitekey="6LfEeKIrAAAAAOtnJGyIq4LpZC2Zw1kIVr1BLOLa"
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>
          <button type="submit" className="register-button">Registrarse</button>
        </form>
        <div className="register-login-link">
          ¿Ya tienes una cuenta? <Link to="/login" className="register-link">Inicia sesión aquí</Link>
        </div>
        <div className="back">
          <button type="button" className="back-to-login-btn" onClick={() => navigate('/')}>Volver</button>
        </div>   
      </div>
    </div>
  );
};

export default Register;
