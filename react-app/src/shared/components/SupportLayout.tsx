import React, { type ReactNode } from 'react';
import styles from './styles/SupportLayout.module.css';

interface SupportLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

const SupportLayout: React.FC<SupportLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                <div className={styles.contentCard}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SupportLayout;
