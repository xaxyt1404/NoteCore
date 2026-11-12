import { useState } from "react";

export default function StepSubjects({ subjects, onChange, onBack, onFinish, onWarning }) {
  const [name, setName] = useState("");

  const addSubject = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      onWarning?.("Ingresa el nombre de la asignatura.");
      return;
    }
    onChange([...subjects, { name: trimmed }]);
    setName("");
  };

  const editSubject = (index) => {
    const next = prompt("Editar nombre de la asignatura:", subjects[index]?.name || "");
    if (next === null || !next.trim()) return;
    onChange(subjects.map((s, i) => (i === index ? { ...s, name: next.trim() } : s)));
  };

  const removeSubject = (index) => {
    onChange(subjects.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFinish?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject();
    }
  };

  const iconBtn = (color) => ({
    background: "none",
    border: "none",
    color,
    cursor: "pointer",
    padding: "2px 6px",
  });

  return (
    <div>
      <div className="auth-header">
        <span className="badge">Paso 2 de 2</span>
        <h2>Asignaturas</h2>
        <p>Agrega tus asignaturas para este semestre.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
        <div className="form-group">
          <label htmlFor="setupSubjectName">Nombre de la Asignatura</label>
          <div className="input-icon-wrapper">
            <i className="fa-solid fa-book input-icon"></i>
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
              Aún no has agregado materias (se requiere al menos una).
            </span>
          ) : (
            subjects.map((subject, index) => (
              <div
                key={`${subject.name}-${index}`}
                className="dropdown-item"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "default" }}
              >
                <span className="subject-name">📚 {subject.name}</span>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button
                    type="button"
                    title="Editar materia"
                    style={iconBtn("var(--primary)")}
                    onClick={() => editSubject(index)}
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    type="button"
                    title="Eliminar materia"
                    style={iconBtn("var(--danger)")}
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
          <button type="button" className="btn btn-primary btn-auth" onClick={onFinish}>
            Finalizar
          </button>
        </div>
      </form>
    </div>
  );
}


