import React, { useState } from 'react';
import styles from './styles/Input.module.css';
import { FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    touched?: boolean;
    containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    touched,
    type = 'text',
    id,
    className,
    containerClassName,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`${styles.inputGroup} ${containerClassName || ''}`}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <div className={styles.inputWrapper}>
                <input
                    id={id}
                    type={inputType}
                    className={`${styles.input} ${touched ? (error ? styles.inputError : styles.inputSuccess) : ''
                        } ${className || ''}`}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}

                {touched && !isPassword && (
                    <div className={styles.validationIcon}>
                        {error ? (
                            <FaExclamationCircle className={styles.iconError} />
                        ) : (
                            <FaCheckCircle className={styles.iconSuccess} />
                        )}
                    </div>
                )}
            </div>
            {touched && error && <div className={styles.errorMessage}>{error}</div>}
        </div>
    );
};

export default Input;
