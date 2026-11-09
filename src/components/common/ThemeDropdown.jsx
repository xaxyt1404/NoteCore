import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  { value: "light", label: "Claro", icon: "fa-sun" },
  { value: "dark", label: "Oscuro", icon: "fa-moon" },
  { value: "system", label: "Sistema", icon: "fa-desktop" },
];

export default function ThemeDropdown() {
  const { preference, theme, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [open]);

  const handleSelect = (value) => {
    setPreference(value);
    setOpen(false);
  };

  return (
    <div className="theme-dropdown-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="hamburger-btn"
        aria-label="Cambiar tema"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="theme-text">Tema</span>
        <i className={`fa-solid ${theme === "dark" ? "fa-moon" : "fa-sun"}`}></i>
      </button>

      <div className={`theme-menu${open ? " active" : ""}`}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`theme-option${preference === opt.value ? " active" : ""}`}
            onClick={() => handleSelect(opt.value)}
          >
            <i className={`fa-solid ${opt.icon}`}></i> {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}