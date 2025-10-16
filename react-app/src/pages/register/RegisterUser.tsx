import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './styles/RegisterUser.module.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    dni: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
  });
  
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof formData, boolean>>>({});
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const validateField = (name: keyof typeof formData, value: string) => {
    let errorMsg = '';
    switch (name) {
      case 'dni':
        if (!/^\d{7,8}$/.test(value)) errorMsg = 'El DNI debe tener 7 u 8 dígitos.';
        break;
      case 'fullName':
        if (value.trim().split(' ').length < 2) errorMsg = 'Ingresa nombre y apellido.';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = 'Email inválido.';
        break;
      case 'password':
        if (value.length < 4) errorMsg = 'La contraseña debe tener al menos 4 caracteres.';
        break;
      case 'confirmPassword':
        if (value !== formData.password) errorMsg = 'Las contraseñas no coinciden.';
        break;
      case 'birthDate':
        if (!value) errorMsg = 'La fecha es obligatoria.';
        else if (new Date(value) > new Date()) errorMsg = 'La fecha no puede ser futura.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg || undefined }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData, value: string };
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof typeof formData, value: string };
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    const formKeys = Object.keys(formData) as (keyof typeof formData)[];
    formKeys.forEach(fieldName => {
      validateField(fieldName, formData[fieldName]);
    });
    
    const hasErrors = formKeys.some(key => {
        let errorMsg = '';
        const value = formData[key];
        switch (key) {
            case 'dni': if (!/^\d{7,8}$/.test(value)) errorMsg = '..'; break;
            case 'fullName': if (value.trim().split(' ').length < 2) errorMsg = '..'; break;
            case 'email': if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = '..'; break;
            case 'password': if (value.length < 4) errorMsg = '..'; break;
            case 'confirmPassword': if (value !== formData.password) errorMsg = '..'; break;
            case 'birthDate': if (!value || new Date(value) > new Date()) errorMsg = '..'; break;
        }
        return !!errorMsg;
    });

    if (hasErrors || Object.values(formData).some(val => val === '')) {
      setServerError('Por favor, corrige los errores antes de continuar.');
      return;
    }
    
    if (!captchaValue) {
      setServerError('Por favor, verifica que no eres un robot.');
      return;
    }

    const nameParts = formData.fullName.trim().split(' ');
    const name = nameParts.length > 1 ? nameParts[0] : formData.fullName;
    const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    try {
      await axios.post(`http://localhost:3000/api/auth/register`, {
        dni: formData.dni,
        name,
        surname,
        mail: formData.email,
        password: formData.password,
        birthDate: formData.birthDate,
        captchaToken: captchaValue,
      });

      setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
      setTimeout(() => {
        onRegisterSuccess();
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || 'Error de red o del servidor.';
        setServerError(errorMsg);
      } else {
        setServerError('Ocurrió un error inesperado.');
      }
    }
  };

  const getInputClass = (field: keyof typeof formData) => {
    if (!touched[field]) return styles.registerInput;
    return errors[field] ? `${styles.registerInput} ${styles.invalid}` : `${styles.registerInput} ${styles.valid}`;
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h2 className={styles.registerTitle}>Registrarse</h2>
        {serverError && <div className={styles.registerErrorMessage}>{serverError}</div>}
        {successMessage && <div className={styles.registerSuccessMessage}>{successMessage}</div>}
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {Object.keys(formData).map(key => {
              const fieldName = key as keyof typeof formData;
              const labelMap: Record<keyof typeof formData, string> = {
                dni: 'DNI',
                fullName: 'Nombre completo',
                email: 'Email',
                birthDate: 'Fecha de nacimiento',
                password: 'Contraseña',
                confirmPassword: 'Confirmar contraseña',
              };
              
              const getInputType = (field: keyof typeof formData) => {
                if (field.toLowerCase().includes('password')) return 'password';
                if (field === 'email') return 'email';
                if (field === 'birthDate') return 'date';
                return 'text';
              };

              return (
                <div className={styles.registerFormGroup} key={fieldName}>
                  <label htmlFor={fieldName} className={styles.registerLabel}>{labelMap[fieldName]}:</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={getInputType(fieldName)}
                      id={fieldName}
                      name={fieldName}
                      value={formData[fieldName]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getInputClass(fieldName)}
                      placeholder={`Ingresa tu ${labelMap[fieldName].toLowerCase()}`}
                    />
                    {touched[fieldName] && (
                      errors[fieldName] 
                        ? <FaTimesCircle className={`${styles.inputIcon} ${styles.invalidIcon}`} />
                        : <FaCheckCircle className={`${styles.inputIcon} ${styles.validIcon}`} />
                    )}
                  </div>
                  {touched[fieldName] && errors[fieldName] && <span className={styles.errorMessage}>{errors[fieldName]}</span>}
                </div>
              );
          })}
          
          <div className={styles.captchaContainer}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>
          <button type="submit" className={styles.registerButton}>Registrarse</button>
        </form>
        <div className={styles.registerLoginLink}>
          ¿Ya tienes una cuenta? <Link to="/login" className={styles.registerLink}>Inicia sesión aquí</Link>
        </div>
        <div className={styles.back}>
          <button type="button" className={styles.backToLoginBtn} onClick={() => navigate('/')}>Volver</button>
        </div>  
      </div>
    </div>
  );
};

export default Register;

