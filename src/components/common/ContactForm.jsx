import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";

const WHATSAPP_PHONE = "573053924821";

export default function ContactForm({ defaultName = "", defaultEmail = "" }) {
  const { showToast } = useToast();
  const [ws, setWs] = useState({ name: defaultName, message: "" });
  const [mail, setMail] = useState({
    name: defaultName,
    email: defaultEmail,
    message: "",
  });

  useEffect(() => {
    setWs((prev) => ({ ...prev, name: prev.name || defaultName }));
    setMail((prev) => ({
      ...prev,
      name: prev.name || defaultName,
      email: prev.email || defaultEmail,
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
    setWs({ name: defaultName, message: "" });
  };

  // Sin backend: el envío por email queda pendiente de integración
  const handleEmail = (e) => {
    e.preventDefault();
    showToast("El envío por email estará disponible próximamente.", "info");
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

        {/* Formulario Email */}
        <form className="contact-form" onSubmit={handleEmail}>
          <h3>
            <i className="fa-solid fa-paper-plane"></i> Envío por Email
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
            <button type="submit" className="submit-btn">
              Enviar Mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}