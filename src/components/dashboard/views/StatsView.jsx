import { getGradeStatus } from "../../../utils/gradeHelpers";

const fmt = (value, decimals = 1) => (value == null ? "—" : Number(value).toFixed(decimals));

// Calcula la nota de un corte a partir de su objeto (actividades + parcial + bono)
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
    (cut.activities || []).some((a) => a.grade > 0 || a.locked) ||
    cut.parcial?.grade > 0 ||
    cut.parcial?.locked ||
    cut.bonus > 0;

  if (!hasAnyGrade) return null;
  return Math.min(5.0, total);
};

export default function StatsView({ semester, subjects = [], summary, cuts }) {
  const sorted = [...subjects].sort((a, b) => b.current - a.current);
  const summaryStatus = getGradeStatus(summary.current);

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
                  const status = getGradeStatus(s.current);
                  return (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>
                        <i className={`fa-solid ${s.icon} card-icon`}></i> {s.statsName}
                      </td>
                      {s.cuts.map((c, idx) => (
                        <td key={c.id || idx}>
                          {fmt(getCutGrade(c))}
                        </td>
                      ))}
                      <td>
                        <span className={`subject-grade-badge ${status.colorClass}`}>{fmt(s.current)}</span>
                      </td>
                      <td>
                        <span className={`subject-grade-badge ${status.colorClass}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={2}>
                  PROMEDIO GENERAL
                </td>
                {summary.cuts.map((c, idx) => (
                  <td key={idx}>
                    {fmt(c, 2)}
                  </td>
                ))}
                <td>
                  <span className={`subject-grade-badge ${summaryStatus.colorClass}`}>
                    {fmt(summary.current, 2)}
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