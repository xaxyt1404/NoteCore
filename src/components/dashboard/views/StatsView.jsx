import { getGradeStatus } from "../../../utils/gradeHelpers";

const fmt = (value, decimals = 1) => (value == null ? "—" : value.toFixed(decimals));

export default function StatsView({ semester, subjects, summary, cuts }) {
  const sorted = [...subjects].sort((a, b) => b.current - a.current);

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
              {sorted.map((s, i) => {
                const status = getGradeStatus(s.current);
                return (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>
                      <i className={`fa-solid ${s.icon} card-icon`}></i> {s.statsName}
                    </td>
                    {s.cuts.map((c, idx) => (
                      <td key={idx}>
                        {fmt(c)}
                      </td>
                    ))}
                    <td>
                      <span className={`subject-grade-badge ${getGradeStatus(s.current)}`}>{fmt(s.current)}</span>
                    </td>
                    <td>
                      <span className={`subject-grade-badge ${getGradeStatus(s.current)}`}>{s.performance}</span>
                    </td>
                  </tr>
                );
              })}
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
                  <span className={`subject-grade-badge ${getGradeStatus(summary.current)}`}>
                    {fmt(summary.current, 2)}
                  </span>
                </td>
                <td>
                  <span className={`subject-grade-badge ${getGradeStatus(summary.current)}`}>{summary.status}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}


