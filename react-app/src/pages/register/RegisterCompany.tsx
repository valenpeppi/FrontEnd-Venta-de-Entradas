import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMessage } from '../../shared/context/MessageContext';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './styles/RegisterCompany.module.css';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const RegisterCompany: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    cuil: '',
    contactEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const navigate = useNavigate();
  const { clearMessages } = useMessage();

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const validate = (name: string, value: string, currentFormData: typeof formData) => {
    let errorMsg = '';
    switch (name) {
      case 'companyName':
        if (!value) errorMsg = 'El nombre de la empresa es requerido.';
        break;
      case 'cuil':
        if (!value) errorMsg = 'El CUIL es requerido.';
        else if (!/^\d{2}-\d{8}-\d{1}$/.test(value)) errorMsg = 'Formato de CUIL inválido (XX-XXXXXXXX-X).';
        break;
      case 'contactEmail':
        if (!value) errorMsg = 'El email es requerido.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Email inválido.';
        break;
      case 'password':
        if (!value) errorMsg = 'La contraseña es requerida.';
        else if (value.length < 4) errorMsg = 'La contraseña debe tener al menos 4 caracteres.';
        break;
      case 'confirmPassword':
        if (!value) errorMsg = 'Debes confirmar la contraseña.';
        else if (value !== currentFormData.password) errorMsg = 'Las contraseñas no coinciden.';
        break;
      case 'phone':
        if (!value) errorMsg = 'El teléfono es requerido.';
        break;
      case 'address':
        if (!value) errorMsg = 'La dirección es requerida.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    if (touched[name]) {
      validate(name, value, newFormData);
    }
    // Re-validate confirmPassword if password changes
    if (name === 'password' && touched.confirmPassword) {
      validate('confirmPassword', formData.confirmPassword, newFormData);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validate(name, value, formData);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    
    setTouched({
      companyName: true, cuil: true, contactEmail: true, password: true,
      confirmPassword: true, phone: true, address: true
    });

    Object.keys(formData).forEach(key => {
        validate(key, formData[key as keyof typeof formData], formData);
    });


    if (!captchaValue) {
      setServerError('Por favor, verifica que no eres un robot.');
      return;
    }

    const hasErrors = Object.values(errors).some(error => error);
    const isFormIncomplete = Object.values(formData).some(value => !value);
    
    if (hasErrors || isFormIncomplete) {
      setServerError('Por favor, completa todos los campos correctamente.');
      return;
    }


    try {
      await axios.post('http://localhost:3000/api/auth/register-company', {
        ...formData,
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
        setServerError(errorMessage);
      } else {
        setServerError('Error de red o del servidor.');
      }
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h2 className={styles.registerTitle}>Registrar Empresa</h2>
        {serverError && <div className={styles.registerErrorMessage}>{serverError}</div>}
        {successMessage && <div className={styles.registerSuccessMessage}>{successMessage}</div>}
        <form onSubmit={handleSubmit} className={styles.registerForm} noValidate>
          {Object.keys(formData).map(key => {
             const fieldKey = key as keyof typeof formData;
             return (
              <div className={styles.registerFormGroup} key={fieldKey}>
                <label htmlFor={`register-${fieldKey}`} className={styles.registerLabel}>
                  {fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <div className={styles.inputWrapper}>
                  <input 
                    type={fieldKey.includes('password') ? 'password' : 'text'}
                    id={`register-${fieldKey}`} 
                    name={fieldKey}
                    className={`${styles.registerInput} ${touched[fieldKey] && (errors[fieldKey] ? styles.inputError : styles.inputSuccess)}`}
                    value={formData[fieldKey]} 
                    onChange={handleChange} 
                    onBlur={handleBlur}
                    required 
                  />
                  {touched[fieldKey] && (
                    <div className={styles.validationIcon}>
                      {errors[fieldKey] ? <FaExclamationCircle color="red" /> : <FaCheckCircle color="green" />}
                    </div>
                  )}
                </div>
                {touched[fieldKey] && errors[fieldKey] && <span className={styles.errorMessage}>{errors[fieldKey]}</span>}
              </div>
             )
          })}

          <div className={styles.captchaContainer}>
            <ReCAPTCHA
              sitekey="6LeIxAcpAAAAAMa2v_VTK-5A9jkyPLsESKVz_de-" // Clave de prueba para localhost
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
