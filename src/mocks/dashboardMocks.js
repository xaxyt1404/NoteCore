export const mockUser = {
  firstName: "Estiben Yesid",
  lastName: "Martinez",
  greetingName: "Yesid",
  fullName: "Estiben Yesid",
  email: "yesid@notecore.com",
  university: "Universidad de Cartagena",
  degree: "Ingeniería de Sistemas",
  roleLabel: "Estudiante Universitario",
};

export const mockSemester = "Semestre 2026 - 2";

export const mockKpis = {
  average: 4.1,
  maxGrade: 5.0,
  trend: "+0.3 vs. semestre anterior",
  totalSubjects: 6,
  goodStanding: 5,
  atRisk: 1,
};

export const mockNotifications = [
  {
    id: 1,
    variant: "danger",
    icon: "fa-solid fa-triangle-exclamation",
    subject: "Física",
    message: "Tu nota bajó a 2.8. ¡Atención con el próximo parcial!",
    time: "Hace 10 min",
    unread: true,
  },
  {
    id: 2,
    variant: "primary",
    icon: "fa-regular fa-calendar",
    subject: "Matemáticas",
    message: "Parcial 2 programado para el 15 de Octubre.",
    time: "Hace 2 horas",
    unread: false,
  },
];

// Orden de tarjetas en la vista Asignaturas (Estadísticas ordena por nota desc.)
export const mockSubjects = [
  { id: "fisica", name: "Física", statsName: "Física I", icon: "fa-atom", cuts: [2.8, 2.8, null], current: 2.8, statusLabel: "En riesgo", performance: "En Riesgo" },
  { id: "calculo", name: "Cálculo", statsName: "Cálculo Diferencial", icon: "fa-calculator", cuts: [3.6, 3.6, null], current: 3.6, statusLabel: "En buen estado", performance: "Bueno" },
  { id: "programacion", name: "Programación", statsName: "Programación", icon: "fa-code", cuts: [4.5, 4.5, null], current: 4.5, statusLabel: "En buen estado", performance: "Excelente" },
  { id: "matematicas", name: "Matemáticas", statsName: "Matemáticas", icon: "fa-square-root-variable", cuts: [4.2, 4.2, null], current: 4.2, statusLabel: "En buen estado", performance: "Bueno" },
  { id: "produccion-textual", name: "Producción Textual", statsName: "Producción Textual", icon: "fa-pen-nib", cuts: [4.8, 4.8, null], current: 4.8, statusLabel: "En buen estado", performance: "Excelente" },
];

export const mockSubjectTabs = [
  { key: "all", label: "Todas", count: 6 },
  { key: "in-progress", label: "En curso", count: 5 },
  { key: "at-risk", label: "En riesgo", count: 1 },
  { key: "passed", label: "Aprobadas", count: 0 },
];

export const mockAttentionSubjectIds = ["fisica", "calculo", "programacion"];

export const mockStatsSummary = {
  cuts: [3.98, 3.98, null],
  current: 4.1,
  status: "Bueno",
};

export const mockStatsCuts = [
  { label: "C1", weight: 30 },
  { label: "C2", weight: 30 },
  { label: "C3", weight: 40 },
];

export const mockRendimientoChart = {
  labels: ["Corte 1", "Corte 2", "Corte 3", "Actual"],
  data: [3.8, 4.0, 3.9, 4.1],
  options: [
    { value: "promedio", label: "Promedio" },
    { value: "cortes", label: "Por Cortes" },
  ],
};

export const mockEstadoChart = {
  labels: ["Excelente", "Bueno", "Regular", "En riesgo"],
  data: [4, 1, 0, 1],
  legend: [
    { key: "excelente", label: "Excelente", count: 4, percent: 67 },
    { key: "bueno", label: "Bueno", count: 1, percent: 17 },
    { key: "regular", label: "Regular", count: 0, percent: 0 },
    { key: "en-riesgo", label: "En riesgo", count: 1, percent: 16 },
  ],
};

export const mockAiRecommendation = {
  subject: "Física",
  message:
    "requiere mayor atención esta semana. Tu nota actual está por debajo del promedio del curso. Te recomiendo repasar los temas de movimiento y revisar los ejercicios del parcial anterior.",
};

export const mockChatGreeting =
  "¡Hola Yesid! Soy CoreAI. ¿En qué te puedo ayudar hoy con tus materias?";