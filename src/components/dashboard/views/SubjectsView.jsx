import { useEffect, useState } from "react";
import { getGradeStatus } from "../../../utils/gradeHelpers";
import { useToast } from "../../../context/ToastContext";
import ModifySubjectModal from "../modals/ModifySubjectModal";

export default function SubjectsView({
  subjects = [],
  onSubjectsChange,
  onOpenSubjectDetail,
}) {
  const { showToast } = useToast();
  const [modifyModal, setModifyModal] = useState({ open: false, mode: "create", subject: null });
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handleOutside = (e) => {
      if (!e.target.closest(".card-menu-wrapper")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [openMenuId]);

  const openModify = (mode, subject = null) => {
    setOpenMenuId(null);
    setModifyModal({ open: true, mode, subject });
  };

  const closeModify = () => {
    setModifyModal((prev) => ({ ...prev, open: false }));
  };

  const handleSaveModifiedSubject = (savedSub, mode) => {
    if (mode === "create") {
      onSubjectsChange?.([...subjects, savedSub]);
    } else {
      onSubjectsChange?.(subjects.map((s) => (s.id === savedSub.id ? savedSub : s)));
    }
  };

  const handleDeleteSubject = (subject) => {
    onSubjectsChange?.(subjects.filter((s) => s.id !== subject.id));
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
            const currentVal = Number(s.current) || 0;
            const { status, colorClass, label } = getGradeStatus(currentVal);
            const isMenuOpen = openMenuId === s.id;

            return (
              <div className="dash-card subject-card-compact" key={s.id}>
                <div className="dash-card-header">
                  <div className="subject-card-title">
                    <i className={`fa-solid ${s.icon || "fa-book"} card-icon`}></i>
                    <h3>{s.name}</h3>
                  </div>

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
                      <span className={`grade-val ${colorClass}`}>{currentVal.toFixed(1)}</span>
                      <span className="grade-max">/ 5.0</span>
                    </div>
                  </div>
                  <div className="subject-card-footer">
                    <a
                      href="#"
                      className="card-link-action"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenSubjectDetail?.(s);
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

      <ModifySubjectModal
        isOpen={modifyModal.open}
        onClose={closeModify}
        onSaveSubject={handleSaveModifiedSubject}
        subject={modifyModal.subject}
        mode={modifyModal.mode}
      />
    </section>
  );
}