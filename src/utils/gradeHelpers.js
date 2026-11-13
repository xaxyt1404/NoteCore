// Formatea una nota a 1 decimal con coma (ej: 3,6)
export function formatGrade(num) {
  return Number(num || 0)
    .toFixed(1)
    .replace(".", ",");
}

// Formatea una nota a 2 decimales con coma (ej: 3,65)
export function formatGradePrecise(num) {
  return Number(num || 0)
    .toFixed(2)
    .replace(".", ",");
}

// Calcula la definitiva de un corte individual (o null si aún no tiene notas registradas)
export function computeCutGrade(cut) {
  if (typeof cut === "number" || cut === null) return cut;
  if (!cut) return null;

  const activitiesSum = (cut.activities || []).reduce(
    (acc, act) =>
      acc + (Number(act.grade) || 0) * ((Number(act.weight) || 0) / 100),
    0,
  );
  const parcialSum =
    (Number(cut.parcial?.grade) || 0) *
    ((Number(cut.parcial?.weight) || 0) / 100);

  const hasAnyGrade =
    (cut.activities || []).some((a) => Number(a.grade) > 0) ||
    Number(cut.parcial?.grade) > 0 ||
    Number(cut.bonus) > 0;

  if (!hasAnyGrade) return null;
  return Math.min(5.0, activitiesSum + parcialSum + (Number(cut.bonus) || 0));
}

// Calcula:
// - accumulated: acumulado ponderado real sobre el 100% del semestre (ej: 1.2 con solo C1=4.0)
// - paceGrade: promedio ponderado sobre lo evaluado hasta ahora (ej: 4.0 con solo C1=4.0)
// - evaluatedWeight: peso acumulado evaluado (0 a 1)
export function computeSubjectGrades(cuts = []) {
  let accumulated = 0;
  let evaluatedWeight = 0;

  cuts.forEach((c) => {
    const grade = computeCutGrade(c);
    if (grade !== null) {
      const w = (Number(c.weight) || 0) / 100;
      accumulated += grade * w;
      evaluatedWeight += w;
    }
  });

  const paceGrade = evaluatedWeight > 0 ? accumulated / evaluatedWeight : 0;

  return {
    accumulated: Number(accumulated.toFixed(2)),
    paceGrade: Number(paceGrade.toFixed(2)),
    evaluatedWeight,
  };
}

// Clase y etiqueta según ritmo/estado de la nota
// Si evaluatedWeight === 0 -> "Sin notas" (neutral)
// danger: < 3.0 | warning: 3.0 a 3.4 | success: 3.5 a 4.4 | excelent: >= 4.5
export function getGradeStatus(grade, evaluatedWeight = 1) {
  if (evaluatedWeight === 0) {
    return { status: "neutral", colorClass: "text-muted", label: "Sin notas" };
  }
  const value = Number(grade) || 0;
  if (value < 3.0) {
    return { status: "danger", colorClass: "text-danger", label: "En riesgo" };
  }
  if (value < 3.5) {
    return { status: "warning", colorClass: "text-warning", label: "Regular" };
  }
  if (value >= 4.5) {
    return {
      status: "excelent",
      colorClass: "text-excelent",
      label: "Excelente",
    };
  }
  return {
    status: "success",
    colorClass: "text-success",
    label: "En buen estado",
  };
}

// Clase según exigencia de la nota requerida (usada en SimulationModal y Herramientas)
export function getGradeColorClass(grade) {
  const rounded = Math.round(Number(grade) * 100) / 100;
  if (rounded <= 3.0) return "text-excelent";
  if (rounded <= 3.6) return "text-success";
  if (rounded <= 4.5) return "text-warning";
  return "text-danger";
}

// Etiqueta + clase de color según exigencia de la nota requerida
export function getRequiredGradeViability(grade) {
  const rounded = Math.round(Number(grade) * 100) / 100;
  if (rounded <= 0) {
    return { colorClass: "text-excelent", label: "Meta cumplida" };
  }
  if (rounded <= 3.0) {
    return { colorClass: "text-excelent", label: "Muy alcanzable" };
  }
  if (rounded <= 3.6) {
    return { colorClass: "text-success", label: "Alcanzable" };
  }
  if (rounded <= 4.5) {
    return { colorClass: "text-warning", label: "Requiere esfuerzo" };
  }
  if (rounded <= 5.0) {
    return { colorClass: "text-danger", label: "Máximo esfuerzo" };
  }
  return { colorClass: "text-danger", label: "Supera el máximo (5,0)" };
}

// --- Helpers exclusivos de SimulationModal (Landing) ---

// Proyección del Corte 1 (Taller 30%, Quiz 20%, Bono, Parcial 50%) para llegar a 3.0
export function getCorte1Projection(taller, quiz, bonus) {
  const currentPoints =
    (Number(taller) || 0) * 0.3 +
    (Number(quiz) || 0) * 0.2 +
    (Number(bonus) || 0);
  const needed = (3.0 - currentPoints) / 0.5;
  const corte1Grade = Math.min(5.0, currentPoints + 5.0 * 0.5);
  return { needed, corte1Grade };
}

// Puntos ponderados pendientes entre Corte 2 (30%) y Corte 3 (40%) para aprobar en 3.0
export function calculatePendingNeeded(c1) {
  return Math.max(0, 3.0 - (Number(c1) || 0) * 0.3);
}

// Nota necesaria en el Corte 3 (40%) dado el pendiente ponderado y la nota del Corte 2 (30%)
export function calculateNeededC3(pending, c2) {
  return (Number(pending) - (Number(c2) || 0) * 0.3) / 0.4;
}
