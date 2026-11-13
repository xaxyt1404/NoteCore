import { useEffect, useState } from "react";
import Modal from "../../common/Modal";
import { useToast } from "../../../context/ToastContext";
import {
  computeSubjectGrades,
  formatGrade,
  getGradeStatus,
} from "../../../utils/gradeHelpers";

const sumActivitiesWeight = (activities = []) =>
  activities.reduce((acc, a) => acc + (Number(a.weight) || 0), 0);

export default function SubjectDetailModal({ isOpen, onClose, subject, onSaveSubject }) {
  const [activeCutIdx, setActiveCutIdx] = useState(0);
  const [cutsData, setCutsData] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (subject) {
      const baseCuts =
        Array.isArray(subject.cuts) && subject.cuts.length > 0
          ? subject.cuts
          : [
            { id: 1, name: "Corte 1", weight: 30, activities: [], parcial: { grade: 0, weight: 100, locked: true }, bonus: 0 },
            { id: 2, name: "Corte 2", weight: 30, activities: [], parcial: { grade: 0, weight: 100, locked: true }, bonus: 0 },
            { id: 3, name: "Corte 3", weight: 40, activities: [], parcial: { grade: 0, weight: 100, locked: true }, bonus: 0 },
          ];

      const clonedCuts = JSON.parse(JSON.stringify(baseCuts)).map((cut) => {
        const acts = cut.activities || [];
        const actsWeight = sumActivitiesWeight(acts);
        const defaultParcialWeight = Math.max(0, 100 - actsWeight);
        const rawParcialWeight =
          cut.parcial?.weight !== undefined ? Number(cut.parcial.weight) : defaultParcialWeight;

        return {
          ...cut,
          activities: acts,
          parcial: {
            grade: 0,
            ...cut.parcial,
            weight: Math.min(defaultParcialWeight, Math.max(0, rawParcialWeight)),
            locked: true,
          },
        };
      });
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

  const totalActivitiesWeight = sumActivitiesWeight(currentCut.activities);
  const maxParcialWeight = Math.max(0, 100 - totalActivitiesWeight);
  const totalCutWeight = totalActivitiesWeight + (Number(currentCut.parcial?.weight) || 0);

  const updateActivityGrade = (actId, val) => {
    setCutsData((prev) =>
      prev.map((cut, idx) =>
        idx !== activeCutIdx
          ? cut
          : {
            ...cut,
            activities: cut.activities.map((a) =>
              a.id === actId ? { ...a, grade: val } : a
            ),
          }
      )
    );
  };

  const updateActivityWeight = (actId, rawVal) => {
    setCutsData((prev) =>
      prev.map((cut, idx) => {
        if (idx !== activeCutIdx) return cut;

        const otherActsWeight = cut.activities
          .filter((a) => a.id !== actId)
          .reduce((acc, a) => acc + (Number(a.weight) || 0), 0);

        const maxAllowedForThis = Math.max(0, 100 - otherActsWeight);
        const parsed = parseFloat(rawVal);
        const clampedWeight = Number.isNaN(parsed)
          ? 0
          : Math.min(maxAllowedForThis, Math.max(0, parsed));

        const newActsTotal = otherActsWeight + clampedWeight;
        const autoParcialWeight = Math.max(0, 100 - newActsTotal);

        return {
          ...cut,
          activities: cut.activities.map((a) =>
            a.id === actId ? { ...a, weight: clampedWeight } : a
          ),
          parcial: {
            ...cut.parcial,
            weight: autoParcialWeight,
          },
        };
      })
    );
  };

  const toggleLockActivity = (actId) => {
    setCutsData((prev) =>
      prev.map((cut, idx) =>
        idx !== activeCutIdx
          ? cut
          : {
            ...cut,
            activities: cut.activities.map((a) =>
              a.id === actId ? { ...a, locked: !a.locked } : a
            ),
          }
      )
    );
  };

  const addActivity = () => {
    setCutsData((prev) =>
      prev.map((cut, idx) => {
        if (idx !== activeCutIdx) return cut;
        const newAct = {
          id: Date.now(),
          name: `Actividad ${cut.activities.length + 1}`,
          grade: 0,
          weight: 0,
          locked: false,
        };
        const updatedActivities = [newAct, ...cut.activities];
        const autoParcialWeight = Math.max(0, 100 - sumActivitiesWeight(updatedActivities));

        return {
          ...cut,
          activities: updatedActivities,
          parcial: {
            ...cut.parcial,
            weight: autoParcialWeight,
          },
        };
      })
    );
  };

  const removeActivity = (actId) => {
    setCutsData((prev) =>
      prev.map((cut, idx) => {
        if (idx !== activeCutIdx) return cut;
        const remaining = cut.activities.filter((a) => a.id !== actId);
        const autoParcialWeight = Math.max(0, 100 - sumActivitiesWeight(remaining));

        return {
          ...cut,
          activities: remaining,
          parcial: {
            ...cut.parcial,
            weight: autoParcialWeight,
          },
        };
      })
    );
  };

  const updateParcialGrade = (val) => {
    setCutsData((prev) =>
      prev.map((cut, idx) =>
        idx !== activeCutIdx
          ? cut
          : {
            ...cut,
            parcial: { ...cut.parcial, grade: val },
          }
      )
    );
  };

  const updateParcialWeight = (rawVal) => {
    setCutsData((prev) =>
      prev.map((cut, idx) => {
        if (idx !== activeCutIdx) return cut;
        const actsTotal = sumActivitiesWeight(cut.activities);
        const maxAllowed = Math.max(0, 100 - actsTotal);
        const parsed = parseFloat(rawVal);
        const clampedWeight = Number.isNaN(parsed)
          ? 0
          : Math.min(maxAllowed, Math.max(0, parsed));

        return {
          ...cut,
          parcial: {
            ...cut.parcial,
            weight: clampedWeight,
          },
        };
      })
    );
  };

  const toggleLockParcial = () => {
    setCutsData((prev) =>
      prev.map((cut, idx) =>
        idx !== activeCutIdx
          ? cut
          : {
            ...cut,
            parcial: { ...cut.parcial, locked: !cut.parcial.locked },
          }
      )
    );
  };

  const updateBonus = (val) => {
    setCutsData((prev) =>
      prev.map((cut, idx) =>
        idx !== activeCutIdx
          ? cut
          : { ...cut, bonus: parseFloat(val) || 0 }
      )
    );
  };

  const handleSave = () => {
    const invalidCut = cutsData.find((cut) => {
      const sum = sumActivitiesWeight(cut.activities) + (Number(cut.parcial?.weight) || 0);
      return sum !== 100;
    });

    if (invalidCut) {
      const sum =
        sumActivitiesWeight(invalidCut.activities) + (Number(invalidCut.parcial?.weight) || 0);
      showToast(
        `En ${invalidCut.name}, la suma de porcentajes es ${sum}%. Debe ser exactamente 100%.`,
        "warning"
      );
      return;
    }

    const { accumulated, paceGrade, evaluatedWeight } = computeSubjectGrades(cutsData);
    const status = getGradeStatus(paceGrade, evaluatedWeight);
    onSaveSubject({
      ...subject,
      cuts: cutsData,
      current: accumulated,
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

        <div className="activities-section">
          <div className="section-header-row">
            <h4>Actividades del Corte</h4>
            <p className="dash-card-sub">
              Distribución del corte: <strong>{totalActivitiesWeight}%</strong> actividades +{" "}
              <strong>{currentCut.parcial.weight}%</strong> parcial ={" "}
              <strong className={totalCutWeight === 100 ? "text-success" : "text-warning"}>
                {totalCutWeight}%
              </strong>
            </p>
            <button type="button" className="btn btn-primary" onClick={addActivity}>
              <i className="fa-solid fa-plus icon-left"></i> Agregar actividad
            </button>
          </div>

          {currentCut.activities.length === 0 ? (
            <p className="dash-card-sub">
              No hay actividades registradas en este corte. Agrega las tuyas.
            </p>
          ) : (
            currentCut.activities.map((act) => {
              const otherActsWeight = currentCut.activities
                .filter((a) => a.id !== act.id)
                .reduce((acc, a) => acc + (Number(a.weight) || 0), 0);
              const maxForThisAct = Math.max(0, 100 - otherActsWeight);

              return (
                <div key={act.id} className="scenario-card">
                  <div className="scenario-header">
                    <input
                      type="text"
                      className="form-control"
                      disabled={act.locked}
                      value={act.name}
                      onChange={(e) => {
                        setCutsData((prev) =>
                          prev.map((cut, idx) =>
                            idx !== activeCutIdx
                              ? cut
                              : {
                                ...cut,
                                activities: cut.activities.map((a) =>
                                  a.id === act.id ? { ...a, name: e.target.value } : a
                                ),
                              }
                          )
                        );
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
                        min="0"
                        max={maxForThisAct}
                        step="1"
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
              );
            })
          )}
        </div>

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
                  onChange={(e) => updateParcialGrade(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group weight-group">
              <label>Porcentaje (%):</label>
              <input
                type="number"
                className="form-control"
                min="0"
                max={maxParcialWeight}
                step="1"
                value={currentCut.parcial.weight}
                disabled={currentCut.parcial.locked}
                onChange={(e) => updateParcialWeight(e.target.value)}
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