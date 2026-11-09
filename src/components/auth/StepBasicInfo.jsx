import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SocialAuthGrid from "./SocialAuthGrid";
import TermsModal from "./TermsModal";

export default function StepBasicInfo({ data, onChange, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const nameRef = useRef(null);
  const passwordRef = useRef(null);

  const set = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    onNext?.();
  };

  const focusOnEnter = (ref) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ref.current?.focus();
    }
  };

  const acceptTerms = () => {
    onChange({ ...data, terms: true });
    setTermsOpen(false);
  };

  return (
    <div className="auth-wizard-view">
      <div className="auth-header">
        <h2>Crear Cuenta</h2>
        <p>Únete a NoteCore y gestiona tus notas de forma eficiente.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="regEmail">Correo Electrónico</label>
          <div className="input-icon-wrapper">
            <i className="fa-regular fa-envelope input-icon"></i>
            <input
              type="email"
              id="regEmail"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={data.email}
              onChange={set("email")}
              onKeyDown={focusOnEnter(nameRef)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="regName">Nombre y Apellido</label>
          <div className="input-icon-wrapper">
            <i className="fa-regular fa-user input-icon"></i>
            <input
              ref={nameRef}
              type="text"
              id="regName"
              placeholder="Ej. Estiben Martinez"
              autoComplete="name"
              value={data.name}
              onChange={set("name")}
              onKeyDown={focusOnEnter(passwordRef)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="regPassword">Contraseña</label>
          <div className="input-icon-wrapper">
            <i className="fa-solid fa-lock input-icon"></i>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              id="regPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              pattern="(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}"
              title="Mínimo 6 caracteres, un número y un carácter especial"
              value={data.password}
              onChange={set("password")}
              required
            />
            <button
              type="button"
              className="toggle-password"
              aria-label="Mostrar u ocultar contraseña"
              onClick={() => setShowPassword((s) => !s)}
            >
              <i className={`fa-regular ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
            </button>
          </div>
        </div>

        <div className="form-group">
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="regTerms"
              checked={data.terms}
              onChange={(e) => onChange({ ...data, terms: e.target.checked })}
              required
            />
            <label htmlFor="regTerms">
              Acepto los{" "}
              <a
                href="#"
                className="terms-link"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTermsOpen(true);
                }}
              >
                Términos y Condiciones
              </a>
            </label>
          </div>
        </div>

        <div className="auth-buttons-group" style={{ gridTemplateColumns: "1fr" }}>
          <button type="submit" className="btn btn-primary btn-auth">
            <span className="btn-text">Continuar</span>
          </button>
        </div>

        <p className="auth-login-redirect">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="terms-link">
            Iniciar sesión
          </Link>
        </p>
      </form>

      <SocialAuthGrid />

      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={acceptTerms}
      />
    </div>
  );
}