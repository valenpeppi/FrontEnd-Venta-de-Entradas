import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface RegisterProps {
  onRegisterSuccess: () => void; 
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validaciones
    if (!email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Aquí iría la lógica para registrar el usuario en la base de datos
    // Por ahora, realizamos una simulación de éxito inmediato
    console.log('Intentando registrar usuario:', { email, password });

    setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
    setTimeout(() => {
      onRegisterSuccess();
      navigate('/login'); // Redirigir a la página de login después del registro
    }, 2000); // Redirige después de 2 segundos para que el usuario vea el mensaje
  };

  return (
    <div className="register-root">
      <div className="register-card">
        <h2 className="register-title">Registrarse</h2>
        {error && (
          <div className="register-error-message">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="register-success-message">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="register-field">
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
          <div className="register-field">
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
          <div className="register-field">
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
          <button
            type="submit"
            className="register-btn-submit"
          >
            Registrarse
          </button>
          <div className="register-login-link-row">
            <p className="register-login-link-text">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="register-login-link-btn">
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
