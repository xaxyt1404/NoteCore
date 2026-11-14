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
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <i className="fa-solid fa-robot highlight"></i> CoreAI Assistant
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

        <div className="ai-chat-body">
          {messages.map((m) =>
            m.sender === "user" ? (
              <div
                key={m.id}
                className="chat-message user"
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "var(--primary)",
                  color: "var(--text-on-primary)",
                  padding: "0.8rem 1rem",
                  borderRadius: "16px 16px 4px 16px",
                  fontSize: "0.88rem",
                  maxWidth: "85%",
                  lineHeight: 1.4,
                }}
              >
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="chat-message bot">
                {m.text}
              </div>
            )
          )}
          {sending && <div className="chat-message bot">Analizando tus asignaturas...</div>}
          <div ref={messagesEndRef} />
        </div>

        <form className="ai-chat-footer" onSubmit={handleSend}>
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
            className="btn-send"
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