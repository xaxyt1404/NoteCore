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

  // Manejo de Registro
  validateAndSubmit(document.getElementById('registerForm'), () => {
    const email = document.getElementById('regEmail')?.value;
    const name = document.getElementById('regName')?.value;

    // Aquí irá la conexión real con el backend / base de datos
    console.log('Registro intentado:', { email, name });
    alert(`¡Bienvenido a NoteCore, ${name}! Tu cuenta ha sido creada.`);
    window.location.href = 'index.html';
  });

  // Manejo de Login
  validateAndSubmit(document.getElementById('loginForm'), () => {
    const email = document.getElementById('loginEmail')?.value;

    console.log('Login intentado:', email);
    alert('¡Inicio de sesión exitoso!');
    window.location.href = 'index.html';
  });

  // Manejo de Recuperación de Contraseña
  validateAndSubmit(document.getElementById('forgotPasswordForm'), () => {
    const email = document.getElementById('resetEmail')?.value;

    alert(`Hemos enviado un enlace de recuperación a: ${email}`);
    window.location.href = 'login.html';
  });
});

/* ==========================================
   MODAL TÉRMINOS Y CONDICIONES (Reutilizando clases de main.css)
   ========================================== */

function openTermsModal() {
  const termsModal = document.getElementById('termsModal');
  if (termsModal) {
    termsModal.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeTermsModal() {
  const termsModal = document.getElementById('termsModal');
  if (termsModal) {
    termsModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

function acceptTermsAndClose() {
  const regTermsCheckbox = document.getElementById('regTerms');
  if (regTermsCheckbox) {
    regTermsCheckbox.checked = true;
  }
  closeTermsModal();
}