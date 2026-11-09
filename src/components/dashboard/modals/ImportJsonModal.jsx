import { useRef, useState } from "react";
import Modal from "../../common/Modal";

export default function ImportJsonModal({ isOpen, onClose, onImport, onInvalid }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const accept = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".json")) {
      onInvalid?.();
      return;
    }
    setFile(f);
  };

  const handleClose = () => {
    setFile(null);
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
    onClose?.();
  };

  const handleConfirm = () => {
    if (!file) return;
    onImport?.(file);
    handleClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-header">
        <div>
          <h3>
            <i className="fa-solid fa-upload card-icon"></i> Importar Respaldo
          </h3>
          <p className="dash-card-sub">
            Carga tu archivo de seguridad (.json) para restaurar tus asignaturas y calificaciones.
          </p>
        </div>
      </div>

      <div className="modal-body">
        <div
          className={`drop-zone${dragging ? " dragover" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <i className="fa-solid fa-cloud-arrow-up drop-zone-icon"></i>
          {file ? (
            <>
              <p className="drop-zone-text">
                <strong>{file.name}</strong>
              </p>
              <span className="drop-zone-sub">Haz clic para elegir otro archivo</span>
            </>
          ) : (
            <>
              <p className="drop-zone-text">
                Arrastra y suelta tu archivo <strong>JSON</strong> aquí
              </p>
              <span className="drop-zone-sub">o haz clic aquí para seleccionarlo desde tu equipo</span>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".json"
          className="d-none"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      <div className="modal-footer modal-footer-between">
        <button type="button" className="btn btn-outline" onClick={handleClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!file}
          style={{ opacity: file ? 1 : 0.5, cursor: file ? "pointer" : "not-allowed" }}
          onClick={handleConfirm}
        >
          <i className="fa-solid fa-check icon-left"></i> Restaurar Datos
        </button>
      </div>
    </Modal>
  );
}