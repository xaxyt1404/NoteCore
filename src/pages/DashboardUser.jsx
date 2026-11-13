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
import ToolModal from "../components/dashboard/modals/ToolModal";
import SubjectDetailModal from "../components/dashboard/modals/SubjectDetailModal";
import { useToast } from "../context/ToastContext";
import { getGradeStatus } from "../utils/gradeHelpers";
import {
  DEFAULT_CHAT_GREETING,
  DEFAULT_CUT_WEIGHTS,
  buildStatsCuts,
} from "../utils/academicConstants";
import {
  authApi,
  clearSessionStorageData,
  getToken,
  subjectsApi,
} from "../services/api";

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

const getCachedUser = () => {
  try {
    const saved = localStorage.getItem("notecore_active_user");
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignorar
  }
  return {
    firstName: "Estudiante",
    lastName: "",
    greetingName: "Estudiante",
    fullName: "Estudiante NoteCore",
    email: "",
    university: "Universidad de Cartagena",
    degree: "",
    roleLabel: "Estudiante Universitario",
    avatar: "",
    semester: { period: "Semestre 2026 - 2", schema: "30-30-40" },
  };
};

const getCachedSubjects = () => {
  try {
    const saved = localStorage.getItem("notecore_user_subjects");
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignorar
  }
  return [];
};

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

const computeSubjectGrades = (cuts = []) => {
  let accumulated = 0;
  let evaluatedWeight = 0;

  cuts.forEach((c) => {
    const grade = computeCutGrade(c);
    if (grade !== null) {
      const w = (Number(c.weight) || 0) / 100;
      accumulated += grade * w;
      evaluatedWeight += w;
    }
  });

  const paceGrade =
    evaluatedWeight > 0 ? Number((accumulated / evaluatedWeight).toFixed(2)) : 0;

  return {
    accumulated: Number(accumulated.toFixed(2)),
    evaluatedWeight,
    paceGrade,
  };
};

export default function DashboardUser() {
  const [activeView, setActiveView] = useState("view-inicio");
  const [detailSubject, setDetailSubject] = useState(null);
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(getCachedUser);
  const [subjects, setSubjects] = useState(getCachedSubjects);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    authApi
      .getMe()
      .then((res) => {
        if (!active) return;
        if (res.user?.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }
        setUser(res.user);
        setSubjects(res.subjects || []);
        localStorage.setItem("notecore_active_user", JSON.stringify(res.user));
        localStorage.setItem("notecore_user_subjects", JSON.stringify(res.subjects || []));
      })
      .catch(() => {
        if (!active) return;
        clearSessionStorageData();
        navigate("/login", { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const syncSubjectsCache = (nextSubjects) => {
    setSubjects(nextSubjects);
    localStorage.setItem("notecore_user_subjects", JSON.stringify(nextSubjects));
    sessionStorage.setItem("notecore_initial_subjects", JSON.stringify(nextSubjects));
  };

  const closeModal = () => setModal(null);

  const redirectToLanding = (delay) => {
    timerRef.current = setTimeout(() => navigate("/"), delay);
  };

  const semester = user?.semester?.period || "Semestre 2026 - 2";

  const cutWeights = useMemo(() => {
    if (subjects[0]?.cuts?.length) {
      return subjects[0].cuts.map((c) => Number(c.weight));
    }
    if (user?.semester?.schema) {
      const parsed = user.semester.schema.split("-").map(Number).filter(Boolean);
      if (parsed.length) return parsed;
    }
    return DEFAULT_CUT_WEIGHTS;
  }, [subjects, user]);

  const statsCuts = useMemo(() => buildStatsCuts(cutWeights), [cutWeights]);

  const notifications = useMemo(() => {
    const atRiskSubs = subjects.filter(
      (s) => Number(s.current) > 0 && Number(s.current) <= 3.0
    );
    if (atRiskSubs.length > 0) {
      return atRiskSubs.map((s, idx) => ({
        id: s.id || idx + 1,
        variant: "danger",
        icon: "fa-solid fa-triangle-exclamation",
        subject: s.name,
        message: `Tu nota actual es ${Number(s.current).toFixed(1)}. ¡Atención con el próximo corte!`,
        time: "En curso",
        unread: true,
      }));
    }
    return [
      {
        id: "welcome",
        variant: "primary",
        icon: "fa-solid fa-graduation-cap",
        subject: "NoteCore",
        message:
          subjects.length > 0
            ? "Tus asignaturas están sincronizadas con la nube."
            : "¡Bienvenido! Registra tus notas en Asignaturas para proyectar tu semestre.",
        time: "Ahora",
        unread: subjects.length === 0,
      },
    ];
  }, [subjects]);

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

    const cutAverages = cutWeights.map((_, idx) => {
      const validGrades = subjects
        .map((s) => computeCutGrade(s.cuts?.[idx]))
        .filter((g) => g !== null);
      if (validGrades.length === 0) return null;
      return validGrades.reduce((a, b) => a + b, 0) / validGrades.length;
    });

    const attentionIds = evaluatedSubjects
      .filter((s) => s.evaluatedWeight > 0 && s.paceGrade <= 3.0)
      .map((s) => s.id);

    const lowestSubject = [...withGrades].sort((a, b) => a.paceGrade - b.paceGrade)[0];

    const recommendation =
      total === 0
        ? {
          subject: "Tus asignaturas",
          message:
            "aún no tienen registros. Ve a Asignaturas y agrega tus asignaturas del semestre para empezar.",
        }
        : withGrades.length === 0
          ? {
            subject: "Primer paso:",
            message:
              "registra tus primeras notas en Asignaturas para ver tu ritmo académico y proyecciones de corte.",
          }
          : lowestSubject && lowestSubject.paceGrade <= 3.0
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
      attentionIds,
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
        labels: [...cutWeights.map((_, i) => `Corte ${i + 1}`), "Acumulado"],
        data: [...cutAverages.map((val) => val ?? 0), average],
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
  }, [subjects, cutWeights]);

  const handleLogout = () => {
    clearSessionStorageData();
    showToast("Sesión cerrada.", "info");
    redirectToLanding(900);
  };

  const handleSaveProfile = async (form) => {
    try {
      const res = await authApi.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        university: form.university,
        degree: form.degree,
        avatar: form.avatar,
      });
      setUser(res.user);
      localStorage.setItem("notecore_active_user", JSON.stringify(res.user));
      showToast("Perfil actualizado correctamente.", "success");
    } catch (error) {
      showToast(error.message || "Error al actualizar perfil.", "danger");
    }
  };

  const handleSaveSubjectDetail = async (updatedSub) => {
    try {
      const res = await subjectsApi.update(updatedSub.id, updatedSub);
      const next = subjects.map((s) => (s.id === res.subject.id ? res.subject : s));
      syncSubjectsCache(next);
      showToast(`Notas de "${res.subject.name}" guardadas.`, "success");
    } catch (error) {
      showToast(error.message || "Error al guardar las notas.", "danger");
    }
  };

  const handleSaveSimulation = async (subjectId, simulation) => {
    try {
      const res = await subjectsApi.addSimulation(subjectId, {
        toolId: simulation.toolId,
        toolTitle: simulation.toolTitle,
        summary: simulation.summary,
      });
      const updated = subjects.map((s) => (s.id === subjectId ? res.subject : s));
      syncSubjectsCache(updated);
      showToast(`Simulación guardada en "${res.subject?.name || "la asignatura"}".`, "success");
    } catch (error) {
      showToast(error.message || "No se pudo guardar la simulación.", "danger");
    }
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
        const res = await subjectsApi.importBackup(data.subjects);
        syncSubjectsCache(res.subjects || []);
      }
      if (data.user && typeof data.user === "object") {
        await handleSaveProfile({
          firstName: data.user.firstName || user.firstName,
          lastName: data.user.lastName || user.lastName,
          email: data.user.email || user.email,
          university: data.user.university || user.university,
          degree: data.user.degree || user.degree,
          avatar: data.user.avatar ?? user.avatar,
        });
      }
      showToast("Respaldo restaurado en la nube con éxito.", "success");
    } catch (error) {
      showToast(error.message || "El archivo JSON no es válido.", "danger");
    }
  };

  const handleReset = async () => {
    try {
      const res = await authApi.resetSemester();
      syncSubjectsCache(res.subjects || []);
      showToast("Calificaciones del semestre restablecidas.", "warning");
    } catch (error) {
      showToast(error.message || "Error al restablecer semestre.", "danger");
    }
  };

  const handleDelete = async () => {
    try {
      await authApi.deleteAccount();
      clearSessionStorageData();
      showToast("Cuenta eliminada correctamente.", "danger");
      redirectToLanding(1100);
    } catch (error) {
      showToast(error.message || "No se pudo eliminar la cuenta.", "danger");
    }
  };

  return (
    <>
      <DashboardLayout
        navigation={NAVIGATION}
        activeView={activeView}
        onNavigate={setActiveView}
        user={user}
        notifications={notifications}
        onOpenProfile={() => setModal("profile")}
        onLogout={handleLogout}
        chatGreeting={DEFAULT_CHAT_GREETING(user.greetingName)}
      >
        {activeView === "view-inicio" && (
          <HomeView
            user={user}
            semester={semester}
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
            onSubjectsChange={syncSubjectsCache}
            onOpenSubjectDetail={setDetailSubject}
          />
        )}
        {activeView === "view-herramientas" && <ToolsView onOpenTool={setModal} />}
        {activeView === "view-estadisticas" && (
          <StatsView
            semester={semester}
            subjects={subjects}
            summary={dashboardData.statsSummary}
            cuts={statsCuts}
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
          <SupportView
            user={user}
            onNavigate={setActiveView}
          />
        )}
      </DashboardLayout>

      <SubjectDetailModal
        isOpen={Boolean(detailSubject)}
        onClose={() => setDetailSubject(null)}
        subject={detailSubject}
        onSaveSubject={handleSaveSubjectDetail}
      />
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
      <ToolModal
        toolId={
          ["last-cut", "parcial-needed", "what-if", "strategy", "inverse"].includes(modal)
            ? modal
            : null
        }
        onClose={closeModal}
        subjects={subjects}
        onSaveSimulation={handleSaveSimulation}
      />
    </>
  );
}