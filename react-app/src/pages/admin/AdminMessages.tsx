import React, { useEffect, useState } from 'react';
import { MessageService } from '../../services/MessageService';
import type { Message } from '../../types/message';
import styles from './styles/AdminMessages.module.css';
import StatusBadge from "../../shared/components/StatusBadge";
import EmptyState from "../../shared/components/EmptyState";
import { FaInbox, FaReply, FaTimes, FaCheck, FaUser } from 'react-icons/fa';

export const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'unread': return 'No Leído';
            case 'answered': return 'Respondido';
            case 'rejected': return 'Rechazado';
            default: return status;
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const data = await MessageService.getMessages();
            // Sort by Date DESC
            const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setMessages(sorted);
        } catch (err) {
            setError('Error al cargar mensajes.');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id: number) => {
        const responseText = prompt("Escribe tu respuesta para el usuario:");
        if (!responseText) return;

        try {
            // Optimistic update
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
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Mensajes de Usuarios</h1>
            </header>

            {messages.length === 0 ? (
                <EmptyState
                    title="Bandeja Vacía"
                    description="No tiene mensajes pendientes de revisión."
                    icon={<FaInbox />}
                />
            ) : (
                <div className={styles.messagesList}>
                    {messages.map(msg => (
                        <div key={msg.idMessage} className={styles.messageCard}>
                            <div className={styles.messageHeader}>
                                <div className={styles.messageMeta}>
                                    <h3 className={styles.messageTitle}>{msg.title}</h3>
                                    <div className={styles.senderInfo}>
                                        <FaUser size={12} />
                                        <span className={styles.senderEmail}>{msg.senderEmail}</span>
                                        <span>•</span>
                                        <span className={styles.messageDate}>{new Date(msg.date).toLocaleDateString()} {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <StatusBadge status={msg.state} label={getStatusLabel(msg.state)} />
                            </div>

                            <div className={styles.messageBody}>
                                {msg.description}
                            </div>

                            {msg.response && (
                                <div className={styles.responseBox}>
                                    <span className={styles.responseLabel}>Tu Respuesta</span>
                                    <p className={styles.responseText}>{msg.response}</p>
                                </div>
                            )}

                            <div className={styles.actions}>
                                {msg.state === 'unread' && (
                                    <>
                                        <button
                                            className={`${styles.btn} ${styles.btnReply}`}
                                            onClick={() => handleReply(msg.idMessage)}
                                        >
                                            <FaReply /> Responder
                                        </button>
                                        <button
                                            className={`${styles.btn} ${styles.btnReject}`}
                                            onClick={() => handleReject(msg.idMessage)}
                                        >
                                            <FaTimes /> Rechazar
                                        </button>
                                    </>
                                )}
                                {msg.state === 'rejected' && (
                                    <button
                                        className={`${styles.btn} ${styles.btnReply}`}
                                        onClick={() => handleReply(msg.idMessage)}
                                    >
                                        <FaCheck /> Reconsiderar
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
