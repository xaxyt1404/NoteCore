/* =================================================
   AUTH.JS - NoteCore
   Lógica de interacción, validación y asistente (SPA)
   para login.html, register.html y forgot-password.html
   ================================================= */

// Objeto temporal en memoria para recolectar el Onboarding del usuario
let onboardingPayload = {
  email: "",
  name: "",
  password: "",
  university: "",
  degree: "",
  semesterName: "",
  cutsSchema: "30-30-40",
  subjects: [],
};

// Catálogo estructurado de carreras por universidad (Desacoplado: listo para migrar a backend)
const academicCatalog = {
  "Universidad de Cartagena": [
    "Administración de Empresas",
    "Administración de Empresas Turísticas y Hoteleras",
    "Administración de Servicios de Salud",
    "Administración Financiera",
    "Administración Industrial",
    "Biología",
    "Comunicación Social",
    "Contaduría Pública",
    "Derecho",
    "Economía",
    "Enfermería",
    "Filosofía",
    "Historia",
    "Ingeniería Civil",
    "Ingeniería de Alimentos",
    "Ingeniería de Sistemas",
    "Ingeniería de Software",
    "Ingeniería Química",
    "Licenciatura en Educación con Énfasis en Ciencias Sociales y Ambientales",
    "Licenciatura en Educación Infantil",
    "Lingüística y Literatura",
    "Matemáticas",
    "Medicina",
    "Odontología",
    "Profesional Universitario en Lenguas Extranjeras",
    "Química",
    "Química Farmacéutica",
    "Seguridad y Salud en el Trabajo",
    "Técnica Profesional en Operación de Procesos Petroquímicos",
    "Técnica Profesional en Operación Turística",
    "Técnica Profesional en Procesos de Gestión Pública",
    "Técnica Profesional en Procesos Metrológicos",
    "Tecnología Agroindustrial",
    "Tecnología en Metrología Industrial",
    "Tecnología en Procesos Industriales",
    "Trabajo Social",
  ],
  "Institución Universitaria Mayor de Cartagena": [
    "Administración de Empresas",
    "Diseño Visual",
    "Técnica Profesional en Operación Turística",
    "Tecnología en Gestión Gastronómica",
  ],
  "Universidad Tecnológica de Bolívar": [
    "Ingeniería de Sistemas",
    "Ingeniería Industrial",
    "Ingeniería Mecatrónica",
    "Administración de Empresas",
    "Finanzas y Negocios Internacionales",
  ],
};

// ===========================
// UTILIDADES Y HELPERS DE UI
// ===========================

// Mostrar / Ocultar Contraseña
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn?.querySelector("i");
  if (!input || !icon) return;

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  icon.classList.toggle("fa-eye-slash", !isPassword);
  icon.classList.toggle("fa-eye", isPassword);
}

// Alertas de feedback dentro del contenedor global #authAlert
function showAuthAlert(message, type = "info") {
  const alert = document.getElementById("authAlert");
  if (!alert) return;
  alert.textContent = message;
  alert.className = `auth-alert auth-alert-${type}`;
  alert.style.display = "block";
}

// Control del estado de carga del botón (Spinner)
function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  const text = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".btn-spinner");
  btn.disabled = isLoading;
  if (text) text.hidden = isLoading;
  if (spinner) spinner.hidden = !isLoading;
}

// Transición de vistas SPA dentro del wizard
function switchAuthStep(hideId, showId) {
  const hideEl = document.getElementById(hideId);
  const showEl = document.getElementById(showId);
  const backLink = document.querySelector(".back-link");

  if (hideEl && showEl) {
    hideEl.classList.add("d-none");
    showEl.classList.remove("d-none");
  }

  // Mostrar "Volver al inicio" únicamente en la Vista 0 (Registro Base)
  if (backLink) {
    if (showId === "step-register") {
      backLink.classList.remove("d-none");
    } else {
      backLink.classList.add("d-none");
    }
  }
}

// Cálculo automático del periodo/semestre por fecha
function getAutoSemesterName() {
  const now = new Date();
  const year = now.getFullYear();
  const period = now.getMonth() < 6 ? 1 : 2; // Ene-Jun = 1, Jul-Dic = 2
  return `Semestre ${year}-${period}`;
}

// Servicio de persistencia (Desacoplado: listo para cambiar por API/Fetch)
function saveUserDataService(data) {
  localStorage.setItem(
    "notecore_active_user",
    JSON.stringify({
      name: data.name,
      email: data.email,
      university: data.university,
      degree: data.degree,
    }),
  );
  localStorage.setItem(
    "notecore_user_semester",
    JSON.stringify({
      period: data.semesterName,
      schema: data.cutsSchema,
    }),
  );
  localStorage.setItem("notecore_user_subjects", JSON.stringify(data.subjects));
}

// Servicio de inicio de sesión
function loginUserService(email) {
  localStorage.setItem("notecore_active_user", JSON.stringify({ email }));
}

// ================================================
// MODAL TÉRMINOS Y CONDICIONES (Scroll-Lock Dual)
// ================================================

function openTermsModal() {
  const termsModal = document.getElementById("termsModal");
  if (termsModal) {
    termsModal.classList.add("active");
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  }
}

function closeTermsModal() {
  const termsModal = document.getElementById("termsModal");
  if (termsModal) {
    termsModal.classList.remove("active");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }
}

function acceptTermsAndClose() {
  const regTermsCheckbox = document.getElementById("regTerms");
  if (regTermsCheckbox) {
    regTermsCheckbox.checked = true;
  }
  closeTermsModal();
}

// ==========================================
// PASO 2: GESTIÓN DE ASIGNATURAS INICIALES
// ==========================================

// Añadir asignatura clonando la plantilla <template>
function addTemporarySubject() {
  const nameInput = document.getElementById("setupSubjectName");
  const listContainer = document.getElementById("tempSubjectsList");
  const template = document.getElementById("subjectPillTemplate");
  const noMsg = document.getElementById("noSubjectsMsg");

  if (!nameInput || !listContainer || !template) return;

  const subName = nameInput.value.trim();

  if (!subName) {
    showAuthAlert("Ingresa el nombre de la asignatura.", "warning");
    nameInput.focus();
    return;
  }

  const alertEl = document.getElementById("authAlert");
  if (alertEl) alertEl.style.display = "none";

  if (noMsg) noMsg.remove();

  onboardingPayload.subjects.push({ name: subName });
  const index = onboardingPayload.subjects.length - 1;

  const clone = template.content.cloneNode(true);
  const pillElement = clone.querySelector(".dropdown-item");
  const nameSpan = clone.querySelector(".subject-name");
  const editBtn = clone.querySelector(".subject-pill-edit");
  const deleteBtn = clone.querySelector(".subject-pill-delete");

  nameSpan.textContent = `📚 ${subName}`;

  editBtn.onclick = function () {
    editTemporarySubject(index, nameSpan);
  };

  deleteBtn.onclick = function () {
    removeTemporarySubject(index, pillElement);
  };

  listContainer.appendChild(clone);

  nameInput.value = "";
  nameInput.focus();
}

// Editar el nombre de una asignatura existente
function editTemporarySubject(index, nameSpan) {
  const currentName = onboardingPayload.subjects[index]?.name || "";
  const newName = prompt("Editar nombre de la asignatura:", currentName);

  if (newName !== null && newName.trim() !== "") {
    const trimmed = newName.trim();
    onboardingPayload.subjects[index].name = trimmed;
    nameSpan.textContent = `📚 ${trimmed}`;
  }
}

// Eliminar asignatura de la lista
function removeTemporarySubject(index, pillElement) {
  onboardingPayload.subjects.splice(index, 1);

  if (pillElement) pillElement.remove();

  const listContainer = document.getElementById("tempSubjectsList");
  const remainingPills = listContainer.querySelectorAll(".dropdown-item");

  // Re-indexar los eventos onclick de los botones de editar y eliminar
  remainingPills.forEach((pill, idx) => {
    const nameSpan = pill.querySelector(".subject-name");
    const editBtn = pill.querySelector(".subject-pill-edit");
    const deleteBtn = pill.querySelector(".subject-pill-delete");

    if (editBtn) {
      editBtn.onclick = function () {
        editTemporarySubject(idx, nameSpan);
      };
    }
    if (deleteBtn) {
      deleteBtn.onclick = function () {
        removeTemporarySubject(idx, pill);
      };
    }
  });

  if (onboardingPayload.subjects.length === 0) {
    listContainer.innerHTML = `
      <span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;" id="noSubjectsMsg">
        Aún no has agregado materias (se requiere al menos una).
      </span>
    `;
  }
}

// Paso Final: Validar al menos 1 materia, consolidar y redirigir
function completeOnboardingFlow() {
  if (!onboardingPayload.subjects || onboardingPayload.subjects.length === 0) {
    showAuthAlert(
      "Debes agregar al menos una asignatura para poder continuar.",
      "warning",
    );
    document.getElementById("setupSubjectName")?.focus();
    return;
  }

  saveUserDataService(onboardingPayload);
  window.location.href = "dashboard-user.html";
}

// ==========================================
// DROPDOWNS Y FILTRADO DINÁMICO DE CARRERAS
// ==========================================

function updateDegreeDropdown(universityName) {
  const degreeOptionsList = document.getElementById("degreeOptionsList");
  const degreeSelectedText = document.querySelector(
    "#dropdownDegree .dropdown-selected-text",
  );
  const setupDegreeInput = document.getElementById("setupDegree");
  const searchInput = document.getElementById("degreeSearchInput");

  if (!degreeOptionsList) return;

  const degrees = academicCatalog[universityName] || [
    "Otra Carrera / Programa",
  ];

  degreeOptionsList.innerHTML = "";
  if (degreeSelectedText)
    degreeSelectedText.textContent = "Selecciona tu Programa Académico";
  if (setupDegreeInput) setupDegreeInput.value = "";
  if (searchInput) searchInput.value = "";

  degrees.forEach((degree) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dropdown-item";
    btn.setAttribute("role", "menuitem");
    btn.setAttribute("data-value", degree);
    btn.textContent = degree;

    btn.addEventListener("click", () => {
      degreeOptionsList
        .querySelectorAll(".dropdown-item")
        .forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");

      if (degreeSelectedText) degreeSelectedText.textContent = degree;
      if (setupDegreeInput) setupDegreeInput.value = degree;

      document.getElementById("dropdownDegree")?.classList.remove("active");
    });

    degreeOptionsList.appendChild(btn);
  });
}

// ===============================================
// INICIALIZACIÓN DE EVENTOS (DOM CONTENT LOADED)
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  // Helper DRY para formularios
  const validateAndSubmit = (form, onValid) => {
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      onValid();
    });
  };

  /* ------------------------------------------
     1. SECUENCIA DE FOCUS CON TECLA ENTER (PASO 0)
     ------------------------------------------ */
  const regEmail = document.getElementById("regEmail");
  const regName = document.getElementById("regName");
  const regPassword = document.getElementById("regPassword");
  const registerForm = document.getElementById("registerForm");

  if (regEmail) {
    regEmail.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        regName?.focus();
      }
    });
  }

  if (regName) {
    regName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        regPassword?.focus();
      }
    });
  }

  // Al presionar Enter en contraseña, el submit nativo del formulario procesará el envío automáticamente.

  /* ------------------------------------------
     2. MANEJO DE PASOS DEL WIZARD DE REGISTRO
     ------------------------------------------ */

  // Paso 0: Registro Base ➔ Avanzar al Paso 1
  validateAndSubmit(registerForm, () => {
    onboardingPayload.email = regEmail?.value || "";
    onboardingPayload.name = regName?.value || "";
    onboardingPayload.password = regPassword?.value || "";

    switchAuthStep("step-register", "step-profile");
  });

  // Paso 1: Perfil Académico ➔ Avanzar al Paso 2 con validación estricta
  validateAndSubmit(document.getElementById("profileFormStep"), () => {
    const uniVal = document.getElementById("setupUniversity")?.value.trim();
    const degreeVal = document.getElementById("setupDegree")?.value.trim();

    if (!uniVal) {
      showAuthAlert("Por favor selecciona tu institución.", "warning");
      return;
    }

    if (!degreeVal) {
      showAuthAlert("Por favor selecciona tu programa académico.", "warning");
      return;
    }

    // Ocultar alertas de error previas si todo está correcto
    const alertEl = document.getElementById("authAlert");
    if (alertEl) alertEl.style.display = "none";

    onboardingPayload.university = uniVal;
    onboardingPayload.degree = degreeVal;
    onboardingPayload.semesterName = getAutoSemesterName();

    switchAuthStep("step-profile", "step-subjects");
  });

  // Paso 2: Intercepción de tecla Enter al añadir asignaturas
  const subjectsFormStep = document.getElementById("subjectsFormStep");
  if (subjectsFormStep) {
    subjectsFormStep.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTemporarySubject();
      }
    });

    validateAndSubmit(subjectsFormStep, () => {
      completeOnboardingFlow();
    });
  }

  // Manejo de Login
  validateAndSubmit(document.getElementById("loginForm"), () => {
    const email = document.getElementById("loginEmail")?.value;
    const password = document.getElementById("loginPassword")?.value;
    const submitBtn = document.getElementById("btnLoginSubmit");

    setButtonLoading(submitBtn, true);
    loginUserService(email, password);
    window.location.href = "dashboard-user.html";
  });

  // Manejo de Recuperación de Contraseña
  validateAndSubmit(document.getElementById("forgotPasswordForm"), () => {
    const email = document.getElementById("resetEmail")?.value;
    alert(`Hemos enviado un enlace de recuperación a: ${email}`);
    switchAuthStep("view-forgot-password", "view-login");
  });

  /* ------------------------------------------
     3. LÓGICA GENERAL DE CUSTOM DROPDOWNS
     ------------------------------------------ */
  const customDropdowns = document.querySelectorAll(".custom-dropdown");

  customDropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    const selectedText = dropdown.querySelector(".dropdown-selected-text");
    const items = dropdown.querySelectorAll(".dropdown-item");
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        customDropdowns.forEach((d) => {
          if (d !== dropdown) d.classList.remove("active");
        });
        dropdown.classList.toggle("active");
        trigger.setAttribute(
          "aria-expanded",
          dropdown.classList.contains("active"),
        );
      });
    }

    items.forEach((item) => {
      item.addEventListener("click", () => {
        items.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        const val = item.getAttribute("data-value");
        if (selectedText) selectedText.textContent = item.textContent.trim();
        if (hiddenInput) hiddenInput.value = val;

        // Si es la universidad, actualizar dinámicamente sus carreras
        if (dropdown.id === "dropdownUniversity") {
          updateDegreeDropdown(val);
        }

        dropdown.classList.remove("active");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    });
  });

  /* ------------------------------------------
     4. BUSCADOR EN EL DROPDOWN DE CARRERAS
     ------------------------------------------ */
  const degreeSearchInput = document.getElementById("degreeSearchInput");
  const degreeSearchWrapper = document.querySelector(
    ".dropdown-search-wrapper",
  );

  if (degreeSearchWrapper) {
    // Evita que el clic en la barra de búsqueda cierre el desplegable
    degreeSearchWrapper.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (degreeSearchInput) {
    degreeSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const options = document.querySelectorAll(
        "#degreeOptionsList .dropdown-item",
      );

      options.forEach((option) => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? "block" : "none";
      });
    });
  }

  // Cerrar cualquier dropdown al hacer clic afuera
  document.addEventListener("click", () => {
    customDropdowns.forEach((d) => d.classList.remove("active"));
  });
});
