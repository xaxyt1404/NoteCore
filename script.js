document.addEventListener('DOMContentLoaded', () => {
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
});

// Función para enviar consulta directa a WhatsApp
function sendToWhatsApp(event) {
  event.preventDefault();
  
  const name = document.getElementById('ws-name').value.trim();
  const message = document.getElementById('ws-message').value.trim();
  const phone = '573136297041'; // Número de destino

  if (!name || !message) return;

  // Texto continuo codificado de forma segura
  const text = `Hola, mi nombre es ${name}. ${message}`;
  const encodedText = encodeURIComponent(text);
  
  // URL universal compatible de WhatsApp
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

  window.open(whatsappUrl, '_blank');
}