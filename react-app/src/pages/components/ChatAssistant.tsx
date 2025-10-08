import React, { useState } from "react";
import { sendMessageToAI } from "../../shared/api/AIClient";
import styles from "./styles/ChatAssistant.module.css";

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const reply = await sendMessageToAI(input);
    setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    setLoading(false);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatMessages}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.sender === "user" ? styles.userMsg : styles.aiMsg}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className={styles.chatInput}>
        <input
          type="text"
          placeholder="Escribí tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;
