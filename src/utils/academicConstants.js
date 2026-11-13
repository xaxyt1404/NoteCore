export const DEFAULT_CUT_WEIGHTS = [30, 30, 40];

// Construye los cortes limpios según los porcentajes de la universidad (por defecto 30-30-40)
export const createEmptyCuts = (weights = DEFAULT_CUT_WEIGHTS) =>
  (Array.isArray(weights) && weights.length
    ? weights
    : DEFAULT_CUT_WEIGHTS
  ).map((weight, idx) => ({
    id: idx + 1,
    name: `Corte ${idx + 1}`,
    weight: Number(weight),
    activities: [],
    parcial: { grade: 0, weight: 100, locked: true },
    bonus: 0,
  }));

export const buildStatsCuts = (weights = DEFAULT_CUT_WEIGHTS) =>
  (Array.isArray(weights) && weights.length
    ? weights
    : DEFAULT_CUT_WEIGHTS
  ).map((weight, idx) => ({
    label: `C${idx + 1}`,
    weight: Number(weight),
  }));

export const DEFAULT_CHAT_GREETING = (greetingName = "Estudiante") =>
  `¡Hola ${greetingName}! Soy CoreAI. ¿En qué te puedo ayudar hoy con tus materias?`;
