import React from 'react';
import SupportLayout from '@/shared/components/SupportLayout';
import styles from '@/pages/support/styles/About.module.css';
import { FaShieldAlt, FaRocket, FaUsers, FaHeart } from 'react-icons/fa';

const About: React.FC = () => {
  return (
    <SupportLayout
      title="Sobre TicketApp"
      subtitle="Conectando fans con experiencias inolvidables desde 2015"
      transparent
    >
      <div className={styles.aboutContainer}>

        {/* Hero Section */}
        <div className={styles.heroCard}>
          <p className={styles.heroText}>
            En <span className={styles.heroHighlight}>TicketApp</span>, creemos que la vida se mide en momentos.
            Nuestra misión es hacer que el acceso a esos momentos sea tan emocionante como el evento mismo.
            Somos la plataforma líder en venta de entradas, uniendo tecnología de punta con una pasión inquebrantable por el entretenimiento.
          </p>
        </div>

        {/* Stats Section */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>+1M</span>
            <span className={styles.statLabel}>Entradas Vendidas</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>500+</span>
            <span className={styles.statLabel}>Eventos Exclusivos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>4.9</span>
            <span className={styles.statLabel}>Calificación App</span>
          </div>
        </div>

        {/* Values Section */}
        <div className={styles.valuesSection}>
          <h2 className={styles.valuesTitle}>¿Por qué elegirnos?</h2>

          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <FaShieldAlt />
              </div>
              <h3 className={styles.valueTitle}>Seguridad Total</h3>
              <p className={styles.valueDescription}>
                Tu tranquilidad es prioridad. Utilizamos encriptación bancaria y validaciones antifraude para cada transacción.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <FaRocket />
              </div>
              <h3 className={styles.valueTitle}>Velocidad Extrema</h3>
              <p className={styles.valueDescription}>
                Compra tus entradas en segundos. Nuestra plataforma está optimizada para manejar alta demanda sin esperas.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <FaUsers />
              </div>
              <h3 className={styles.valueTitle}>Comunidad</h3>
              <p className={styles.valueDescription}>
                Creamos espacios donde los fans se encuentran. Más que entradas, vendemos pertenencia.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div className={styles.iconWrapper}>
                <FaHeart />
              </div>
              <h3 className={styles.valueTitle}>Pasión</h3>
              <p className={styles.valueDescription}>
                Amamos lo que hacemos. Nuestro equipo de soporte trabaja 24/7 para asegurarse de que tu noche sea perfecta.
              </p>
            </div>
          </div>
        </div>

      </div>
    </SupportLayout>
  );
};

export default About;
