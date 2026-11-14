import { useEffect, useState } from "react";
// import { useRef } from "react";
import Modal from "../common/Modal";
import CustomDropdown from "../common/CustomDropdown";
// import AvatarCropModal from "./modals/AvatarCropModal";
import { adminApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const pickForm = (u) => ({
  firstName: u.firstName || "",
  lastName: u.lastName || "",
  email: u.email || "",
  university: u.university || "",
  degree: u.degree || "",
  avatar: u.avatar || "",
});

export default function ProfileModal({ isOpen, onClose, user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => pickForm(user));
  // const [rawImage, setRawImage] = useState(null);
  const [universitiesList, setUniversitiesList] = useState([]);
  // const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isOpen) return;
    setForm(pickForm(user));
    setEditing(false);
    // setRawImage(null);

    if (isAdmin) {
      setUniversitiesList([]);
      return;
    }

    let active = true;
    adminApi
      .getUniversities()
      .then((res) => {
        if (active) setUniversitiesList(res.universities || []);
      })
      .catch(() => {
        if (active) setUniversitiesList([]);
      });
    return () => {
      active = false;
    };
  }, [isOpen, user, isAdmin]);

  const universities = universitiesList.map((u) => u.name);
  const selectedUni = universitiesList.find((u) => u.name === form.university);
  const degrees = selectedUni?.programs || [];

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUniversityChange = (university) => {
    setForm((f) => ({ ...f, university, degree: "" }));
  };

  const handleAvatarUploadClick = () => {
    showToast("La subida de fotos de perfil aún no está disponible.", "info");
  };

  /* Descomentar cuando se habilite almacenamiento externo de avatares:
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Selecciona un archivo de imagen válido (JPG, PNG o WebP).", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  */

  const handleClose = () => {
    setEditing(false);
    // setRawImage(null);
    setForm(pickForm(user));
    onClose?.();
  };

  const handleToggle = () => {
    if (editing) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
        showToast("Nombre, apellidos y correo electrónico son obligatorios.", "warning");
        return;
      }
      if (!isAdmin && (!form.university || !form.degree)) {
        showToast("Selecciona tu institución y programa académico.", "warning");
        return;
      }
      onSave?.(form);
    }
    setEditing((e) => !e);
  };

  return (
    <>
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
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt={`Foto de ${form.firstName}`}
                  className="profile-avatar-img"
                />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}

              {editing && (
                <>
                  {/* <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  /> */}
                  {form.avatar && (
                    <button
                      type="button"
                      className="avatar-remove-btn"
                      aria-label="Eliminar foto de perfil"
                      title="Eliminar foto"
                      onClick={() => setForm((f) => ({ ...f, avatar: "" }))}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
                  <button
                    type="button"
                    className="avatar-edit-btn"
                    aria-label="Cambiar foto de perfil"
                    title="Subir foto"
                    onClick={handleAvatarUploadClick}
                  // onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fa-solid fa-camera"></i>
                  </button>
                </>
              )}
            </div>

            <div className="profile-head-info">
              <h3>{`${form.firstName} ${form.lastName}`.trim()}</h3>
              <span className="badge">{user.roleLabel || "Estudiante Universitario"}</span>
            </div>
          </div>

          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="prof-firstname">Nombre</label>
                <input
                  id="prof-firstname"
                  type="text"
                  value={form.firstName}
                  onChange={set("firstName")}
                  readOnly={!editing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-lastname">Apellidos</label>
                <input
                  id="prof-lastname"
                  type="text"
                  value={form.lastName}
                  onChange={set("lastName")}
                  readOnly={!editing}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prof-email">Correo Electrónico</label>
              <input
                id="prof-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                readOnly={!editing}
              />
            </div>

            {!isAdmin && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Institución</label>
                  <CustomDropdown
                    options={universities}
                    value={form.university}
                    onChange={handleUniversityChange}
                    placeholder="Selecciona tu Institución"
                    disabled={!editing}
                  />
                </div>
                <div className="form-group">
                  <label>Programa Académico</label>
                  <CustomDropdown
                    key={form.university}
                    searchable
                    options={degrees}
                    value={form.degree}
                    onChange={(degree) => setForm((f) => ({ ...f, degree }))}
                    placeholder="Selecciona tu Programa Académico"
                    emptyMessage="Selecciona primero una institución"
                    disabled={!editing}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer modal-footer-between">
          <button
            type="button"
            className={`btn ${editing ? "btn-primary" : "btn-outline"}`}
            onClick={handleToggle}
          >
            <i
              className={`fa-solid ${editing ? "fa-floppy-disk" : "fa-pen-to-square"} icon-left`}
            ></i>
            {editing ? "Guardar cambios" : "Editar perfil"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </Modal>

      {/* <AvatarCropModal
        isOpen={Boolean(rawImage)}
        imageSrc={rawImage}
        onClose={() => setRawImage(null)}
        onConfirm={(croppedAvatar) => {
          setForm((f) => ({ ...f, avatar: croppedAvatar }));
          setRawImage(null);
        }}
      /> */}
    </>
  );
}