import React, { useState, useEffect } from 'react';
import SupportLayout from '../../shared/components/SupportLayout';
import styles from './styles/Contact.module.css';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import { useAuth } from '../../shared/context/AuthContext';
import { MessageService } from '../../services/MessageService';
import { useMessage } from '../../shared/context/MessageContext';

const Contact: React.FC = () => {
  const { user } = useAuth();
  const { setAppMessage } = useMessage();
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || user.mail || user.contactEmail || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await MessageService.createMessage({
        title: formData.title,
        description: formData.description,
        senderEmail: formData.email
      });
      setAppMessage('Mensaje enviado con éxito. Te responderemos pronto.', 'success');
      setFormData({ title: '', email: user?.email || user?.mail || user?.contactEmail || '', description: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setAppMessage('Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SupportLayout
      title="Contacto"
      subtitle="¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para asistirte."
    >


      {!isAdmin && (
        <div className={styles.formContainer}>
          <h2>Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Asunto</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ej: Problema con mi entrada"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email de contacto</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                disabled={!!user} // Si está logueado, aparece pre-filled disabled o enabled? User dijo "holder", implying input. Pero si está logueado, mejor asegurar que sea su email.
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Consulta</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Escribe tu consulta aquí..."
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>
      )}
    </SupportLayout>
  );
};

export default Contact;
