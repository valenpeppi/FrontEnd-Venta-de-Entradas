import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../../services/AuthService';
import { useMessage } from '../../../shared/context/MessageContext';
import MessageDisplay from '../../../shared/MessageDisplay';
import styles from './styles/LoginPage.module.css';
import globalStyles from '../../../shared/styles/GlobalStyles.module.css';
import { FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";

interface LoginPageProps {
    onLoginSuccess: (userHelper: any, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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

        setLoading(true);
        try {
            const response = await AuthService.login({
                email: formData.email,
                password: formData.password,
            });

            // response: { token, user: { ... } }
            onLoginSuccess(response.user, response.token);

            // Redirection logic is handled by parent (App.tsx) mostly, usually Login component doesn't redirect if prop is passed?
            // Wait, LoginUser.tsx did navigate.
            // App.tsx passes `onLoginSuccess` which handles navigation. 
            // In LoginUser.tsx line 79 it did navigate as well.
            // Let's rely on the callback `onLoginSuccess` (handled in App.tsx) to avoid double navigation or conflicts.
            // But if onLoginSuccess is void, I might need to if the App wrapper doesn't do it?
            // Reviewing App.tsx: explicit navigate calls are inside handleLoginSuccess/handleCompanyLoginSuccess.
            // So we don't need to navigate here.

        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || "Error al iniciar sesión.";
            setServerError(message);
        } finally {
            setLoading(false);
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
                                    autoFocus
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
                                    type={showPassword ? "text" : "password"}
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
                                <button
                                    type="button"
                                    className={styles.loginPasswordToggle}
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <i>{showPassword ? <FaEyeSlash /> : <FaEye />}</i>
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <span className={styles.errorMessage}>{errors.password}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={`${styles.loginBtnSubmit} ${globalStyles.glowBtnInverse}`}
                            disabled={loading}
                        >
                            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className={styles.loginRegisterLink}>
                        ¿No tenés una cuenta?{" "}
                        <Link to="/register" className={styles.loginLink}>
                            Registrate aquí
                        </Link>
                        <br />
                        ¿Sos organizador?{" "}
                        <Link to="/registercompany" className={styles.loginLink}>
                            Creá tu cuenta
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

export default LoginPage;
