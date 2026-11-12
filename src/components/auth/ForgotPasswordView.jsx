import { useState } from "react";

export default function ForgotPasswordView({ onSubmit, onCancel }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    onSubmit?.(email);
  };

  return (
    <div>
      <div className="auth-header">
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Ingresa tu correo registrado y te enviaremos las instrucciones para restablecerla.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="resetEmail">Correo Electrónico</label>
          <div className="input-icon-wrapper">
            <i className="fa-regular fa-envelope input-icon"></i>
            <input
              type="email"
              id="resetEmail"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-buttons-group">
          <button type="submit" className="btn btn-primary btn-auth">
            Enviar Enlace
          </button>
          <button type="button" className="btn btn-outline btn-auth" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}


