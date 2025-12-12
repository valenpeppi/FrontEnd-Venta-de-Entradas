import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/shared/components/styles/AuthLayout.module.css';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    footerText?: string;
    footerLinkText?: string;
    footerLinkTo?: string;
    backButton?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    footerText,
    footerLinkText,
    footerLinkTo,
    backButton = false
}) => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>{title}</h2>

                {children}

                {(footerText || (backButton && !footerLinkTo)) && (
                    <div className={styles.footer}>
                        {footerText && footerLinkTo && footerLinkText && (
                            <div className={styles.linkWrapper}>
                                {footerText}{' '}
                                <Link to={footerLinkTo} className={styles.link}>
                                    {footerLinkText}
                                </Link>
                            </div>
                        )}

                        {backButton && (
                            <div className={styles.backWrapper}>
                                <Link to="/" className={styles.backButton}>
                                    Volver
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthLayout;
