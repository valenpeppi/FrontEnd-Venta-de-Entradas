import React from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/Help.css'; 

const Help: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="help-container">
      <section className="help-hero">
        <h1 className="help-title">Centro de Ayuda</h1>
        <p className="help-subtitle">¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte.</p>
      </section>

      <section className="help-section">
        <h2 className="help-section-title">Preguntas Frecuentes</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h3 className="faq-question">¿Cómo puedo comprar entradas?</h3>
            <p className="faq-answer">Puedes comprar entradas a través de nuestra página web, seleccionando el evento y siguiendo los pasos de pago. El proceso es sencillo y seguro.</p>
          </div>
          
          <div className="faq-item">
            <h3 className="faq-question">¿Qué métodos de pago aceptan?</h3>
            <p className="faq-answer">Aceptamos tarjetas de crédito (Visa, MasterCard, American Express), débito y PayPal. Todas las transacciones están protegidas con encriptación SSL.</p>
          </div>
          
          <div className="faq-item">
            <h3 className="faq-question">¿Puedo cancelar mi compra?</h3>
            <p className="faq-answer">Las compras son generalmente finales, pero en casos excepcionales puedes contactar con nuestro equipo de soporte dentro de las 24 horas posteriores a la compra.</p>
          </div>
          
          <div className="faq-item">
            <h3 className="faq-question">¿Cómo recibo mis entradas?</h3>
            <p className="faq-answer">Las entradas se envían automáticamente por correo electrónico una vez que se completa la compra. También puedes descargarlas desde la sección "Mis Entradas" en tu cuenta.</p>
          </div>
        </div>
      </section>

      <section className="help-section contact-section">
        <h2 className="help-section-title">Contacto</h2>
        <div className="contact-methods">
          <div className="contact-card">
            <div className="contact-icon">📧</div>
            <h3>Correo Electrónico</h3>
            <p>Responde dentro de 24 horas</p>
            <a href="mailto:support@ticketapp.com" className="contact-link">support@ticketapp.com</a>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">💬</div>
            <h3>Chat en Vivo</h3>
            <p>Disponible 24/7</p>
            <button className="btn btn-primary">Iniciar Chat</button>
          </div>
          
          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>Teléfono</h3>
            <p>Lunes a Viernes, 9am-6pm</p>
            <a href="tel:+1234567890" className="contact-link">+1 (234) 567-890</a>
          </div>
        </div>
      </section>
      <button onClick={() => navigate('/')} className="btn btn-primary mt-8">Volver a la página principal</button>
    </main>
  );
};

export default Help;
