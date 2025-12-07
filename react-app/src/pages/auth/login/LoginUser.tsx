import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMessage } from '../../../shared/context/MessageContext';
import { AuthService } from '../../../services/AuthService';
import MessageDisplay from '../../../shared/MessageDisplay';
import styles from "./styles/LoginUser.module.css";
import globalStyles from '../../../shared/styles/GlobalStyles.module.css';
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import type { LoginProps } from '../../../types/auth';

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { messages, clearMessages } = useMessage();

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const validate = (name: string, value: string) => {
    let errorMsg = "";
    switch (name) {
      case "email":
        if (!value) errorMsg = "El email es requerido.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          errorMsg = "Email inválido.";
        break;
      case "password":
        if (!value) errorMsg = "La contraseña es requerida.";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validate(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    Object.keys(formData).forEach((name) =>
      validate(name, formData[name as keyof typeof formData])
    );

    const hasErrors = Object.values(errors).some((error) => error);
    const isFormIncomplete = Object.values(formData).some((v) => !v);

    if (hasErrors || isFormIncomplete) {
      setServerError("Por favor, corrige los errores antes de continuar.");
      return;
    }

    try {
      const data = await AuthService.login({
        mail: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLoginSuccess(data.user, data.token);

      if (data.user?.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error de red o del servidor.";
      setServerError(message);
    }
  };

  return (
    <>
      {messages.map((m) => (
        <MessageDisplay key={m.id} message={m.text} type={m.type} />
      ))}
      <div className={styles.loginRoot}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Iniciar Sesión</h2>
          {serverError && (
            <div className={styles.loginErrorMessage}>{serverError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.loginField}>
              <label htmlFor="email" className={styles.loginLabel}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`${styles.loginInput} ${touched.email
                    ? errors.email
                      ? styles.inputError
                      : styles.inputSuccess
                    : ""
                    }`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.email && (
                  <div className={styles.validationIcon}>
                    {errors.email ? (
                      <FaExclamationCircle color="red" />
                    ) : (
                      <FaCheckCircle color="green" />
                    )}
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.loginFieldPassword}>
              <label htmlFor="password" className={styles.loginLabel}>
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`${styles.loginInputPassword} ${touched.password
                    ? errors.password
                      ? styles.inputError
                      : styles.inputSuccess
                    : ""
                    }`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                {touched.password && (
                  <div className={styles.validationIcon}>
                    {errors.password ? (
                      <FaExclamationCircle color="red" />
                    ) : (
                      <FaCheckCircle color="green" />
                    )}
                  </div>
                )}
              </div>
              {touched.password && errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className={`${styles.loginBtnSubmit} ${globalStyles.glowBtnInverse}`}
            >
              Iniciar Sesión
            </button>
          </form>

          <div className={styles.loginRegisterLink}>
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className={styles.loginLink}>
              Regístrate aquí
            </Link>
          </div>

          <div className={styles.loginForgotPasswordLink}>
            <Link to="/forgot-password" className={styles.loginLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className={styles.back}>
            <button
              type="button"
              className={`${styles.backToLoginBtn} ${globalStyles.littleGlowBtn}`}
              onClick={() => navigate("/")}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;


