const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");
const TOKEN_KEY = "notecore_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignorar si localStorage no está disponible
  }
};

export const clearSessionStorageData = () => {
  setToken("");
  try {
    localStorage.removeItem("notecore_active_user");
    localStorage.removeItem("notecore_user_semester");
    localStorage.removeItem("notecore_user_subjects");
    sessionStorage.removeItem("notecore_initial_subjects");
  } catch {
    // Ignorar
  }
};

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor de NoteCore.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.ok === false) {
    throw new Error(data.message || `Error en la solicitud (${res.status})`);
  }

  return data;
}

// ==========================================
// 1. AUTENTICACIÓN Y PERFIL (/api/auth)
// ==========================================
export const authApi = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMe: () => request("/auth/me"),
  updateProfile: (payload) =>
    request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  resetSemester: () =>
    request("/auth/reset-semester", {
      method: "POST",
    }),
  deleteAccount: () =>
    request("/auth/account", {
      method: "DELETE",
    }),
  googleLogin: (accessToken) =>
    request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    }),
};

// ==========================================
// 2. ASIGNATURAS Y SIMULACIONES (/api/subjects)
// ==========================================
export const subjectsApi = {
  list: () => request("/subjects"),
  create: (payload) =>
    request("/subjects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  addSimulation: (id, payload) =>
    request(`/subjects/${id}/simulations`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id) =>
    request(`/subjects/${id}`, {
      method: "DELETE",
    }),
  importBackup: (subjects) =>
    request("/subjects/import", {
      method: "POST",
      body: JSON.stringify({ subjects }),
    }),
};

// ==========================================
// 3. BUZÓN DE CONTACTO (/api/contact)
// ==========================================
export const contactApi = {
  send: (payload) =>
    request("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  myReplies: () => request("/contact/my-replies"),
  list: () => request("/contact"),
  updateStatus: (id, payload) =>
    request(`/contact/${id}`, {
      method: "PATCH",
      body: JSON.stringify(
        typeof payload === "string" ? { status: payload } : payload,
      ),
    }),
  remove: (id) =>
    request(`/contact/${id}`, {
      method: "DELETE",
    }),
};

// ==========================================
// 4. UNIVERSIDADES Y ADMIN (/api/admin)
// ==========================================
export const adminApi = {
  getUniversities: (includeInactive = false) =>
    request(`/admin/universities${includeInactive ? "?all=true" : ""}`),
  getOverview: () => request("/admin/overview"),
  createUniversity: (payload) =>
    request("/admin/universities", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateUniversity: (id, payload) =>
    request(`/admin/universities/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteUniversity: (id) =>
    request(`/admin/universities/${id}`, {
      method: "DELETE",
    }),
  updateUser: (id, payload) =>
    request(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteUser: (id) =>
    request(`/admin/users/${id}`, {
      method: "DELETE",
    }),
};

// ==========================================
// 5. ASISTENTE COREAI (/api/ai)
// ==========================================
export const aiApi = {
  chat: (message) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};
