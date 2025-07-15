import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Importa el nuevo archivo CSS

interface RegisterProps {
  onRegisterSuccess: () => void; 
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [dni, setDni] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>(''); // Para la fecha de nacimiento
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validaciones
    if (!dni || !fullName || !email || !password || !confirmPassword || !birthDate) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, introduce un email válido.');
      return;
    }

    // Aquí iría la lógica para registrar el usuario en la base de datos
    console.log('Intentando registrar usuario con los siguientes datos:', {
      dni,
      fullName,
      email,
      password, // En una aplicación real, nunca envíes la contraseña en texto plano
      birthDate,
    });

    setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
    setTimeout(() => {
      onRegisterSuccess();
      navigate('/login'); // Redirigir a la página de login después del registro
    }, 2000); 
  };

  return (
    <div className="register-container"> {/* Clase CSS para el contenedor principal */}
      <div className="register-card"> {/* Clase CSS para la tarjeta del formulario */}
        <h2 className="register-title">Registrarse</h2> {/* Clase CSS para el título */}
        {error && (
          <div className="register-error-message"> {/* Clase CSS para mensajes de error */}
            {error}
          </div>
        )}
        {successMessage && (
          <div className="register-success-message"> {/* Clase CSS para mensajes de éxito */}
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="register-form-grid"> {/* Clase CSS para la cuadrícula de campos */}
            {/* DNI */}
            <div className="register-field-col-span"> {/* Clase CSS para el contenedor de cada campo */}
              <label htmlFor="register-dni" className="register-label">DNI:</label> {/* Clase CSS para la etiqueta */}
              <input
                type="text"
                id="register-dni"
                className="register-input" /* Clase CSS para el input */
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
            </div>
            {/* Nombre y Apellido */}
            <div className="register-field-col-span">
              <label htmlFor="register-fullName" className="register-label">Nombre y Apellido:</label>
              <input
                type="text"
                id="register-fullName"
                className="register-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            {/* Email */}
            <div className="register-field-col-span">
              <label htmlFor="register-email" className="register-label">Email:</label>
              <input
                type="email"
                id="register-email"
                className="register-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {/* Fecha de Nacimiento */}
            <div className="register-field-col-span">
              <label htmlFor="register-birthDate" className="register-label">Fecha de Nacimiento:</label>
              <input
                type="date"
                id="register-birthDate"
                className="register-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </div>
            {/* Contraseña */}
            <div className="register-field-col-span">
              <label htmlFor="register-password" className="register-label">Contraseña:</label>
              <input
                type="password"
                id="register-password"
                className="register-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* Confirmar Contraseña */}
            <div className="register-field-col-span">
              <label htmlFor="confirm-password" className="register-label">Confirmar Contraseña:</label>
              <input
                type="password"
                id="confirm-password"
                className="register-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="register-submit-btn" /* Clase CSS para el botón de enviar */
          >
            Registrarse
          </button>
          <div className="register-login-link-container"> {/* Clase CSS para el contenedor del enlace */}
            <p className="register-login-link-text"> {/* Clase CSS para el texto */}
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="register-login-link"> {/* Clase CSS para el enlace */}
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
