document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // Función para abrir el sidebar
  const openMenu = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
  };

  // Función para cerrar el sidebar
  const closeMenu = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  };

  menuToggle.addEventListener('click', openMenu);
  closeSidebar.addEventListener('click', closeMenu);
  sidebarOverlay.addEventListener('click', closeMenu);

  // Cerrar el menú automáticamente al hacer clic en cualquier enlace
  sidebarLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
});