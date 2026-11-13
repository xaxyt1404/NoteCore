import { useState } from "react";
import Modal from "../common/Modal";
import { useToast } from "../../context/ToastContext";

const pickForm = (u) => ({
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  university: u.university,
  degree: u.degree,
});

export default function ProfileModal({ isOpen, onClose, user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => pickForm(user));
  const { showToast } = useToast();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleClose = () => {
    setEditing(false);
    setForm(pickForm(user));
    onClose?.();
  };

  const handleToggle = () => {
    if (editing) {
      onSave?.(form);
      showToast("Perfil actualizado correctamente.", "success");
    }
    setEditing((e) => !e);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} cardClassName="profile-modal-card">
      <div className="modal-header">
        <div className="modal-title">
          <i className="fa-solid fa-user-gear highlight"></i>
          <span>Perfil de Usuario</span>
        </div>
      </div>

      <div className="modal-body">
        <div className="profile-avatar-section">
          <div className="profile-frame-avatar">
            <i className="fa-solid fa-user"></i>
            {editing && (
              <button type="button" className="avatar-edit-btn" aria-label="Cambiar foto de perfil">
                <i className="fa-solid fa-camera"></i>
              </button>
            )}
          </div>
          <div className="profile-head-info">
            <h3>{`${form.firstName} ${form.lastName}`.trim()}</h3>
            <span className="badge">{user.roleLabel}</span>
          </div>
        </div>

        <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="prof-firstname">Nombre</label>
              <input id="prof-firstname" type="text" value={form.firstName} onChange={set("firstName")} readOnly={!editing} />
            </div>
            <div className="form-group">
              <label htmlFor="prof-lastname">Apellidos</label>
              <input id="prof-lastname" type="text" value={form.lastName} onChange={set("lastName")} readOnly={!editing} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prof-email">Correo Electrónico</label>
            <input id="prof-email" type="email" value={form.email} onChange={set("email")} readOnly={!editing} />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="prof-university">Institución</label>
              <input id="prof-university" type="text" value={form.university} onChange={set("university")} readOnly={!editing} />
            </div>
            <div className="form-group">
              <label htmlFor="prof-degree">Programa Académico</label>
              <input id="prof-degree" type="text" value={form.degree} onChange={set("degree")} readOnly={!editing} />
            </div>
          </div>
        </form>
      </div>

      <div className="modal-footer modal-footer-between">
        <button
          type="button"
          className={`btn ${editing ? "btn-primary" : "btn-outline"}`}
          onClick={handleToggle}
        >
          <i className={`fa-solid ${editing ? "fa-floppy-disk" : "fa-pen-to-square"} icon-left`}></i>
          {editing ? "Guardar cambios" : "Editar perfil"}
        </button>
        <button type="button" className="btn btn-primary" onClick={handleClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}