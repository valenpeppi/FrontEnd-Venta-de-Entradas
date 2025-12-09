import React from 'react';
import styles from '@/shared/components/styles/Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
    fullWidth?: boolean;
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    isLoading = false,
    className,
    disabled,
    ...props
}) => {
    const buttonClass = `
    ${styles.button}
    ${styles[variant]}
    ${fullWidth ? styles.fullWidth : ''}
    ${className || ''}
  `;

    return (
        <button
            className={buttonClass}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className={styles.loader}></span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
