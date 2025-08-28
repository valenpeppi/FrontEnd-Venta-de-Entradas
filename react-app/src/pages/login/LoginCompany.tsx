import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMessage } from '../../shared/context/MessageContext';
import axios from 'axios';
import styles from './styles/LoginCompany.module.css'; 

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
      const response = await axios.post('http://localhost:3000/api/auth/login-company', {
        contact_email,
        password,
      });

      const data = response.data;
      onLoginSuccess(data.companyName || data.contact_email);
      navigate('/create-event');
    } catch (err) {
      console.error('Error en login de organizador:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.message || 'Email o contraseña de organizador incorrectos.';
        setError(errorMessage);
      } else {
        setError('Error de red o del servidor.');
      }
    }
  };

  return (
    <div className={styles.loginCompanyRoot}>
      <div className={styles.loginCompanyCard}>
        <h2 className={styles.loginCompanyTitle}>Iniciar Sesión como Organizador</h2>
        {error && <div className={styles.loginCompanyErrorMessage}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.loginCompanyField}>
            <label htmlFor="email" className={styles.loginCompanyLabel}>
              Email
            </label>
            <input
              type="email"
              id="email"
              className={styles.loginCompanyInput}
              value={contact_email}
              onChange={(e) => setcontact_email(e.target.value)}
              required
            />
          </div>
          <div className={styles.loginCompanyFieldPassword}>
            <label htmlFor="password" className={styles.loginCompanyLabel}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className={styles.loginCompanyInputPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={styles.loginCompanyBtnSubmit}
          >
            Iniciar Sesión
          </button>
        </form>
        <div className={styles.loginCompanyRegisterLink}>
          <p>¿No tienes cuenta de organizador? <Link to="/registercompany" className={styles.loginCompanyRegisterLinkBtn}>Regístrate aquí</Link></p>
        </div>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Volver</button>
      </div>
    </div>
  );
};

export default LoginCompany;
