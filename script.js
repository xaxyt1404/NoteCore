document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // NAVEGACIÓN Y SIDEBAR
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // Abrir sidebar
  const openMenu = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
  };

  // Cerrar sidebar
  const closeMenu = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  };

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (closeSidebar) closeSidebar.addEventListener('click', closeMenu);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMenu);

  // Desplazamiento suave y cierre del menú lateral
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          closeMenu();

          // Un pequeño delay para permitir que la barra se repliegue antes del scroll
          setTimeout(() => {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 150);
        }
      }
    });
  });

  // ==========================================
  // GESTIÓN DEL TEMA (CLARO, OSCURO, SISTEMA)
  // ==========================================
  const themeBtn = document.getElementById('theme-btn');
  const themeMenu = document.getElementById('theme-menu');
  const themeBtnIcon = document.getElementById('theme-btn-icon');
  const themeOptions = document.querySelectorAll('.theme-option');

  // Detectar preferencia del sistema operativo
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(preference) {
    let effectiveTheme = preference;

    if (preference === 'system') {
      effectiveTheme = systemPrefersDark.matches ? 'dark' : 'light';
    }

    // Aplicar atributo a <html>
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // Actualizar icono del botón principal
    if (effectiveTheme === 'dark') {
      themeBtnIcon.className = 'fa-solid fa-moon';
    } else {
      themeBtnIcon.className = 'fa-solid fa-sun';
    }

    // Marcar opción activa en el menú
    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.themeOpt === preference);
    });
  }

  // Abrir / Cerrar menú desplegable
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('active');
    });
  }

  // Cerrar menú al hacer clic afuera
  document.addEventListener('click', () => {
    if (themeMenu) themeMenu.classList.remove('active');
  });

  // Selección de opción por el usuario
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const selected = opt.dataset.themeOpt;
      localStorage.setItem('theme-preference', selected);
      applyTheme(selected);
      themeMenu.classList.remove('active');
    });
  });

  // Escuchar cambios en el tema del sistema en tiempo real
  systemPrefersDark.addEventListener('change', () => {
    const savedPref = localStorage.getItem('theme-preference') || 'system';
    if (savedPref === 'system') {
      applyTheme('system');
    }
  });

  // Inicializar tema guardado o por defecto 'system'
  const initialPref = localStorage.getItem('theme-preference') || 'system';
  applyTheme(initialPref);
});

// ==========================================
// CONSULTA POR WHATSAPP (ÁMBITO GLOBAL)
// ==========================================
function sendToWhatsApp(event) {
  event.preventDefault();

  const nameInput = document.getElementById('ws-name');
  const messageInput = document.getElementById('ws-message');

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();
  const phone = '573136297041'; // Número de destino

  if (!name || !message) return;

  // Texto continuo codificado
  const text = `Hola, mi nombre es ${name}. ${message}`;
  const encodedText = encodeURIComponent(text);

  // URL universal de WhatsApp
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

  // Abre WhatsApp
  window.open(whatsappUrl, '_blank');

  // Limpia el formulario completo
  event.target.reset();
}