import React from 'react';
import { useRegisterUser } from '@/hooks/useRegisterUser';
import ReCAPTCHA from 'react-google-recaptcha';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import AuthLayout from '@/shared/components/AuthLayout';
import PasswordStrengthBar from '@/shared/components/PasswordStrengthBar';
import styles from '@/pages/auth/register/styles/RegisterUser.module.css';
import type { RegisterUserProps } from '@/types/auth';

const Register: React.FC<RegisterUserProps> = ({ onRegisterSuccess }) => {
  const {
    formData,
    errors,
    touched,
    serverError,
    successMessage,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    setCaptchaValue,
    labelMap,
    getInputType,
    showCaptcha
  } = useRegisterUser(onRegisterSuccess);

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
            <div key={fieldName}>
              <Input
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
              {fieldName === 'password' && formData.password && (
                <PasswordStrengthBar password={formData.password} />
              )}
            </div>
          );
        })}

        <div className={styles.captchaContainer}>
          {showCaptcha ? (
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



