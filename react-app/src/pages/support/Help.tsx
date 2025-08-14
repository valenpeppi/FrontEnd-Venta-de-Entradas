import React from "react";
import { useNavigate } from 'react-router-dom';
import styles from './styles/Help.module.css'; 

const Help: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className={styles.helpContainer}>
      <section className={styles.helpHero}>
        <h1 className={styles.helpTitle}>Centro de Ayuda</h1>
        <p className={styles.helpSubtitle}>¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte.</p>
      </section>

      <section className={styles.helpSection}>
        <h2 className={styles.helpSectionTitle}>Preguntas Frecuentes</h2>
        <div className={styles.faqContainer}>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Cómo puedo comprar entradas?</h3>
            <p className={styles.faqAnswer}>Puedes comprar entradas a través de nuestra página web, seleccionando el evento y siguiendo los pasos de pago. El proceso es sencillo y seguro.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Qué métodos de pago aceptan?</h3>
            <p className={styles.faqAnswer}>Aceptamos tarjetas de crédito (Visa, MasterCard, American Express), débito y PayPal. Todas las transacciones están protegidas con encriptación SSL.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Puedo cancelar mi compra?</h3>
            <p className={styles.faqAnswer}>Las compras son generalmente finales, pero en casos excepcionales puedes contactar con nuestro equipo de soporte dentro de las 24 horas posteriores a la compra.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Cómo recibo mis entradas?</h3>
            <p className={styles.faqAnswer}>Las entradas se envían automáticamente por correo electrónico una vez que se completa la compra. También puedes descargarlas desde la sección "Mis Entradas" en tu cuenta.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.helpSection} ${styles.contactSection}`}>
        <h2 className={styles.helpSectionTitle}>Contacto</h2>
        <div className={styles.contactMethods}>
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>📧</div>
            <h3>Correo Electrónico</h3>
            <p>Responde dentro de 24 horas</p>
            <a href="mailto:support@ticketapp.com" className={styles.contactLink}>support@ticketapp.com</a>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>💬</div>
            <h3>Chat en Vivo</h3>
            <p>Disponible 24/7</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>Iniciar Chat</button>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>📞</div>
            <h3>Teléfono</h3>
            <p>Lunes a Viernes, 9am-6pm</p>
            <a href="tel:+1234567890" className={styles.contactLink}>+1 (234) 567-890</a>
          </div>
        </div>
      </section>
      <button onClick={() => navigate('/')} className={`${styles.btn} ${styles.btnPrimary}`} style={{marginTop: '2rem'}}>Volver a la página principal</button>
    </main>
  );
};

export default Help;
