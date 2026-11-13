import { useState } from "react";
import { getGradeStatus } from "../../../utils/gradeHelpers";
import { useToast } from "../../../context/ToastContext";
import SubjectDetailModal from "../modals/SubjectDetailModal";
import ModifySubjectModal from "../modals/ModifySubjectModal";

export default function SubjectsView({
  subjects: initialSubjects = [],
  onSubjectsChange,
  initialDetailSubject = null,
  onClearInitialDetail,
}) {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [selectedSubject, setSelectedSubject] = useState(initialDetailSubject);
  const [modifyModal, setModifyModal] = useState({ open: false, mode: "create", subject: null });
  const [openMenuId, setOpenMenuId] = useState(null);

  // Sincroniza el estado local y notifica al padre (DashboardUser) si está conectado
  const syncSubjects = (updater) => {
    setSubjects((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onSubjectsChange?.(next);
      return next;
    });
  };

  const openModify = (mode, subject = null) => {
    setOpenMenuId(null);
    setModifyModal({ open: true, mode, subject });
  };

  const closeModify = () => {
    setModifyModal((prev) => ({ ...prev, open: false }));
  };

  const handleSaveModifiedSubject = (savedSub, mode) => {
    if (mode === "create") {
      syncSubjects((prev) => [...prev, savedSub]);
    } else {
      syncSubjects((prev) => prev.map((s) => (s.id === savedSub.id ? savedSub : s)));
    }
  };

  const handleSaveDetails = (updated) => {
    syncSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(`Notas de "${updated.name}" guardadas.`, "success");
  };

  const handleDeleteSubject = (subject) => {
    syncSubjects((prev) => prev.filter((s) => s.id !== subject.id));
    setOpenMenuId(null);
    showToast(`Asignatura "${subject.name}" eliminada.`, "info");
  };

  return (
    <section id="view-asignaturas" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Asignaturas 📚</h1>
          <p>Gestiona tus notas, consulta el estado y proyecta tus calificaciones del semestre.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openModify("create")}
        >
          <i className="fa-solid fa-plus icon-left"></i> Agregar asignatura
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="dash-card empty-state-card">
          <p className="dash-card-sub">
            Aún no tienes asignaturas registradas. Haz clic en <strong>"Agregar asignatura"</strong> para comenzar.
          </p>
        </div>
      ) : (
        <div className="subjects-grid-3col">
          {subjects.map((s) => {
            const { status, colorClass, label } = getGradeStatus(s.current);
            const isMenuOpen = openMenuId === s.id;

            return (
              <div className="dash-card subject-card-compact" key={s.id}>
                <div className="dash-card-header">
                  <div className="subject-card-title">
                    <i className={`fa-solid ${s.icon} card-icon`}></i>
                    <h3>{s.name}</h3>
                  </div>

                  {/* Menú de 3 puntos flotante */}
                  <div className="card-menu-wrapper">
                    <button
                      type="button"
                      className="btn-icon-more"
                      aria-label="Opciones de asignatura"
                      onClick={() => setOpenMenuId(isMenuOpen ? null : s.id)}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    {isMenuOpen && (
                      <div className="dropdown-menu active floating-card-menu">
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => openModify("edit-name", s)}
                        >
                          <i className="fa-solid fa-pen"></i> Editar nombre
                        </button>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => openModify("edit-icon", s)}
                        >
                          <i className="fa-solid fa-icons"></i> Editar ícono
                        </button>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={() => handleDeleteSubject(s)}
                        >
                          <i className="fa-solid fa-trash"></i> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="subject-card-top-info">
                    <span className={`subject-grade-badge ${status}`}>{label}</span>
                    <div className="grade-display">
                      <span className={`grade-val ${colorClass}`}>{s.current.toFixed(1)}</span>
                      <span className="grade-max">/ 5.0</span>
                    </div>
                  </div>
                  <div className="subject-card-footer">
                    <a
                      href="#"
                      className="card-link-action"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSubject(s);
                      }}
                    >
                      Ver detalles <i className="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Agregar / Editar Nombre / Editar Ícono */}
      <ModifySubjectModal
        isOpen={modifyModal.open}
        onClose={closeModify}
        onSaveSubject={handleSaveModifiedSubject}
        subject={modifyModal.subject}
        mode={modifyModal.mode}
      />

      {/* Modal de Detalles de Asignatura */}
      <SubjectDetailModal
        isOpen={!!selectedSubject}
        onClose={() => {
          setSelectedSubject(null);
          onClearInitialDetail?.();
        }}
        subject={selectedSubject}
        onSaveSubject={handleSaveDetails}
      />
    </section>
  );
}