import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import StepBasicInfo from "../components/auth/StepBasicInfo";
import StepAcademic from "../components/auth/StepAcademic";
import StepSubjects from "../components/auth/StepSubjects";
import { useToast } from "../context/ToastContext";

const getAutoSemesterName = () => {
  const now = new Date();
  return `Semestre ${now.getFullYear()}-${now.getMonth() < 6 ? 1 : 2}`;
};

const saveUserData = (data) => {
  localStorage.setItem(
    "notecore_active_user",
    JSON.stringify({
      name: data.name,
      email: data.email,
      university: data.university,
      degree: data.degree,
    }),
  );
  localStorage.setItem(
    "notecore_user_semester",
    JSON.stringify({ period: getAutoSemesterName(), schema: "30-30-40" }),
  );
  localStorage.setItem("notecore_user_subjects", JSON.stringify(data.subjects));
};

export default function Register() {
  const [step, setStep] = useState(0);
  const [basic, setBasic] = useState({ email: "", name: "", password: "", terms: false });
  const [academic, setAcademic] = useState({ university: "", degree: "" });
  const [subjects, setSubjects] = useState([]);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleAcademicNext = () => {
    if (!academic.university) {
      showToast("Por favor selecciona tu institución.", "warning");
      return;
    }
    if (!academic.degree) {
      showToast("Por favor selecciona tu programa académico.", "warning");
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    if (subjects.length === 0) {
      showToast("Debes agregar al menos una asignatura para poder continuar.", "warning");
      return;
    }
    saveUserData({ ...basic, ...academic, subjects });
    showToast("¡Registro completado! Preparando tu panel...", "success");
    timerRef.current = setTimeout(() => navigate("/dashboard"), 1000);
  };

  return (
    <AuthLayout showBackLink={step === 0}>
      {step === 0 && (
        <StepBasicInfo data={basic} onChange={setBasic} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <StepAcademic
          data={academic}
          onChange={setAcademic}
          onBack={() => setStep(0)}
          onNext={handleAcademicNext}
        />
      )}
      {step === 2 && (
        <StepSubjects
          subjects={subjects}
          onChange={setSubjects}
          onBack={() => setStep(1)}
          onFinish={handleFinish}
          onWarning={(msg) => showToast(msg, "warning")}
        />
      )}
    </AuthLayout>
  );
}