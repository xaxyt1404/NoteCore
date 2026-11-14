import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SocialAuthGrid from "./SocialAuthGrid";

export default function LoginView({
  onSubmit,
  onForgot,
  onGoogleSuccess,
  loading = false,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
    onSubmit?.({ email, password, remember });
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  return (
    <div>
      <div className="auth-header">
        <h2>¡Hola de nuevo!</h2>
        <p>Ingresa tus datos para continuar.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="loginEmail">Correo Electrónico</label>
          <div className="input-icon-wrapper">
            <i className="fa-regular fa-envelope input-icon"></i>
            <input
              type="email"
              id="loginEmail"
              placeholder="tu@correo.com"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleEmailKeyDown}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="loginPassword">Contraseña</label>
          <div className="input-icon-wrapper">
            <i className="fa-solid fa-lock input-icon"></i>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              id="loginPassword"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="form-checkbox">
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Recordarme</span>
          </label>
          <a
            href="#"
            className="terms-link"
            onClick={(e) => {
              e.preventDefault();
              onForgot?.();
            }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div className="auth-buttons-group" style={{ gridTemplateColumns: "1fr" }}>
          <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              "Continuar"
            )}
          </button>
        </div>

        <p className="auth-login-redirect">
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="terms-link">
            Crear Cuenta
          </Link>
        </p>
      </form>

      <SocialAuthGrid onGoogleSuccess={onGoogleSuccess} disabled={loading} />
    </div>
  );
}