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
import { useToast } from "../context/ToastContext";
import { getGradeStatus } from "../utils/gradeHelpers";
import {
  mockUser,
  mockSemester,
  mockNotifications,
  mockSubjects,
  mockStatsCuts,
  mockChatGreeting,
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

// Lee las asignaturas creadas en el registro (StepSubjects) o usa mockSubjects
const getInitialSubjects = () => {
  try {
    const saved = sessionStorage.getItem("notecore_initial_subjects");
    if (saved) return JSON.parse(saved);
  } catch {
    // Si falla la lectura, continúa con mockSubjects
  }
  return mockSubjects;
};

// Calcula la nota de un corte individual (o null si aún no tiene notas)
const computeCutGrade = (cut) => {
  if (!cut) return null;
  const activitiesSum = (cut.activities || []).reduce(
    (acc, act) => acc + (Number(act.grade) || 0) * ((Number(act.weight) || 0) / 100),
    0
  );
  const parcialSum =
    (Number(cut.parcial?.grade) || 0) * ((Number(cut.parcial?.weight) || 0) / 100);

  const hasAnyGrade =
    (cut.activities || []).some((a) => a.grade > 0 || a.locked) ||
    cut.parcial?.grade > 0 ||
    cut.parcial?.locked ||
    cut.bonus > 0;

  if (!hasAnyGrade) return null;
  return Math.min(5.0, activitiesSum + parcialSum + (Number(cut.bonus) || 0));
};

export default function DashboardUser() {
  const [activeView, setActiveView] = useState("view-inicio");
  const [detailSubject, setDetailSubject] = useState(null);
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(mockUser);
  const [subjects, setSubjects] = useState(getInitialSubjects);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const closeModal = () => setModal(null);

  const redirectToLogin = (delay) => {
    timerRef.current = setTimeout(() => navigate("/login"), delay);
  };

  // Métricas, gráficos y resúmenes calculados dinámicamente desde `subjects`
  const dashboardData = useMemo(() => {
    const total = subjects.length;
    const sumCurrent = subjects.reduce((acc, s) => acc + (Number(s.current) || 0), 0);
    const average = total > 0 ? Number((sumCurrent / total).toFixed(2)) : 0;

    let excelent = 0;
    let good = 0;
    let regular = 0;
    let atRisk = 0;

    subjects.forEach((s) => {
      const { status } = getGradeStatus(s.current);
      if (status === "excelent") excelent += 1;
      else if (status === "success") good += 1;
      else if (status === "warning") regular += 1;
      else atRisk += 1;
    });

    const pct = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

    // Promedio por cada corte (C1, C2, C3) entre todas las materias
    const cutAverages = [0, 1, 2].map((idx) => {
      const validGrades = subjects
        .map((s) => computeCutGrade(s.cuts?.[idx]))
        .filter((g) => g !== null);
      if (validGrades.length === 0) return null;
      return validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
    });

    // Asignaturas en riesgo o regular para la tarjeta de atención
    const attentionIds = subjects
      .filter((s) => Number(s.current) < 3.5)
      .map((s) => s.id);

    const lowestSubject = [...subjects].sort((a, b) => a.current - b.current)[0];

    const recommendation =
      total === 0
        ? {
          subject: "Tus asignaturas",
          message:
            "aún no tienen registros. Ve a Asignaturas y agrega tus asignaturas del semestre para empezar.",
        }
        : lowestSubject && lowestSubject.current < 3.5
          ? {
            subject: lowestSubject.name,
            message: `requiere mayor atención esta semana. Tu nota actual es ${lowestSubject.current.toFixed(1)}. Usa las herramientas de simulación para proyectar tu próximo corte.`,
          }
          : {
            subject: "Excelente ritmo:",
            message:
              "todas tus asignaturas están aprobando. Sigue registrando tus evaluaciones para mantener tu promedio.",
          };

    return {
      kpis: {
        average,
        maxGrade: 5.0,
        trend: total > 0 ? `${total} ${total === 1 ? "asignatura activa" : "asignaturas activas"}` : "Sin asignaturas aún",
        totalSubjects: total,
        goodStanding: excelent + good,
        atRisk,
      },
      attentionIds,
      estadoChart: {
        labels: ["Excelente", "En buen estado", "Regular", "En riesgo"],
        data: total > 0 ? [excelent, good, regular, atRisk] : [0, 0, 0, 0],
        legend: [
          { key: "excelente", label: "Excelente", count: excelent, percent: pct(excelent) },
          { key: "bueno", label: "En buen estado", count: good, percent: pct(good) },
          { key: "regular", label: "Regular", count: regular, percent: pct(regular) },
          { key: "en-riesgo", label: "En riesgo", count: atRisk, percent: pct(atRisk) },
        ],
      },
      rendimientoChart: {
        labels: ["Corte 1", "Corte 2", "Corte 3", "Actual"],
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
      },
      recommendation,
    };
  }, [subjects]);

  const handleLogout = () => {
    showToast("Sesión cerrada.", "info");
    redirectToLogin(1000);
  };

  const handleSaveProfile = (form) => {
    const first = form.firstName.trim();
    setUser((prev) => ({
      ...prev,
      ...form,
      fullName: first || prev.fullName,
      greetingName: first.split(" ")[0] || prev.greetingName,
    }));
  };

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      semester: mockSemester,
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
        setSubjects(data.subjects);
        sessionStorage.setItem("notecore_initial_subjects", JSON.stringify(data.subjects));
      }
      showToast("Respaldo restaurado con éxito.", "success");
    } catch {
      showToast("El archivo JSON no es válido.", "danger");
    }
  };

  const handleReset = () => {
    setSubjects([]);
    sessionStorage.removeItem("notecore_initial_subjects");
    showToast("Asignaturas y notas del semestre restablecidas.", "warning");
  };

  const handleDelete = () => {
    sessionStorage.removeItem("notecore_initial_subjects");
    showToast("Cuenta eliminada correctamente.", "danger");
    redirectToLogin(1200);
  };

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
        chatGreeting={mockChatGreeting}
      >
        {activeView === "view-inicio" && (
          <HomeView
            user={user}
            semester={mockSemester}
            kpis={dashboardData.kpis}
            subjects={subjects}
            attentionIds={dashboardData.attentionIds}
            estadoChart={dashboardData.estadoChart}
            rendimientoChart={dashboardData.rendimientoChart}
            recommendation={dashboardData.recommendation}
            onNavigate={setActiveView}
            onOpenSubjectDetail={(subject) => {
              setDetailSubject(subject);
              setActiveView("view-asignaturas");
            }}
          />
        )}
        {activeView === "view-asignaturas" && (
          <SubjectsView
            subjects={subjects}
            initialDetailSubject={detailSubject}
            onClearInitialDetail={() => setDetailSubject(null)}
            onSubjectsChange={(next) => {
              setSubjects(next);
              sessionStorage.setItem("notecore_initial_subjects", JSON.stringify(next));
            }}
          />
        )}
        {activeView === "view-herramientas" && <ToolsView onOpenTool={setModal} />}
        {activeView === "view-estadisticas" && (
          <StatsView
            semester={mockSemester}
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
        {activeView === "view-soporte" && <SupportView />}
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
    </>
  );
}