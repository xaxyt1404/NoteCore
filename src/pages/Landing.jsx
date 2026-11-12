import { useState } from "react";
import Navbar from "../components/landing/Navbar";
import SimulationModal from "../components/landing/SimulationModal";
import ContactSection from "../components/landing/ContactSection";
import FloatingIcons from "../components/common/FloatingIcons";

const AI_STEPS = [
  { label: "Configura:", text: "Agrega tus asignaturas y los porcentajes establecidos para tus notas." },
  { label: "Registra:", text: "Guarda tus notas a medida que avanza el semestre." },
  { label: "Proyecta:", text: "Calcula cuánto necesitas exactamente para aprobar." },
];

const TOOLS = [
  { icon: "⚙️", title: "Esquemas Personalizables", text: "Adapta los porcentajes de las asignaturas como necesites." },
  { icon: "🎯", title: "Calculadoras dinámicas", text: "Calcula múltiples escenarios para tus notas finales." },
  {
    icon: "🤖",
    title: "Asistente CoreAI",
    text: "Diagnósticos en tiempo real ajustados a tu meta académica para enfocarte en lo que más importa.",
  },
];

export default function Landing() {
  const [simOpen, setSimOpen] = useState(false);

  return (
    <>
      <Navbar />

      <section id="inicio" className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="badge">Diseñado para estudiantes universitarios</span>
            <h1>
              Toma el control total de tus <span className="highlight">notas</span>
            </h1>
            <p>
              Configura los cortes de tus asignaturas, calcula cuánto necesitas exactamente para aprobar y recibe
              recomendaciones inteligentes con <strong>CoreAI</strong>.
            </p>
          </div>
          <div className="hero-buttons">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setSimOpen(true)}>
              <i className="fa-solid fa-play icon-left"></i> Probar simulación
            </button>
          </div>
        </div>
      </section>

      <section id="herramientas" className="features container">
        <h2 className="section-title">Herramientas</h2>
        <div className="tools-layout">
          <div className="card-preview ai-guide-card">
            <div className="card-preview-header">
              <span className="ai-badge">
                <i className="fa-solid fa-robot"></i> CoreAI
              </span>
              <span className="status-badge info">Cómo funciona</span>
            </div>
            <div>
              <p className="ai-greeting">¡Hola! Soy CoreAI, te ayudaré a controlar tu progreso en el semestre.</p>

              <ul className="ai-steps">
                {AI_STEPS.map((step, i) => (
                  <li key={step.label}>
                    <span className="step-num">{i + 1}</span>
                    <span>
                      <strong>{step.label}</strong> {step.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="ai-footer-tag">
                <i className="fa-solid fa-sparkles"></i> Deja de hacer cuentas en la calculadora
              </div>
            </div>
          </div>

          <div className="tools-list">
            {TOOLS.map((tool) => (
              <article className="feature-card tool-card" key={tool.title}>
                <div className="feature-icon">{tool.icon}</div>
                <div>
                  <h3>{tool.title}</h3>
                  <p>{tool.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />

      <footer className="footer">
        <div className="container">
          <p>© 2026 NoteCore. Desarrollado por Estiben Yesid Martinez</p>
        </div>
      </footer>

      <FloatingIcons />

      <SimulationModal isOpen={simOpen} onClose={() => setSimOpen(false)} />
    </>
  );
}


