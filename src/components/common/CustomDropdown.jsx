import { useEffect, useMemo, useRef, useState } from "react";

const normalize = (opt) =>
  typeof opt === "string" ? { value: opt, label: opt } : opt;

export default function CustomDropdown({
  options = [],
  value = "",
  onChange,
  placeholder = "Selecciona una opción",
  searchable = false,
  searchPlaceholder = "Buscar",
  emptyMessage = "Sin opciones disponibles",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const normalized = useMemo(() => options.map(normalize), [options]);
  const selected = normalized.find((o) => o.value === value);

  const visibleOptions = useMemo(() => {
    if (!searchable || !search.trim()) return normalized;
    const term = search.toLowerCase().trim();
    return normalized.filter((o) => o.label.toLowerCase().includes(term));
  }, [normalized, search, searchable]);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [open]);

  const handleSelect = (opt) => {
    onChange?.(opt.value);
    close();
  };

  const items =
    normalized.length === 0 ? (
      <button type="button" className="dropdown-item" disabled>
        {emptyMessage}
      </button>
    ) : (
      visibleOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="menuitem"
          className={`dropdown-item${opt.value === value ? " active" : ""}`}
          onClick={() => handleSelect(opt)}
        >
          {opt.label}
        </button>
      ))
    );

  return (
    <div
      ref={wrapperRef}
      className={`custom-dropdown${searchable ? " searchable" : ""}${open ? " active" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className="dropdown-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="dropdown-selected-text">{selected ? selected.label : placeholder}</span>
        <i className="fa-solid fa-chevron-down arrow-icon"></i>
      </button>

      <div className="dropdown-menu" role="menu">
        {searchable && (
          <div className="dropdown-search-wrapper">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="dropdown-search-input"
              placeholder={searchPlaceholder}
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        {searchable ? <div className="dropdown-options-list">{items}</div> : items}
      </div>
    </div>
  );
}