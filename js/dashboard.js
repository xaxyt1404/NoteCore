/* =============================================
LÓGICA DE INTERFAZ & GRÁFICOS PARA EL DASHBOARD
   ============================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------
     1. NAVEGACIÓN SPA (SIDEBAR LINKS & VIEWS)
     ------------------------------------------ */
  const sidebarLinks = document.querySelectorAll(".sidebar-link[data-view]");
  const dashViews = document.querySelectorAll(".dash-view");

  // Oculta todas las vistas y muestra la indicada
  function showView(viewId) {
    const targetView = document.getElementById(viewId);
    if (!targetView) return false;

    dashViews.forEach((v) => {
      v.classList.remove("active");
      v.classList.add("d-none");
    });

    targetView.classList.remove("d-none");
    targetView.classList.add("active");
    return true;
  }

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      if (!showView(link.getAttribute("data-view"))) return;

      // Activar link clicado
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Cerrar sidebar automáticamente en pantallas pequeñas
      if (window.innerWidth <= 1024) {
        closeMobileSidebar();
      }
    });
  });

  // Enlaces internos que también cambian de vista (p. ej. "Ver todas" en Inicio)
  document
    .querySelectorAll("[data-view]:not(.sidebar-link)")
    .forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        showView(link.getAttribute("data-view"));
      });
    });

  /* ------------------------------------------
     2. CONTROL DE SIDEBAR MÓVIL (DRAWER)
     ------------------------------------------ */
  const menuToggleBtn = document.getElementById("menuToggle");
  const closeSidebarBtn = document.getElementById("closeSidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebar = document.getElementById("sidebar");

  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add("active");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
    if (menuToggleBtn) menuToggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    if (menuToggleBtn) menuToggleBtn.setAttribute("aria-expanded", "false");
  }

  if (menuToggleBtn) menuToggleBtn.addEventListener("click", openMobileSidebar);
  if (closeSidebarBtn)
    closeSidebarBtn.addEventListener("click", closeMobileSidebar);
  if (sidebarOverlay)
    sidebarOverlay.addEventListener("click", closeMobileSidebar);

  /* ------------------------------------------
     3. DROPDOWNS PERSONALIZADOS
     ------------------------------------------ */
  const customDropdowns = document.querySelectorAll(".custom-dropdown");

  customDropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".dropdown-trigger");
    const selectedText = dropdown.querySelector(".dropdown-selected-text");
    const items = dropdown.querySelectorAll(".dropdown-item");

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        // Cerrar otros dropdowns abiertos
        customDropdowns.forEach((d) => {
          if (d !== dropdown) d.classList.remove("active");
        });
        dropdown.classList.toggle("active");
        trigger.setAttribute(
          "aria-expanded",
          dropdown.classList.contains("active"),
        );
      });
    }

    items.forEach((item) => {
      item.addEventListener("click", () => {
        items.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        if (selectedText) {
          selectedText.textContent = item.textContent.trim();
        }

        dropdown.classList.remove("active");
        if (trigger) trigger.setAttribute("aria-expanded", "false");

        // Disparar evento personalizado por si se desea cambiar los datos del gráfico
        const val = item.getAttribute("data-value");
        dropdown.dispatchEvent(
          new CustomEvent("changeValue", { detail: { value: val } }),
        );
      });
    });
  });

  // Cerrar dropdowns si se hace clic afuera
  document.addEventListener("click", () => {
    customDropdowns.forEach((d) => d.classList.remove("active"));
  });

  /* ------------------------------------------
     4. DRAWER FLOTANTE DE CoreAI CHAT
     ------------------------------------------ */
  const openAiChatBtn = document.getElementById("openAiChatBtn");
  const closeAiChatBtn = document.getElementById("closeAiChatBtn");
  const aiChatDrawer = document.getElementById("aiChatDrawer");

  function toggleAiChat() {
    if (!aiChatDrawer) return;
    const isActive = aiChatDrawer.classList.toggle("active");
    if (openAiChatBtn) {
      openAiChatBtn.setAttribute("aria-expanded", isActive);
    }
  }

  if (openAiChatBtn) openAiChatBtn.addEventListener("click", toggleAiChat);
  if (closeAiChatBtn) closeAiChatBtn.addEventListener("click", toggleAiChat);

  /* ------------------------------------------
     5. INICIALIZACIÓN DE GRÁFICOS (CHART.JS)
     ------------------------------------------ */
  let chartRendimientoInstance = null;
  let chartEstadoInstance = null;

  function isDarkMode() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function getChartColors() {
    const dark = isDarkMode();
    return {
      textColor: dark ? "#94a3b8" : "#64748b",
      borderColor: dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
      primaryBlue: "#00a3ff",
    };
  }

  // --- Gráfico 1: Rendimiento Académico (Línea) ---
  function initChartRendimiento() {
    const canvas = document.getElementById("chartRendimiento");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    const colors = getChartColors();

    // Crear degradado azul bajo la línea
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(0, 163, 255, 0.3)");
    gradient.addColorStop(1, "rgba(0, 163, 255, 0.0)");

    chartRendimientoInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Corte 1", "Corte 2", "Corte 3", "Actual"],
        datasets: [
          {
            label: "Promedio",
            data: [3.8, 4.0, 3.9, 4.1],
            borderColor: colors.primaryBlue,
            borderWidth: 3,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: colors.primaryBlue,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradient,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDarkMode() ? "#0f172a" : "#ffffff",
            titleColor: isDarkMode() ? "#f8fafc" : "#0f172a",
            bodyColor: colors.primaryBlue,
            borderColor: colors.borderColor,
            borderWidth: 1,
            padding: 10,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "Inter", size: 11, weight: "600" },
            },
          },
          y: {
            min: 1.0,
            max: 5.0,
            grid: { color: colors.borderColor },
            ticks: {
              stepSize: 0.5,
              color: colors.textColor,
              font: { family: "Inter", size: 11, weight: "600" },
            },
          },
        },
      },
    });
  }

  // --- Gráfico 2: Estado Académico (Dona) ---
  function initChartEstado() {
    const canvas = document.getElementById("chartEstado");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");

    chartEstadoInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Excelente", "Bueno", "Regular", "En riesgo"],
        datasets: [
          {
            data: [4, 1, 0, 1],
            backgroundColor: [
              "#10b981", // Excelente (Verde)
              "#00a3ff", // Bueno (Azul)
              "#f59e0b", // Regular (Amarillo)
              "#ef4444", // En riesgo (Rojo)
            ],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: "80%",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            padding: 8,
          },
        },
      },
    });
  }

  // Inicializar ambos gráficos
  initChartRendimiento();
  initChartEstado();

  /* ------------------------------------------
     6. ACTUALIZAR COLORES DE GRÁFICOS AL CAMBIAR TEMA
     ------------------------------------------ */
  const observer = new MutationObserver(() => {
    if (chartRendimientoInstance) {
      const colors = getChartColors();
      chartRendimientoInstance.options.scales.x.ticks.color = colors.textColor;
      chartRendimientoInstance.options.scales.y.ticks.color = colors.textColor;
      chartRendimientoInstance.options.scales.y.grid.color = colors.borderColor;
      chartRendimientoInstance.update();
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  /* ------------------------------------------
     POPOVERS DE HEADER & MODAL DE PERFIL
     ------------------------------------------ */
  const notifMenuBtn = document.getElementById("notifMenuBtn");
  const notifPopover = document.getElementById("notifPopover");
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userPopover = document.getElementById("userPopover");
  const themeMenu = document.getElementById("theme-menu");

  const openProfileModalBtn = document.getElementById("openProfileModalBtn");
  const closeProfileModalBtn = document.getElementById("closeProfileModalBtn");
  const toggleEditProfileBtn = document.getElementById("toggleEditProfileBtn");
  const avatarEditBtn = document.getElementById("avatarEditBtn");
  const profileModal = document.getElementById("profileModal");
  const profileInputs = document.querySelectorAll("#profileForm input");

  let isEditingProfile = false;

  // Alternar Popovers del Header (Notificaciones / Perfil)
  function togglePopover(btn, popover) {
    if (!btn || !popover) return;
    const isActive = popover.classList.contains("active");

    // Cerrar ambos popovers antes de abrir uno nuevo
    if (notifPopover) notifPopover.classList.remove("active");
    if (userPopover) userPopover.classList.remove("active");
    if (themeMenu) themeMenu.classList.remove("active");

    if (!isActive) {
      popover.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
    } else {
      btn.setAttribute("aria-expanded", "false");
    }
  }

  if (notifMenuBtn) {
    notifMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePopover(notifMenuBtn, notifPopover);
    });
  }

  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePopover(userMenuBtn, userPopover);
    });
  }

  // Control de Modos (Solo Lectura / Edición)
  function setProfileMode(editing) {
    isEditingProfile = editing;
    profileInputs.forEach((input) => {
      if (editing) {
        input.removeAttribute("readonly");
      } else {
        input.setAttribute("readonly", "true");
      }
    });

    if (avatarEditBtn) {
      if (editing) avatarEditBtn.classList.remove("d-none");
      else avatarEditBtn.classList.add("d-none");
    }

    if (toggleEditProfileBtn) {
      if (editing) {
        toggleEditProfileBtn.innerHTML =
          '<i class="fa-solid fa-floppy-disk icon-left"></i> Guardar cambios';
        toggleEditProfileBtn.classList.remove("btn-outline");
        toggleEditProfileBtn.classList.add("btn-primary");
      } else {
        toggleEditProfileBtn.innerHTML =
          '<i class="fa-solid fa-pen-to-square icon-left"></i> Editar perfil';
        toggleEditProfileBtn.classList.remove("btn-primary");
        toggleEditProfileBtn.classList.add("btn-outline");
      }
    }
  }

  // Abrir / Cerrar Modal de Perfil
  function openProfileModal() {
    if (userPopover) userPopover.classList.remove("active");
    setProfileMode(false); // Siempre abre en modo lectura
    if (profileModal) {
      profileModal.classList.add("active");
      document.documentElement.classList.add("modal-open"); // Bloquea el scroll del elemento html
      document.body.classList.add("modal-open");
    }
  }

  function closeProfileModal() {
    if (profileModal) {
      profileModal.classList.remove("active");
      document.documentElement.classList.remove("modal-open"); // Reactiva el scroll del elemento html
      document.body.classList.remove("modal-open");
      setProfileMode(false);
    }
  }

  if (openProfileModalBtn)
    openProfileModalBtn.addEventListener("click", openProfileModal);
  if (closeProfileModalBtn)
    closeProfileModalBtn.addEventListener("click", closeProfileModal);

  if (toggleEditProfileBtn) {
    toggleEditProfileBtn.addEventListener("click", () => {
      if (!isEditingProfile) {
        setProfileMode(true);
      } else {
        // Guardar cambios y regresar a modo lectura
        setProfileMode(false);
      }
    });
  }

  // Prevenir cierre de modal con la tecla Escape
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      profileModal &&
      profileModal.classList.contains("active")
    ) {
      e.stopPropagation();
    }
  });

  // Cerrar unicamente los popovers del header al hacer clic afuera (La modal no se cierra afuera)
  document.addEventListener("click", () => {
    if (notifPopover) notifPopover.classList.remove("active");
    if (userPopover) userPopover.classList.remove("active");
  });

  /* ------------------------------------------
     7. LÓGICA DE HERRAMIENTAS ACADÉMICAS & MODALES
     ------------------------------------------ */
  function lockScroll() {
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
  }

  function unlockScroll() {
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
  }

  // --- Modal 1: Calculadora de Nota Sencilla ---
  const openCalcSencillaBtn = document.getElementById("openCalcSencillaBtn");
  const closeSimpleCalcBtn = document.getElementById("closeSimpleCalcBtn");
  const modalCalcSencilla = document.getElementById("modalCalcSencilla");
  const resetSimpleCalcBtn = document.getElementById("resetSimpleCalcBtn");
  const btnModeSimple = document.getElementById("btnModeSimple");
  const btnModeWeighted = document.getElementById("btnModeWeighted");
  const simpleCalcRows = document.getElementById("simpleCalcRows");

  let isWeightedMode = false;

  function openModalSencilla() {
    if (modalCalcSencilla) {
      modalCalcSencilla.classList.add("active");
      lockScroll();
      calculateSimpleScore();
    }
  }

  function closeModalSencilla() {
    if (modalCalcSencilla) {
      modalCalcSencilla.classList.remove("active");
      unlockScroll();
    }
  }

  if (openCalcSencillaBtn)
    openCalcSencillaBtn.addEventListener("click", openModalSencilla);
  if (closeSimpleCalcBtn)
    closeSimpleCalcBtn.addEventListener("click", closeModalSencilla);

  if (btnModeSimple && btnModeWeighted) {
    btnModeSimple.addEventListener("click", () => {
      isWeightedMode = false;
      btnModeSimple.classList.add("active");
      btnModeWeighted.classList.remove("active");
      document
        .querySelectorAll(".row-weight-group")
        .forEach((el) => el.classList.add("d-none"));
      calculateSimpleScore();
    });

    btnModeWeighted.addEventListener("click", () => {
      isWeightedMode = true;
      btnModeWeighted.classList.add("active");
      btnModeSimple.classList.remove("active");
      document
        .querySelectorAll(".row-weight-group")
        .forEach((el) => el.classList.remove("d-none"));
      calculateSimpleScore();
    });
  }

  function calculateSimpleScore() {
    if (!simpleCalcRows) return;
    const rows = simpleCalcRows.querySelectorAll(".form-grid");
    let totalScore = 0;
    let validCount = 0;

    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const grade = parseFloat(inputs[1]?.value) || 0;

      if (isWeightedMode) {
        const weight = parseFloat(inputs[2]?.value) || 0;
        totalScore += grade * (weight / 100);
      } else {
        totalScore += grade;
        validCount++;
      }
    });

    const resultVal = modalCalcSencilla?.querySelector(".result-value");
    if (resultVal) {
      if (isWeightedMode) {
        resultVal.textContent = totalScore.toFixed(2);
      } else {
        const finalAvg = validCount > 0 ? totalScore / validCount : 0;
        resultVal.textContent = finalAvg.toFixed(2);
      }
    }
  }

  if (simpleCalcRows) {
    simpleCalcRows.addEventListener("input", calculateSimpleScore);
  }

  if (resetSimpleCalcBtn) {
    resetSimpleCalcBtn.addEventListener("click", () => {
      if (simpleCalcRows) {
        simpleCalcRows.querySelectorAll("input").forEach((input) => {
          if (input.type === "number") input.value = "";
        });
        calculateSimpleScore();
      }
    });
  }

  // --- Modal 2: Calculadora para un Corte ---
  const openCalcCorteBtn = document.getElementById("openCalcCorteBtn");
  const closeCalcCorteBtn = document.getElementById("closeCalcCorteBtn");
  const modalCalcCorte = document.getElementById("modalCalcCorte");
  const corteWeightInput = document.getElementById("corteWeightInput");
  const bonusPointsInput = document.getElementById("bonusPointsInput");
  const corteEvalRows = document.getElementById("corteEvalRows");

  function openModalCorte() {
    if (modalCalcCorte) {
      modalCalcCorte.classList.add("active");
      lockScroll();
      calculateCorteScore();
    }
  }

  function closeModalCorte() {
    if (modalCalcCorte) {
      modalCalcCorte.classList.remove("active");
      unlockScroll();
    }
  }

  if (openCalcCorteBtn)
    openCalcCorteBtn.addEventListener("click", openModalCorte);
  if (closeCalcCorteBtn)
    closeCalcCorteBtn.addEventListener("click", closeModalCorte);

  function calculateCorteScore() {
    if (!modalCalcCorte) return;
    const cortePct = (parseFloat(corteWeightInput?.value) || 30) / 100;
    const bonus = parseFloat(bonusPointsInput?.value) || 0;

    let corteGrade = 0;
    if (corteEvalRows) {
      const rows = corteEvalRows.querySelectorAll(".form-grid");
      rows.forEach((row) => {
        const inputs = row.querySelectorAll("input");
        const grade = parseFloat(inputs[1]?.value) || 0;
        const weightPct = (parseFloat(inputs[2]?.value) || 0) / 100;
        corteGrade += grade * weightPct;
      });
    }

    corteGrade = Math.min(5.0, corteGrade + bonus);
    const contribution = (corteGrade * cortePct).toFixed(2);

    const resultVal = modalCalcCorte.querySelector(".result-value");
    const resultSub = modalCalcCorte.querySelector(".result-subtext strong");

    if (resultVal) resultVal.textContent = corteGrade.toFixed(2);
    if (resultSub) resultSub.textContent = `${contribution} puntos`;
  }

  if (modalCalcCorte) {
    modalCalcCorte.addEventListener("input", calculateCorteScore);
  }

  // --- Modal 3: Simulador de Asignatura Completa ---
  const openCalcAsignaturaBtn = document.getElementById(
    "openCalcAsignaturaBtn",
  );
  const closeCalcAsignaturaBtn = document.getElementById(
    "closeCalcAsignaturaBtn",
  );
  const modalCalcAsignatura = document.getElementById("modalCalcAsignatura");
  const c1GradeInput = document.getElementById("c1GradeInput");
  const c2GradeInput = document.getElementById("c2GradeInput");

  function openModalAsignatura() {
    if (modalCalcAsignatura) {
      modalCalcAsignatura.classList.add("active");
      lockScroll();
      calculateAsignaturaScore();
    }
  }

  function closeModalAsignatura() {
    if (modalCalcAsignatura) {
      modalCalcAsignatura.classList.remove("active");
      unlockScroll();
    }
  }

  if (openCalcAsignaturaBtn)
    openCalcAsignaturaBtn.addEventListener("click", openModalAsignatura);
  if (closeCalcAsignaturaBtn)
    closeCalcAsignaturaBtn.addEventListener("click", closeModalAsignatura);

  function calculateAsignaturaScore() {
    if (!modalCalcAsignatura) return;
    const c1 = parseFloat(c1GradeInput?.value) || 0;
    const c2 = parseFloat(c2GradeInput?.value) || 0;

    // Fórmula para esquema 30% - 30% - 40% (aprobar en 3.0):
    // 3.0 - (c1*0.3 + c2*0.3) = c3 * 0.4
    const neededC3 = (3.0 - (c1 * 0.3 + c2 * 0.3)) / 0.4;
    const resultVal = modalCalcAsignatura.querySelector(".result-value");

    if (resultVal) {
      if (neededC3 <= 0) {
        resultVal.textContent = "0.0 (Aprobada)";
        resultVal.style.color = "var(--success)";
      } else if (neededC3 > 5.0) {
        resultVal.textContent = "> 5.0 (Inalcanzable)";
        resultVal.style.color = "#ef4444";
      } else {
        resultVal.textContent = neededC3.toFixed(2);
        resultVal.style.color = "var(--primary)";
      }
    }
  }

  if (modalCalcAsignatura) {
    modalCalcAsignatura.addEventListener("input", calculateAsignaturaScore);
  }
});
