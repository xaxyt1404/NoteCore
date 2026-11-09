import CustomDropdown from "../common/CustomDropdown";
import { universities, getDegreesByUniversity } from "../../mocks/academicCatalog";

export default function StepAcademic({ data, onChange, onBack, onNext }) {
  const degrees = data.university ? getDegreesByUniversity(data.university) : [];

  const handleUniversity = (university) => {
    onChange({ ...data, university, degree: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext?.();
  };

  return (
    <div className="auth-wizard-view">
      <div className="auth-header">
        <span className="badge">Paso 1 de 2</span>
        <h2>Perfil Académico</h2>
        <p>Selecciona tu institución y programa de estudio.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Institución</label>
          <CustomDropdown
            options={universities}
            value={data.university}
            onChange={handleUniversity}
            placeholder="Selecciona tu Institución"
          />
        </div>

        <div className="form-group">
          <label>Programa Académico</label>
          <CustomDropdown
            key={data.university}
            searchable
            options={degrees}
            value={data.degree}
            onChange={(degree) => onChange({ ...data, degree })}
            placeholder="Selecciona tu Programa Académico"
            emptyMessage="Selecciona primero una institución"
          />
        </div>

        <div className="auth-buttons-group two-cols" style={{ marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-outline btn-auth" onClick={onBack}>
            Atrás
          </button>
          <button type="submit" className="btn btn-primary btn-auth">
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
}