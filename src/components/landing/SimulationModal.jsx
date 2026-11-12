import { useEffect, useRef, useState } from "react";
import Modal from "../common/Modal";
import {
  formatGrade,
  formatGradePrecise,
  getGradeColorClass,
  getCorte1Projection,
  calculatePendingNeeded,
  calculateNeededC3,
} from "../../utils/gradeHelpers";

const INITIAL_A = { taller: 0, quiz: 0, bonus: 0 };
const C2_SCENARIOS = [3.0, 2.0, 4.0, 2.5, 4.5];

const carriedFromA = ({ taller, quiz, bonus }) =>
  taller === 0 && quiz === 0 && bonus === 0
    ? 0
    : getCorte1Projection(taller, quiz, bonus).corte1Grade;

function SliderField({ id, label, value, max = 5, onChange }) {
  return (
    <div className="form-group">
      <div className="label-wrapper">
        <label htmlFor={id}>{label}</label>
        <span className="range-val">{formatGrade(value)}</span>
      </div>
      <div className="slider-wrapper">
        <input
          type="range"
          id={id}
          min="0"
          max={max}
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

// Opción A: nota necesaria en el parcial del Corte 1
function computeA({ taller, quiz, bonus }) {
  if (taller === 0 && quiz === 0 && bonus === 0) {
    return {
      text: "5,00",
      cls: "text-danger",
      feedback: (
        <>
          🤖 <strong>CoreAI:</strong> Mueve los controles de Taller, Quiz y Puntos de clase para calcular cuánto
          necesitas exactamente en el Parcial del Corte 1.
        </>
      ),
    };
  }

  const { needed, corte1Grade } = getCorte1Projection(taller, quiz, bonus);
  const cls = getGradeColorClass(needed);
  const finalParcial = Math.max(0, needed);

  if (needed > 5.0) {
    return {
      text: "> 5,0",
      cls,
      feedback: (
        <>
          ⚠️ <strong>CoreAI:</strong> Matemáticamente necesitarías un <strong>{formatGrade(needed)}</strong> en el
          parcial para llegar a 3,0. Si sacas 5,0, tu Corte 1 cerrará en{" "}
          <strong>{formatGradePrecise(corte1Grade)}</strong>. ¡Tranquilo, aún quedan el Corte 2 y 3!
        </>
      ),
    };
  }

  if (needed > 4.0) {
    return {
      text: formatGradePrecise(finalParcial),
      cls,
      feedback: (
        <>
          🔥 <strong>CoreAI:</strong> ¡A apretar el acelerador! Necesitas un{" "}
          <strong>{formatGradePrecise(finalParcial)}</strong> en el parcial. Con los puntos adicionales amortiguaste
          bastante, pero requiere estudio enfocado.
        </>
      ),
    };
  }

  if (needed > 0) {
    return {
      text: formatGradePrecise(finalParcial),
      cls,
      feedback: (
        <>
          📈 <strong>CoreAI:</strong> Panorama muy alcanzable. Sacando un{" "}
          <strong>{formatGradePrecise(finalParcial)}</strong> en el parcial aseguras el 3,0 del Corte 1. ¡Un repaso de
          los temas claves y lo tienes!
        </>
      ),
    };
  }

  return {
    text: "0,00",
    cls,
    feedback: (
      <>
        🎉 <strong>CoreAI:</strong> ¡Ya aseguraste el corte! Con tus notas actuales y bonos sumas{" "}
        <strong>{formatGradePrecise(corte1Grade)}</strong> en el Corte 1 sin depender del examen parcial.
      </>
    ),
  };
}

// Opción B: escenarios para Cortes 2 y 3
function computeB(c1) {
  const contribution = c1 * 0.3;
  const pending = calculatePendingNeeded(c1);

  const summary =
    c1 === 0 ? (
      <>
        Mueve el control arriba para definir la nota del Corte 1 (o simúlala en la Opción A). Necesitando el{" "}
        <strong>3,0 completo</strong> en los cortes restantes:
      </>
    ) : (
      <>
        Con tu Corte 1 en <strong>{formatGradePrecise(c1)}</strong> (aporta {formatGradePrecise(contribution)} a la
        nota final), necesitas acumular <strong>{formatGradePrecise(pending)}</strong> puntos ponderados entre el
        Corte 2 (30%) y Corte 3 (40%) para aprobar en <strong>3,0</strong>:
      </>
    );

  const scenarios = C2_SCENARIOS.map((c2, idx) => {
    const neededC3 = calculateNeededC3(pending, c2);
    const text =
      neededC3 <= 0
        ? "0,0 (Ganas la materia)"
        : neededC3 > 5.0
          ? "> 5,0 (Inalcanzable)"
          : formatGradePrecise(neededC3);
    return { idx, c2, text, cls: getGradeColorClass(neededC3) };
  });

  let feedback;
  if (c1 === 0) {
    feedback = (
      <>
        🤖 <strong>CoreAI:</strong> Selecciona tu nota del Corte 1. Si no sumas puntos en este corte, necesitarás un
        promedio sostenido de <strong>4,3</strong> entre el Corte 2 y 3.
      </>
    );
  } else if (c1 < 2.0) {
    feedback = (
      <>
        ⚠️ <strong>CoreAI:</strong> Un Corte 1 en <strong>{formatGradePrecise(c1)}</strong> exige recuperar terreno.
        Apunta a sacar al menos <strong>4,0 en el Corte 2</strong> para evitar depender de una nota perfecta al
        final.
      </>
    );
  } else if (c1 < 3.0) {
    feedback = (
      <>
        📊 <strong>CoreAI:</strong> Quedaste muy cerca del mínimo con un <strong>{formatGradePrecise(c1)}</strong>.
        Subiendo levemente tu promedio a <strong>3,3</strong> en los dos cortes restantes apruebas la asignatura.
      </>
    );
  } else if (c1 < 4.2) {
    feedback = (
      <>
        🤖 <strong>CoreAI:</strong> ¡Vas por buen camino! Con un <strong>{formatGradePrecise(c1)}</strong> en el
        primer corte, mantener un promedio de <strong>3,0</strong> en lo que resta te asegura ganar la materia.
      </>
    );
  } else {
    feedback = (
      <>
        🚀 <strong>CoreAI:</strong> ¡Excelente nota de primer corte (<strong>{formatGradePrecise(c1)}</strong>)!
        Tienes un gran colchón de puntos acumulados.
      </>
    );
  }

  return { summary, scenarios, feedback };
}

export default function SimulationModal({ isOpen, onClose }) {
  const [tab, setTab] = useState("A");
  const [a, setA] = useState(INITIAL_A);
  const [corte1, setCorte1] = useState(0);
  const [carried, setCarried] = useState(0);
  const bodyRef = useRef(null);
  const savedScroll = useRef(0);

  useEffect(() => {
    if (isOpen) savedScroll.current = window.scrollY;
  }, [isOpen]);

  const updateA = (key, value) => {
    const next = { ...a, [key]: value };
    setA(next);
    setCarried(carriedFromA(next));
  };

  const updateCorte1 = (value) => {
    setCorte1(value);
    setCarried(value);
  };

  const switchTab = (next) => {
    if (next === "B" && corte1 === 0 && carried > 0) {
      setCorte1(Number(carried.toFixed(1)));
    }
    if (next === "A") setCarried(carriedFromA(a));
    setTab(next);
  };

  const handleClose = () => {
    setA(INITIAL_A);
    setCorte1(0);
    setCarried(0);
    setTab("A");
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    onClose?.();
    requestAnimationFrame(() => window.scrollTo(0, savedScroll.current));
  };

  const viewA = computeA(a);
  const viewB = computeB(corte1);
  const feedback = tab === "A" ? viewA.feedback : viewB.feedback;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="modal-header">
        <div className="modal-title">
          <i className="fa-solid fa-calculator highlight"></i>
          <span>Simulador de Asignaturas</span>
        </div>
      </div>

      <div className="modal-body" ref={bodyRef}>
        <div className="subject-tag">
          <span className="badge">Escenario Hipotético</span>
          <h3>Asignatura: Producción Textual</h3>
          <p className="cuts-summary">
            Desglose de Cortes: <strong>Corte 1 (30%)</strong> • <strong>Corte 2 (30%)</strong> •{" "}
            <strong>Corte 3 (40%)</strong>
          </p>
        </div>

        <div className="sim-tabs">
          <button
            type="button"
            className={`tab-btn${tab === "A" ? " active" : ""}`}
            onClick={() => switchTab("A")}
          >
            Calcular Parcial (Corte 1)
          </button>
          <button
            type="button"
            className={`tab-btn${tab === "B" ? " active" : ""}`}
            onClick={() => switchTab("B")}
          >
            Escenarios Cortes 2 y 3
          </button>
        </div>

        {tab === "A" ? (
          <div>
            <div className="form-grid">
              <SliderField
                id="tallerInput"
                label="Taller (30% del corte):"
                value={a.taller}
                onChange={(v) => updateA("taller", v)}
              />
              <SliderField
                id="quizInput"
                label="Quiz (20% del corte):"
                value={a.quiz}
                onChange={(v) => updateA("quiz", v)}
              />
              <SliderField
                id="bonusInput"
                label="Puntos Clase (+0.2 a la definitiva):"
                value={a.bonus}
                max={1}
                onChange={(v) => updateA("bonus", v)}
              />
            </div>

            <div className="result-box">
              <span className="result-label">
                Nota necesaria en el Parcial (50% del corte) para aprobar el Corte 1 con 3.0:
              </span>
              <div className={`result-value ${viewA.cls}`}>{viewA.text}</div>
            </div>
          </div>
        ) : (
          <div>
            <SliderField
              id="corte1Input"
              label="Nota Definitiva del Corte 1 (30%):"
              value={corte1}
              onChange={updateCorte1}
            />

            <p className="sim-instruction">{viewB.summary}</p>

            <div className="scenarios-grid">
              {viewB.scenarios.map((s) => (
                <div className="scenario-card" key={s.idx}>
                  <strong>Escenario {s.idx + 1}</strong>
                  <span>C2 (30%): {formatGrade(s.c2)}</span>
                  <br />
                  <span className={s.cls}>C3 (40%): {s.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ai-feedback-box">
          <div className="ai-header">
            <i className="fa-solid fa-robot highlight"></i>
            <strong>CoreAI Smart Insight:</strong>
          </div>
          <p className="ai-message">{feedback}</p>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-primary" onClick={handleClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}


