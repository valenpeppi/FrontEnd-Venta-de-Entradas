import React, { useState, useEffect } from 'react';
import styles from './styles/PasswordStrengthBar.module.css';
import type { PasswordStrengthBarProps, PasswordEvaluation } from '@/types/common';


const evaluatePasswordStrength = (pwd: string): PasswordEvaluation => {
  let score = 0;
  const feedback: string[] = [];

  if (!pwd) {
    return { strength: 'weak', score: 0, feedback: ['La contraseña no puede estar vacía'] };
  }


  if (pwd.length >= 8) {
    score += 30;
  } else {
    feedback.push(`Mínimo 8 caracteres (${pwd.length}/8)`);
  }


  if (/[a-z]/.test(pwd)) {
    score += 20;
  } else {
    feedback.push('Incluye minúsculas (a-z)');
  }


  if (/[A-Z]/.test(pwd)) {
    score += 20;
  } else {
    feedback.push('Incluye mayúsculas (A-Z)');
  }


  if (/\d/.test(pwd)) {
    score += 15;
  } else {
    feedback.push('Incluye números (0-9)');
  }


  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
    score += 15;
  }


  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 70) {
    strength = 'strong';
  } else if (score >= 50) {
    strength = 'medium';
  }

  return { strength, score, feedback };
};

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const [evaluation, setEvaluation] = useState<PasswordEvaluation | null>(null);

  useEffect(() => {
    if (!password) {
      setEvaluation(null);
      return;
    }


    const result = evaluatePasswordStrength(password);
    setEvaluation(result);
  }, [password]);

  if (!password || !evaluation) {
    return null;
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'strong':
        return '#10b981';
      default:
        return '#d1d5db';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
      default:
        return '';
    }
  };

  return (
    <div className={styles.strengthContainer}>
      <div className={styles.barContainer}>
        <div
          className={styles.bar}
          style={{
            width: `${evaluation.score}%`,
            backgroundColor: getStrengthColor(evaluation.strength),
          }}
        />
      </div>
      <span
        className={styles.strengthLabel}
        style={{ color: getStrengthColor(evaluation.strength) }}
      >
        {getStrengthLabel(evaluation.strength)}
      </span>
      {evaluation.feedback.length > 0 && (
        <ul className={styles.feedbackList}>
          {evaluation.feedback.map((item, index) => (
            <li key={index} className={styles.feedbackItem}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {evaluation.strength === 'strong' && evaluation.feedback.length === 0 && (
        <p className={styles.successMessage}>✓ Contraseña muy fuerte</p>
      )}
    </div>
  );
};

export default PasswordStrengthBar;
