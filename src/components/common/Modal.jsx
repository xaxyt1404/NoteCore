import { useEffect } from "react";
import { createPortal } from "react-dom";

// Contador para soportar modales simultáneos sin liberar el scroll antes de tiempo
let openModals = 0;

const lockScroll = () => {
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
};

const unlockScroll = () => {
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
};

export default function Modal({
  isOpen,
  onClose,
  children,
  cardClassName = "",
  closeOnOverlay = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    openModals += 1;
    lockScroll();
    return () => {
      openModals -= 1;
      if (openModals <= 0) {
        openModals = 0;
        unlockScroll();
      }
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlay && e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    <div
      className={`modal-overlay${isOpen ? " active" : ""}`}
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      <div className={`modal-card ${cardClassName}`.trim()} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>,
    document.body,
  );
}