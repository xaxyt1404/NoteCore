export default function SettingsView({ onExport, onOpenImport, onReset, onDelete }) {
  return (
    <section id="view-ajustes" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Ajustes ⚙️</h1>
          <p>Gestiona el respaldo de tus datos y la información de tu cuenta.</p>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h3>
              <i className="fa-solid fa-database card-icon"></i> Portabilidad de Datos
            </h3>
            <p className="dash-card-sub">
              Exporta una copia de seguridad en formato JSON de todas tus calificaciones y asignaturas, o restaura un
              respaldo previo.
            </p>
          </div>
        </div>
        <div className="dash-card-body">
          <div className="form-grid">
            <button type="button" className="btn btn-outline" onClick={onExport}>
              <i className="fa-solid fa-download icon-left"></i> Exportar datos (JSON)
            </button>
            <button type="button" className="btn btn-outline" onClick={onOpenImport}>
              <i className="fa-solid fa-upload icon-left"></i> Importar respaldo
            </button>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h3>
              <i className="fa-solid fa-triangle-exclamation card-icon text-danger"></i> Limpieza y Eliminación de
              cuenta
            </h3>
            <p className="dash-card-sub">
              Acciones sobre los datos almacenados y tu cuenta.{" "}
              <span className="text-warning">Esto no puede revertirse.</span>
            </p>
          </div>
        </div>
        <div className="dash-card-body settings-danger-zone">
          <div className="subject-header-row settings-option-row">
            <div>
              <span className="subject-name">Limpiar calificaciones del semestre </span>
              <span className="dash-card-sub">
                Resetea todas las notas actuales a cero manteniendo tus asignaturas base.
              </span>
            </div>
            <button type="button" className="btn btn-outline" onClick={onReset}>
              <i className="fa-solid fa-rotate-left icon-left"></i> Restablecer notas
            </button>
          </div>

          <div className="subject-header-row settings-option-row">
            <div>
              <span className="subject-name text-danger">Eliminar cuenta y datos </span>
              <span className="dash-card-sub">Elimina permanentemente tu perfil, asignaturas y registros.</span>
            </div>
            <button type="button" className="btn btn-outline btn-danger" onClick={onDelete}>
              <i className="fa-solid fa-user-xmark icon-left"></i> Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}