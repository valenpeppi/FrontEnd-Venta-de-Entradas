import styles from '@/shared/layout/styles/GradientText.module.css';
import type { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
}

export default function GradientText({ children }: GradientTextProps) {
  return <span className={styles.gradientText}>{children}</span>;
}
