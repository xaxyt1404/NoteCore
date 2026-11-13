import { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import { createEmptyCuts } from "../../../mocks/dashboardMocks";
import { getGradeStatus } from "../../../utils/gradeHelpers";
import { useToast } from "../../../context/ToastContext";

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

const MODAL_CONFIG = {
  create: {
    title: "Agregar Nueva Asignatura",
    icon: "fa-plus-circle",
    submitLabel: "Crear asignatura",
  },
  "edit-name": {
    title: "Editar Nombre de Asignatura",
    icon: "fa-pen",
    submitLabel: "Guardar nombre",
  },
  "edit-icon": {
    title: "Editar Ícono de Asignatura",
    icon: "fa-icons",
    submitLabel: "Guardar ícono",
  },
};

export default function ModifySubjectModal({
  isOpen,
  onClose,
  onSaveSubject,
  subject = null,
  mode = "create", // "create" | "edit-name" | "edit-icon"
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(SUBJECT_ICONS[0]);

  const config = MODAL_CONFIG[mode] || MODAL_CONFIG.create;

  useEffect(() => {
    if (isOpen) {
      if (subject && mode !== "create") {
        setName(subject.name);
        setSelectedIcon(subject.icon || SUBJECT_ICONS[0]);
      } else {
        setName("");
        setSelectedIcon(SUBJECT_ICONS[0]);
      }
    }
  }, [isOpen, subject, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if ((mode === "create" || mode === "edit-name") && !trimmed) {
      showToast("Por favor ingresa un nombre para la asignatura.", "warning");
      return;
    }

    if (mode === "create") {
      const initialGrade = 0.0;
      const status = getGradeStatus(initialGrade, 0);

      const newSubject = {
        id: `sub-${Date.now()}`,
        name: trimmed,
        statsName: trimmed,
        icon: selectedIcon,
        current: initialGrade,
        statusLabel: status.label,
        performance: status.label,
        cuts: createEmptyCuts(),
      };

      onSaveSubject(newSubject, mode);
      showToast(`Asignatura "${trimmed}" agregada correctamente.`, "success");
    } else if (subject) {
      const updatedSubject = {
        ...subject,
        name: mode === "edit-name" ? trimmed : subject.name,
        statsName: mode === "edit-name" ? trimmed : subject.statsName,
        icon: mode === "edit-icon" ? selectedIcon : subject.icon,
      };

      onSaveSubject(updatedSubject, mode);
      showToast(
        mode === "edit-name"
          ? `Nombre actualizado a "${trimmed}".`
          : `Ícono de "${subject.name}" actualizado.`,
        "success"
      );
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title">
          <i className={`fa-solid ${config.icon} highlight`}></i>
          <span>{config.title}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {(mode === "create" || mode === "edit-name") && (
            <div className="form-group">
              <label htmlFor="subjectNameInput">Nombre de la asignatura</label>
              <input
                type="text"
                id="subjectNameInput"
                className="form-control"
                placeholder="Ej: Cálculo Diferencial, Física I..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {(mode === "create" || mode === "edit-icon") && (
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
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {config.submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}