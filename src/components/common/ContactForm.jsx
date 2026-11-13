import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { contactApi } from "../../services/api";

const WHATSAPP_PHONE = "573053924821";

const getLoggedUserFallback = () => {
  try {
    const raw = localStorage.getItem("notecore_active_user");
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignorar
  }
  return null;
};

export default function ContactForm({
  defaultName = "",
  defaultEmail = "",
  source = "landing",
}) {
  const { showToast } = useToast();
  const cached = getLoggedUserFallback();
  const initialName = defaultName || cached?.fullName || "";
  const initialEmail = defaultEmail || cached?.email || "";

  const [ws, setWs] = useState({ name: initialName, message: "" });
  const [mail, setMail] = useState({
    name: initialName,
    email: initialEmail,
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const resolvedName = defaultName || getLoggedUserFallback()?.fullName || "";
    const resolvedEmail = defaultEmail || getLoggedUserFallback()?.email || "";
    setWs((prev) => ({ ...prev, name: prev.name || resolvedName }));
    setMail((prev) => ({
      ...prev,
      name: prev.name || resolvedName,
      email: prev.email || resolvedEmail,
    }));
  }, [defaultName, defaultEmail]);

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const name = ws.name.trim();
    const message = ws.message.trim();
    if (!name || !message) return;

    const text = encodeURIComponent(`Hola, mi nombre es ${name}. ${message}`);
    window.open(
      `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${text}`,
      "_blank"
    );
    setWs({ name: initialName, message: "" });
  };

  const handleNoteCoreSend = async (e) => {
    e.preventDefault();
    if (sending) return;

    const name = mail.name.trim();
    const email = mail.email.trim();
    const message = mail.message.trim();
    if (!name || !email || !message) return;

    setSending(true);
    try {
      const res = await contactApi.send({
        name,
        email,
        message,
        source,
      });
      showToast(
        res.message || "¡Mensaje enviado por NoteCore! Te responderemos pronto.",
        "success"
      );
      setMail({
        name: initialName || name,
        email: initialEmail || email,
        message: "",
      });
    } catch (error) {
      showToast(error.message || "No se pudo enviar el mensaje.", "danger");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-wrapper">
      <div className="contact-forms-container">
        {/* Formulario WhatsApp */}
        <form className="contact-form" onSubmit={handleWhatsApp}>
          <h3>
            <i className="fa-brands fa-whatsapp"></i> Chat de WhatsApp
          </h3>

          <div className="form-group">
            <label htmlFor="ws-name">Nombre</label>
            <input
              type="text"
              id="ws-name"
              placeholder="Tu nombre"
              value={ws.name}
              onChange={(e) => setWs({ ...ws, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ws-message">Consulta o Sugerencia</label>
            <textarea
              id="ws-message"
              rows="3"
              placeholder="¿En qué te puedo ayudar?"
              value={ws.message}
              onChange={(e) => setWs({ ...ws, message: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <button type="submit" className="submit-btn ws-btn">
              <i className="fa-brands fa-whatsapp"></i> Enviar mensaje
            </button>
          </div>
        </form>

        {/* Formulario Enviar por NoteCore */}
        <form className="contact-form" onSubmit={handleNoteCoreSend}>
          <h3>
            <i className="fa-solid fa-paper-plane"></i> Enviar por NoteCore
          </h3>

          <div className="form-group">
            <label htmlFor="contact-name">Nombre</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              placeholder="Tu nombre"
              autoComplete="name"
              value={mail.name}
              onChange={(e) => setMail({ ...mail, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-email">Email</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={mail.email}
              onChange={(e) => setMail({ ...mail, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact-message">Mensaje</label>
            <textarea
              id="contact-message"
              name="message"
              rows="3"
              placeholder="Escribe tu mensaje aquí..."
              value={mail.message}
              onChange={(e) => setMail({ ...mail, message: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <button type="submit" className="submit-btn" disabled={sending}>
              {sending ? "Enviando..." : "Enviar por NoteCore"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}