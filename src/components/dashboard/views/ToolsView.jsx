const TOOLS = [
  {
    id: "simple",
    icon: "fa-calculator",
    title: "Calculadora de Nota Sencilla",
    text: "Calcula rápidamente tu promedio simple o ponderado ingresando una lista de calificaciones y sus porcentajes.",
  },
  {
    id: "cut",
    icon: "fa-chart-pie",
    title: "Calculadora para un Corte",
    text: "Desglosa las evaluaciones de un solo corte (quices, talleres, parcial) e incluye puntos de bonificación.",
  },
  {
    id: "sim",
    icon: "fa-graduation-cap",
    title: "Simulador de Asignatura",
    text: "Proyecta tu nota final del semestre seleccionando el esquema de cortes y calcula la nota requerida para aprobar.",
  },
];

export default function ToolsView({ onOpenTool }) {
  return (
    <section id="view-herramientas" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Herramientas Académicas 🛠️</h1>
          <p>
            Calcula promedios rápidos, desglosa las evaluaciones de un corte y simula el rendimiento completo de tus
            asignaturas.
          </p>
        </div>
      </div>

      <div className="subjects-grid-3col">
        {TOOLS.map((tool) => (
          <div className="dash-card" key={tool.id}>
            <div className="dash-card-header">
              <div className="subject-card-title">
                <i className={`fa-solid ${tool.icon} card-icon`}></i>
                <h3>{tool.title}</h3>
              </div>
            </div>
            <div className="dash-card-body">
              <p className="dash-card-sub" style={{ marginBottom: "1.2rem" }}>
                {tool.text}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => onOpenTool?.(tool.id)}
              >
                <i className="fa-solid fa-arrow-right icon-left"></i> Abrir calculadora
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}