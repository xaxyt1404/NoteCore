import ThemeDropdown from "../common/ThemeDropdown";
import booksImg from "../../assets/fondo/iconosfondo_03.png";
import plantImg from "../../assets/fondo/iconosfondo_02.png";

function NavLinks({ links, activeView, onNavigate }) {
  return links.map((link) => (
    <a
      key={link.id}
      href={`#${link.id}`}
      className={`sidebar-link${activeView === link.id ? " active" : ""}`}
      aria-current={activeView === link.id ? "page" : undefined}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(link.id);
      }}
    >
      <i className={`fa-solid ${link.icon}`}></i>
      <span>{link.label}</span>
    </a>
  ));
}

export default function Sidebar({ navigation, activeView, onNavigate, isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-overlay${isOpen ? " active" : ""}`} onClick={onClose}></div>

      <aside className={`sidebar dash-sidebar${isOpen ? " active" : ""}`}>
        <div className="sidebar-header">
          <ThemeDropdown />
          <button type="button" className="close-btn" aria-label="Cerrar menú" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <nav className="sidebar-links">
          <div className="sidebar-group main-links">
            <NavLinks links={navigation.main} activeView={activeView} onNavigate={onNavigate} />
          </div>

          <div className="sidebar-group bottom-links">
            <NavLinks links={navigation.bottom} activeView={activeView} onNavigate={onNavigate} />
          </div>

          <div className="sidebar-illustration">
            <img src={booksImg} alt="" className="sidebar-deco-img books-img" aria-hidden="true" />
            <img src={plantImg} alt="" className="sidebar-deco-img plant-img" aria-hidden="true" />
          </div>
        </nav>
      </aside>
    </>
  );
}