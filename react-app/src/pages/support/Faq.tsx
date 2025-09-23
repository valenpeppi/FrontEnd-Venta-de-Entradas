import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Faq.module.css';

const Faq: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: '¿Cómo puedo comprar entradas?',
      answer: 'Para comprar, simplemente selecciona el evento que te interese, elige el sector y la cantidad de entradas que deseas, y haz clic en "Agregar al Carrito". Luego, finaliza la compra desde tu carrito siguiendo los pasos indicados.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Actualmente aceptamos todas las principales tarjetas de crédito y débito a través de Mercado Pago. Todas las transacciones son seguras y están encriptadas.'
    },
    {
      question: '¿Puedo cancelar o cambiar mis entradas?',
      answer: 'Todas las ventas de entradas son finales. No se aceptan cancelaciones, cambios ni devoluciones. Te recomendamos revisar tu compra cuidadosamente antes de finalizarla.'
    },
    {
      question: '¿Qué pasa si un evento se cancela o se reprograma?',
      answer: 'Si un evento es cancelado, te contactaremos por correo electrónico con la información sobre el proceso de reembolso. Si es reprogramado, tus entradas actuales serán válidas para la nueva fecha.'
    },
    {
      question: '¿Cómo recibo mis entradas?',
      answer: 'Una vez completada la compra, recibirás tus entradas digitales (e-tickets) por correo electrónico. También podrás acceder a ellas en cualquier momento desde la sección "Mis Entradas" de tu perfil.'
    }
  ];

  return (
    <div className={styles.faqPage}>
      <div className={styles.faqContainer}>
        <h1 className={styles.faqTitle}>Preguntas Frecuentes</h1>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <details key={index} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{faq.question}</summary>
              <p className={styles.faqAnswer}>{faq.answer}</p>
            </details>
          ))}
        </div>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default Faq;

