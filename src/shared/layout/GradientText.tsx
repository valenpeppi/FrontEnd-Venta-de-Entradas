import styles from '@/shared/layout/styles/GradientText.module.css';
import type { GradientTextProps } from '@/types/common';


export default function GradientText({ children }: GradientTextProps) {
  return <span className={styles.gradientText}>{children}</span>;
}
