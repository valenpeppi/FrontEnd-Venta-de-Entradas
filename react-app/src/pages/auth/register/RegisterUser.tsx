import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from "@/services/AuthService";
import ReCAPTCHA from 'react-google-recaptcha';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import AuthLayout from '@/shared/components/AuthLayout';
import styles from '@/pages/auth/register/styles/RegisterUser.module.css';

import type { RegisterUserProps } from '@/types/auth';

const Register: React.FC<RegisterUserProps> = ({ onRegisterSuccess }) => {
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
  const [isLoading, setIsLoading] = useState(false);

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

    if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaValue) {
      setServerError('Por favor, verifica que no eres un robot.');
      return;
    }

    setIsLoading(true);
    const nameParts = formData.fullName.trim().split(' ');
    const name = nameParts.length > 1 ? nameParts[0] : formData.fullName;
    const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    try {
      await AuthService.registerUser({
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
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Error de red o del servidor.';
      setServerError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
    <AuthLayout
      title="Registrarse"
      footerText="¿Ya tienes una cuenta?"
      footerLinkText="Inicia sesión aquí"
      footerLinkTo="/login"
      backButton
    >
      {serverError && <div className={styles.registerErrorMessage}>{serverError}</div>}
      {successMessage && <div className={styles.registerSuccessMessage}>{successMessage}</div>}

      <form onSubmit={handleSubmit} className={styles.registerForm}>
        {Object.keys(formData).map(key => {
          const fieldName = key as keyof typeof formData;
          const label = labelMap[fieldName];
          return (
            <Input
              key={fieldName}
              id={fieldName}
              name={fieldName}
              type={getInputType(fieldName)}
              label={label || fieldName}
              value={formData[fieldName]}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors[fieldName]}
              touched={touched[fieldName]}
              placeholder={`Ingresa tu ${(label || fieldName).toLowerCase()}`}
            />
          );
        })}

        <div className={styles.captchaContainer}>
          {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? (
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(value) => setCaptchaValue(value)}
            />
          ) : (
            <p className={styles.captchaWarning}>
              ⚠ ReCAPTCHA no configurado (modo desarrollo)
            </p>
          )}
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          Registrarse
        </Button>
      </form>

      <div className={styles.registerLoginLink} style={{ marginTop: '10px' }}>
      </div>
    </AuthLayout>
  );
};

export default Register;



