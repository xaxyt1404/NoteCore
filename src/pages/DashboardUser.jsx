import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import HomeView from "../components/dashboard/views/HomeView";
import SubjectsView from "../components/dashboard/views/SubjectsView";
import ToolsView from "../components/dashboard/views/ToolsView";
import StatsView from "../components/dashboard/views/StatsView";
import SettingsView from "../components/dashboard/views/SettingsView";
import SupportView from "../components/dashboard/views/SupportView";
import ProfileModal from "../components/dashboard/ProfileModal";
// import SimpleCalcModal from "../components/dashboard/modals/SimpleCalcModal";
// import CutCalcModal from "../components/dashboard/modals/CutCalcModal";
// import SubjectSimModal from "../components/dashboard/modals/SubjectSimModal";
import ImportJsonModal from "../components/dashboard/modals/ImportJsonModal";
import { useToast } from "../context/ToastContext";
import {
  mockUser,
  mockSemester,
  mockKpis,
  mockNotifications,
  mockSubjects,
  mockSubjectTabs,
  mockAttentionSubjectIds,
  mockStatsSummary,
  mockStatsCuts,
  mockRendimientoChart,
  mockEstadoChart,
  mockAiRecommendation,
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

export default function DashboardUser() {
  const [activeView, setActiveView] = useState("view-inicio");
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(mockUser);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const closeModal = () => setModal(null);

  const redirectToLogin = (delay) => {
    timerRef.current = setTimeout(() => navigate("/login"), delay);
  };

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
      subjects: mockSubjects,
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
      JSON.parse(await file.text());
      showToast("Respaldo restaurado con éxito.", "success");
    } catch {
      showToast("El archivo JSON no es válido.", "danger");
    }
  };

  const handleReset = () => showToast("Notas del semestre restablecidas a cero.", "warning");

  const handleDelete = () => {
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
            kpis={mockKpis}
            subjects={mockSubjects}
            attentionIds={mockAttentionSubjectIds}
            estadoChart={mockEstadoChart}
            rendimientoChart={mockRendimientoChart}
            recommendation={mockAiRecommendation}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "view-asignaturas" && (
          <SubjectsView subjects={mockSubjects} tabs={mockSubjectTabs} />
        )}
        {activeView === "view-herramientas" && <ToolsView onOpenTool={setModal} />}
        {activeView === "view-estadisticas" && (
          <StatsView
            semester={mockSemester}
            subjects={mockSubjects}
            summary={mockStatsSummary}
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
      {/* <SimpleCalcModal isOpen={modal === "simple"} onClose={closeModal} />
      <CutCalcModal isOpen={modal === "cut"} onClose={closeModal} />
      <SubjectSimModal isOpen={modal === "sim"} onClose={closeModal} /> */}
      <ImportJsonModal
        isOpen={modal === "import"}
        onClose={closeModal}
        onImport={handleImport}
        onInvalid={() => showToast("Selecciona un archivo con extensión .json", "warning")}
      />
    </>
  );
}