import { useEffect, useRef, useState } from "react";
import { aiApi } from "../../services/api";

export default function CoreAIChat({ greeting }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (greeting && messages.length === 0) {
      setMessages([{ id: "init", sender: "ai", text: greeting }]);
    }
  }, [greeting, messages.length]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;

    const userMsg = { id: `u-${Date.now()}`, sender: "user", text: clean };
    setMessages((prev) => [...prev, userMsg]);
    setText("");
    setSending(true);

    try {
      const res = await aiApi.chat(clean);
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, sender: "ai", text: res.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: error.message || "No pude analizar tus notas en este momento.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="ai-fab-btn"
        aria-label="Abrir asistente CoreAI"
        aria-controls="aiChatDrawer"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <i className="fa-solid fa-robot"></i>
      </button>

      <aside
        id="aiChatDrawer"
        className={`ai-chat-drawer${open ? " active" : ""}`}
        aria-hidden={!open}
      >
        <div className="chat-header">
          <div className="chat-title">
            <i className="fa-solid fa-robot"></i> CoreAI Assistant
          </div>
          <button
            type="button"
            className="close-btn"
            aria-label="Cerrar chat"
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`message ${m.sender === "user" ? "user-msg" : "ai-msg"}`}>
              {m.text}
            </div>
          ))}
          {sending && <div className="message ai-msg">Analizando tus asignaturas...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Pregúntame cómo va tu semestre..."
            aria-label="Escribir mensaje a CoreAI"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn-send-chat"
            aria-label="Enviar mensaje"
            disabled={sending || !text.trim()}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </aside>
    </>
  );
}