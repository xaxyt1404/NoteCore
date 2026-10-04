/* ==========================================
   THEME.JS
   Gestión del tema (claro, oscuro, sistema) compartida por todas las páginas.
   Cargar en el <head>, SIN defer, para aplicar el tema antes de que se
   pinte la página y evitar el destello claro en modo oscuro.
   ========================================== */
(function () {
  const STORAGE_KEY = 'theme-preference';
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Leer la preferencia guardada (por defecto 'system')
  function getPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch (e) {
      return 'system';
    }
  }

  function savePreference(pref) {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch (e) {
      /* sin almacenamiento disponible: el tema solo dura esta visita */
    }
  }

  // Aplicar el tema. Los elementos del menú se buscan en cada llamada porque,
  // la primera vez, el DOM todavía no existe (el script corre en el <head>).
  function applyTheme(preference) {
    let effectiveTheme = preference;

    if (preference === 'system') {
      effectiveTheme = systemPrefersDark.matches ? 'dark' : 'light';
    }

    // Atributo en <html>: lo usan las variables de variables.css
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // Icono del botón principal (si la página tiene selector de tema)
    const themeBtnIcon = document.getElementById('theme-btn-icon');
    if (themeBtnIcon) {
      themeBtnIcon.className = effectiveTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }

    // Opción activa dentro del menú
    document.querySelectorAll('.theme-option').forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.themeOpt === preference);
    });
  }

  // 1) Inmediato: aplicar el tema antes de que se pinte nada
  applyTheme(getPreference());

  // 2) Al cargar el DOM: conectar el selector de tema (si existe en la página)
  document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Abrir / cerrar el menú desplegable
    if (themeBtn && themeMenu) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('active');
      });
    }

    // Cerrar el menú al hacer clic afuera
    document.addEventListener('click', () => {
      if (themeMenu) themeMenu.classList.remove('active');
    });

    // Selección de opción por el usuario
    themeOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        const selected = opt.dataset.themeOpt;
        savePreference(selected);
        applyTheme(selected);
        if (themeMenu) themeMenu.classList.remove('active');
      });
    });

    // Reaccionar en tiempo real a cambios del tema del sistema
    systemPrefersDark.addEventListener('change', () => {
      if (getPreference() === 'system') applyTheme('system');
    });

    // Sincronizar icono y opción activa ahora que el DOM ya existe
    applyTheme(getPreference());
  });
})();
