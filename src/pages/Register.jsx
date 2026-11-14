import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import StepBasicInfo from "../components/auth/StepBasicInfo";
import StepAcademic from "../components/auth/StepAcademic";
import StepSubjects from "../components/auth/StepSubjects";
import { useToast } from "../context/ToastContext";
import { authApi, setToken } from "../services/api";

export default function Register() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [basic, setBasic] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    terms: false,
  });
  const [academic, setAcademic] = useState({ university: "", degree: "" });
  const [subjects, setSubjects] = useState([]);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleFinish = async (formattedSubjects) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await authApi.register({
        firstName: basic.firstName.trim(),
        lastName: basic.lastName.trim(),
        email: basic.email.trim(),
        password: basic.password,
        university: academic.university,
        degree: academic.degree,
        subjects: formattedSubjects.map((s) => ({
          name: s.name,
          statsName: s.statsName || s.name,
          icon: s.icon || "fa-book",
        })),
      });

      setToken(data.token);
      localStorage.setItem("notecore_active_user", JSON.stringify(data.user));
      if (data.user?.semester) {
        localStorage.setItem("notecore_user_semester", JSON.stringify(data.user.semester));
      }
      localStorage.setItem("notecore_user_subjects", JSON.stringify(data.subjects || []));
      sessionStorage.setItem("notecore_initial_subjects", JSON.stringify(data.subjects || []));

      showToast("¡Cuenta creada con éxito! Redirigiendo a tu panel...", "success");
      timerRef.current = setTimeout(() => navigate("/dashboard"), 900);
    } catch (error) {
      showToast(error.message || "No se pudo completar el registro.", "danger");
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (accessToken) => {
    try {
      const data = await authApi.googleLogin(accessToken);
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
      showToast("¡Sesión iniciada con Google! Redirigiendo...", "success");

      if (!data.user?.degree && data.user?.role !== "admin") {
        setTimeout(() => {
          showToast(
            "No olvides ir a tu perfil para configurar tu institución y programa académico.",
            "info"
          );
        }, 1100);
        
      } timerRef.current = setTimeout(() => navigate(targetRoute), 800);
    } catch (error) {
      showToast(error.message || "No se pudo iniciar sesión con Google.", "danger");
    }
  };

  return (
    <AuthLayout showBackLink={step === 0}>
      {step === 0 && (
        <StepBasicInfo
          data={basic}
          onChange={setBasic}
          onNext={() => setStep(1)}
          onGoogleSuccess={handleGoogleSuccess}
        />
      )}
      {step === 1 && (
        <StepAcademic
          data={academic}
          onChange={setAcademic}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepSubjects
          subjects={subjects}
          onChange={setSubjects}
          onBack={() => setStep(1)}
          onFinish={handleFinish}
        />
      )}
    </AuthLayout>
  );
}