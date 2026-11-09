/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const ICONS = {
  success: "fa-circle-check",
  warning: "fa-triangle-exclamation",
  danger: "fa-circle-xmark",
  info: "fa-circle-info",
};

const DURATION = 3500;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(timerRef.current);
    setToast({ message, type, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, DURATION);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={`toast toast-${toast.type}${toast.visible ? " show" : ""}`}
        role="alert"
        aria-live="polite"
      >
        <i className={`fa-solid toast-icon ${ICONS[toast.type] || ICONS.info}`}></i>
        <span>{toast.message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}