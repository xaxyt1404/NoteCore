import { getGradeStatus } from "../../../utils/gradeHelpers";

const fmt = (value, decimals = 1) => (value == null ? "—" : Number(value).toFixed(decimals));

const getCutGrade = (cut) => {
  if (typeof cut === "number" || cut === null) return cut;
  if (!cut) return null;

  const activitiesSum = (cut.activities || []).reduce(
    (acc, act) => acc + (Number(act.grade) || 0) * ((Number(act.weight) || 0) / 100),
    0
  );
  const parcialContribution =
    (Number(cut.parcial?.grade) || 0) * ((Number(cut.parcial?.weight) || 0) / 100);
  const total = activitiesSum + parcialContribution + (Number(cut.bonus) || 0);

  const hasAnyGrade =
    (cut.activities || []).some((a) => Number(a.grade) > 0) ||
    Number(cut.parcial?.grade) > 0 ||
    Number(cut.bonus) > 0;

  if (!hasAnyGrade) return null;
  return Math.min(5.0, total);
};

export default function StatsView({
  semester,
  subjects = [],
  summary = { cuts: [null, null, null], current: 0 },
  cuts = [
    { label: "C1", weight: 30 },
    { label: "C2", weight: 30 },
    { label: "C3", weight: 40 },
  ],
}) {
  const sorted = [...subjects].sort((a, b) => (Number(b.current) || 0) - (Number(a.current) || 0));
  const summaryCurrent = Number(summary?.current) || 0;
  const summaryCuts = Array.isArray(summary?.cuts) ? summary.cuts : [null, null, null];
  const summaryStatus = getGradeStatus(summaryCurrent);

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
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={cuts.length + 4} className="dash-card-sub">
                    Aún no hay asignaturas registradas para mostrar estadísticas.
                  </td>
                </tr>
              ) : (
                sorted.map((s, i) => {
                  const currentVal = Number(s.current) || 0;
                  const status = getGradeStatus(currentVal);
                  const subjectCuts = Array.isArray(s.cuts) ? s.cuts : [null, null, null];

                  return (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>
                        <i className={`fa-solid ${s.icon || "fa-book"} card-icon`}></i>{" "}
                        {s.statsName || s.name}
                      </td>
                      {cuts.map((_, idx) => (
                        <td key={subjectCuts[idx]?.id || idx}>
                          {fmt(getCutGrade(subjectCuts[idx]))}
                        </td>
                      ))}
                      <td>
                        <span className={`subject-grade-badge ${status.colorClass}`}>
                          {fmt(currentVal)}
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
                    {fmt(summaryCurrent, 2)}
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