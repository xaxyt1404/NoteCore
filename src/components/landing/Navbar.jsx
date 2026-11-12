import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeDropdown from "../common/ThemeDropdown";
import logo from "../../assets/logotipo.png";

const LINKS = [
  { href: "#inicio", icon: "fa-house", label: "Inicio" },
  { href: "#herramientas", icon: "fa-toolbox", label: "Herramientas" },
  { href: "#contacto", icon: "fa-envelope", label: "Contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    setOpen(false);
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container container">
          <div className="nav-left">
            <button
              type="button"
              className="hamburger-btn"
              aria-label="Abrir menú"
              onClick={() => setOpen(true)}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <div>
              <img src={logo} alt="NoteCore Logo" className="logo-img" />
            </div>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary">Registrarse</Link>
          </div>
        </div>
      </header>

      <div
        className={`sidebar-overlay${open ? " active" : ""}`}
        onClick={() => setOpen(false)}
      ></div>

      <aside className={`sidebar${open ? " active" : ""}`}>
        <div className="sidebar-header">
          <ThemeDropdown />
          <button
            type="button"
            className="close-btn"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <nav className="sidebar-links">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="sidebar-link"
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              <i className={`fa-solid ${link.icon}`}></i> {link.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}


