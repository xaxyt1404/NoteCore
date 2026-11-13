import { useState } from "react";
import ContactForm from "../../common/ContactForm";

const GUIDE_STEPS = [
  {
    step: "1",
    icon: "fa-book-open",
    title: "Configura tus asignaturas",
    description:
      "Ve a la sección Asignaturas, crea tus materias del semestre o impórtalas en JSON. Define tus cortes (30%, 30%, 40%) y los porcentajes de actividades y parciales.",
    targetView: "view-asignaturas",
    actionLabel: "Ir a Asignaturas",
  },
  {
    step: "2",
    icon: "fa-pen-to-square",
    title: "Registra tus notas y bonos",
    description:
      "Abre cualquier tarjeta de asignatura para ingresar las notas de tus talleres, quices, parciales o puntos extra. El sistema calcula tu definitiva y tu estado automáticamente.",
    targetView: "view-asignaturas",
    actionLabel: "Gestionar notas",
  },
  {
    step: "3",
    icon: "fa-calculator",
    title: "Proyecta con las Herramientas",
    description:
      "Usa las 5 calculadoras académicas para saber cuánto necesitas en tu parcial, simular escenarios en los cortes pendientes o calcular qué nota sacaste en un examen.",
    targetView: "view-herramientas",
    actionLabel: "Abrir Herramientas",
  },
  {
    step: "4",
    icon: "fa-chart-line",
    title: "Analiza y consulta a CoreAI",
    description:
      "Revisa tu promedio ponderado en Estadísticas y abre el chat flotante de CoreAI para recibir recomendaciones personalizadas sobre qué materias priorizar.",
    targetView: "view-estadisticas",
    actionLabel: "Ver Estadísticas",
  },
];

export default function SupportView({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState("guide"); // "guide" | "contact"

  return (
    <section id="view-soporte" className="dash-view">
      {/* Encabezado de la vista */}
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Centro de Soporte 🛠️</h1>
          <p>
            Aprende a sacar el máximo provecho de NoteCore o contáctanos directamente.
          </p>
        </div>
      </div>

      {/* Pestañas principales: Guía y Contacto */}
      <div className="sim-tabs">
        <button
          type="button"
          className={`tab-btn${activeTab === "guide" ? " active" : ""}`}
          onClick={() => setActiveTab("guide")}
        >
          <i className="fa-solid fa-book-bookmark icon-left"></i> Guía rápida
        </button>
        <button
          type="button"
          className={`tab-btn${activeTab === "contact" ? " active" : ""}`}
          onClick={() => setActiveTab("contact")}
        >
          <i className="fa-solid fa-paper-plane icon-left"></i> Contacto
        </button>
      </div>

      {/* Vista 1: Guía rápida */}
      {activeTab === "guide" && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3>
                <i className="fa-solid fa-compass card-icon"></i> Guía rápida de uso
              </h3>
              <p className="dash-card-sub">
                Todo lo que necesitas saber para controlar tu semestre en 4 pasos.
              </p>
            </div>
          </div>

          <div className="scenarios-grid">
            {GUIDE_STEPS.map((item) => (
              <div className="scenario-card" key={item.step}>
                <strong>
                  <i className={`fa-solid ${item.icon} highlight icon-left`}></i>
                  {item.step}. {item.title}
                </strong>
                <p className="dash-card-sub">{item.description}</p>
                {onNavigate && (
                  <button
                    type="button"
                    className="btn-text-action"
                    onClick={() => onNavigate(item.targetView)}
                  >
                    {item.actionLabel}{" "}
                    <i className="fa-solid fa-arrow-right icon-right"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista 2: Contacto */}
      {activeTab === "contact" && (
        <div className="dash-card">
          <div className="dash-card-header">
            <div>
              <h3>
                <i className="fa-solid fa-headset card-icon"></i> ¿Tienes una duda o sugerencia?
              </h3>
              <p className="dash-card-sub">
                Envíanos un mensaje por WhatsApp o correo y te responderemos lo antes posible.
              </p>
            </div>
          </div>

          <ContactForm
            defaultName={user?.name || user?.fullName || ""}
            defaultEmail={user?.email || ""}
          />
        </div>
      )}
    </section>
  );
}