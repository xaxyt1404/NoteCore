import { useState } from "react";
import { getGradeTone } from "../../../utils/gradeHelpers";

const FILTERS = {
  all: () => true,
  "in-progress": (s) => !s.passed,
  "at-risk": (s) => s.performance === "En Riesgo",
  passed: (s) => !!s.passed,
};

export default function SubjectsView({ subjects, tabs }) {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const visible = subjects.filter(FILTERS[activeTab] || FILTERS.all);

  return (
    <section id="view-asignaturas" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Asignaturas 📚</h1>
          <p>Gestiona tus notas, consulta el estado y proyecta tus calificaciones del semestre.</p>
        </div>
        <button type="button" className="btn btn-primary">
          <i className="fa-solid fa-plus icon-left"></i> Agregar asignatura
        </button>
      </div>

      <div className="sim-tabs" style={{ marginBottom: "1rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="dash-card-sub">No hay asignaturas en esta categoría.</p>
      ) : (
        <div className="subjects-grid-3col">
          {visible.map((s) => {
            const tone = getGradeTone(s.current);
            return (
              <div className="dash-card subject-card-compact" key={s.id}>
                <div className="dash-card-header">
                  <div className="subject-card-title">
                    <i className={`fa-solid ${s.icon} card-icon`}></i>
                    <h3>{s.name}</h3>
                  </div>
                  <button type="button" className="btn-icon-more" aria-label="Opciones de asignatura">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </button>
                </div>
                <div className="dash-card-body">
                  <div className="subject-card-top-info">
                    <span className={`subject-grade-badge ${tone}`}>{s.statusLabel}</span>
                    <div className="grade-display">
                      <span className={`grade-val ${tone}-text`}>{s.current.toFixed(1)}</span>
                      <span className="grade-max">/ 5.0</span>
                    </div>
                  </div>
                  <div className="subject-card-footer">
                    <a href="#" className="card-link-action" onClick={(e) => e.preventDefault()}>
                      Ver detalles <i className="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}