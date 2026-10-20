/* ==========================================
   AUTH.JS
   Lógica de interacción y validación para
   login.html, register.html y forgot-password.html
   ========================================== */

// Mostrar / Ocultar Contraseña
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');

  if (!input || !icon) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  icon.classList.toggle('fa-eye-slash', !isPassword);
  icon.classList.toggle('fa-eye', isPassword);
}

// Helper reutilizable para validar y enviar formularios
function showAuthAlert(elementId, message, type = 'info') {
  const alert = document.getElementById(elementId);
  if (!alert) return;
  alert.textContent = message;
  alert.className = `auth-alert auth-alert-${type}`;
  alert.style.display = 'block';
}

// ==========================================
// WIZARD DE ONBOARDING & PERFIL (SPA)
// ==========================================

// Objeto temporal en memoria para recolectar todo el wizard antes de guardarlo
let onboardingPayload = {
  email: '',
  name: '',
  password: '',
  university: '',
  degree: '',
  semesterName: 'Semestre 2026-2',
  cutsSchema: '30-30-40',
  subjects: []
};

// Función auxiliar para cambiar de vista dentro de la misma tarjeta de registro
function switchAuthStep(hideId, showId) {
  const hideEl = document.getElementById(hideId);
  const showEl = document.getElementById(showId);
  if (hideEl && showEl) {
    hideEl.classList.add('d-none');
    showEl.classList.remove('d-none');
  }
}

// Servicio de almacenamiento (Desacoplado: preparado para cambiar por fetch/axios al backend)
function saveUserDataService(data) {
  // HOY: Persistencia estructurada en localStorage
  localStorage.setItem('notecore_active_user', JSON.stringify({
    name: data.name,
    email: data.email,
    university: data.university,
    degree: data.degree
  }));
  localStorage.setItem('notecore_user_semester', JSON.stringify({
    period: data.semesterName,
    schema: data.cutsSchema
  }));
  localStorage.setItem('notecore_user_subjects', JSON.stringify(data.subjects));

  /* MAÑANA (Backend Integration):
  return fetch('/api/v1/auth/register-onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  */
}

// Función para añadir asignaturas temporalmente en el Paso 3
function addTemporarySubject() {
  const nameInput = document.getElementById('setupSubjectName');
  const creditsInput = document.getElementById('setupSubjectCredits');
  const listContainer = document.getElementById('tempSubjectsList');
  const noMsg = document.getElementById('noSubjectsMsg');

  const subName = nameInput.value.trim();
  const subCredits = creditsInput.value;

  if (!subName) {
    alert('Por favor ingresa el nombre de la asignatura.');
    nameInput.focus();
    return;
  }

  if (noMsg) noMsg.remove();

  // Agregar al array temporal
  onboardingPayload.subjects.push({ name: subName, credits: subCredits });

  // Renderizar píldora visual reutilizando variables y clases
  const pill = document.createElement('div');
  pill.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); border: 1px solid var(--border-color); padding: 6px 10px; border-radius: 8px; font-size: 0.82rem; font-weight: 700;';
  pill.innerHTML = `<span>📚 ${subName} (${subCredits} Créditos)</span> <span style="color: var(--primary);">✔ Agregada</span>`;
  listContainer.appendChild(pill);

  // Limpiar inputs para la siguiente materia
  nameInput.value = '';
  creditsInput.value = '3';
  nameInput.focus();
}

// Paso Final: Consolidar y Redirigir al Dashboard
function completeOnboardingFlow() {
  saveUserDataService(onboardingPayload);
  window.location.href = 'dashboard-user.html';
}

/* ==========================================
   MODAL TÉRMINOS Y CONDICIONES (Con bloqueo de scroll)
   ========================================== */

function openTermsModal() {
  const termsModal = document.getElementById('termsModal');
  if (termsModal) {
    termsModal.classList.add('active');
    document.documentElement.classList.add('modal-open'); // Bloquea el scroll del elemento html
    document.body.classList.add('modal-open'); // Bloquea el scroll del body
  }
}

function closeTermsModal() {
  const termsModal = document.getElementById('termsModal');
  if (termsModal) {
    termsModal.classList.remove('active');
    document.documentElement.classList.remove('modal-open'); // Reactiva el scroll del elemento html
    document.body.classList.remove('modal-open'); // Reactiva el scroll del body
  }
}

function acceptTermsAndClose() {
  const regTermsCheckbox = document.getElementById('regTerms');
  if (regTermsCheckbox) {
    regTermsCheckbox.checked = true;
  }
  closeTermsModal();
}

// Eventos de los formularios
document.addEventListener('DOMContentLoaded', () => {
  // Función helper DRY: valida el formulario y ejecuta onValid si pasa
  const validateAndSubmit = (form, onValid) => {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Validación nativa del navegador (usa los required / type / pattern del HTML)
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      onValid();
    });
  };

  // Manejo de Registro Base (Paso 0) ➔ Avanzar al Paso 1 del Wizard
  validateAndSubmit(document.getElementById('registerForm'), () => {
    onboardingPayload.email = document.getElementById('regEmail')?.value || '';
    onboardingPayload.name = document.getElementById('regName')?.value || '';
    onboardingPayload.password = document.getElementById('regPassword')?.value || '';

    // Ocultar registro y mostrar Paso 1 (Perfil Académico)
    switchAuthStep('step-register', 'step-profile');
  });

  // Manejo del Paso 1: Perfil Académico ➔ Avanzar al Paso 2
  validateAndSubmit(document.getElementById('profileFormStep'), () => {
    onboardingPayload.university = document.getElementById('setupUniversity')?.value || '';
    onboardingPayload.degree = document.getElementById('setupDegree')?.value || '';

    switchAuthStep('step-profile', 'step-semester');
  });

  // Manejo del Paso 2: Semestre y Cortes ➔ Avanzar al Paso 3
  validateAndSubmit(document.getElementById('semesterFormStep'), () => {
    onboardingPayload.semesterName = document.getElementById('setupSemesterName')?.value || 'Semestre 2026-2';
    onboardingPayload.cutsSchema = document.getElementById('setupCutsSchema')?.value || '30-30-40';

    switchAuthStep('step-semester', 'step-subjects');
  });

  // Manejo de Login
  validateAndSubmit(document.getElementById('loginForm'), () => {
    const email = document.getElementById('loginEmail')?.value;

    console.log('Login intentado:', email);
    showAuthAlert('success', '¡Inicio de sesión exitoso!');
    window.location.href = 'index.html';
  });

  // Manejo de Recuperación de Contraseña (Ajustado para SPA)
  validateAndSubmit(document.getElementById('forgotPasswordForm'), () => {
    const email = document.getElementById('resetEmail')?.value;

    alert(`Hemos enviado un enlace de recuperación a: ${email}`);
    // Regresa a la vista principal de login
    switchAuthStep('view-forgot-password', 'view-login');
  });

  /* ---------------------------
     DROPDOWNS PERSONALIZADOS
     --------------------------- */
  const customDropdowns = document.querySelectorAll('.custom-dropdown');

  customDropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const selectedText = dropdown.querySelector('.dropdown-selected-text');
    const items = dropdown.querySelectorAll('.dropdown-item');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customDropdowns.forEach(d => {
          if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.toggle('active');
        trigger.setAttribute('aria-expanded', dropdown.classList.contains('active'));
      });
    }

    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (selectedText) {
          selectedText.textContent = item.textContent.trim();
        }
        if (hiddenInput) {
          hiddenInput.value = item.getAttribute('data-value');
        }

        dropdown.classList.remove('active');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', () => {
    customDropdowns.forEach(d => d.classList.remove('active'));
  });

});