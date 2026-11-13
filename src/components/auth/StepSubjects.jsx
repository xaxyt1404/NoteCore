import { useState } from "react";
import ModifySubjectModal from "../dashboard/modals/ModifySubjectModal";
import { createEmptyCuts, mockSubjects } from "../../mocks/dashboardMocks";
import { getGradeStatus } from "../../utils/gradeHelpers";

const SUBJECT_ICONS = [
  "fa-book",
  "fa-calculator",
  "fa-atom",
  "fa-code",
  "fa-square-root-variable",
  "fa-pen-nib",
  "fa-flask",
  "fa-globe",
];

export default function StepSubjects({ subjects, onChange, onBack, onFinish, onWarning }) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(SUBJECT_ICONS[0]);
  const [editingIndex, setEditingIndex] = useState(null);

  const addSubject = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      onWarning?.("Ingresa el nombre de la asignatura.");
      return;
    }
    onChange([...subjects, { name: trimmed, icon: selectedIcon }]);
    setName("");
    setSelectedIcon(SUBJECT_ICONS[0]);
  };

  const handleSaveEdited = (updatedSub) => {
    if (editingIndex === null) return;
    onChange(
      subjects.map((s, i) =>
        i === editingIndex ? { ...s, name: updatedSub.name, icon: updatedSub.icon } : s
      )
    );
    setEditingIndex(null);
  };

  const removeSubject = (index) => {
    onChange(subjects.filter((_, i) => i !== index));
  };

  const handleFinish = (e) => {
    e?.preventDefault();
    if (subjects.length === 0) {
      onWarning?.("Debes agregar al menos una asignatura para continuar.");
      return;
    }

    const status = getGradeStatus(0.0, 0);
    const formattedSubjects = subjects.map((s, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      name: s.name,
      statsName: s.name,
      icon: s.icon || SUBJECT_ICONS[0],
      current: 0.0,
      statusLabel: status.label,
      performance: status.label,
      cuts: createEmptyCuts(),
    }));

    // Sincroniza el arreglo en memoria y guarda respaldo inicial para el Dashboard
    mockSubjects.splice(0, mockSubjects.length, ...formattedSubjects);
    sessionStorage.setItem("notecore_initial_subjects", JSON.stringify(formattedSubjects));

    onFinish?.(formattedSubjects);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject();
    }
  };

  return (
    <div>
      <div className="auth-header">
        <span className="badge">Paso 2 de 2</span>
        <h2>Asignaturas</h2>
        <p>Agrega tus asignaturas para este semestre.</p>
      </div>

      <form className="auth-form" onSubmit={handleFinish} onKeyDown={handleKeyDown} noValidate>
        <div className="form-group">
          <label htmlFor="setupSubjectName">Nombre de la Asignatura</label>
          <div className="input-icon-wrapper">
            <i className={`fa-solid ${selectedIcon} input-icon`}></i>
            <input
              type="text"
              id="setupSubjectName"
              placeholder="Ej. Producción Textual"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Selecciona un ícono</label>
          <div className="icon-selector-grid">
            {SUBJECT_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`btn ${selectedIcon === icon ? "btn-primary" : "btn-outline"}`}
                onClick={() => setSelectedIcon(icon)}
              >
                <i className={`fa-solid ${icon}`}></i>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline"
          style={{ width: "100%", marginBottom: "0.8rem" }}
          onClick={addSubject}
        >
          <i className="fa-solid fa-plus icon-left"></i> Añadir a la lista
        </button>

        <div className="dropdown-options-list" style={{ marginBottom: "1rem", maxHeight: "125px" }}>
          {subjects.length === 0 ? (
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              Aún no has agregado asignaturas (se requiere al menos una).
            </span>
          ) : (
            subjects.map((subject, index) => (
              <div
                key={`${subject.name}-${index}`}
                className="dropdown-item"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "default" }}
              >
                <span className="subject-name">
                  <i className={`fa-solid ${subject.icon || "fa-book"} icon-left`}></i>{"  "}
                  {subject.name}
                </span>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button
                    type="button"
                    title="Editar asignatura"
                    className="btn-icon-edit"
                    onClick={() => setEditingIndex(index)}
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    type="button"
                    title="Eliminar asignatura"
                    className="btn-icon-delete"
                    onClick={() => removeSubject(index)}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="auth-buttons-group two-cols">
          <button type="button" className="btn btn-outline btn-auth" onClick={onBack}>
            Atrás
          </button>
          <button type="submit" className="btn btn-primary btn-auth">
            Finalizar
          </button>
        </div>
      </form>

      {/* Modal reutilizada para editar nombre */}
      <ModifySubjectModal
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        onSaveSubject={handleSaveEdited}
        subject={editingIndex !== null ? subjects[editingIndex] : null}
        mode="edit-name"
      />
    </div>
  );
}