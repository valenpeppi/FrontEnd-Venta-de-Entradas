import React from 'react';
import styles from '@/shared/components/styles/Button.module.css';
import type { ButtonProps } from '@/types/common';
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
