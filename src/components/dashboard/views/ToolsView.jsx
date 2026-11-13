const TOOLS = [
  {
    id: "last-cut",
    icon: "fa-bullseye",
    title: "¿Cuánto necesito en el último corte?",
    text: "Ingresa tus notas del Corte 1 y Corte 2 para saber exactamente qué necesitas en el Corte 3 para aprobar con 3,0, 3,5, 4,0 o 4,5.",
  },
  {
    id: "parcial-needed",
    icon: "fa-file-pen",
    title: "¿Cuánto necesito en mi parcial?",
    text: "Añade tus actividades del corte (quices, talleres, trabajos) con su porcentaje y calcula la nota exacta que necesitas en el parcial.",
  },
  {
    id: "what-if",
    icon: "fa-sliders",
    title: "Simulador ¿Y si saco...?",
    text: "Mueve el control de 0,0 a 5,0 en el corte que te falta para proyectar en tiempo real cómo quedaría tu definitiva final.",
  },
  {
    id: "strategy",
    icon: "fa-chess-knight",
    title: "Calculadora de Estrategia",
    text: "¿Dónde me esfuerzo menos? Descubre todas las combinaciones posibles entre los cortes pendientes para aprobar con 3,0.",
  },
  {
    id: "inverse",
    icon: "fa-rotate-left",
    title: "Calculadora Inversa ¿Cuánto saqué?",
    text: "Si ya conoces la nota definitiva de tu corte y las notas de tus actividades, calcula qué nota sacaste en el examen parcial.",
  },
];

export default function ToolsView({ onOpenTool }) {
  return (
    <section id="view-herramientas" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Herramientas Académicas 🛠️</h1>
          <p>
            Proyecta tus cortes, calcula notas necesarias en parciales y encuentra la mejor estrategia para aprobar tus
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
            <div>
              <p className="dash-card-sub">{tool.text}</p>
            </div>
            <div className="action-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onOpenTool?.(tool.id)}
              >
                <i className="fa-solid fa-arrow-right icon-left"></i> Abrir
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}