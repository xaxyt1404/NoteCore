import Modal from "../common/Modal";

export default function TermsModal({ isOpen, onClose, onAccept }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title">
          <i className="fa-solid fa-file-contract highlight"></i>
          <span>Términos y Condiciones</span>
        </div>
      </div>

      <div className="modal-body">
        <p>
          <strong>Bienvenido a NoteCore.</strong> Al registrarte y utilizar nuestra plataforma, aceptas cumplir con
          los siguientes términos y condiciones:
        </p>

        <h4>1. Uso de la Cuenta</h4>
        <p>
          Eres responsable de mantener la confidencialidad de las credenciales de tu cuenta y de todas las
          actividades que ocurran bajo ella.
        </p>

        <h4>2. Privacidad y Datos</h4>
        <p>
          Tus datos personales y la información de tus notas serán procesados y almacenados de forma segura con el
          único propósito de brindarte el servicio.
        </p>

        <h4>3. Propiedad Intelectual</h4>
        <p>
          Todo el contenido, marcas y diseños dentro de NoteCore son propiedad de la plataforma. Tus notas
          personales siguen siendo 100% de tu propiedad.
        </p>

        <h4>4. Modificaciones del Servicio</h4>
        <p>
          Nos reservamos el derecho de actualizar la plataforma y sus términos para mejorar la experiencia
          académica del usuario.
        </p>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cerrar
        </button>
        <button type="button" className="btn btn-primary" onClick={onAccept}>
          Aceptar Términos
        </button>
      </div>
    </Modal>
  );
}