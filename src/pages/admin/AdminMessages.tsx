import React from 'react';
import styles from '@/pages/admin/styles/AdminMessages.module.css';
import StatusBadge from "@/shared/components/StatusBadge";
import EmptyState from "@/shared/components/EmptyState";
import { FaInbox, FaReply, FaCheck, FaUser, FaPaperPlane, FaTimes, FaMagic, FaSpinner } from 'react-icons/fa';
import { useAdminMessages } from '@/hooks/useAdminMessages';

export const AdminMessages: React.FC = () => {
    const {
        messages,
        loading,
        error,
        replyingId,
        replyText,
        setReplyText,
        generating,
        startReply,
        cancelReply,
        submitReply,
        handleReject,
        handleDiscard,
        handleGenerateReply,
        getStatusLabel
    } = useAdminMessages();

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
                                        disabled={generating}
                                    />
                                    <div className={styles.formActions}>
                                        <button
                                            className={styles.btn}
                                            onClick={() => handleGenerateReply(msg.description)}
                                            style={{ marginRight: 'auto', backgroundColor: '#8b5cf6', color: 'white' }}
                                            title="Generar respuesta automática con IA"
                                            disabled={generating}
                                        >
                                            {generating ? <FaSpinner className={styles.spin} /> : <FaMagic />} {generating ? 'Generando...' : 'Generar con IA'}
                                        </button>
                                        <button className={`${styles.btn} ${styles.btnCancel}`} onClick={cancelReply} disabled={generating}>
                                            Cancelar
                                        </button>
                                        <button className={`${styles.btn} ${styles.btnSend}`} onClick={() => submitReply(msg.idMessage)} disabled={generating}>
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
