import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function CoreAIChat({ greeting }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { showToast } = useToast();

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setText("");
    showToast("CoreAI estará disponible próximamente.", "info");
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

      <div className={`ai-chat-drawer${open ? " active" : ""}`} id="aiChatDrawer">
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <i className="fa-solid fa-robot highlight"></i>
            <span>CoreAI Assistant</span>
          </div>
          <button type="button" className="close-btn" aria-label="Cerrar chat" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="ai-chat-body">
          <div className="chat-message bot">{greeting}</div>
        </div>

        <form className="ai-chat-footer" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Escribe un mensaje a CoreAI..."
            aria-label="Mensaje para CoreAI"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn-send" aria-label="Enviar mensaje">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </>
  );
}