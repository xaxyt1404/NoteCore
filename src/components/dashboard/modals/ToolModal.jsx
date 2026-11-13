import { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import CustomDropdown from "../../common/CustomDropdown";
import {
  formatGrade,
  formatGradePrecise,
  getGradeStatus,
  getGradeColorClass,
  getRequiredGradeViability,
} from "../../../utils/gradeHelpers";

// Metadatos (ícono y título) de las 5 herramientas
const TOOL_META = {
  "last-cut": {
    icon: "fa-bullseye",
    title: "¿Cuánto necesito en el último corte?",
  },
  "parcial-needed": {
    icon: "fa-file-pen",
    title: "¿Cuánto necesito en mi parcial?",
  },
  "what-if": {
    icon: "fa-sliders",
    title: "Simulador ¿Y si saco...?",
  },
  strategy: {
    icon: "fa-chess-knight",
    title: "Calculadora de Estrategia - ¿Dónde me esfuerzo menos?",
  },
  inverse: {
    icon: "fa-rotate-left",
    title: "Calculadora Inversa ¿Cuánto saqué?",
  },
};

// Calcula la definitiva de un corte individual (o null si aún no tiene notas)
const computeCutGrade = (cut) => {
  if (!cut) return null;
  const activitiesSum = (cut.activities || []).reduce(
    (acc, act) => acc + (Number(act.grade) || 0) * ((Number(act.weight) || 0) / 100),
    0
  );
  const parcialSum =
    (Number(cut.parcial?.grade) || 0) * ((Number(cut.parcial?.weight) || 0) / 100);

  const hasAnyGrade =
    (cut.activities || []).some((a) => a.grade > 0) ||
    cut.parcial?.grade > 0 ||
    cut.bonus > 0;

  if (!hasAnyGrade) return null;
  return Math.min(5.0, activitiesSum + parcialSum + (Number(cut.bonus) || 0));
};

// Control deslizante reutilizable para notas (0.0 a 5.0)
function GradeSlider({ id, label, value, onChange }) {
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
          max="5"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

// Campo de solo lectura para notas importadas de una asignatura
function LockedGradeField({ label, value }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type="text" readOnly value={formatGrade(value)} />
    </div>
  );
}

export default function ToolModal({ toolId, onClose, subjects = [], onSaveSimulation }) {
  const isOpen = Boolean(toolId && TOOL_META[toolId]);
  const meta = TOOL_META[toolId] || { icon: "fa-calculator", title: "" };

  // Estado del selector de asignatura
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || null;

  // Estado de cortes (Herramientas 1, 3 y 4)
  const [c1, setC1] = useState(0);
  const [c2, setC2] = useState(0);
  const [c3, setC3] = useState(0);

  // Detección automática de cortes reales de la asignatura seleccionada
  const subC1 = selectedSubject ? computeCutGrade(selectedSubject.cuts?.[0]) : null;
  const subC2 = selectedSubject ? computeCutGrade(selectedSubject.cuts?.[1]) : null;
  const hasC1 = subC1 !== null;
  const hasC2 = subC2 !== null;

  // Estado de actividades dinámicas por corte (Herramientas 2 y 5)
  const [activeCutIdx, setActiveCutIdx] = useState(0);
  const [activities, setActivities] = useState([]);
  const [finalCutGrade, setFinalCutGrade] = useState(3.0);

  // Indica si el corte activo en herramienta 5 tiene definitiva importada de la asignatura
  const activeCutImportedGrade = selectedSubject
    ? computeCutGrade(selectedSubject.cuts?.[activeCutIdx])
    : null;
  const hasImportedFinalCut = activeCutImportedGrade !== null;

  // Temporizador para mostrar el botón Guardar 500ms después de calcular (solo en herramienta 5)
  const [calcTick, setCalcTick] = useState(0);
  const [showSaveBtn, setShowSaveBtn] = useState(false);

  const triggerAutoCalc = () => {
    setShowSaveBtn(false);
    setCalcTick((t) => t + 1);
  };

  useEffect(() => {
    if (!isOpen || toolId !== "inverse" || !selectedSubject || calcTick === 0) {
      setShowSaveBtn(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowSaveBtn(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [isOpen, toolId, selectedSubject, calcTick]);

  // Reinicia todos los campos a modo manual
  const resetManual = () => {
    setSelectedSubjectId("");
    setC1(0);
    setC2(0);
    setC3(0);
    setActiveCutIdx(0);
    setActivities([]);
    setFinalCutGrade(3.0);
    setCalcTick(0);
    setShowSaveBtn(false);
  };

  useEffect(() => {
    if (isOpen) resetManual();
  }, [toolId]);

  const mapImportedActivities = (cut) =>
    (cut?.activities || []).map((a) => ({
      id: a.id,
      name: a.name,
      grade: Number(a.grade) || 0,
      weight: Number(a.weight) || 0,
      imported: true,
    }));

  // Autocompleta los datos al elegir una asignatura del dropdown
  const handleSelectSubject = (subId) => {
    if (!subId) {
      resetManual();
      return;
    }
    setSelectedSubjectId(subId);
    const sub = subjects.find((s) => s.id === subId);
    if (!sub) return;

    const g1 = computeCutGrade(sub.cuts?.[0]);
    const g2 = computeCutGrade(sub.cuts?.[1]);
    const g3 = computeCutGrade(sub.cuts?.[2]);

    setC1(g1 !== null ? Number(g1.toFixed(1)) : 0);
    setC2(g2 !== null ? Number(g2.toFixed(1)) : 0);
    setC3(g3 !== null ? Number(g3.toFixed(1)) : 0);

    setActiveCutIdx(0);
    setActivities(mapImportedActivities(sub.cuts?.[0]));
    setFinalCutGrade(g1 !== null ? Number(g1.toFixed(1)) : 3.0);
    triggerAutoCalc();
  };

  // Cambia el corte activo en herramientas con actividades (2 y 5)
  const handleChangeCutForActivities = (idx) => {
    setActiveCutIdx(idx);
    if (!selectedSubject) return;
    const cut = selectedSubject.cuts?.[idx];
    setActivities(mapImportedActivities(cut));
    const g = computeCutGrade(cut);
    setFinalCutGrade(g !== null ? Number(g.toFixed(1)) : 3.0);
    triggerAutoCalc();
  };

  // Gestión de filas de actividades (las nuevas agregadas en la herramienta sí son editables)
  const addActivityRow = () => {
    setActivities((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `Actividad ${prev.length + 1}`,
        grade: 0,
        weight: 0,
        imported: false,
      },
    ]);
    triggerAutoCalc();
  };

  const updateActivityRow = (id, field, val) => {
    setActivities((prev) => {
      const otherWeight = prev
        .filter((a) => a.id !== id)
        .reduce((acc, a) => acc + (Number(a.weight) || 0), 0);
      const maxAllowed = Math.max(0, 100 - otherWeight);

      return prev.map((a) => {
        if (a.id !== id || a.imported) return a;
        if (field === "weight") {
          const clamped = Math.min(maxAllowed, Math.max(0, Number(val) || 0));
          return { ...a, weight: clamped };
        }
        return { ...a, [field]: val };
      });
    });
    triggerAutoCalc();
  };

  const removeActivityRow = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id || a.imported));
    triggerAutoCalc();
  };

  // Cálculos matemáticos en tiempo real
  const targetsLastCut = [3.0, 3.5, 4.0, 4.5].map((goal) => {
    const needed = (goal - (c1 * 0.3 + c2 * 0.3)) / 0.4;
    return { goal, needed };
  });

  const totalActWeight = activities.reduce((acc, a) => acc + (Number(a.weight) || 0), 0);
  const parcialWeight = Math.max(0, 100 - totalActWeight);
  const accumulatedCutPoints = activities.reduce(
    (acc, a) => acc + (Number(a.grade) || 0) * ((Number(a.weight) || 0) / 100),
    0
  );
  const neededInParcial =
    parcialWeight > 0 ? (3.0 - accumulatedCutPoints) / (parcialWeight / 100) : null;

  const simulatedDefinitive = Number((c1 * 0.3 + c2 * 0.3 + c3 * 0.4).toFixed(2));
  const simStatus = getGradeStatus(simulatedDefinitive);

  const pendingWeightFor3 = Math.max(0, 3.0 - c1 * 0.3);
  const strategyPresets = [3.0, 3.5, 4.0, 4.5, 5.0];
  const strategyCombinations = strategyPresets
    .map((simC2) => {
      const reqC3 = (pendingWeightFor3 - simC2 * 0.3) / 0.4;
      return { simC2, reqC3: Math.max(0, reqC3) };
    })
    .filter((item) => item.reqC3 <= 5.0);

  const inverseParcialGrade =
    parcialWeight > 0 ? (finalCutGrade - accumulatedCutPoints) / (parcialWeight / 100) : null;

  // Guarda el cálculo inverso dentro de la asignatura seleccionada (solo Herramienta 5)
  const handleSaveToSubject = () => {
    if (!selectedSubject || toolId !== "inverse") return;
    const summaryText =
      inverseParcialGrade !== null
        ? `Nota calculada del parcial en Corte ${activeCutIdx + 1}: ${formatGradePrecise(
          Math.max(0, inverseParcialGrade)
        )}.`
        : "Cálculo inverso registrado.";

    onSaveSimulation?.(selectedSubject.id, {
      id: Date.now(),
      toolId,
      toolTitle: meta.title,
      summary: summaryText,
      createdAt: new Date().toISOString(),
    });
    onClose?.();
  };

  const subjectDropdownOptions = [
    { value: "", label: "Sin asignatura" },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  // Controla si la caja de resultados debe mostrarse
  const showResultBox = toolId !== "what-if" || (Boolean(selectedSubject) && hasC1);

  const renderActivityCard = (act, idPrefix, gradeLabel) => {
    if (act.imported) {
      return (
        <div key={act.id} className="scenario-card profile-form">
          <div className="scenario-header">
            <input type="text" readOnly value={act.name} />
          </div>
          <div className="form-grid activity-grid">
            <LockedGradeField label={gradeLabel} value={act.grade} />
            <div className="form-group weight-group">
              <label>Porcentaje (%):</label>
              <input type="text" readOnly value={`${act.weight}%`} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={act.id} className="scenario-card">
        <div className="scenario-header">
          <input
            type="text"
            value={act.name}
            onChange={(e) => updateActivityRow(act.id, "name", e.target.value)}
          />
          <button
            type="button"
            className="btn-icon-delete"
            title="Eliminar fila"
            onClick={() => removeActivityRow(act.id)}
          >
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div className="form-grid activity-grid">
          <GradeSlider
            id={`${idPrefix}-act-${act.id}`}
            label={gradeLabel}
            value={act.grade}
            onChange={(v) => updateActivityRow(act.id, "grade", v)}
          />
          <div className="form-group weight-group">
            <label>Porcentaje (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={act.weight}
              onChange={(e) =>
                updateActivityRow(act.id, "weight", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Cabecera de la modal */}
      <div className="modal-header">
        <div className="modal-title">
          <i className={`fa-solid ${meta.icon} highlight`}></i>
          <span>{meta.title}</span>
        </div>
      </div>

      <div className="modal-body">
        {/* Bloque selector de asignatura */}
        <div className="form-group">
          <div className="label-wrapper">
            <label>Asignatura a simular:</label>
            {selectedSubject && (
              <span className="text-success">
                <i className="fa-solid fa-circle-check icon-left"></i>{" "}
                Usando datos de {selectedSubject.name}
              </span>
            )}
          </div>
          <CustomDropdown
            options={subjectDropdownOptions}
            value={selectedSubjectId}
            placeholder="Sin asignatura"
            searchable={subjects.length > 4}
            onChange={handleSelectSubject}
          />
        </div>

        {/* Formulario Herramienta 1: Último corte */}
        {toolId === "last-cut" && (
          <div className={`form-grid${hasC1 || hasC2 ? " profile-form" : ""}`}>
            {hasC1 ? (
              <LockedGradeField label="Nota Corte 1 (30%):" value={c1} />
            ) : (
              <GradeSlider
                id="lc-c1"
                label="Nota Corte 1 (30%):"
                value={c1}
                onChange={(v) => {
                  setC1(v);
                  triggerAutoCalc();
                }}
              />
            )}

            {hasC2 ? (
              <LockedGradeField label="Nota Corte 2 (30%):" value={c2} />
            ) : (
              <GradeSlider
                id="lc-c2"
                label="Nota Corte 2 (30%):"
                value={c2}
                onChange={(v) => {
                  setC2(v);
                  triggerAutoCalc();
                }}
              />
            )}
          </div>
        )}

        {/* Formulario Herramienta 2: ¿Cuánto necesito en mi parcial? */}
        {toolId === "parcial-needed" && (
          <div className="activities-section">
            {selectedSubject && (
              <div className="sim-tabs">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`tab-btn${activeCutIdx === idx ? " active" : ""}`}
                    onClick={() => handleChangeCutForActivities(idx)}
                  >
                    Corte {idx + 1}
                  </button>
                ))}
              </div>
            )}

            <div className="section-header-row">
              <h4>
                Actividades del Corte ({totalActWeight}% asignado • Parcial restante: {parcialWeight}%)
              </h4>
              <button type="button" className="btn btn-outline" onClick={addActivityRow}>
                <i className="fa-solid fa-plus icon-left"></i> Agregar actividad
              </button>
            </div>

            {activities.length === 0 ? (
              <p className="dash-card-sub">
                Agrega las actividades realizadas y sus notas para hacer el cálculo
              </p>
            ) : (
              activities.map((act) => renderActivityCard(act, "pn", "Nota obtenida:"))
            )}
          </div>
        )}

        {/* Formulario Herramienta 3: Simulador ¿Y si saco...? */}
        {toolId === "what-if" && (
          <div>
            {!selectedSubject ? (
              <p className="dash-card-sub">Selecciona una asignatura para continuar</p>
            ) : !hasC1 ? (
              <p className="dash-card-sub">
                Registra al menos la nota del Corte 1 en <strong>{selectedSubject.name}</strong> para simular.
              </p>
            ) : (
              <>
                {/* Indicador de vista detectada (no interactivo) */}
                <div className="sim-tabs readonly">
                  <div className={`tab-btn${!hasC2 ? " active" : ""}`}>
                    Simular Cortes 2 y 3
                  </div>
                  <div className={`tab-btn${hasC2 ? " active" : ""}`}>
                    Simular Corte 3
                  </div>
                </div>

                {/* Notas fijas importadas de la asignatura */}
                <div className="profile-form">
                  <div className="form-grid">
                    <LockedGradeField label="Corte 1 (30%):" value={c1} />
                    {hasC2 && <LockedGradeField label="Corte 2 (30%):" value={c2} />}
                  </div>
                </div>

                {/* Sliders activos solo para los cortes pendientes */}
                <div className="form-grid">
                  {!hasC2 && (
                    <GradeSlider
                      id="wi-c2"
                      label="Corte 2 (30%):"
                      value={c2}
                      onChange={(v) => {
                        setC2(v);
                        triggerAutoCalc();
                      }}
                    />
                  )}
                  <GradeSlider
                    id="wi-c3"
                    label="Corte 3 (40%):"
                    value={c3}
                    onChange={(v) => {
                      setC3(v);
                      triggerAutoCalc();
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Formulario Herramienta 4: Calculadora de Estrategia */}
        {toolId === "strategy" && (
          <div className={hasC1 ? "profile-form" : undefined}>
            {hasC1 ? (
              <LockedGradeField label="Nota que llevas en el Corte 1 (30%):" value={c1} />
            ) : (
              <GradeSlider
                id="st-c1"
                label="Nota que llevas en el Corte 1 (30%):"
                value={c1}
                onChange={(v) => {
                  setC1(v);
                  triggerAutoCalc();
                }}
              />
            )}
          </div>
        )}

        {/* Formulario Herramienta 5: Calculadora Inversa */}
        {toolId === "inverse" && (
          <div className="activities-section">
            {selectedSubject && (
              <div className="sim-tabs">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`tab-btn${activeCutIdx === idx ? " active" : ""}`}
                    onClick={() => handleChangeCutForActivities(idx)}
                  >
                    Corte {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {hasImportedFinalCut ? (
              <div className="profile-form">
                <LockedGradeField
                  label="Nota definitiva que obtuviste en el corte:"
                  value={finalCutGrade}
                />
              </div>
            ) : (
              <GradeSlider
                id="inv-final"
                label="Nota definitiva que obtuviste en el corte:"
                value={finalCutGrade}
                onChange={(v) => {
                  setFinalCutGrade(v);
                  triggerAutoCalc();
                }}
              />
            )}

            <div className="section-header-row">
              <h4>
                Actividades conocidas ({totalActWeight}% • Parcial equivale al {parcialWeight}%)
              </h4>
              <button type="button" className="btn btn-outline" onClick={addActivityRow}>
                <i className="fa-solid fa-plus icon-left"></i> Agregar actividad
              </button>
            </div>

            {activities.length === 0 ? (
              <p className="dash-card-sub">
                Agrega las actividades realizadas y sus notas para hacer el cálculo
              </p>
            ) : (
              activities.map((act) => renderActivityCard(act, "inv", "Nota de la actividad:"))
            )}
          </div>
        )}

        {/* Zona de resultados en tiempo real */}
        {showResultBox && (
          <div className="result-box">
            {/* Resultado 1: Último corte */}
            {toolId === "last-cut" && (
              <div>
                <span className="result-label">
                  Nota que necesitas en el <strong>Corte 3 (40%)</strong> según tu meta:
                </span>
                <div className="table-responsive">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Meta</th>
                        <th>Nota requerida en Corte 3</th>
                        <th>Viabilidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {targetsLastCut.map(({ goal, needed }) => {
                        const rounded = Math.round(needed * 100) / 100;
                        const { colorClass, label } = getRequiredGradeViability(rounded);
                        const displayVal =
                          rounded <= 0
                            ? "0,00 (Ya asegurada)"
                            : rounded > 5.0
                              ? `${formatGradePrecise(rounded)} (> 5,0)`
                              : formatGradePrecise(rounded);

                        return (
                          <tr key={goal}>
                            <td>
                              <strong>{formatGrade(goal)}</strong>
                            </td>
                            <td>
                              <strong className={colorClass}>{displayVal}</strong>
                            </td>
                            <td>
                              <span className={colorClass}>
                                <strong>{label}</strong>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Resultado 2: ¿Cuánto necesito en mi parcial? */}
            {toolId === "parcial-needed" && (
              <div>
                {parcialWeight <= 0 ? (
                  <p className="text-warning">
                    Tus actividades ya suman {totalActWeight}%. Reduce algún porcentaje para dejar peso al parcial.
                  </p>
                ) : (
                  <>
                    <span className="result-label">
                      Nota necesaria en el Parcial ({parcialWeight}% del corte) para aprobar el corte en{" "}
                      <strong>3,0</strong>:
                    </span>
                    <div className={`result-value ${getGradeColorClass(neededInParcial)}`}>
                      {neededInParcial <= 0
                        ? "0,00"
                        : neededInParcial > 5.0
                          ? `> 5,0 (${formatGradePrecise(neededInParcial)})`
                          : formatGradePrecise(neededInParcial)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Resultado 3: Simulador ¿Y si saco...? */}
            {toolId === "what-if" && selectedSubject && hasC1 && (
              <div>
                <span className="result-label">Definitiva proyectada de la asignatura:</span>
                <div className={`result-value ${simStatus.colorClass}`}>
                  {formatGradePrecise(simulatedDefinitive)}
                </div>
                <span className={`result-label ${simStatus.colorClass}`}>
                  Estado: <strong>{simStatus.label}</strong>
                </span>
              </div>
            )}

            {/* Resultado 4: Calculadora de Estrategia */}
            {toolId === "strategy" && (
              <div>
                <span className="result-label">
                  Combinaciones entre <strong>Corte 2 (30%)</strong> y <strong>Corte 3 (40%)</strong> para aprobar en{" "}
                  <strong>3,0</strong>:
                </span>
                <div className="scenarios-grid">
                  {strategyCombinations.map(({ simC2, reqC3 }) => (
                    <div className="scenario-card" key={simC2}>
                      <strong>Si sacas {formatGrade(simC2)} en Corte 2</strong>
                      <span className={getGradeColorClass(reqC3)}>
                        Necesitas {formatGradePrecise(reqC3)} en el Corte 3
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resultado 5: Calculadora Inversa */}
            {toolId === "inverse" && (
              <div>
                {parcialWeight <= 0 ? (
                  <p className="text-warning">
                    Las actividades ya ocupan el {totalActWeight}% del corte; no queda porcentaje para el parcial.
                  </p>
                ) : (
                  <>
                    <span className="result-label">
                      Nota que sacaste en el Examen Parcial ({parcialWeight}% del corte):
                    </span>
                    <div
                      className={`result-value ${getGradeStatus(Math.max(0, inverseParcialGrade)).colorClass
                        }`}
                    >
                      {inverseParcialGrade < 0
                        ? "0,00"
                        : inverseParcialGrade > 5.0
                          ? `> 5,0 (${formatGradePrecise(inverseParcialGrade)})`
                          : formatGradePrecise(inverseParcialGrade)}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pie de modal: botón Guardar aparece 500ms después de calcular solo en Calculadora Inversa */}
      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cerrar
        </button>
        {toolId === "inverse" && showSaveBtn && selectedSubject && (
          <button type="button" className="btn btn-primary" onClick={handleSaveToSubject}>
            <i className="fa-solid fa-floppy-disk icon-left"></i> Guardar en {selectedSubject.name}
          </button>
        )}
      </div>
    </Modal>
  );
}