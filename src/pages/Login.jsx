import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginView from "../components/auth/LoginView";
import ForgotPasswordView from "../components/auth/ForgotPasswordView";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleLogin = ({ email }) => {
    setLoading(true);
    localStorage.setItem("notecore_active_user", JSON.stringify({ email }));
    showToast("¡Inicio de sesión exitoso! Redirigiendo...", "success");
    timerRef.current = setTimeout(() => navigate("/dashboard"), 1000);
  };

  const handleForgot = (email) => {
    showToast(
      `Revisa el mensaje enviado a: ${email} y sigue las instrucciones para recuperar tu contraseña.`,
      "success",
    );
    setView("login");
  };

  return (
    <AuthLayout showBackLink={view === "login"}>
      {view === "login" ? (
        <LoginView
          onSubmit={handleLogin}
          onForgot={() => setView("forgot")}
          loading={loading}
        />
      ) : (
        <ForgotPasswordView onSubmit={handleForgot} onCancel={() => setView("login")} />
      )}
    </AuthLayout>
  );
}