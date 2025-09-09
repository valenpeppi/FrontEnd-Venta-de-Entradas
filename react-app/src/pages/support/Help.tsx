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
            <p className={styles.faqAnswer}>Para comprar, simplemente selecciona el evento que te interese, elige el sector y la cantidad de entradas que deseas, y haz clic en "Agregar al Carrito". Luego, finaliza la compra desde tu carrito siguiendo los pasos indicados.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Qué métodos de pago aceptan?</h3>
            <p className={styles.faqAnswer}>Actualmente aceptamos todas las principales tarjetas de crédito y débito. Estamos trabajando para incorporar más métodos de pago en el futuro. Todas las transacciones son seguras y están encriptadas.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Puedo cancelar o cambiar mis entradas?</h3>
            <p className={styles.faqAnswer}>Todas las ventas de entradas son finales. No se aceptan cancelaciones, cambios ni devoluciones. Te recomendamos revisar tu compra cuidadosamente antes de finalizarla.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Qué pasa si un evento se cancela o se reprograma?</h3>
            <p className={styles.faqAnswer}>Si un evento es cancelado, te contactaremos por correo electrónico con la información sobre el proceso de reembolso. Si es reprogramado, tus entradas actuales serán válidas para la nueva fecha.</p>
          </div>

          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>¿Cómo recibo mis entradas?</h3>
            <p className={styles.faqAnswer}>Una vez completada la compra, recibirás tus entradas digitales (e-tickets) por correo electrónico. También podrás acceder a ellas en cualquier momento desde la sección "Mis Entradas" de tu perfil.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.helpSection} ${styles.contactSection}`}>
        <h2 className={styles.helpSectionTitle}>Contacto</h2>
        <div className={styles.contactMethods}>
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>📧</div>
            <h3>Correo Electrónico</h3>
            <p>Te responderemos en un plazo de 24 horas hábiles.</p>
            <a href="mailto:support@ticketapp.com" className={styles.contactLink}>support@ticketapp.com</a>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>💬</div>
            <h3>Chat en Vivo</h3>
            <p>Disponible próximamente</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} disabled>Iniciar Chat</button>
          </div>
          
          <div className={styles.contactCard}>
            <div className={styles.contactIcon}>📞</div>
            <h3>Atención Telefónica</h3>
            <p>Lunes a Viernes, 9:00 a 18:00 hs (ARG)</p>
            <a href="tel:+543415555555" className={styles.contactLink}>+54 (341) 555-5555</a>
          </div>
        </div>
      </section>
      <button onClick={() => navigate('/')} className={`${styles.btn} ${styles.btnPrimary}`} style={{marginTop: '2rem'}}>Volver a la página principal</button>
    </main>
  );
};

export default Help;
