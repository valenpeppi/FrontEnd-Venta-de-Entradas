import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMessage } from '../context/MessageContext';
import './LoginCompany.css'; 

interface LoginCompanyProps {
  onLoginSuccess: (companyName: string) => void;
}

const LoginCompany: React.FC<LoginCompanyProps> = ({ onLoginSuccess }) => {
  const [contact_email, setcontact_email] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { clearMessages } = useMessage();

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/auth/companylogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Email o contraseña de organizador incorrectos.');
        return;
      }

      const data = await response.json();

      onLoginSuccess(data.companyName || contact_email);
      navigate('/admin');
    } catch (err) {
      console.error('Error en login de organizador:', err);
      setError('Error de red o del servidor.');
    }
  };

  return (
    <div className="login-company-root">
      <div className="login-company-card">
        <h2 className="login-company-title">Iniciar Sesión como Organizador</h2>
        {error && <div className="login-company-error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="login-company-field">
            <label htmlFor="email" className="login-company-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="login-company-input"
              value={contact_email}
              onChange={(e) => setcontact_email(e.target.value)}
              required
            />
          </div>
          <div className="login-company-field-password">
            <label htmlFor="password" className="login-company-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="login-company-input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="login-company-btn-submit"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="login-company-register-link">
          <p>¿No tienes cuenta de organizador? <Link to="/registercompany" className="login-company-register-link-btn">Regístrate aquí</Link></p>
        </div>
        <button onClick={() => navigate(-1)} className="back-button">Volver</button>
      </div>
    </div>
  );
};

export default LoginCompany;
