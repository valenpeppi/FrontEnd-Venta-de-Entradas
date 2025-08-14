import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMessage } from '../../shared/context/MessageContext';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './styles/RegisterCompany.module.css';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const RegisterCompany: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [company_name, setCompanyName] = useState<string>('');
  const [cuil, setCuil] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const navigate = useNavigate();
  const { clearMessages } = useMessage();

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!captchaValue) {
      setError('Por favor, verifica que no eres un robot.');
      return;
    }

    if (!company_name || !contactEmail || !password || !confirmPassword || !phone || !address) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      setError('Por favor, introduce un email válido.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/auth/register-company', {
        company_name,
        cuil,
        contactEmail,
        password,
        phone,
        address,
        captchaToken: captchaValue,
      });

      setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
      setTimeout(() => {
        onRegisterSuccess();
        navigate('/logincompany');
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.message || 'Error al registrar la empresa.';
        setError(errorMessage);
      } else {
        setError('Error de red o del servidor.');
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h2 className={styles.registerTitle}>Registrar Empresa</h2>
        {error && <div className={styles.registerErrorMessage}>{error}</div>}
        {successMessage && <div className={styles.registerSuccessMessage}>{successMessage}</div>}
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <div className={styles.registerFormGroup}>
            <label htmlFor="register-companyName" className={styles.registerLabel}>Nombre de la Empresa</label>
            <input type="text" id="register-companyName" className={styles.registerInput} value={company_name} onChange={(e) => setCompanyName(e.target.value)} required />
          </div>
          <div className={styles.registerFormGroup}>
            <label htmlFor="register-CUIL" className={styles.registerLabel}>CUIL</label>
            <input type="text" id="register-CUIL" className={styles.registerInput} value={cuil} onChange={(e) => setCuil(e.target.value)} />
          </div>
          <div className={styles.registerFormGroup}>
            <label htmlFor="register-email" className={styles.registerLabel}>Email de Contacto</label>
            <input type="email" id="register-email" className={styles.registerInput} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
          </div>
          <div className={styles.registerFormGroup}>
            <label htmlFor="register-phone" className={styles.registerLabel}>Teléfono</label>
            <input type="text" id="register-phone" className={styles.registerInput} value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className={styles.registerFormGroup}>
            <label htmlFor="register-address" className={styles.registerLabel}>Dirección</label>
            <input type="text" id="register-address" className={styles.registerInput} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div className={styles.registerFormGroup}>
            <label htmlFor="register-password" className={styles.registerLabel}>Contraseña</label>
            <input type="password" id="register-password" className={styles.registerInput} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.registerFormGroup}>
            <label htmlFor="confirm-password" className={styles.registerLabel}>Confirmar Contraseña</label>
            <input type="password" id="confirm-password" className={styles.registerInput} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <div className={styles.captchaContainer}>
            <ReCAPTCHA
              sitekey="6LfEeKIrAAAAAOtnJGyIq4LpZC2Zw1kIVr1BLOLa"
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>

          <button type="submit" className={styles.registerButton}>
            Registrar Empresa
          </button>
          <div className={styles.registerLoginLink}>
            ¿Ya tienes una cuenta de organizador?{' '}
            <Link to="/logincompany" className={styles.registerLink}>
              Inicia sesión aquí
            </Link>
          </div>
        </form>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Volver</button>
      </div>
    </div>
  );
};

export default RegisterCompany;
