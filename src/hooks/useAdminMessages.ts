import { useState, useEffect } from 'react';
import { MessageService } from '@/services/MessageService';
import { useMessage } from '@/hooks/useMessage';
import type { Message } from '@/types/message';

export const useAdminMessages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setAppMessage } = useMessage();

    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [generating, setGenerating] = useState(false);

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

    useEffect(() => {
        loadMessages();
    }, []);

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

    const handleGenerateReply = async (messageDescription: string) => {
        if (generating) return;
        setGenerating(true);
        try {
            const data = await MessageService.generateAIReply(messageDescription);
            if (data && data.reply) {
                setReplyText(data.reply);
            }
        } catch (e) {
            setAppMessage('No se pudo generar la respuesta automática', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'unread': return 'No Leído';
            case 'answered': return 'Respondido';
            case 'rejected': return 'Rechazado';
            case 'discarded': return 'Descartado';
            default: return status;
        }
    };

    return {
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
    };
};
