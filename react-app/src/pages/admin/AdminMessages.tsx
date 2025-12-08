import React, { useEffect, useState } from 'react';
import { MessageService } from '../../services/MessageService';
import type { Message } from '../../types/message';
import styles from './styles/AdminPanel.module.css';
import StatusBadge from "../../shared/components/StatusBadge";
import EmptyState from "../../shared/components/EmptyState";
import { FaInbox, FaReply, FaTimes, FaCheck } from 'react-icons/fa';

export const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const data = await MessageService.getMessages();
            setMessages(data);
        } catch (err) {
            setError('Error al cargar mensajes.');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id: number) => {
        const responseText = prompt("Escribe tu respuesta:");
        if (!responseText) return;

        try {
            // Optimistic
            setMessages(prev => prev.map(m => m.idMessage === id ? { ...m, state: 'answered', response: responseText } : m));
            await MessageService.replyMessage(id, responseText);
        } catch (e) {
            alert('Error al responder mensaje');
            loadMessages(); // Revert
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("¿Seguro que quieres rechazar este mensaje?")) return;
        try {
            setMessages(prev => prev.map(m => m.idMessage === id ? { ...m, state: 'rejected' } : m));
            await MessageService.rejectMessage(id);
        } catch (e) {
            alert('Error al rechazar mensaje');
            loadMessages();
        }
    };

    if (loading) return <div className={styles.loadingState}>Cargando mensajes...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.adminContainer} style={{ marginTop: '0' }}>
            <header className={styles.adminHeader}>
                <h1>Bandeja de Entrada</h1>
            </header>

            {messages.length === 0 ? (
                <EmptyState title="No hay mensajes" description="Tu bandeja de entrada está vacía." icon={<FaInbox />} />
            ) : (
                <div className={styles.messagesList}>
                    {messages.map(msg => (
                        <div key={msg.idMessage} className={styles.messageCard}>
                            <div className={styles.messageHeader}>
                                <div className={styles.messageMeta}>
                                    <h3 className={styles.messageTitle}>{msg.title}</h3>
                                    <span className={styles.messageSender}>{msg.senderEmail}</span>
                                    <span className={styles.messageDate}>{new Date(msg.date).toLocaleDateString()}</span>
                                </div>
                                <StatusBadge status={msg.state} />
                            </div>
                            <p className={styles.messageBody}>{msg.description}</p>

                            {msg.response && (
                                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
                                    <strong>Tu respuesta:</strong>
                                    <p style={{ margin: '0.5rem 0 0', color: '#166534' }}>{msg.response}</p>
                                </div>
                            )}

                            <div className={styles.messageActions}>
                                {msg.state === 'unread' && (
                                    <>
                                        <button
                                            className={`${styles.btn} ${styles.btnApprove}`}
                                            onClick={() => handleReply(msg.idMessage)}
                                            title="Responder"
                                        >
                                            <FaReply /> Responder
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnReject}`}
                                            onClick={() => handleReject(msg.idMessage)}
                                            title="Rechazar"
                                        >
                                            <FaTimes /> Rechazar
                                        </button>
                                    </>
                                )}
                                {msg.state === 'rejected' && (
                                    <button
                                        className={`${styles.btn} ${styles.btnApprove}`}
                                        onClick={() => handleReply(msg.idMessage)}
                                        title="Reconsiderar y Responder"
                                    >
                                        <FaCheck /> Responder
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
