import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import HomeView from "../components/dashboard/views/HomeView";
import SubjectsView from "../components/dashboard/views/SubjectsView";
import ToolsView from "../components/dashboard/views/ToolsView";
import StatsView from "../components/dashboard/views/StatsView";
import SettingsView from "../components/dashboard/views/SettingsView";
import SupportView from "../components/dashboard/views/SupportView";
import ProfileModal from "../components/dashboard/ProfileModal";
import ImportJsonModal from "../components/dashboard/modals/ImportJsonModal";
import SubjectDetailModal from "../components/dashboard/modals/SubjectDetailModal";
import ToolModal from "../components/dashboard/modals/ToolModal";
import { useToast } from "../context/ToastContext";
import {
  computeCutGrade,
  computeSubjectGrades,
  getGradeStatus,
} from "../utils/gradeHelpers";
import {
  mockUser,
  mockSemester,
  mockNotifications,
  mockSubjects,
  mockStatsCuts,
} from "../mocks/dashboardMocks";

const NAVIGATION = {
  main: [
    { id: "view-inicio", icon: "fa-house", label: "Inicio" },
    { id: "view-asignaturas", icon: "fa-book-open", label: "Asignaturas" },
    { id: "view-herramientas", icon: "fa-screwdriver-wrench", label: "Herramientas" },
    { id: "view-estadisticas", icon: "fa-chart-simple", label: "Estadísticas" },
  ],
  bottom: [
    { id: "view-ajustes", icon: "fa-gear", label: "Ajustes" },
    { id: "view-soporte", icon: "fa-headset", label: "Soporte" },
  ],
};

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem("notecore_active_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      const first = parsed.firstName || parsed.name || mockUser.firstName;
      const last = parsed.lastName ?? "";
      return {
        ...mockUser,
        ...parsed,
        firstName: first,
        lastName: last,
        fullName: `${first} ${last}`.trim(),
        greetingName: first.split(/\s+/)[0] || first,
      };
    }
  } catch {
    // Si falla el parseo, usa mockUser
  }
  return mockUser;
};

const getInitialSemester = () => {
  try {
    const saved = localStorage.getItem("notecore_user_semester");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.period || mockSemester;
    }
  } catch {
    // Ignorar
  }
  return mockSemester;
};

const getInitialSubjects = () => {
  try {
    const fromLocal = localStorage.getItem("notecore_user_subjects");
    if (fromLocal) return JSON.parse(fromLocal);
    const fromSession = sessionStorage.getItem("notecore_initial_subjects");
    if (fromSession) return JSON.parse(fromSession);
  } catch {
    // Si falla la lectura, continúa con mockSubjects
  }
  return mockSubjects;
};

export default function DashboardUser() {
  const [activeView, setActiveView] = useState("view-inicio");
  const [detailSubject, setDetailSubject] = useState(null);
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(getInitialUser);
  const [semester] = useState(getInitialSemester);
  const [subjects, setSubjects] = useState(getInitialSubjects);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const persistSubjects = (nextSubjects) => {
    setSubjects(nextSubjects);
    localStorage.setItem("notecore_user_subjects", JSON.stringify(nextSubjects));
    sessionStorage.setItem("notecore_initial_subjects", JSON.stringify(nextSubjects));
  };

  const closeModal = () => setModal(null);

  const redirectToLanding = (delay) => {
    timerRef.current = setTimeout(() => navigate("/"), delay);
  };

  const dashboardData = useMemo(() => {
    const total = subjects.length;

    const evaluatedSubjects = subjects.map((s) => {
      const grades = computeSubjectGrades(s.cuts || []);
      const statusInfo = getGradeStatus(grades.paceGrade, grades.evaluatedWeight);
      return { ...s, ...grades, statusInfo };
    });

    const sumAccumulated = evaluatedSubjects.reduce((acc, s) => acc + s.accumulated, 0);
    const average = total > 0 ? Number((sumAccumulated / total).toFixed(2)) : 0;

    const withGrades = evaluatedSubjects.filter((s) => s.evaluatedWeight > 0);
    const paceAverage =
      withGrades.length > 0
        ? Number(
          (
            withGrades.reduce((acc, s) => acc + s.paceGrade, 0) / withGrades.length
          ).toFixed(2)
        )
        : 0;

    let excelent = 0;
    let good = 0;
    let regular = 0;
    let atRisk = 0;

    withGrades.forEach((s) => {
      if (s.statusInfo.status === "excelent") excelent += 1;
      else if (s.statusInfo.status === "success") good += 1;
      else if (s.statusInfo.status === "warning") regular += 1;
      else if (s.statusInfo.status === "danger") atRisk += 1;
    });

    const evaluatedCount = withGrades.length;
    const pct = (count) => (evaluatedCount > 0 ? Math.round((count / evaluatedCount) * 100) : 0);

    const cutAverages = [0, 1, 2].map((idx) => {
      const validGrades = subjects
        .map((s) => computeCutGrade(s.cuts?.[idx]))
        .filter((g) => g !== null);
      if (validGrades.length === 0) return null;
      return validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
    });

    const lowestSubject = [...withGrades].sort((a, b) => a.paceGrade - b.paceGrade)[0];

    const recommendation =
      total === 0
        ? {
          subject: "Tus materias",
          message:
            "aún no tienen registros. Ve a Asignaturas y agrega tus materias del semestre para empezar.",
        }
        : withGrades.length === 0
          ? {
            subject: "Primer paso:",
            message:
              "registra tus primeras notas en Asignaturas para ver tu ritmo académico y proyecciones de corte.",
          }
          : lowestSubject && lowestSubject.paceGrade < 3.5
            ? {
              subject: lowestSubject.name,
              message: `requiere mayor atención esta semana. Tu promedio evaluado es ${lowestSubject.paceGrade.toFixed(1)} (acumulado ${lowestSubject.accumulated.toFixed(1)}). Usa las herramientas para proyectar tu próximo corte.`,
            }
            : {
              subject: "Excelente ritmo:",
              message:
                "todas tus asignaturas evaluadas van por buen camino. Sigue registrando tus notas para asegurar el semestre.",
            };

    return {
      kpis: {
        average,
        maxGrade: 5.0,
        trend:
          total > 0
            ? `${total} ${total === 1 ? "asignatura activa" : "asignaturas activas"}`
            : "Sin asignaturas aún",
        totalSubjects: total,
        goodStanding: excelent + good,
        atRisk,
      },
      estadoChart: {
        labels: ["Excelente", "En buen estado", "Regular", "En riesgo"],
        data: evaluatedCount > 0 ? [excelent, good, regular, atRisk] : [0, 0, 0, 0],
        legend: [
          { key: "excelente", label: "Excelente", count: excelent, percent: pct(excelent) },
          { key: "bueno", label: "En buen estado", count: good, percent: pct(good) },
          { key: "regular", label: "Regular", count: regular, percent: pct(regular) },
          { key: "en-riesgo", label: "En riesgo", count: atRisk, percent: pct(atRisk) },
        ],
      },
      rendimientoChart: {
        labels: ["Corte 1", "Corte 2", "Corte 3", "Acumulado"],
        data: [
          cutAverages[0] ?? 0,
          cutAverages[1] ?? 0,
          cutAverages[2] ?? 0,
          average,
        ],
        options: [
          { value: "promedio", label: "Promedio" },
          { value: "cortes", label: "Por Cortes" },
        ],
      },
      statsSummary: {
        cuts: cutAverages,
        current: average,
        paceCurrent: paceAverage,
        hasEvaluated: withGrades.length > 0,
      },
      recommendation,
    };
  }, [subjects]);

  const handleLogout = () => {
    showToast("Sesión cerrada.", "info");
    redirectToLanding(1000);
  };

  const handleSaveProfile = (form) => {
    const first = form.firstName.trim();
    const last = form.lastName.trim();
    setUser((prev) => {
      const updated = {
        ...prev,
        ...form,
        firstName: first,
        lastName: last,
        fullName: `${first} ${last}`.trim() || prev.fullName,
        greetingName: first.split(/\s+/)[0] || prev.greetingName,
      };
      localStorage.setItem("notecore_active_user", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveSubjectDetail = (updatedSub) => {
    const next = subjects.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    persistSubjects(next);
    showToast(`Notas de "${updatedSub.name}" guardadas.`, "success");
  };

  const handleSaveSimulation = (subjectId, simulation) => {
    const updated = subjects.map((s) =>
      s.id === subjectId
        ? { ...s, simulations: [simulation, ...(s.simulations || [])] }
        : s
    );
    persistSubjects(updated);
    const targetSub = updated.find((s) => s.id === subjectId);
    showToast(
      `Simulación guardada en "${targetSub?.name || "la asignatura"}".`,
      "success"
    );
  };

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      semester,
      subjects,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notecore-respaldo.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Descargando copia de seguridad en JSON...", "success");
  };

  const handleImport = async (file) => {
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.subjects)) {
        persistSubjects(data.subjects);
      }
      if (data.user && typeof data.user === "object") {
        handleSaveProfile({
          firstName: data.user.firstName || user.firstName,
          lastName: data.user.lastName || user.lastName,
          email: data.user.email || user.email,
          university: data.user.university || user.university,
          degree: data.user.degree || user.degree,
        });
      }
      showToast("Respaldo restaurado con éxito.", "success");
    } catch {
      showToast("El archivo JSON no es válido.", "danger");
    }
  };

  const handleReset = () => {
    const resetSubjects = subjects.map((s) => {
      const status = getGradeStatus(0.0, 0);
      return {
        ...s,
        current: 0.0,
        statusLabel: status.label,
        performance: status.label,
        cuts: (s.cuts || []).map((c) => ({
          ...c,
          activities: [],
          parcial: { grade: 0, weight: 100, locked: true },
          bonus: 0,
        })),
      };
    });
    persistSubjects(resetSubjects);
    showToast("Calificaciones del semestre restablecidas.", "warning");
  };

  const handleDelete = () => {
    localStorage.removeItem("notecore_active_user");
    localStorage.removeItem("notecore_user_semester");
    localStorage.removeItem("notecore_user_subjects");
    sessionStorage.removeItem("notecore_initial_subjects");
    showToast("Cuenta eliminada correctamente.", "danger");
    redirectToLanding(1200);
  };

  const activeToolId =
    modal && ["last-cut", "parcial-needed", "what-if", "strategy", "inverse"].includes(modal)
      ? modal
      : null;

  return (
    <>
      <DashboardLayout
        navigation={NAVIGATION}
        activeView={activeView}
        onNavigate={setActiveView}
        user={user}
        notifications={mockNotifications}
        onOpenProfile={() => setModal("profile")}
        onLogout={handleLogout}
        chatGreeting={`¡Hola ${user.greetingName}! Soy CoreAI. ¿En qué te puedo ayudar hoy con tus materias?`}
      >
        {activeView === "view-inicio" && (
          <HomeView
            user={user}
            semester={semester}
            kpis={dashboardData.kpis}
            estadoChart={dashboardData.estadoChart}
            rendimientoChart={dashboardData.rendimientoChart}
            recommendation={dashboardData.recommendation}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "view-asignaturas" && (
          <SubjectsView
            subjects={subjects}
            onSubjectsChange={persistSubjects}
            onOpenSubjectDetail={setDetailSubject}
          />
        )}
        {activeView === "view-herramientas" && <ToolsView onOpenTool={setModal} />}
        {activeView === "view-estadisticas" && (
          <StatsView
            semester={semester}
            subjects={subjects}
            summary={dashboardData.statsSummary}
            cuts={mockStatsCuts}
          />
        )}
        {activeView === "view-ajustes" && (
          <SettingsView
            onExport={handleExport}
            onOpenImport={() => setModal("import")}
            onReset={handleReset}
            onDelete={handleDelete}
          />
        )}
        {activeView === "view-soporte" && (
          <SupportView user={user} onNavigate={setActiveView} />
        )}
      </DashboardLayout>

      <ProfileModal
        isOpen={modal === "profile"}
        onClose={closeModal}
        user={user}
        onSave={handleSaveProfile}
      />
      <ImportJsonModal
        isOpen={modal === "import"}
        onClose={closeModal}
        onImport={handleImport}
        onInvalid={() => showToast("Selecciona un archivo con extensión .json", "warning")}
      />
      <SubjectDetailModal
        isOpen={!!detailSubject}
        onClose={() => setDetailSubject(null)}
        subject={detailSubject}
        onSaveSubject={handleSaveSubjectDetail}
      />
      <ToolModal
        isOpen={!!activeToolId}
        toolId={activeToolId}
        onClose={closeModal}
        subjects={subjects}
        onSaveSimulation={handleSaveSimulation}
        onSaveSubject={handleSaveSubjectDetail}
      />
    </>
  );
}