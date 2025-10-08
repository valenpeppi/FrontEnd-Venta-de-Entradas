import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessageToAI } from "../../shared/api/AIClient";
import { RiRobot2Fill } from "react-icons/ri";
import { MdClose, MdConfirmationNumber } from "react-icons/md";
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
          text: "👋 ¡Hola! Soy **TicketBot**. ¿En qué puedo ayudarte hoy?",
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
          title="Abrir asistente TicketBot"
        >
          <RiRobot2Fill  className={styles.iconPulse} size={32} color="#fff" />
        </button>
      )}

      {isOpen && (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <div className={styles.headerTitle}>
              <MdConfirmationNumber size={22} className={styles.ticketIcon} />
              <span>TicketBot</span>
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              title="Cerrar chat"
            >
              <MdClose size={20} />
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
                  <div className={styles.userText}>{m.text}</div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInput}>
            <textarea
              ref={textareaRef}
              placeholder="Escribí tu mensaje..."
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
