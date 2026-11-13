import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginView from "../components/auth/LoginView";
import ForgotPasswordView from "../components/auth/ForgotPasswordView";
import { useToast } from "../context/ToastContext";
import { authApi, setToken } from "../services/api";

export default function Login() {
  const [view, setView] = useState("login"); // "login" | "forgot"
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setToken(data.token);
      localStorage.setItem("notecore_active_user", JSON.stringify(data.user));
      if (data.user?.semester) {
        localStorage.setItem("notecore_user_semester", JSON.stringify(data.user.semester));
      }
      if (Array.isArray(data.subjects)) {
        localStorage.setItem("notecore_user_subjects", JSON.stringify(data.subjects));
        sessionStorage.setItem("notecore_initial_subjects", JSON.stringify(data.subjects));
      }

      const targetRoute = data.user?.role === "admin" ? "/admin" : "/dashboard";
      showToast("¡Inicio de sesión exitoso! Redirigiendo...", "success");
      timerRef.current = setTimeout(() => navigate(targetRoute), 800);
    } catch (error) {
      showToast(error.message || "Error al iniciar sesión.", "danger");
      setLoading(false);
    }
  };

  const handleForgot = (email) => {
    showToast(
      `Revisa el mensaje enviado a: ${email} y sigue las instrucciones para recuperar tu contraseña.`,
      "success"
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
        <ForgotPasswordView
          onSubmit={handleForgot}
          onCancel={() => setView("login")}
        />
      )}
    </AuthLayout>
  );
}