import { useEffect, useState } from "react";
import CustomDropdown from "../common/CustomDropdown";
import { adminApi } from "../../services/api";

export default function StepAcademic({ data, onChange, onBack, onNext }) {
  const [universitiesList, setUniversitiesList] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(true);

  useEffect(() => {
    let active = true;
    adminApi
      .getUniversities()
      .then((res) => {
        if (active) setUniversitiesList(res.universities || []);
      })
      .catch(() => {
        if (active) setUniversitiesList([]);
      })
      .finally(() => {
        if (active) setLoadingUnis(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedUni = universitiesList.find((u) => u.name === data.university);
  const degrees = selectedUni?.programs || [];

  const handleUniversity = (university) => {
    onChange({ ...data, university, degree: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext?.();
  };

  return (
    <div>
      <div className="auth-header">
        <h2>Perfil Académico</h2>
        <p>Cuéntanos dónde y qué estudias para personalizar tu panel.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Institución</label>
          <CustomDropdown
            value={data.university}
            onChange={handleUniversity}
            options={universitiesList.map((u) => u.name)}
            placeholder={
              loadingUnis
                ? "Cargando instituciones..."
                : "Selecciona tu institución..."
            }
            searchable
            searchPlaceholder="Buscar institución..."
          />
        </div>

        <div className="form-group">
          <label>Programa académico</label>
          <CustomDropdown
            value={data.degree}
            onChange={(degree) => onChange({ ...data, degree })}
            options={degrees}
            placeholder={
              data.university
                ? "Selecciona tu programa..."
                : "Selecciona primero una institución..."
            }
            disabled={!data.university}
            searchable
            searchPlaceholder="Buscar programa..."
          />
        </div>

        <div className="wizard-nav">
          <button
            type="button"
            className="btn btn-outline btn-step"
            onClick={onBack}
          >
            <i className="fa-solid fa-arrow-left icon-left"></i> Anterior
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-step"
            disabled={!data.university || !data.degree}
          >
            Continuar <i className="fa-solid fa-arrow-right icon-right"></i>
          </button>
        </div>
      </form>
    </div>
  );
} 