export const TARGET_GRADE = 3.0;
export const MAX_GRADE = 5.0;

export const CUT_SCHEMES = {
  "30-30-40": [30, 30, 40],
  "25-25-25-25": [25, 25, 25, 25],
  "50-50": [50, 50],
};

export const toNumber = (value) => parseFloat(value) || 0;

// Formato con coma (4.2 -> "4,2")
export const formatGrade = (val) => Number(val).toFixed(1).replace(".", ",");
export const formatGradePrecise = (val) =>
  Number(val).toFixed(2).replace(".", ",");

// Clase según exigencia de la nota requerida
export function getGradeColorClass(grade) {
  if (grade <= 4.0) return "text-success";
  if (grade <= 4.5) return "text-warning";
  return "text-danger";
}

// danger: < 3.0 | warning: 3.0 a 3.4 | success: >= 3.5
export function getGradeStatus(grade) {
  const value = Number(grade);
  if (value < 3.0) return "danger";
  if (value < 3.5) return "warning";
  return "success";
}

// Landing - Opción A: nota necesaria en el parcial (50% del corte 1)
export function calculateParcialNeeded(
  taller,
  quiz,
  bonus,
  target = TARGET_GRADE,
) {
  return (target - taller * 0.3 - quiz * 0.2 - bonus) / 0.5;
}

export function getCorte1Projection(taller, quiz, bonus) {
  const needed = calculateParcialNeeded(taller, quiz, bonus);
  const base = taller * 0.3 + quiz * 0.2;
  let corte1Grade;

  if (needed > 5.0) corte1Grade = Math.min(MAX_GRADE, base + 2.5 + bonus);
  else if (needed > 0) corte1Grade = TARGET_GRADE;
  else corte1Grade = Math.min(MAX_GRADE, base + bonus);

  return { needed, corte1Grade };
}

// Landing - Opción B: escenarios para cortes 2 y 3
export const calculatePendingNeeded = (c1Grade, target = TARGET_GRADE) =>
  Math.max(0, target - c1Grade * 0.3);

export const calculateNeededC3 = (pendingNeeded, c2Grade) =>
  (pendingNeeded - c2Grade * 0.3) / 0.4;

// Calculadora sencilla: rows = [{ grade, weight }]
export function calculateSimpleAverage(rows, weighted = false) {
  if (weighted) {
    return rows.reduce(
      (acc, r) => acc + toNumber(r.grade) * (toNumber(r.weight) / 100),
      0,
    );
  }
  if (rows.length === 0) return 0;
  return rows.reduce((acc, r) => acc + toNumber(r.grade), 0) / rows.length;
}

// Calculadora de un corte: rows = [{ grade, weight }] (weight = % interno)
export function calculateCorteGrade(rows, bonus = 0) {
  const base = rows.reduce(
    (acc, r) => acc + toNumber(r.grade) * (toNumber(r.weight) / 100),
    0,
  );
  return Math.min(MAX_GRADE, base + toNumber(bonus));
}

export const calculateCorteContribution = (corteGrade, cortePercent) =>
  corteGrade * (toNumber(cortePercent) / 100);

// Simulador de asignatura: grades con null/"" en el corte pendiente
// Retorna la nota requerida en el primer corte pendiente
export function calculateRequiredGrade(grades, weights, target = TARGET_GRADE) {
  const pendingIdx = grades.findIndex(
    (g) => g === null || g === "" || g === undefined,
  );
  if (pendingIdx === -1) return null;

  const accumulated = grades.reduce((acc, g, i) => {
    if (i === pendingIdx) return acc;
    return acc + toNumber(g) * (weights[i] / 100);
  }, 0);

  return (target - accumulated) / (weights[pendingIdx] / 100);
}

export function calculateAccumulated(grades, weights) {
  return grades.reduce(
    (acc, g, i) => acc + toNumber(g) * (weights[i] / 100),
    0,
  );
}
