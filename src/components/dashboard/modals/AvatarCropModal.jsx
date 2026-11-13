import { useEffect, useRef, useState } from "react";
import Modal from "../../common/Modal";

const CROP_SIZE = 240;
const OUTPUT_SIZE = 320;

export default function AvatarCropModal({ isOpen, imageSrc, onClose, onConfirm }) {
  const [imgEl, setImgEl] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setImgEl(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  const getBaseScale = () => {
    if (!imgEl) return 1;
    return Math.max(CROP_SIZE / imgEl.width, CROP_SIZE / imgEl.height);
  };

  const clampOffset = (nextX, nextY, targetZoom = zoom) => {
    if (!imgEl) return { x: 0, y: 0 };
    const scale = getBaseScale() * targetZoom;
    const drawnW = imgEl.width * scale;
    const drawnH = imgEl.height * scale;
    const maxX = Math.max(0, (drawnW - CROP_SIZE) / 2);
    const maxY = Math.max(0, (drawnH - CROP_SIZE) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, nextX)),
      y: Math.min(maxY, Math.max(-maxY, nextY)),
    };
  };

  const handleZoomChange = (val) => {
    const nextZoom = parseFloat(val) || 1;
    setZoom(nextZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
  };

  const startDrag = (clientX, clientY) => {
    dragRef.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      origX: offset.x,
      origY: offset.y,
    };
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragRef.current.active) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    setOffset(clampOffset(dragRef.current.origX + dx, dragRef.current.origY + dy));
  };

  const endDrag = () => {
    dragRef.current.active = false;
  };

  const handleCropSave = () => {
    if (!imgEl) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    const ratio = OUTPUT_SIZE / CROP_SIZE;
    const scale = getBaseScale() * zoom * ratio;
    const drawnW = imgEl.width * scale;
    const drawnH = imgEl.height * scale;
    const drawX = (OUTPUT_SIZE - drawnW) / 2 + offset.x * ratio;
    const drawY = (OUTPUT_SIZE - drawnH) / 2 + offset.y * ratio;

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(imgEl, drawX, drawY, drawnW, drawnH);

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onConfirm?.(croppedDataUrl);
  };

  const scale = getBaseScale() * zoom;
  const displayW = imgEl ? imgEl.width * scale : CROP_SIZE;
  const displayH = imgEl ? imgEl.height * scale : CROP_SIZE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} cardClassName="avatar-crop-modal-card">
      <div className="modal-header">
        <div className="modal-title">
          <i className="fa-solid fa-crop-simple highlight"></i>
          <span>Recortar foto de perfil</span>
        </div>
      </div>

      <div className="modal-body">
        <p className="dash-card-sub">
          Arrastra la imagen para encuadrarla y usa el control de acercamiento.
        </p>

        <div className="cropper-stage-wrapper">
          <div
            className="cropper-viewport"
            onMouseDown={(e) => {
              e.preventDefault();
              startDrag(e.clientX, e.clientY);
            }}
            onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (t) startDrag(t.clientX, t.clientY);
            }}
            onTouchMove={(e) => {
              const t = e.touches[0];
              if (t) moveDrag(t.clientX, t.clientY);
            }}
            onTouchEnd={endDrag}
          >
            {imgEl && (
              <img
                src={imageSrc}
                alt="Vista previa para recorte"
                draggable={false}
                className="cropper-image"
                style={{
                  width: `${displayW}px`,
                  height: `${displayH}px`,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            )}
            <div className="cropper-circle-guide" aria-hidden="true"></div>
          </div>
        </div>

        <div className="form-group">
          <div className="label-wrapper">
            <label htmlFor="avatar-zoom-range">Zoom</label>
            <span className="range-val">{zoom.toFixed(1)}x</span>
          </div>
          <div className="slider-wrapper">
            <input
              id="avatar-zoom-range"
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleCropSave}>
          <i className="fa-solid fa-check icon-left"></i> Aplicar recorte
        </button>
      </div>
    </Modal>
  );
}