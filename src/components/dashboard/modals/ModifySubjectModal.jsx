import { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import { createEmptyCuts } from "../../../utils/academicConstants";
import { useToast } from "../../../context/ToastContext";

export const SUBJECT_ICONS = [
  { icon: "fa-book", label: "General" },
  { icon: "fa-calculator", label: "Cálculo" },
  { icon: "fa-square-root-variable", label: "Matemáticas" },
  { icon: "fa-atom", label: "Física" },
  { icon: "fa-flask", label: "Química" },
  { icon: "fa-code", label: "Programación" },
  { icon: "fa-laptop-code", label: "Software" },
  { icon: "fa-database", label: "Bases de Datos" },
  { icon: "fa-pen-nib", label: "Redacción" },
  { icon: "fa-language", label: "Idiomas" },
  { icon: "fa-scale-balanced", label: "Derecho" },
  { icon: "fa-chart-line", label: "Economía" },
  { icon: "fa-briefcase", label: "Administración" },
  { icon: "fa-heart-pulse", label: "Salud" },
  { icon: "fa-compass-drafting", label: "Ingeniería" },
];

export default function ModifySubjectModal({
  isOpen,
  onClose,
  onSaveSubject,
  subject = null,
  mode = "create", // "create" | "edit-name" | "edit-icon" | "edit-all"
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("fa-book");

  useEffect(() => {
    if (isOpen) {
      setName(subject ? subject.name : "");
      setSelectedIcon(subject ? subject.icon || "fa-book" : "fa-book");
    }
  }, [isOpen, subject]);

  const showNameField = mode === "create" || mode === "edit-name" || mode === "edit-all";
  const showIconField = mode === "create" || mode === "edit-icon" || mode === "edit-all";

  const modalTitle =
    mode === "edit-name"
      ? "Editar Nombre de Asignatura"
      : mode === "edit-icon"
        ? "Cambiar Ícono"
        : mode === "edit-all"
          ? "Editar Asignatura"
          : "Agregar Nueva Asignatura";

  const modalIcon = mode === "create" ? "fa-book-medical" : "fa-pen-to-square";

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (showNameField && !cleanName) {
      showToast("Escribe el nombre de la asignatura.", "warning");
      return;
    }

    if (mode === "create") {
      onSaveSubject?.(
        {
          id: `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
          name: cleanName,
          statsName: cleanName,
          icon: selectedIcon,
          current: 0.0,
          statusLabel: "Sin notas",
          performance: "Sin notas",
          cuts: createEmptyCuts(),
        },
        mode
      );
    } else if (subject) {
      onSaveSubject?.(
        {
          ...subject,
          name: showNameField ? cleanName : subject.name,
          statsName: showNameField ? cleanName : subject.statsName,
          icon: showIconField ? selectedIcon : subject.icon,
        },
        mode
      );
    }

    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title">
          <i className={`fa-solid ${modalIcon} highlight`}></i>
          <span>{modalTitle}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {showNameField && (
            <div className="form-group">
              <label htmlFor="subject-name-input">Nombre de la asignatura</label>
              <input
                id="subject-name-input"
                type="text"
                placeholder="Ej. Estructura de Datos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
          )}

          {showIconField && (
            <div className="form-group">
              <label>Selecciona un ícono</label>
              <div className="icon-picker-grid">
                {SUBJECT_ICONS.map((item) => (
                  <button
                    key={item.icon}
                    type="button"
                    className={`icon-picker-btn${selectedIcon === item.icon ? " active" : ""}`}
                    title={item.label}
                    aria-label={item.label}
                    onClick={() => setSelectedIcon(item.icon)}
                  >
                    <i className={`fa-solid ${item.icon}`}></i>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-check icon-left"></i>
            {mode === "create" ? "Crear Asignatura" : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}