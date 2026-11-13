import { useEffect, useMemo, useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import CustomDropdown from "../../common/CustomDropdown";
import { getGradeStatus } from "../../../utils/gradeHelpers";

ChartJS.register(ArcElement, CategoryScale, Filler, LinearScale, LineElement, PointElement, Tooltip);

const readVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const readColors = () => ({
  primary: readVar("--primary"),
  excelent: readVar("--excelent"),
  success: readVar("--success"),
  warning: readVar("--warning"),
  danger: readVar("--danger"),
  textColor: readVar("--text-muted"),
  borderColor: readVar("--border-color"),
  bgCard: readVar("--bg-card"),
  bgTooltip: readVar("--bg-tooltip"),
  textTooltip: readVar("--text-tooltip"),
});

// Sincroniza los colores del gráfico con las variables CSS del tema activo
function useChartColors() {
  const [colors, setColors] = useState(readColors);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}

const hexToRgba = (hex, alpha) => {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return "transparent";
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const tickFont = { family: "Inter", size: 11, weight: "600" };

const LEGEND_COLOR_CLASS = {
  excelente: "text-excelent",
  bueno: "text-success",
  regular: "text-warning",
  "en-riesgo": "text-danger",
};

export default function HomeView({
  user,
  semester,
  kpis,
  subjects,
  attentionIds,
  estadoChart,
  rendimientoChart,
  recommendation,
  onNavigate,
  onOpenSubjectDetail,
}) {
  const colors = useChartColors();
  const [mode, setMode] = useState(rendimientoChart.options[0].value);

  const attention = attentionIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter(Boolean);

  const hasAttention = attention.length > 0;

  const lineData = useMemo(
    () => ({
      labels: rendimientoChart.labels,
      datasets: [
        {
          label: "Promedio",
          data: rendimientoChart.data,
          borderColor: colors.primary,
          borderWidth: 3,
          pointBackgroundColor: colors.bgCard,
          pointBorderColor: colors.primary,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return undefined;
            const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, hexToRgba(colors.primary, 0.35));
            g.addColorStop(1, hexToRgba(colors.primary, 0));
            return g;
          },
        },
      ],
    }),
    [colors, rendimientoChart],
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.bgTooltip,
          titleColor: colors.textTooltip,
          bodyColor: colors.primary,
          borderColor: colors.borderColor,
          borderWidth: 1,
          padding: 10,
          displayColors: false,
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.textColor, font: tickFont } },
        y: {
          min: 0,
          max: 5.0,
          grid: { color: colors.borderColor },
          ticks: { stepSize: 0.5, color: colors.textColor, font: tickFont },
        },
      },
    }),
    [colors],
  );

  const donutData = useMemo(
    () => ({
      labels: estadoChart.labels,
      datasets: [
        {
          data: estadoChart.data,
          backgroundColor: [colors.excelent, colors.success, colors.warning, colors.danger],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    }),
    [colors, estadoChart],
  );

  const donutOptions = {
    cutout: "80%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true, padding: 8 } },
  };

  const goTo = (e, id) => {
    e.preventDefault();
    onNavigate?.(id);
  };

  return (
    <section id="view-inicio" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>Hola, {user.greetingName} 👋</h1>
          <p>Este es el resumen de tu progreso académico.</p>
        </div>
        <button type="button" className="btn btn-outline semester-selector-btn">
          <i className="fa-regular fa-calendar icon-left"></i>
          <span>{semester}</span>
          <i className="fa-solid fa-chevron-down semester-chevron" aria-hidden="true"></i>
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box blue">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Promedio general</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{kpis.average.toFixed(1)}</span>
              <span className="kpi-max">/ {kpis.maxGrade.toFixed(1)}</span>
            </div>
            <span className="kpi-trend positive">
              <i className="fa-solid fa-arrow-up"></i> {kpis.trend}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box blue-alt">
            <i className="fa-solid fa-book-open"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Asignaturas</span>
            <span className="kpi-value">{kpis.totalSubjects}</span>
            <span className="kpi-subtext">
              <strong className="text-success">{kpis.goodStanding} en buen estado</strong> |{" "}
              <strong className="text-warning">{kpis.atRisk} en riesgo</strong>
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box red">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-label">En riesgo</span>
            <span className="kpi-value">{kpis.atRisk}</span>
            <span className="kpi-subtext text-warning">Requiere atención</span>
          </div>
        </div>
      </div>

      {/* Tarjeta unificada: Estado académico + Asignaturas que requieren atención (si existen) */}
      <div className={`dash-card academic-overview-card ${hasAttention ? "has-attention" : "no-attention"}`}>
        <div className="overview-status-col">
          <div className="dash-card-header">
            <div>
              <h3>
                <i className="fa-solid fa-bullseye card-icon"></i> Estado académico
              </h3>
              <p className="dash-card-sub">Vista rápida de tu rendimiento por área</p>
            </div>
          </div>

          <div className={`donut-layout ${hasAttention ? "donut-stacked" : "donut-centered"}`}>
            <div className="donut-chart-box">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="donut-center-info">
                <span className="donut-val">{kpis.average.toFixed(1)}</span>
                <span className="donut-lbl">Promedio</span>
              </div>
            </div>
            <div className={`donut-legend-list ${hasAttention ? "legend-horizontal" : "legend-vertical"}`}>
              {estadoChart.legend.map((item) => {
                const colorClass = LEGEND_COLOR_CLASS[item.key] || "";
                return (
                  <div className="legend-row" key={item.key}>
                    <span className={`legend-dot ${item.key}`}></span>
                    <span className={`legend-name ${colorClass}`}>{item.label}</span>
                    <span className={`legend-count ${colorClass}`}>{item.count}</span>
                    <span className="legend-percent">({item.percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {hasAttention && (
          <div className="overview-attention-col">
            <div className="dash-card-header">
              <div>
                <h3>
                  <i className="fa-solid fa-triangle-exclamation card-icon text-danger"></i> Asignaturas que
                  requieren atención
                </h3>
                <p className="dash-card-sub">Estas asignaturas están en riesgo o cerca del mínimo.</p>
              </div>
              <a href="#view-asignaturas" className="card-link-action" onClick={(e) => goTo(e, "view-asignaturas")}>
                Ver todas <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>

            <div className="attention-subjects-list">
              {attention.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="attention-subject-item"
                  aria-label={`Abrir asignatura ${s.name}`}
                  onClick={() => {
                    onOpenSubjectDetail?.(s);
                  }}
                >
                  <div className="subject-header-row">
                    <span className="subject-name">{s.name}</span>
                    <span className={`subject-grade-badge ${getGradeStatus(s.current).colorClass}`}>
                      Nota actual <strong>{s.current.toFixed(1)}</strong> / 5.0
                    </span>
                    <i className="fa-solid fa-chevron-right arrow-indicator"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h3>
              <i className="fa-solid fa-chart-line card-icon"></i> Rendimiento académico
            </h3>
            <p className="dash-card-sub">Evolución de tu promedio general</p>
          </div>
          <CustomDropdown options={rendimientoChart.options} value={mode} onChange={setMode} />
        </div>
        <div>
          <div className="chart-container">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      <div className="ai-recommendation-card">
        <div className="ai-rec-left">
          <div className="ai-rec-avatar">
            <i className="fa-solid fa-robot"></i>
          </div>
          <div className="ai-rec-text">
            <h3>Recomendación de CoreAI</h3>
            <p>
              <strong>{recommendation.subject}</strong> {recommendation.message}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-primary">
          <i className="fa-solid fa-arrow-right icon-left"></i> Ver sugerencias
        </button>
      </div>
    </section>
  );
}