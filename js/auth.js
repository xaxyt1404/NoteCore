/* ===================================
   Lógica de interacción y validación
   para login.html, register.html
   =================================== */

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

// Catálogo estructurado de carreras por universidad
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

// =====================
// HELPER GLOBAL TOAST
// =====================
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const toastIcon = document.getElementById("toastIcon");

  if (!toast || !toastMessage || !toastIcon) return;

  toastMessage.textContent = message;
  toast.className = "toast show";
  toastIcon.className = "fa-solid toast-icon";

  if (type === "success") {
    toast.classList.add("toast-success");
    toastIcon.classList.add("fa-circle-check");
  } else if (type === "warning") {
    toast.classList.add("toast-warning");
    toastIcon.classList.add("fa-triangle-exclamation");
  } else if (type === "danger") {
    toast.classList.add("toast-danger");
    toastIcon.classList.add("fa-circle-xmark");
  } else {
    toastIcon.classList.add("fa-circle-info");
  }

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// Alertas de feedback delegadas al Toast flotante
function showAuthAlert(message, type = "info") {
  const toastTypeMap = {
    danger: "danger",
    warning: "warning",
    success: "success",
    info: "info",
  };
  showToast(message, toastTypeMap[type] || "info");
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

// Transición de vistas SPA (register y login)
function switchAuthStep(hideId, showId) {
  const hideEl = document.getElementById(hideId);
  const showEl = document.getElementById(showId);

  if (hideEl && showEl) {
    hideEl.classList.add("d-none");
    showEl.classList.remove("d-none");
  }

  const backLink = document.querySelector(".back-link");
  if (backLink) {
    if (showId === "step-register" || showId === "view-login") {
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
  const period = now.getMonth() < 6 ? 1 : 2;
  return `Semestre ${year}-${period}`;
}

// Servicio de persistencia
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

function editTemporarySubject(index, nameSpan) {
  const currentName = onboardingPayload.subjects[index]?.name || "";
  const newName = prompt("Editar nombre de la asignatura:", currentName);

  if (newName !== null && newName.trim() !== "") {
    const trimmed = newName.trim();
    onboardingPayload.subjects[index].name = trimmed;
    nameSpan.textContent = `📚 ${trimmed}`;
  }
}

function removeTemporarySubject(index, pillElement) {
  onboardingPayload.subjects.splice(index, 1);

  if (pillElement) pillElement.remove();

  const listContainer = document.getElementById("tempSubjectsList");
  const remainingPills = listContainer.querySelectorAll(".dropdown-item");

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
      <span class="sim-instruction" id="noSubjectsMsg">
        Aún no has agregado materias (se requiere al menos una).
      </span>
    `;
  }
}

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
  showToast("¡Registro completado! Preparando tu panel...", "success");
  setTimeout(() => {
    window.location.href = "dashboard-user.html";
  }, 1000);
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
     1. SECUENCIA DE FOCUS CON TECLA ENTER
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

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  if (loginEmail) {
    loginEmail.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        loginPassword?.focus();
      }
    });
  }

  /* ------------------------------------------
     2. MANEJO DE PASOS DEL WIZARD DE REGISTRO
     ------------------------------------------ */

  validateAndSubmit(registerForm, () => {
    onboardingPayload.email = regEmail?.value || "";
    onboardingPayload.name = regName?.value || "";
    onboardingPayload.password = regPassword?.value || "";

    switchAuthStep("step-register", "step-profile");
  });

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

    onboardingPayload.university = uniVal;
    onboardingPayload.degree = degreeVal;
    onboardingPayload.semesterName = getAutoSemesterName();

    switchAuthStep("step-profile", "step-subjects");
  });

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
    showToast("¡Inicio de sesión exitoso! Redirigiendo...", "success");
    setTimeout(() => {
      window.location.href = "dashboard-user.html";
    }, 1000);
  });

  // Manejo de Recuperación de Contraseña
  validateAndSubmit(document.getElementById("forgotPasswordForm"), () => {
    const email = document.getElementById("resetEmail")?.value;
    showToast(
      `Revisa el mensaje enviado a: ${email} y sigue las instrucciones para recuperar tu contraseña.`,
      "success",
    );
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

  document.addEventListener("click", () => {
    customDropdowns.forEach((d) => d.classList.remove("active"));
  });
});
