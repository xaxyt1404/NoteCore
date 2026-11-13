import { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import CustomDropdown from "../../common/CustomDropdown";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const cssVar = (name, fallback) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
    : fallback;

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
  estadoChart,
  rendimientoChart,
  recommendation,
  onNavigate,
}) {
  const [mode, setMode] = useState("promedio");

  const primary = cssVar("--primary", "#2ab8ff");
  const excelent = cssVar("--excelent", "#29d217");
  const success = cssVar("--success", "#18a87c");
  const warning = cssVar("--warning", "#f5a623");
  const danger = cssVar("--danger", "#e54d4d");
  const textMuted = cssVar("--text-muted", "#8c9ba5");
  const borderColor = cssVar("--border-color", "#2b3744");

  const donutData = {
    labels: estadoChart.labels,
    datasets: [
      {
        data: estadoChart.data,
        backgroundColor: [excelent, success, warning, danger],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "74%",
    plugins: { legend: { display: false } },
  };

  const lineData = {
    labels: rendimientoChart.labels,
    datasets: [
      {
        label: mode === "promedio" ? "Promedio General" : "Por Cortes",
        data: rendimientoChart.data,
        borderColor: primary,
        backgroundColor: "rgba(42, 184, 255, 0.12)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: primary,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        min: 0,
        max: 5.0,
        ticks: { color: textMuted, font: { weight: "600" } },
        grid: { color: borderColor },
      },
      x: {
        ticks: { color: textMuted, font: { weight: "600" } },
        grid: { display: false },
      },
    },
  };

  return (
    <section id="view-inicio" className="dash-view active">
      <div className="view-welcome-bar">
        <div className="welcome-heading">
          <h1>
            Bienvenido, <span className="highlight">{user.greetingName}</span> 👋
          </h1>
          <p>Este es el resumen de tu progreso y desempeño académico actual.</p>
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
            <span className="kpi-label">Promedio acumulado</span>
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

      {/* Tarjeta simplificada: solo Estado académico con dona centrada */}
      <div className="dash-card academic-overview-card no-attention">
        <div className="overview-status-col">
          <div className="dash-card-header">
            <div>
              <h3>
                <i className="fa-solid fa-bullseye card-icon"></i> Estado académico
              </h3>
              <p className="dash-card-sub">Vista rápida de tu rendimiento por ritmo de evaluación</p>
            </div>
          </div>

          <div className="donut-layout donut-centered">
            <div className="donut-chart-box">
              <Doughnut data={donutData} options={donutOptions} />
              <div className="donut-center-info">
                <span className="donut-val">{kpis.average.toFixed(1)}</span>
                <span className="donut-lbl">Acumulado</span>
              </div>
            </div>
            <div className="donut-legend-list legend-vertical">
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
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onNavigate?.("view-herramientas")}
        >
          <i className="fa-solid fa-arrow-right icon-left"></i> Ver sugerencias
        </button>
      </div>
    </section>
  );
}