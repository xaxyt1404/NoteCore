import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState(null);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);

  const normalized = useMemo(() => options.map(normalize), [options]);
  const selected = useMemo(
    () => normalized.find((o) => o.value === value) || null,
    [normalized, value]
  );

  const visibleOptions = useMemo(() => {
    if (!searchable || !search.trim()) return normalized;
    const term = search.trim().toLowerCase();
    return normalized.filter((o) => o.label.toLowerCase().includes(term));
  }, [normalized, searchable, search]);

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  const updatePosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = searchable ? 260 : 210;
    const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow;

    setMenuStyle({
      position: "fixed",
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 160)}px`,
      ...(openUpward
        ? { bottom: `${window.innerHeight - rect.top + 6}px`, top: "auto" }
        : { top: `${rect.bottom + 6}px`, bottom: "auto" }),
      zIndex: 450,
    });
  }, [searchable]);

  useEffect(() => {
    if (disabled && open) close();
  }, [disabled, open, close]);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleOutside = (e) => {
      if (
        wrapperRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      close();
    };

    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, updatePosition, close]);

  const handleSelect = (opt) => {
    onChange?.(opt.value);
    close();
  };

  const items =
    normalized.length === 0 ? (
      <button type="button" className="dropdown-item" disabled>
        {emptyMessage}
      </button>
    ) : visibleOptions.length === 0 ? (
      <button type="button" className="dropdown-item" disabled>
        Sin coincidencias
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

  const menuNode =
    open && menuStyle
      ? createPortal(
        <div
          ref={menuRef}
          className={`dropdown-menu portal-dropdown-menu active${searchable ? " searchable" : ""}`}
          style={menuStyle}
          role="menu"
        >
          {searchable && (
            <div className="dropdown-search-wrapper">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                className="dropdown-search-input"
                placeholder={searchPlaceholder}
                autoComplete="off"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
          {searchable ? (
            <div className="dropdown-options-list">{items}</div>
          ) : (
            items
          )}
        </div>,
        document.body
      )
      : null;

  return (
    <div
      ref={wrapperRef}
      className={`custom-dropdown${searchable ? " searchable" : ""}${open ? " active" : ""}${disabled ? " is-disabled" : ""} ${className}`.trim()}
    >
      <button
        type="button"
        className="dropdown-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        {!disabled && <i className="fa-solid fa-chevron-down arrow-icon"></i>}
      </button>
      {menuNode}
    </div>
  );
}