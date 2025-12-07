import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMessage } from '../../../shared/context/MessageContext';
import { AuthService } from '../../../services/AuthService';
import styles from './styles/LoginCompany.module.css';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';


import type { LoginCompanyProps } from '../../../types/auth';

const LoginCompany: React.FC<LoginCompanyProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ contactEmail: '', password: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { clearMessages } = useMessage();

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const validate = (name: string, value: string) => {
    let errorMsg = '';
    switch (name) {
      case 'contactEmail':
        if (!value) errorMsg = 'El email es requerido.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Email inválido.';
        break;
      case 'password':
        if (!value) errorMsg = 'La contraseña es requerida.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validate(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validate(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    Object.keys(formData).forEach(name => validate(name, formData[name as keyof typeof formData]));

    const hasErrors = Object.values(errors).some(error => error);
    const isFormIncomplete = Object.values(formData).some(value => !value);

    if (hasErrors || isFormIncomplete) {
      setServerError('Por favor, corrige los errores antes de continuar.');
      return;
    }


    try {
      const data = await AuthService.loginCompany({
        contactEmail: formData.contactEmail,
        password: formData.password,
      });

      onLoginSuccess(data.company, data.token);
    } catch (err: any) {
      console.error('Error en login de organizador:', err);
      const errorMessage = err?.response?.data?.message || 'Email o contraseña de organizador incorrectos.';
      setServerError(errorMessage);
    }
  };

  return (
    <div className={styles.loginCompanyRoot}>
      <div className={styles.loginCompanyCard}>
        <h2 className={styles.loginCompanyTitle}>Iniciar Sesión como Organizador</h2>
        {serverError && <div className={styles.loginCompanyErrorMessage}>{serverError}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.loginCompanyField}>
            <label htmlFor="contactEmail" className={styles.loginCompanyLabel}>
              Email
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                className={`${styles.loginCompanyInput} ${touched.contactEmail && (errors.contactEmail ? styles.inputError : styles.inputSuccess)}`}
                value={formData.contactEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.contactEmail && (
                <div className={styles.validationIcon}>
                  {errors.contactEmail ? <FaExclamationCircle color="red" /> : <FaCheckCircle color="green" />}
                </div>
              )}
            </div>
            {touched.contactEmail && errors.contactEmail && <span className={styles.errorMessage}>{errors.contactEmail}</span>}
          </div>
          <div className={styles.loginCompanyFieldPassword}>
            <label htmlFor="password" className={styles.loginCompanyLabel}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                id="password"
                name="password"
                className={`${styles.loginCompanyInputPassword} ${touched.password && (errors.password ? styles.inputError : styles.inputSuccess)}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {touched.password && (
                <div className={styles.validationIcon}>
                  {errors.password ? <FaExclamationCircle color="red" /> : <FaCheckCircle color="green" />}
                </div>
              )}
            </div>
            {touched.password && errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
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


