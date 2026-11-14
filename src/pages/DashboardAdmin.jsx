import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import DashboardLayout from "../layouts/DashboardLayout";
import ProfileModal from "../components/dashboard/ProfileModal";
import Modal from "../components/common/Modal";
import CustomDropdown from "../components/common/CustomDropdown";
import { useToast } from "../context/ToastContext";
import {
  adminApi,
  authApi,
  clearSessionStorageData,
  contactApi,
  getToken,
} from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const cssVar = (name, fallback) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    : fallback;

const NAVIGATION = {
  main: [
    { id: "view-admin-inicio", icon: "fa-house", label: "Inicio" },
    { id: "view-admin-mensajes", icon: "fa-inbox", label: "Mensajes" },
    { id: "view-admin-universidades", icon: "fa-building-columns", label: "Instituciones" },
    { id: "view-admin-usuarios", icon: "fa-users", label: "Usuarios" },
  ],
  bottom: [],
};

const TRAFFIC_RANGE_OPTIONS = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
];

const getCachedAdmin = () => {
  try {
    const saved = localStorage.getItem("notecore_active_user");
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignorar
  }
  return {
    firstName: "Admin",
    lastName: "NoteCore",
    greetingName: "Admin",
    fullName: "Admin NoteCore",
    email: "admin@notecore.com",
    university: "Universidad de Cartagena",
    degree: "Administración del Sistema",
    roleLabel: "Administrador",
    avatar: "",
  };
};

export default function DashboardAdmin() {
  const [activeView, setActiveView] = useState("view-admin-inicio");
  const [user, setUser] = useState(getCachedAdmin);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trafficRange, setTrafficRange] = useState("7d");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubjects: 0,
    pendingMessages: 0,
    totalUniversities: 0,
  });
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [universities, setUniversities] = useState([]);

  const [msgFilter, setMsgFilter] = useState("all");
  const [replyModalMsg, setReplyModalMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [uniModal, setUniModal] = useState({ open: false, editing: null });
  const [uniForm, setUniForm] = useState({
    name: "",
    city: "Cartagena",
    cutsInput: "30, 30, 40",
    programsInput: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    degree: "",
  });

  const { showToast } = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const loadAdminData = async () => {
    try {
      const [meRes, overviewRes] = await Promise.all([
        authApi.getMe(),
        adminApi.getOverview(),
      ]);

      if (meRes.user?.role !== "admin") {
        navigate("/dashboard", { replace: true });
        return;
      }

      setUser(meRes.user);
      localStorage.setItem("notecore_active_user", JSON.stringify(meRes.user));
      setStats(overviewRes.stats || {});
      setUsers(overviewRes.users || []);
      setMessages(overviewRes.messages || []);
      setUniversities(overviewRes.universities || []);
    } catch {
      clearSessionStorageData();
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const notifications = useMemo(() => {
    const pending = messages.filter((m) => m.status === "pending");
    if (pending.length === 0) {
      return [
        {
          id: "admin-ok",
          variant: "primary",
          icon: "fa-solid fa-circle-check",
          subject: "Buzón al día",
          message: "No tienes mensajes pendientes por responder.",
          time: "Ahora",
          unread: false,
        },
      ];
    }
    return pending.map((m) => ({
      id: m.id,
      variant: "warning",
      icon: "fa-solid fa-envelope",
      subject: m.name,
      message: m.message.length > 70 ? `${m.message.slice(0, 70)}...` : m.message,
      time: new Date(m.createdAt).toLocaleDateString("es-CO"),
      unread: true,
    }));
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (msgFilter === "pending") return messages.filter((m) => m.status === "pending");
    if (msgFilter === "resolved") return messages.filter((m) => m.status === "resolved");
    return messages;
  }, [messages, msgFilter]);

  const universityNames = useMemo(() => universities.map((u) => u.name), [universities]);

  const selectedUserDegrees = useMemo(() => {
    const found = universities.find((u) => u.name === userForm.university);
    return found?.programs || [];
  }, [universities, userForm.university]);

  const { trafficChartData, trafficChartOptions } = useMemo(() => {
    const days = trafficRange === "30d" ? 30 : 7;
    const primary = cssVar("--primary", "#2ab8ff");
    const success = cssVar("--success", "#18a87c");
    const textMuted = cssVar("--text-muted", "#8c9ba5");
    const borderColor = cssVar("--border-color", "#2b3744");

    const toDayKey = (dateVal) => {
      const d = new Date(dateVal);
      if (Number.isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    };

    const userCounts = {};
    users.forEach((u) => {
      const k = toDayKey(u.createdAt);
      if (k) userCounts[k] = (userCounts[k] || 0) + 1;
    });

    const msgCounts = {};
    messages.forEach((m) => {
      const k = toDayKey(m.createdAt);
      if (k) msgCounts[k] = (msgCounts[k] || 0) + 1;
    });

    const labels = [];
    const userSeries = [];
    const msgSeries = [];

    const today = new Date();
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDayKey(d);
      labels.push(
        d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
      );
      userSeries.push(userCounts[key] || 0);
      msgSeries.push(msgCounts[key] || 0);
    }

    return {
      trafficChartData: {
        labels,
        datasets: [
          {
            label: "Registros",
            data: userSeries,
            borderColor: primary,
            backgroundColor: "rgba(42, 184, 255, 0.14)",
            fill: true,
            tension: 0.35,
            pointBackgroundColor: primary,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: days > 14 ? 3 : 5,
          },
          {
            label: "Mensajes",
            data: msgSeries,
            borderColor: success,
            backgroundColor: "rgba(24, 168, 124, 0.10)",
            fill: true,
            tension: 0.35,
            pointBackgroundColor: success,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: days > 14 ? 3 : 5,
          },
        ],
      },
      trafficChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: textMuted, boxWidth: 12, font: { weight: "600" } },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 5,
            ticks: {
              stepSize: 1,
              color: textMuted,
              font: { weight: "600" },
            },
            grid: { color: borderColor },
          },
          x: {
            ticks: { color: textMuted, font: { weight: "600" } },
            grid: { display: false },
          },
        },
      },
    };
  }, [users, messages, trafficRange]);

  const handleLogout = () => {
    clearSessionStorageData();
    showToast("Sesión de administrador cerrada.", "info");
    timerRef.current = setTimeout(() => navigate("/"), 800);
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

  const openUserModal = (target) => {
    if (target.role === "admin") return;
    setSelectedUser(target);
    setEditingUser(false);
    setConfirmDeleteUser(false);
    setUserForm({
      firstName: target.firstName || "",
      lastName: target.lastName || "",
      email: target.email || "",
      university: target.university || "",
      degree: target.degree || "",
    });
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setEditingUser(false);
    setConfirmDeleteUser(false);
  };

  const handleToggleEditUser = async () => {
    if (!editingUser) {
      setEditingUser(true);
      setConfirmDeleteUser(false);
      return;
    }

    if (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim()) {
      showToast("Nombre, apellidos y correo electrónico son obligatorios.", "warning");
      return;
    }
    if (!userForm.university || !userForm.degree) {
      showToast("Selecciona la institución y el programa académico.", "warning");
      return;
    }

    setSavingUser(true);
    try {
      const res = await adminApi.updateUser(selectedUser.id, {
        firstName: userForm.firstName.trim(),
        lastName: userForm.lastName.trim(),
        email: userForm.email.trim(),
        university: userForm.university,
        degree: userForm.degree,
      });
      setUsers((prev) => prev.map((u) => (u.id === res.user.id ? res.user : u)));
      setSelectedUser(res.user);
      setEditingUser(false);
      showToast("Perfil de usuario actualizado correctamente.", "success");
    } catch (error) {
      showToast(error.message || "Error al actualizar el usuario.", "danger");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteSelectedUser = async () => {
    if (!selectedUser || savingUser) return;
    if (!confirmDeleteUser) {
      setConfirmDeleteUser(true);
      return;
    }

    setSavingUser(true);
    try {
      await adminApi.deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setStats((prev) => ({
        ...prev,
        totalUsers: Math.max(0, (prev.totalUsers || 1) - 1),
      }));
      showToast(`Perfil de "${selectedUser.fullName}" eliminado.`, "danger");
      closeUserModal();
    } catch (error) {
      showToast(error.message || "No se pudo eliminar el perfil.", "danger");
    } finally {
      setSavingUser(false);
    }
  };

  const openReplyModal = (msg) => {
    setReplyModalMsg(msg);
    setReplyText(msg.adminReply || "");
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyModalMsg || !replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await contactApi.updateStatus(replyModalMsg.id, {
        status: "resolved",
        adminReply: replyText.trim(),
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === res.contact.id ? res.contact : m))
      );
      setStats((prev) => ({
        ...prev,
        pendingMessages: Math.max(
          0,
          messages.filter((m) => m.id !== res.contact.id && m.status === "pending").length
        ),
      }));

      const mailSubject = encodeURIComponent("Respuesta de Soporte - NoteCore");
      const mailBody = encodeURIComponent(
        `Hola ${replyModalMsg.name},\n\n${replyText.trim()}\n\nSaludos,\nEquipo NoteCore`
      );
      window.open(
        `mailto:${replyModalMsg.email}?subject=${mailSubject}&body=${mailBody}`,
        "_blank"
      );

      showToast(
        res.hasAccount
          ? "Respuesta guardada (notificada en NoteCore) y enviada al correo."
          : "Respuesta guardada y enviada al correo del usuario.",
        "success"
      );
      setReplyModalMsg(null);
      setReplyText("");
    } catch (error) {
      showToast(error.message || "No se pudo guardar la respuesta.", "danger");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await contactApi.remove(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showToast("Mensaje eliminado.", "info");
    } catch (error) {
      showToast(error.message || "No se pudo eliminar el mensaje.", "danger");
    }
  };

  const openNewUniModal = () => {
    setUniForm({
      name: "",
      city: "Cartagena",
      cutsInput: "30, 30, 40",
      programsInput: "",
    });
    setUniModal({ open: true, editing: null });
  };

  const openEditUniModal = (uni) => {
    setUniForm({
      name: uni.name,
      city: uni.city || "Cartagena",
      cutsInput: (uni.cutWeights || [30, 30, 40]).join(", "),
      programsInput: (uni.programs || []).join("\n"),
    });
    setUniModal({ open: true, editing: uni });
  };

  const handleSaveUniversity = async (e) => {
    e.preventDefault();
    const cutWeights = uniForm.cutsInput
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);

    const sum = cutWeights.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      showToast("Los porcentajes de los cortes deben sumar exactamente 100%.", "warning");
      return;
    }

    const programs = uniForm.programsInput
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      if (uniModal.editing) {
        const res = await adminApi.updateUniversity(uniModal.editing.id, {
          name: uniForm.name.trim(),
          city: uniForm.city.trim(),
          cutWeights,
          programs,
        });
        setUniversities((prev) =>
          prev.map((u) => (u.id === res.university.id ? res.university : u))
        );
        showToast("Institución actualizada correctamente.", "success");
      } else {
        const res = await adminApi.createUniversity({
          name: uniForm.name.trim(),
          city: uniForm.city.trim(),
          cutWeights,
          programs,
        });
        setUniversities((prev) => [...prev, res.university]);
        showToast("Institución creada correctamente.", "success");
      }
      setUniModal({ open: false, editing: null });
    } catch (error) {
      showToast(error.message || "Error al guardar la institución.", "danger");
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
        onOpenProfile={() => setProfileOpen(true)}
        onLogout={handleLogout}
        chatGreeting={`¡Hola ${user.greetingName}! Panel administrativo activo.`}
      >
        {/* VISTA 1: INICIO ADMIN */}
        {activeView === "view-admin-inicio" && (
          <section id="view-admin-inicio" className="dash-view active">
            <div className="view-welcome-bar">
              <div className="welcome-heading">
                <h1>
                  Panel Administrativo, <span className="highlight">{user.greetingName}</span> 🛡️
                </h1>
                <p>Resumen general del sistema, usuarios activos y mensajes de soporte.</p>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={loadAdminData}
                disabled={loading}
              >
                <i className="fa-solid fa-rotate icon-left"></i> Actualizar
              </button>
            </div>

            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon-box">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Usuarios Registrados</span>
                  <div className="kpi-value">{stats.totalUsers}</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box">
                  <i className="fa-solid fa-book"></i>
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Asignaturas Creadas</span>
                  <div className="kpi-value">{stats.totalSubjects}</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-box">
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Instituciones Activas</span>
                  <div className="kpi-value">{stats.totalUniversities}</div>
                </div>
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-header">
                <div>
                  <h3>
                    <i className="fa-solid fa-chart-line card-icon"></i> Tráfico de la página
                  </h3>
                  <p className="dash-card-sub">
                    Actividad diaria de registros y consultas en NoteCore
                  </p>
                </div>
                <CustomDropdown
                  options={TRAFFIC_RANGE_OPTIONS}
                  value={trafficRange}
                  onChange={setTrafficRange}
                />
              </div>
              <div>
                <div className="chart-container">
                  <Line data={trafficChartData} options={trafficChartOptions} />
                </div>
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-header">
                <div>
                  <h3>
                    <i className="fa-solid fa-inbox card-icon"></i> Últimos mensajes recibidos
                  </h3>
                  <p className="dash-card-sub">
                    Consultas enviadas desde la Landing o Soporte dentro de NoteCore.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveView("view-admin-mensajes")}
                >
                  Ver buzón completo
                </button>
              </div>

              {messages.length === 0 ? (
                <p className="dash-card-sub">No hay mensajes registrados todavía.</p>
              ) : (
                <div className="attention-subjects-list">
                  {messages.slice(0, 4).map((m) => (
                    <div key={m.id} className="attention-subject-item is-static">
                      <div className="subject-header-row">
                        <span className="subject-name">
                          {m.name} ({m.email})
                        </span>
                        <span
                          className={`subject-grade-badge ${m.status === "resolved" ? "success" : "warning"
                            }`}
                        >
                          {m.status === "resolved" ? "Respondido" : "Pendiente"}
                        </span>
                      </div>
                      <p className="dash-card-sub">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* VISTA 2: MENSAJES (BUZÓN INTERNO) */}
        {activeView === "view-admin-mensajes" && (
          <section id="view-admin-mensajes" className="dash-view active">
            <div className="view-welcome-bar">
              <div className="welcome-heading">
                <h1>Buzón de Mensajes 📬</h1>
                <p>Gestiona y responde las consultas enviadas por NoteCore.</p>
              </div>
            </div>

            <div className="sim-tabs">
              <button
                type="button"
                className={`tab-btn${msgFilter === "all" ? " active" : ""}`}
                onClick={() => setMsgFilter("all")}
              >
                Todos ({messages.length})
              </button>
              <button
                type="button"
                className={`tab-btn${msgFilter === "pending" ? " active" : ""}`}
                onClick={() => setMsgFilter("pending")}
              >
                Pendientes ({messages.filter((m) => m.status === "pending").length})
              </button>
              <button
                type="button"
                className={`tab-btn${msgFilter === "resolved" ? " active" : ""}`}
                onClick={() => setMsgFilter("resolved")}
              >
                Respondidos ({messages.filter((m) => m.status === "resolved").length})
              </button>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="dash-card empty-state-card">
                <p className="dash-card-sub">No hay mensajes en esta categoría.</p>
              </div>
            ) : (
              <div className="attention-subjects-list">
                {filteredMessages.map((m) => (
                  <div key={m.id} className="dash-card">
                    <div className="dash-card-header">
                      <div>
                        <h3>{m.name}</h3>
                        <p className="dash-card-sub">
                          {m.email} · Origen:{" "}
                          {m.source === "dashboard-support" ? "Soporte App" : "Landing"} ·{" "}
                          {new Date(m.createdAt).toLocaleString("es-CO")}
                        </p>
                      </div>
                      <span
                        className={`subject-grade-badge ${m.status === "resolved" ? "success" : "warning"
                          }`}
                      >
                        {m.status === "resolved" ? "Respondido" : "Pendiente"}
                      </span>
                    </div>

                    <p>{m.message}</p>

                    {m.adminReply && (
                      <div className="scenario-card">
                        <strong>Tu respuesta:</strong>
                        <p className="dash-card-sub">{m.adminReply}</p>
                      </div>
                    )}

                    <div className="modal-footer modal-footer-between">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openReplyModal(m)}
                      >
                        <i className="fa-solid fa-reply icon-left"></i>
                        {m.adminReply ? "Editar respuesta" : "Responder"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-danger"
                        onClick={() => handleDeleteMessage(m.id)}
                      >
                        <i className="fa-solid fa-trash icon-left"></i> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VISTA 3: INSTITUCIONES Y ESQUEMAS DE CORTES */}
        {activeView === "view-admin-universidades" && (
          <section id="view-admin-universidades" className="dash-view active">
            <div className="view-welcome-bar">
              <div className="welcome-heading">
                <h1>Instituciones y Cortes 🏛️</h1>
                <p>Configura universidades, porcentajes de cortes y programas académicos.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={openNewUniModal}>
                <i className="fa-solid fa-plus icon-left"></i> Agregar institución
              </button>
            </div>

            <div className="subjects-grid-3col">
              {universities.map((u) => (
                <div key={u.id} className="dash-card">
                  <div className="dash-card-header">
                    <div>
                      <h3>{u.name}</h3>
                      <p className="dash-card-sub">
                        {u.city} · Esquema cortes: <strong>{u.schemaLabel}</strong>
                      </p>
                    </div>
                  </div>
                  <p className="dash-card-sub">
                    <strong>{u.programs?.length || 0}</strong> programas académicos activos.
                  </p>
                  <div className="subject-card-footer">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => openEditUniModal(u)}
                    >
                      <i className="fa-solid fa-pen icon-left"></i> Configurar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VISTA 4: USUARIOS */}
        {activeView === "view-admin-usuarios" && (
          <section id="view-admin-usuarios" className="dash-view active">
            <div className="view-welcome-bar">
              <div className="welcome-heading">
                <h1>Usuarios Registrados 👥</h1>
                <p>Listado de cuentas creadas en NoteCore ({users.length}).</p>
              </div>
            </div>

            <div className="dash-card">
              <div className="attention-subjects-list">
                {users.map((u) => {
                  const isAdminAccount = u.role === "admin";
                  return (
                    <div
                      key={u.id}
                      className={`attention-subject-item${isAdminAccount ? " is-static" : ""}`}
                      onClick={isAdminAccount ? undefined : () => openUserModal(u)}
                    >
                      <div className="subject-header-row">
                        <span className="subject-name">
                          {u.fullName} ({u.email})
                        </span>
                        <span
                          className={`subject-grade-badge ${isAdminAccount ? "excelent" : "success"
                            }`}
                        >
                          {isAdminAccount ? "Admin" : "Estudiante"}
                        </span>
                      </div>
                      <p className="dash-card-sub">
                        {u.university} · {u.degree}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </DashboardLayout>

      {/* Modal de Perfil del Usuario Seleccionado (Editar / Eliminar) */}
      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={closeUserModal}
        cardClassName="profile-modal-card"
      >
        <div className="modal-header">
          <div className="modal-title">
            <i className="fa-solid fa-user-gear highlight"></i>
            <span>Perfil de Estudiante</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="profile-avatar-section">
            <div className="profile-frame-avatar">
              {selectedUser?.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={`Foto de ${selectedUser.firstName}`}
                  className="profile-avatar-img"
                />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
            </div>
            <div className="profile-head-info">
              <h3>{`${userForm.firstName} ${userForm.lastName}`.trim()}</h3>
              <span className="badge">{selectedUser?.roleLabel || "Estudiante Universitario"}</span>
            </div>
          </div>

          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="admin-user-firstname">Nombre</label>
                <input
                  id="admin-user-firstname"
                  type="text"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm((f) => ({ ...f, firstName: e.target.value }))}
                  readOnly={!editingUser}
                />
              </div>
              <div className="form-group">
                <label htmlFor="admin-user-lastname">Apellidos</label>
                <input
                  id="admin-user-lastname"
                  type="text"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm((f) => ({ ...f, lastName: e.target.value }))}
                  readOnly={!editingUser}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="admin-user-email">Correo Electrónico</label>
              <input
                id="admin-user-email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                readOnly={!editingUser}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Institución</label>
                <CustomDropdown
                  options={universityNames}
                  value={userForm.university}
                  onChange={(university) =>
                    setUserForm((f) => ({ ...f, university, degree: "" }))
                  }
                  placeholder="Selecciona Institución"
                  disabled={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Programa Académico</label>
                <CustomDropdown
                  key={userForm.university}
                  searchable
                  options={selectedUserDegrees}
                  value={userForm.degree}
                  onChange={(degree) => setUserForm((f) => ({ ...f, degree }))}
                  placeholder="Selecciona Programa"
                  emptyMessage="Selecciona primero una institución"
                  disabled={!editingUser}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer modal-footer-between">
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn ${editingUser ? "btn-primary" : "btn-outline"}`}
              onClick={handleToggleEditUser}
              disabled={savingUser}
            >
              <i
                className={`fa-solid ${editingUser ? "fa-floppy-disk" : "fa-pen-to-square"} icon-left`}
              ></i>
              {editingUser ? (savingUser ? "Guardando..." : "Guardar cambios") : "Editar perfil"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-danger"
              onClick={handleDeleteSelectedUser}
              disabled={savingUser}
            >
              <i className="fa-solid fa-user-xmark icon-left"></i>
              {confirmDeleteUser ? "Confirmar eliminación" : "Eliminar perfil"}
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={closeUserModal}>
            Cerrar
          </button>
        </div>
      </Modal>

      {/* Modal de Respuesta a Mensaje */}
      <Modal
        isOpen={Boolean(replyModalMsg)}
        onClose={() => setReplyModalMsg(null)}
      >
        <div className="modal-header">
          <div className="modal-title">
            <i className="fa-solid fa-reply highlight"></i>
            <span>Responder a {replyModalMsg?.name}</span>
          </div>
        </div>
        <form onSubmit={handleSendReply}>
          <div className="modal-body">
            <p className="dash-card-sub">
              <strong>Consulta original ({replyModalMsg?.email}):</strong>{" "}
              {replyModalMsg?.message}
            </p>
            <div className="form-group">
              <label htmlFor="admin-reply-input">Tu respuesta</label>
              <textarea
                id="admin-reply-input"
                rows="4"
                placeholder="Escribe tu respuesta aquí..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setReplyModalMsg(null)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={sendingReply}>
              {sendingReply ? "Enviando..." : "Enviar respuesta"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Crear / Editar Institución */}
      <Modal
        isOpen={uniModal.open}
        onClose={() => setUniModal({ open: false, editing: null })}
      >
        <div className="modal-header">
          <div className="modal-title">
            <i className="fa-solid fa-building-columns highlight"></i>
            <span>
              {uniModal.editing ? "Configurar Institución" : "Nueva Institución"}
            </span>
          </div>
        </div>
        <form onSubmit={handleSaveUniversity}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="uni-name">Nombre de la institución</label>
                <input
                  id="uni-name"
                  type="text"
                  value={uniForm.name}
                  onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="uni-city">Ciudad</label>
                <input
                  id="uni-city"
                  type="text"
                  value={uniForm.city}
                  onChange={(e) => setUniForm({ ...uniForm, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="uni-cuts">Esquema de cortes (separados por coma, suma 100)</label>
              <input
                id="uni-cuts"
                type="text"
                placeholder="Ej. 30, 30, 40"
                value={uniForm.cutsInput}
                onChange={(e) => setUniForm({ ...uniForm, cutsInput: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="uni-programs">Programas académicos (uno por línea)</label>
              <textarea
                id="uni-programs"
                rows="6"
                placeholder={"Ingeniería de Sistemas\nMedicina\nDerecho"}
                value={uniForm.programsInput}
                onChange={(e) => setUniForm({ ...uniForm, programsInput: e.target.value })}
                required
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setUniModal({ open: false, editing: null })}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Institución
            </button>
          </div>
        </form>
      </Modal>

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />
    </>
  );
}