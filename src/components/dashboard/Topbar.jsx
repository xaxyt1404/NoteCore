import { useEffect, useRef, useState } from "react";
import logo from "../../assets/logotipo.png";

export default function Topbar({
  user,
  notifications = [],
  sidebarOpen,
  onMenuToggle,
  onOpenProfile,
  onLogout,
}) {
  const [menu, setMenu] = useState(null);
  const [items, setItems] = useState(notifications);
  const rightRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const handleOutside = (e) => {
      if (rightRef.current && !rightRef.current.contains(e.target)) setMenu(null);
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [menu]);

  const toggle = (name) => setMenu((m) => (m === name ? null : name));
  const hasUnread = items.some((n) => n.unread);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <header className="dash-header">
      <div className="header-left">
        <button
          type="button"
          className="hamburger-btn mobile-only-btn"
          aria-label="Abrir menú"
          aria-controls="sidebar"
          aria-expanded={!!sidebarOpen}
          onClick={onMenuToggle}
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <div className="logo">
          <img src={logo} alt="NoteCore Logo" className="logo-img" />
        </div>
      </div>

      <div className="header-right" ref={rightRef}>
        <div className="header-dropdown-wrapper">
          <button
            type="button"
            className="hamburger-btn header-action-btn notif-btn"
            aria-label="Notificaciones"
            aria-haspopup="true"
            aria-expanded={menu === "notif"}
            onClick={() => toggle("notif")}
          >
            <i className="fa-regular fa-bell"></i>
            {hasUnread && <span className="notif-badge"></span>}
          </button>

          <div className={`header-popover-menu notif-popover${menu === "notif" ? " active" : ""}`}>
            <div className="popover-header">
              <h4>Notificaciones</h4>
              <button type="button" className="btn-text-action" onClick={markAllRead}>
                Marcar leídas
              </button>
            </div>
            <div className="popover-body">
              {items.map((n) => (
                <div key={n.id} className={`notif-item${n.unread ? " unread" : ""}`}>
                  <div className={`notif-icon ${n.variant}`}>
                    <i className={n.icon}></i>
                  </div>
                  <div className="notif-content">
                    <p>
                      <strong>{n.subject}:</strong> {n.message}
                    </p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="header-dropdown-wrapper">
          <button
            type="button"
            className="profile-btn header-action-btn"
            aria-haspopup="true"
            aria-expanded={menu === "user"}
            onClick={() => toggle("user")}
          >
            <div className="user-avatar">
              <i className="fa-solid fa-user"></i>
            </div>
            <span className="user-name">Hola, {user.greetingName}</span>
            <i className="fa-solid fa-chevron-down arrow-icon"></i>
          </button>

          <div className={`header-popover-menu profile-popover${menu === "user" ? " active" : ""}`}>
            <div className="user-info-head">
              <p className="user-full-name">{user.fullName}</p>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="popover-divider"></div>
            <button
              type="button"
              className="popover-item"
              onClick={() => {
                setMenu(null);
                onOpenProfile?.();
              }}
            >
              <i className="fa-solid fa-id-card"></i> Ver Perfil
            </button>
            <div className="popover-divider"></div>
            <button
              type="button"
              className="popover-item logout-item"
              onClick={() => {
                setMenu(null);
                onLogout?.();
              }}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}