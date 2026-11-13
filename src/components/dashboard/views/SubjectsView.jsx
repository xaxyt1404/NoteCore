import { useEffect, useState } from "react";
import {
  computeCutGrade,
  computeSubjectGrades,
  getGradeStatus,
} from "../../../utils/gradeHelpers";
import { useToast } from "../../../context/ToastContext";
import { subjectsApi } from "../../../services/api";
import ModifySubjectModal from "../modals/ModifySubjectModal";

const fmtCut = (val) => (val == null ? "—" : Number(val).toFixed(1));

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

  const handleSaveModifiedSubject = async (savedSub, mode) => {
    try {
      if (mode === "create") {
        const res = await subjectsApi.create({
          name: savedSub.name,
          statsName: savedSub.statsName || savedSub.name,
          icon: savedSub.icon || "fa-book",
        });
        onSubjectsChange?.([...subjects, res.subject]);
        showToast(`Asignatura "${res.subject.name}" agregada.`, "success");
      } else {
        const res = await subjectsApi.update(savedSub.id, {
          name: savedSub.name,
          statsName: savedSub.statsName || savedSub.name,
          icon: savedSub.icon,
        });
        onSubjectsChange?.(subjects.map((s) => (s.id === res.subject.id ? res.subject : s)));
        showToast(`Asignatura "${res.subject.name}" actualizada.`, "success");
      }
    } catch (error) {
      showToast(error.message || "Error al guardar la asignatura.", "danger");
    }
  };

  const handleDeleteSubject = async (subject) => {
    setOpenMenuId(null);
    try {
      await subjectsApi.remove(subject.id);
      onSubjectsChange?.(subjects.filter((s) => s.id !== subject.id));
      showToast(`Asignatura "${subject.name}" eliminada.`, "info");
    } catch (error) {
      showToast(error.message || "No se pudo eliminar la asignatura.", "danger");
    }
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
            const subjectCuts = Array.isArray(s.cuts) ? s.cuts : [null, null, null];
            const { accumulated, paceGrade, evaluatedWeight } = computeSubjectGrades(subjectCuts);
            const { status, colorClass, label } = getGradeStatus(paceGrade, evaluatedWeight);
            const isMenuOpen = openMenuId === s.id;

            const c1 = computeCutGrade(subjectCuts[0]);
            const c2 = computeCutGrade(subjectCuts[1]);
            const c3 = computeCutGrade(subjectCuts[2]);

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
                  <div className="subject-status-center">
                    <span className={`subject-grade-badge ${status}`}>{label}</span>
                  </div>

                  <div className="subject-card-top-info">
                    <div className="subject-cuts-breakdown">
                      <span>
                        C1: <strong>{fmtCut(c1)}</strong>
                      </span>
                      <span>
                        C2: <strong>{fmtCut(c2)}</strong>
                      </span>
                      <span>
                        C3: <strong>{fmtCut(c3)}</strong>
                      </span>
                    </div>

                    <div className="grade-display">
                      <span className={`grade-val ${colorClass}`}>{accumulated.toFixed(1)}</span>
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