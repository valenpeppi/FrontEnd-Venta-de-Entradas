import React, { useEffect, useState } from 'react';
import { MessageService } from '@/services/MessageService';
import type { Message } from '@/types/message';
import styles from '@/pages/admin/styles/AdminMessages.module.css';
import StatusBadge from "@/shared/components/StatusBadge";
import EmptyState from "@/shared/components/EmptyState";
import { FaInbox, FaReply, FaCheck, FaUser, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useMessage } from '@/hooks/useMessage';

export const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setAppMessage } = useMessage();

    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'unread': return 'No Leído';
            case 'answered': return 'Respondido';
            case 'rejected': return 'Rechazado';
            case 'discarded': return 'Descartado';
            default: return status;
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const sortMessages = (data: Message[]) => {
        return data.sort((a, b) => {
            const priority = { 'unread': 1, 'answered': 2, 'rejected': 3 } as Record<string, number>;
            const pA = priority[a.state] || 99;
            const pB = priority[b.state] || 99;
            if (pA !== pB) return pA - pB;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    };

    const loadMessages = async () => {
        setLoading(true);
        try {
            const data = await MessageService.getMessages();
            setMessages(sortMessages(data));
        } catch (err) {
            setError('Error al cargar mensajes.');
        } finally {
            setLoading(false);
        }
    };

    const startReply = (id: string) => {
        setReplyingId(id);
        const currentMsg = messages.find(m => m.idMessage === id);
        setReplyText(currentMsg?.response || '');
    };

    const cancelReply = () => {
        setReplyingId(null);
        setReplyText('');
    };

    const submitReply = async (id: string) => {
        if (!replyText.trim()) return;

        try {
            setMessages(prev => prev.map(m => m.idMessage === id ? { ...m, state: 'answered', response: replyText } : m));
            setReplyingId(null);
            await MessageService.replyMessage(id, replyText);
            setAppMessage('Mensaje respondido correctamente', 'success');
        } catch (e) {
            setAppMessage('Error al responder mensaje', 'error');
            loadMessages();
        }
    };

    const handleReject = async (id: string) => {
        try {
            setMessages(prev => {
                const updated: Message[] = prev.map(m => m.idMessage === id ? { ...m, state: 'rejected' } : m);
                return sortMessages(updated);
            });
            await MessageService.rejectMessage(id);
            setAppMessage('Mensaje rechazado', 'success');
        } catch (e) {
            setAppMessage('Error al rechazar mensaje', 'error');
            loadMessages();
        }
    };

    const handleDiscard = async (id: string) => {

        try {
            setMessages(prev => prev.filter(m => m.idMessage !== id));
            await MessageService.discardMessage(id);
            setAppMessage('Mensaje descartado', 'success');
        } catch (e) {
            setAppMessage('Error al descartar mensaje', 'error');
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
                            {(msg.state === 'answered' || msg.state === 'rejected') && (
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => handleDiscard(msg.idMessage)}
                                    title="Descartar y ocultar mensaje"
                                >
                                    <FaTimes size={16} />
                                </button>
                            )}

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

                            {msg.response && replyingId !== msg.idMessage && (
                                <div className={styles.responseBox}>
                                    <span className={styles.responseLabel}>Tu Respuesta</span>
                                    <p className={styles.responseText}>{msg.response}</p>
                                </div>
                            )}

                            {replyingId === msg.idMessage && (
                                <div className={styles.replyForm}>
                                    <textarea
                                        className={styles.replyTextarea}
                                        placeholder="Escribe tu respuesta aquí..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        autoFocus
                                    />
                                    <div className={styles.formActions}>
                                        <button className={`${styles.btn} ${styles.btnCancel}`} onClick={cancelReply}>
                                            Cancelar
                                        </button>
                                        <button className={`${styles.btn} ${styles.btnSend}`} onClick={() => submitReply(msg.idMessage)}>
                                            <FaPaperPlane /> Enviar Respuesta
                                        </button>
                                    </div>
                                </div>
                            )}

                            {replyingId !== msg.idMessage && (
                                <div className={styles.actions}>
                                    {msg.state === 'unread' && (
                                        <>
                                            <button
                                                className={`${styles.btn} ${styles.btnReply}`}
                                                onClick={() => startReply(msg.idMessage)}
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
                                    {msg.state === 'answered' && (
                                        <button
                                            className={`${styles.btn} ${styles.btnReply}`}
                                            onClick={() => startReply(msg.idMessage)}
                                            style={{ backgroundColor: '#e2e8f0', color: '#475569', boxShadow: 'none' }}
                                        >
                                            <FaReply /> Editar Respuesta
                                        </button>
                                    )}
                                    {msg.state === 'rejected' && (
                                        <button
                                            className={`${styles.btn} ${styles.btnReply}`}
                                            onClick={() => startReply(msg.idMessage)}
                                        >
                                            <FaCheck /> Reconsiderar
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
