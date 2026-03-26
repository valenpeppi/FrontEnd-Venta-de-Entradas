import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '@/hooks/useMessage';
import { AuthService } from '@/services/AuthService';
import ReCAPTCHA from 'react-google-recaptcha';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import AuthLayout from '@/shared/components/AuthLayout';
import PasswordStrengthBar from '@/shared/components/PasswordStrengthBar';
import styles from '@/pages/auth/register/styles/RegisterCompany.module.css';
import type { RegisterCompanyProps } from '@/types/auth';

const RegisterCompany: React.FC<RegisterCompanyProps> = ({ onRegisterSuccess }) => {
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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { clearMessages } = useMessage();

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const labelMap: Record<keyof typeof formData, string> = {
    companyName: 'Razón Social',
    cuil: 'CUIL',
    contactEmail: 'Email de Contacto',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    phone: 'Teléfono',
    address: 'Dirección',
  };

  const validate = (name: string, value: string, currentFormData: typeof formData) => {
    let errorMsg = '';
    switch (name) {
      case 'companyName':
        if (!value) errorMsg = 'La Razón Social es requerida.';
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
        else if (value.length < 8) errorMsg = 'La contraseña debe tener al menos 8 caracteres.';
        else if (!/[a-z]/.test(value)) errorMsg = 'Debe incluir minúsculas.';
        else if (!/[A-Z]/.test(value)) errorMsg = 'Debe incluir mayúsculas.';
        else if (!/\d/.test(value)) errorMsg = 'Debe incluir números.';
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

    if (import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaValue) {
      setServerError('Por favor, verifica que no eres un robot.');
      return;
    }

    const hasErrors = Object.values(errors).some(error => error);
    const isFormIncomplete = Object.values(formData).some(value => !value);

    if (hasErrors || isFormIncomplete) {
      setServerError('Por favor, completa todos los campos correctamente.');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.registerCompany({
        ...formData,
        captchaToken: captchaValue,
      });

      setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
      setTimeout(() => {
        onRegisterSuccess();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Error al registrar la empresa.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Registrar Empresa"
      footerText="¿Ya tienes una cuenta?"
      footerLinkText="Inicia sesión aquí"
      footerLinkTo="/login"
      backButton
    >
      {serverError && <div className={styles.registerErrorMessage}>{serverError}</div>}
      {successMessage && <div className={styles.registerSuccessMessage}>{successMessage}</div>}

      <form onSubmit={handleSubmit} className={styles.registerForm} noValidate>
        {Object.keys(formData).map(key => {
          const fieldKey = key as keyof typeof formData;
          const label = labelMap[fieldKey];
          return (
            <div key={fieldKey}>
              <Input
                id={`register-${fieldKey}`}
                name={fieldKey}
                type={fieldKey.toLowerCase().includes('password') ? 'password' : 'text'}
                label={label || fieldKey}
                value={formData[fieldKey]}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors[fieldKey] || undefined}
                touched={touched[fieldKey]}
                placeholder={`Ingresa ${label ? label.toLowerCase() : fieldKey}`}
                required
              />
              {fieldKey === 'password' && formData.password && (
                <PasswordStrengthBar password={formData.password} />
              )}
            </div>
          )
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
          Registrar Empresa
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterCompany;



