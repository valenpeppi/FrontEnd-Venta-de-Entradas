import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { sendMessageToAI } from "../../shared/api/AIClient";
import styles from "./styles/ChatAssistant.module.css";

const MarkdownMessage = React.memo(({ text }: { text: string }) => (
  <div className={styles.markdown}>
    <ReactMarkdown components={{}}>{text}</ReactMarkdown>
  </div>
));

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔹 Auto-ajuste de altura del textarea (con límite y sin loop)
  useEffect(() => {
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        const el = textareaRef.current!;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 200) + "px";
      });
    }
  }, [input]);

  // 🔹 Scroll automático al último mensaje (sin ciclo)
  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
    return () => clearTimeout(timeout);
  }, [messages]);

  // 🔹 Enviar mensaje al backend IA
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessageToAI(input);
      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Error al conectar con el asistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔘 Botón flotante para abrir el chat */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
          title="Abrir asistente"
        >
          💬
        </button>
      )}

      {/* 💬 Ventana del chat */}
      {isOpen && (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <span>Asistente TicketBot</span>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              title="Cerrar chat"
            >
              ✖
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.sender === "user" ? styles.userMsg : styles.aiMsg}
              >
                {m.sender === "ai" ? (
                  <MarkdownMessage text={m.text} />
                ) : (
                  m.text
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInput}>
            <textarea
              ref={textareaRef}
              placeholder="Escribí tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSend())
              }
              rows={1}
            />
            <button onClick={handleSend} disabled={loading}>
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
