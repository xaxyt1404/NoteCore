export const mockUser = {
  firstName: "Estiben Yesid",
  lastName: "Martinez",
  greetingName: "Yesid",
  fullName: "Estiben Yesid Martinez",
  email: "yesid@notecore.com",
  university: "Universidad de Cartagena",
  degree: "Ingeniería de Sistemas",
  roleLabel: "Estudiante Universitario",
  avatar: "",
};

export const mockSemester = "Semestre 2026 - 2";

export const mockNotifications = [
  {
    id: 1,
    variant: "primary",
    icon: "fa-solid fa-graduation-cap",
    subject: "NoteCore",
    message:
      "¡Bienvenido! Registra tus notas en Asignaturas para proyectar tu semestre.",
    time: "Ahora",
    unread: true,
  },
];

// Cortes iniciales limpios: sin actividades precargadas, solo parcial bloqueado y puntos adicionales
export const createEmptyCuts = () => [
  {
    id: 1,
    name: "Corte 1",
    weight: 30,
    activities: [],
    parcial: { grade: 0, weight: 100, locked: true },
    bonus: 0,
  },
  {
    id: 2,
    name: "Corte 2",
    weight: 30,
    activities: [],
    parcial: { grade: 0, weight: 100, locked: true },
    bonus: 0,
  },
  {
    id: 3,
    name: "Corte 3",
    weight: 40,
    activities: [],
    parcial: { grade: 0, weight: 100, locked: true },
    bonus: 0,
  },
];

export const mockSubjects = [];

export const mockStatsCuts = [
  { label: "C1", weight: 30 },
  { label: "C2", weight: 30 },
  { label: "C3", weight: 40 },
];

export const mockChatGreeting =
  "¡Hola Yesid! Soy CoreAI. ¿En qué te puedo ayudar hoy con tus materias?";
