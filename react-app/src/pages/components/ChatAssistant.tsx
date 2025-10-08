import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessageToAI } from "../../shared/api/AIClient";
import styles from "./styles/ChatAssistant.module.css";

const MarkdownMessage = React.memo(({ text }: { text: string }) => (
  <div className={styles.markdown}>
    <ReactMarkdown>{text}</ReactMarkdown>
  </div>
));

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [input]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          sender: "ai",
          text: "👋 ¡Hola! Soy TicketBot. ¿En qué puedo ayudarte hoy?",
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    const writingMsg = { sender: "ai", text: "💬 Escribiendo..." };

    setMessages((prev) => [...prev, userMsg, writingMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessageToAI(input);

      // Reemplaza el último mensaje (escribiendo...) por la respuesta real
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "ai", text: reply };
        return updated;
      });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "ai",
          text: "⚠️ Ocurrió un error al conectar con el asistente.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={openChat}
          title="Abrir asistente"
        >
          💬
        </button>
      )}

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
                {m.sender === "ai" && m.text.includes("Escribiendo") ? (
                  <div className={styles.typingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : m.sender === "ai" ? (
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
              disabled={loading}
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
