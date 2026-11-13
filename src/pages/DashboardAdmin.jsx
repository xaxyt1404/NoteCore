import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ProfileModal from "../components/dashboard/ProfileModal";
import Modal from "../components/common/Modal";
import { useToast } from "../context/ToastContext";
import {
  adminApi,
  authApi,
  clearSessionStorageData,
  contactApi,
  getToken,
} from "../services/api";

const NAVIGATION = {
  main: [
    { id: "view-admin-inicio", icon: "fa-house", label: "Inicio" },
    { id: "view-admin-mensajes", icon: "fa-inbox", label: "Mensajes" },
    { id: "view-admin-universidades", icon: "fa-building-columns", label: "Instituciones" },
    { id: "view-admin-usuarios", icon: "fa-users", label: "Usuarios" },
  ],
  bottom: [],
};

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

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubjects: 0,
    pendingMessages: 0,
    totalUniversities: 0,
  });
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [universities, setUniversities] = useState([]);

  // Estado de bandeja de mensajes
  const [msgFilter, setMsgFilter] = useState("all"); // "all" | "pending" | "resolved"
  const [replyModalMsg, setReplyModalMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Estado de nueva/edición de universidad
  const [uniModal, setUniModal] = useState({ open: false, editing: null });
  const [uniForm, setUniForm] = useState({
    name: "",
    city: "Cartagena",
    cutsInput: "30, 30, 40",
    programsInput: "",
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

  // Notificaciones en la Topbar con los mensajes pendientes
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

      // Abre correo prellenado para enviar también al email del remitente
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
                  <i className="fa-solid fa-envelope-open-text"></i>
                </div>
                <div className="kpi-info">
                  <span className="kpi-label">Mensajes Pendientes</span>
                  <div className="kpi-value">{stats.pendingMessages}</div>
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
                    <div key={m.id} className="attention-subject-item">
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
                {users.map((u) => (
                  <div key={u.id} className="attention-subject-item">
                    <div className="subject-header-row">
                      <span className="subject-name">
                        {u.fullName} ({u.email})
                      </span>
                      <span
                        className={`subject-grade-badge ${u.role === "admin" ? "excelent" : "success"
                          }`}
                      >
                        {u.role === "admin" ? "Admin" : "Estudiante"}
                      </span>
                    </div>
                    <p className="dash-card-sub">
                      {u.university} · {u.degree}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </DashboardLayout>

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