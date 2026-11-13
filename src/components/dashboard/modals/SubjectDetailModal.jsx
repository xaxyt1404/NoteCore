import { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import { formatGrade, getGradeStatus } from "../../../utils/gradeHelpers";

const computeCutGrade = (cut) => {
  if (!cut) return null;
  const activitiesSum = (cut.activities || []).reduce(
    (acc, act) => acc + (Number(act.grade) || 0) * ((Number(act.weight) || 0) / 100),
    0
  );
  const parcialSum =
    (Number(cut.parcial?.grade) || 0) * ((Number(cut.parcial?.weight) || 0) / 100);

  const hasAnyGrade =
    (cut.activities || []).some((a) => a.grade > 0) ||
    cut.parcial?.grade > 0 ||
    cut.bonus > 0;

  if (!hasAnyGrade) return null;
  return Math.min(5.0, activitiesSum + parcialSum + (Number(cut.bonus) || 0));
};

const computeSubjectCurrent = (cuts = []) => {
  let weightedSum = 0;
  let evaluatedWeight = 0;

  cuts.forEach((c) => {
    const grade = computeCutGrade(c);
    if (grade !== null) {
      const w = (Number(c.weight) || 0) / 100;
      weightedSum += grade * w;
      evaluatedWeight += w;
    }
  });

  if (evaluatedWeight === 0) return 0;
  return Number((weightedSum / evaluatedWeight).toFixed(2));
};

export default function SubjectDetailModal({ isOpen, onClose, subject, onSaveSubject }) {
  const [activeCutIdx, setActiveCutIdx] = useState(0);
  const [cutsData, setCutsData] = useState([]);

  useEffect(() => {
    if (subject) {
      const clonedCuts = JSON.parse(JSON.stringify(subject.cuts || [])).map((cut) => ({
        ...cut,
        parcial: {
          grade: 0,
          weight: 100,
          ...cut.parcial,
          locked: true,
        },
      }));
      setCutsData(clonedCuts);
      setActiveCutIdx(0);
    }
  }, [subject]);

  if (!subject) return null;

  const currentCut = cutsData[activeCutIdx] || {
    activities: [],
    parcial: { grade: 0, weight: 100, locked: true },
    bonus: 0,
  };

  const updateActivityGrade = (actId, val) => {
    const updated = [...cutsData];
    updated[activeCutIdx].activities = updated[activeCutIdx].activities.map((a) =>
      a.id === actId ? { ...a, grade: val } : a
    );
    setCutsData(updated);
  };

  const updateActivityWeight = (actId, weightVal) => {
    const updated = [...cutsData];
    updated[activeCutIdx].activities = updated[activeCutIdx].activities.map((a) =>
      a.id === actId ? { ...a, weight: parseFloat(weightVal) || 0 } : a
    );
    setCutsData(updated);
  };

  const toggleLockActivity = (actId) => {
    const updated = [...cutsData];
    updated[activeCutIdx].activities = updated[activeCutIdx].activities.map((a) =>
      a.id === actId ? { ...a, locked: !a.locked } : a
    );
    setCutsData(updated);
  };

  const addActivity = () => {
    const updated = [...cutsData];
    const newAct = {
      id: Date.now(),
      name: `Actividad ${updated[activeCutIdx].activities.length + 1}`,
      grade: 0.0,
      weight: 20,
      locked: true,
    };
    updated[activeCutIdx].activities.push(newAct);
    setCutsData(updated);
  };

  const removeActivity = (actId) => {
    const updated = [...cutsData];
    updated[activeCutIdx].activities = updated[activeCutIdx].activities.filter((a) => a.id !== actId);
    setCutsData(updated);
  };

  const updateParcial = (field, val) => {
    const updated = [...cutsData];
    updated[activeCutIdx].parcial[field] = val;
    setCutsData(updated);
  };

  const toggleLockParcial = () => {
    const updated = [...cutsData];
    updated[activeCutIdx].parcial.locked = !updated[activeCutIdx].parcial.locked;
    setCutsData(updated);
  };

  const updateBonus = (val) => {
    const updated = [...cutsData];
    updated[activeCutIdx].bonus = parseFloat(val) || 0;
    setCutsData(updated);
  };

  const handleSave = () => {
    const newCurrent = computeSubjectCurrent(cutsData);
    const status = getGradeStatus(newCurrent);
    onSaveSubject({
      ...subject,
      cuts: cutsData,
      current: newCurrent,
      statusLabel: status.label,
      performance: status.label,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <div className="modal-title">
          <i className={`fa-solid ${subject.icon} highlight`}></i>
          <span>Detalles de Asignatura: {subject.name}</span>
        </div>
      </div>

      <div className="modal-body">
        {/* Selector de Cortes (Pestañas) */}
        <div className="sim-tabs">
          {cutsData.map((cut, idx) => (
            <button
              key={cut.id || idx}
              type="button"
              className={`tab-btn${activeCutIdx === idx ? " active" : ""}`}
              onClick={() => setActiveCutIdx(idx)}
            >
              {cut.name} ({cut.weight}%)
            </button>
          ))}
        </div>

        {/* Sección Puntos Adicionales */}
        <div className="form-group">
          <div className="label-wrapper">
            <label>Puntos adicionales (a la definitiva del corte):</label>
            <span className="range-val">{formatGrade(currentCut.bonus)}</span>
          </div>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={currentCut.bonus}
              onChange={(e) => updateBonus(e.target.value)}
            />
          </div>
        </div>

        {/* Actividades Dinámicas */}
        <div className="activities-section">
          <div className="section-header-row">
            <h4>Actividades del Corte</h4>
            <button type="button" className="btn btn-primary" onClick={addActivity}>
              <i className="fa-solid fa-plus icon-left"></i> Agregar actividad
            </button>
          </div>

          {currentCut.activities.length === 0 ? (
            <p className="dash-card-sub">No hay actividades registradas en este corte. Agrega las tuyas.</p>
          ) : (
            currentCut.activities.map((act) => (
              <div key={act.id} className="scenario-card">
                <div className="scenario-header">
                  <input
                    type="text"
                    className="form-control"
                    disabled={act.locked}
                    value={act.name}
                    onChange={(e) => {
                      const updated = [...cutsData];
                      updated[activeCutIdx].activities = updated[activeCutIdx].activities.map((a) =>
                        a.id === act.id ? { ...a, name: e.target.value } : a
                      );
                      setCutsData(updated);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-icon-delete"
                    title="Eliminar actividad"
                    onClick={() => removeActivity(act.id)}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>

                <div className="form-grid activity-grid">
                  <div className="form-group">
                    <div className="label-wrapper">
                      <span>Nota: {formatGrade(act.grade)}</span>
                    </div>
                    <div className="slider-wrapper">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={act.grade}
                        disabled={act.locked}
                        onChange={(e) => updateActivityGrade(act.id, parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="form-group weight-group">
                    <label>Porcentaje (%):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={act.weight}
                      disabled={act.locked}
                      onChange={(e) => updateActivityWeight(act.id, e.target.value)}
                    />
                  </div>
                </div>

                <div className="action-row">
                  <button
                    type="button"
                    className={`btn ${act.locked ? "btn-outline" : "btn-primary"}`}
                    onClick={() => toggleLockActivity(act.id)}
                  >
                    {act.locked ? (
                      <>
                        <i className="fa-solid fa-pen icon-left"></i> Editar
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check icon-left"></i> Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Examen Parcial */}
        <div className="scenario-card">
          <h4>
            <i className="fa-solid fa-file-lines highlight icon-left"></i> Examen Parcial
          </h4>
          <div className="form-grid activity-grid">
            <div className="form-group">
              <div className="label-wrapper">
                <span>Nota Parcial: {formatGrade(currentCut.parcial.grade)}</span>
              </div>
              <div className="slider-wrapper">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={currentCut.parcial.grade}
                  disabled={currentCut.parcial.locked}
                  onChange={(e) => updateParcial("grade", parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group weight-group">
              <label>Porcentaje (%):</label>
              <input
                type="number"
                className="form-control"
                value={currentCut.parcial.weight}
                disabled={currentCut.parcial.locked}
                onChange={(e) => updateParcial("weight", parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="action-row">
            <button
              type="button"
              className={`btn ${currentCut.parcial.locked ? "btn-outline" : "btn-primary"}`}
              onClick={toggleLockParcial}
            >
              {currentCut.parcial.locked ? (
                <>
                  <i className="fa-solid fa-pen icon-left"></i> Editar
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check icon-left"></i> Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Guardar cambios
        </button>
      </div>
    </Modal>
  );
}