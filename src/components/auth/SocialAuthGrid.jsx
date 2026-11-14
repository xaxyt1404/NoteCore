import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function SocialAuthGrid({ onGoogleSuccess, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      showToast("Falta configurar VITE_GOOGLE_CLIENT_ID en el entorno.", "warning");
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      showToast("Cargando servicio de Google, intenta de nuevo en un segundo.", "info");
      return;
    }

    setLoading(true);
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: async (tokenResponse) => {
        if (tokenResponse?.error || !tokenResponse?.access_token) {
          setLoading(false);
          if (tokenResponse?.error !== "popup_closed_by_user") {
            showToast("No se pudo iniciar sesión con Google.", "danger");
          }
          return;
        }
        try {
          await onGoogleSuccess?.(tokenResponse.access_token);
        } finally {
          setLoading(false);
        }
      },
      error_callback: () => {
        setLoading(false);
      },
    });

    client.requestAccessToken();
  };

  return (
    <>
      <div className="auth-divider">
        <span>O continúa con</span>
      </div>

      <div className="social-auth-grid" style={{ gridTemplateColumns: "1fr" }}>
        <button
          type="button"
          className="social-btn"
          style={{ width: "100%" }}
          onClick={handleGoogleClick}
          disabled={disabled || loading}
        >
          {loading ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            <i className="fa-brands fa-google"></i>
          )}
          <span>{loading ? "Conectando con Google..." : "Continuar con Google"}</span>
        </button>
      </div>
    </>
  );
}