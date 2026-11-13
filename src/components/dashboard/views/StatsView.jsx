import {
  computeCutGrade,
  computeSubjectGrades,
  getGradeStatus,
} from "../../../utils/gradeHelpers";

const fmt = (value, decimals = 1) => (value == null ? "—" : Number(value).toFixed(decimals));

export default function StatsView({
  semester,
  subjects = [],
  summary = { cuts: [null, null, null], current: 0, paceCurrent: 0, hasEvaluated: false },
  cuts = [
    { label: "C1", weight: 30 },
    { label: "C2", weight: 30 },
    { label: "C3", weight: 40 },
  ],
}) {
  const enriched = subjects
    .map((s) => {
      const subjectCuts = Array.isArray(s.cuts) ? s.cuts : [null, null, null];
      const { accumulated, paceGrade, evaluatedWeight } = computeSubjectGrades(subjectCuts);
      return {
        ...s,
        subjectCuts,
        accumulated,
        paceGrade,
        evaluatedWeight,
      };
    })
    .sort((a, b) => b.accumulated - a.accumulated);

  const summaryAccumulated = Number(summary?.current) || 0;
  const summaryPace = Number(summary?.paceCurrent ?? summaryAccumulated) || 0;
  const summaryWeight = summary?.hasEvaluated ? 1 : 0;
  const summaryCuts = Array.isArray(summary?.cuts) ? summary.cuts : [null, null, null];
  const summaryStatus = getGradeStatus(summaryPace, summaryWeight);

  return (
    <section id="view-estadisticas" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Estadísticas Académicas 📊</h1>
          <p>Tabla general de estado.</p>
        </div>
        <button type="button" className="btn btn-outline semester-selector-btn">
          <i className="fa-regular fa-calendar icon-left"></i>
          <span>{semester}</span>
          <i className="fa-solid fa-chevron-down semester-chevron" aria-hidden="true"></i>
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h3>
              <i className="fa-solid fa-table-list card-icon"></i>Rendimiento General
            </h3>
            <p className="dash-card-sub">Desglose acumulado de notas y avance del semestre</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="stats-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Asignatura</th>
                {cuts.map((c) => (
                  <th key={c.label}>
                    {c.label} ({c.weight}%)
                  </th>
                ))}
                <th>Nota Actual</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {enriched.length === 0 ? (
                <tr>
                  <td colSpan={cuts.length + 4} className="dash-card-sub">
                    Aún no hay asignaturas registradas para mostrar estadísticas.
                  </td>
                </tr>
              ) : (
                enriched.map((s, i) => {
                  const status = getGradeStatus(s.paceGrade, s.evaluatedWeight);

                  return (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>
                        <i className={`fa-solid ${s.icon || "fa-book"} card-icon`}></i>{" "}
                        {s.statsName || s.name}
                      </td>
                      {cuts.map((_, idx) => (
                        <td key={s.subjectCuts[idx]?.id || idx}>
                          {fmt(computeCutGrade(s.subjectCuts[idx]))}
                        </td>
                      ))}
                      <td>
                        <span className={`subject-grade-badge ${status.colorClass}`}>
                          {fmt(s.accumulated)}
                        </span>
                      </td>
                      <td>
                        <span className={`subject-grade-badge ${status.colorClass}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={2}>PROMEDIO GENERAL</td>
                {cuts.map((_, idx) => (
                  <td key={idx}>{fmt(summaryCuts[idx], 2)}</td>
                ))}
                <td>
                  <span className={`subject-grade-badge ${summaryStatus.colorClass}`}>
                    {fmt(summaryAccumulated, 2)}
                  </span>
                </td>
                <td>
                  <span className={`subject-grade-badge ${summaryStatus.colorClass}`}>
                    {summaryStatus.label}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}