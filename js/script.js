/* ==========================================
   SCRIPT.JS
   Script principal del landing NoteCore.
   Incluye: navbar, sidebar, contacto por WhatsApp, modal de simulación con Sliders
   ========================================== */

// Constantes globales
const WHATSAPP_PHONE = "573053924821";
const TARGET_GRADE = 3.0;
let calculatedCorte1Grade = 0.0;
let savedScrollPosition = 0;

// Helper para dar formato con coma colombiana (ej: 4.2 -> "4,2")
function formatGrade(val) {
  return val.toFixed(1).replace(".", ",");
}

function formatGradePrecise(val) {
  return val.toFixed(2).replace(".", ",");
}

// Determinar la clase de color según la exigencia de la nota
function getGradeColorClass(grade) {
  if (grade <= 4.0) return "text-success";
  if (grade <= 4.5) return "text-warning";
  return "text-danger"; // Para > 4.5 e inalcanzables (> 5.0)
}

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // NAVEGACIÓN Y SIDEBAR
  // ==========================================
  const menuToggle = document.getElementById("menuToggle");
  const closeSidebar = document.getElementById("closeSidebar");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  const openMenu = () => {
    sidebar?.classList.add("active");
    sidebarOverlay?.classList.add("active");
  };

  const closeMenu = () => {
    sidebar?.classList.remove("active");
    sidebarOverlay?.classList.remove("active");
  };

  if (menuToggle) menuToggle.addEventListener("click", openMenu);
  if (closeSidebar) closeSidebar.addEventListener("click", closeMenu);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeMenu);

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          closeMenu();
          setTimeout(() => {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 150);
        }
      }
    });
  });

  // ===================================
  // LIST SLIDERS DEL SLIDERS DEL MODAL
  // ===================================
  ["tallerInput", "quizInput", "bonusInput"].forEach((id) => {
    const slider = document.getElementById(id);
    if (!slider) return;
    slider.addEventListener("input", () => updateSliderA(slider));
  });

  const corte1Input = document.getElementById("corte1Input");
  if (corte1Input) {
    corte1Input.addEventListener("input", () => updateSliderB(corte1Input));
  }
});

// ======================
// CONSULTA POR WHATSAPP
// ======================
function sendToWhatsApp(event) {
  event.preventDefault();

  const nameInput = document.getElementById("ws-name");
  const messageInput = document.getElementById("ws-message");

  const name = nameInput ? nameInput.value.trim() : "";
  const message = messageInput ? messageInput.value.trim() : "";

  if (!name || !message) return;

  const text = `Hola, mi nombre es ${name}. ${message}`;
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

  window.open(whatsappUrl, "_blank");
  event.target.reset();
}

// ==============================
// LÓGICA Y MODAL DE SIMULACIÓN
// ==============================
const simulationModal = () => document.getElementById("simulationModal");

function openSimulationModal() {
  const modal = simulationModal();
  if (modal) {
    savedScrollPosition = window.scrollY || document.documentElement.scrollTop;
    modal.classList.add("active");
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    calculateOptionA();
  }
}

function closeSimulationModal() {
  const modal = simulationModal();
  if (modal) {
    modal.classList.remove("active");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");

    window.scrollTo(0, savedScrollPosition);

    // Reiniciar Sliders de Opción A a 0
    resetSlider("tallerInput", "tallerVal");
    resetSlider("quizInput", "quizVal");
    resetSlider("bonusInput", "bonusVal");

    // Reiniciar Slider Opción B a 0
    resetSlider("corte1Input", "corte1Val");

    calculatedCorte1Grade = 0.0;

    const modalBody = modal.querySelector(".modal-body");
    if (modalBody) modalBody.scrollTop = 0;

    switchSimTab("A");
  }
}

function resetSlider(inputId, valId) {
  const input = document.getElementById(inputId);
  const valSpan = document.getElementById(valId);
  if (input) input.value = 0;
  if (valSpan) valSpan.textContent = "0,0";
}

function updateSliderA(slider) {
  const valId = slider.id.replace("Input", "Val");
  const valSpan = document.getElementById(valId);
  const numVal = parseFloat(slider.value) || 0;

  if (valSpan) valSpan.textContent = formatGrade(numVal);
  calculateOptionA();
}

function updateSliderB(slider) {
  const valSpan = document.getElementById("corte1Val");
  const numVal = parseFloat(slider.value) || 0;

  if (valSpan) valSpan.textContent = formatGrade(numVal);
  calculatedCorte1Grade = numVal;
  calculateOptionB();
}

// Cambio de Pestañas
function switchSimTab(tab) {
  const btnA = document.getElementById("tabOptionA");
  const btnB = document.getElementById("tabOptionB");
  const contentA = document.getElementById("contentOptionA");
  const contentB = document.getElementById("contentOptionB");

  if (tab === "A") {
    btnA?.classList.add("active");
    btnB?.classList.remove("active");
    contentA?.classList.remove("d-none");
    contentB?.classList.add("d-none");
    calculateOptionA();
  } else {
    btnB?.classList.add("active");
    btnA?.classList.remove("active");
    contentB?.classList.remove("d-none");
    contentA?.classList.add("d-none");
    calculateOptionB();
  }
}

// OPCIÓN A: Cálculo Nota Requerida en Parcial (Corte 1 - 30%)
function calculateOptionA() {
  const tallerElem = document.getElementById("tallerInput");
  const quizElem = document.getElementById("quizInput");
  const bonusElem = document.getElementById("bonusInput");

  const taller = parseFloat(tallerElem?.value) || 0;
  const quiz = parseFloat(quizElem?.value) || 0;
  const bonus = parseFloat(bonusElem?.value) || 0;

  const resultDisplay = document.getElementById("parcialNeededResult");
  const aiFeedback = document.getElementById("coreAIFeedbackText");

  if (!resultDisplay || !aiFeedback) return;

  // Limpiar clases previas de color en el resultado
  resultDisplay.className = "result-value";

  // CASO 0: Estado inicial (todos en 0)
  if (taller === 0 && quiz === 0 && bonus === 0) {
    resultDisplay.textContent = "5,00";
    resultDisplay.classList.add("text-danger"); // > 4.5 es rojo
    calculatedCorte1Grade = 0.0;
    aiFeedback.innerHTML = `🤖 <strong>CoreAI:</strong> Mueve los controles de Taller, Quiz y Puntos de clase para calcular cuánto necesitas exactamente en el Parcial del Corte 1.`;
    return;
  }

  // Fórmula para el Parcial (50% del corte)
  const parcialNeeded =
    (TARGET_GRADE - taller * 0.3 - quiz * 0.2 - bonus) / 0.5;
  let finalParcial = Math.max(0, parcialNeeded);

  // Asignar clase de color según el valor
  resultDisplay.classList.add(getGradeColorClass(parcialNeeded));

  if (parcialNeeded > 5.0) {
    resultDisplay.textContent = "> 5,0";
    calculatedCorte1Grade = Math.min(
      5.0,
      taller * 0.3 + quiz * 0.2 + 2.5 + bonus,
    );

    aiFeedback.innerHTML = `⚠️ <strong>CoreAI:</strong> Matemáticamente necesitarías un <strong>${formatGrade(parcialNeeded)}</strong> en el parcial para llegar a 3,0. Si sacas 5,0, tu Corte 1 cerrará en <strong>${formatGradePrecise(calculatedCorte1Grade)}</strong>. ¡Tranquilo, aún quedan el Corte 2 y 3!`;
  } else if (parcialNeeded > 4.0) {
    resultDisplay.textContent = formatGradePrecise(finalParcial);
    calculatedCorte1Grade = TARGET_GRADE;

    aiFeedback.innerHTML = `🔥 <strong>CoreAI:</strong> ¡A apretar el acelerador! Necesitas un <strong>${formatGradePrecise(finalParcial)}</strong> en el parcial. Con los puntos adicionales amortiguaste bastante, pero requiere estudio enfocado.`;
  } else if (parcialNeeded > 0) {
    resultDisplay.textContent = formatGradePrecise(finalParcial);
    calculatedCorte1Grade = TARGET_GRADE;

    aiFeedback.innerHTML = `📈 <strong>CoreAI:</strong> Panorama muy alcanzable. Sacando un <strong>${formatGradePrecise(finalParcial)}</strong> en el parcial aseguras el 3,0 del Corte 1. ¡Un repaso de los temas claves y lo tienes!`;
  } else {
    calculatedCorte1Grade = Math.min(5.0, taller * 0.3 + quiz * 0.2 + bonus);
    resultDisplay.textContent = "0,00";

    aiFeedback.innerHTML = `🎉 <strong>CoreAI:</strong> ¡Ya aseguraste el corte! Con tus notas actuales y bonos sumas <strong>${formatGradePrecise(calculatedCorte1Grade)}</strong> en el Corte 1 sin depender del examen parcial.`;
  }
}

// OPCIÓN B: 5 Escenarios Conectados
function calculateOptionB() {
  const scenariosContainer = document.getElementById("scenariosContainer");
  const aiFeedback = document.getElementById("coreAIFeedbackText");
  const c1SummaryText = document.getElementById("c1SummaryText");
  const c1Input = document.getElementById("corte1Input");

  if (!scenariosContainer || !aiFeedback || !c1SummaryText) return;

  if (c1Input && parseFloat(c1Input.value) === 0 && calculatedCorte1Grade > 0) {
    c1Input.value = calculatedCorte1Grade.toFixed(1);
    const c1ValSpan = document.getElementById("corte1Val");
    if (c1ValSpan) c1ValSpan.textContent = formatGrade(calculatedCorte1Grade);
  }

  const c1Val =
    parseFloat(c1Input ? c1Input.value : 0) || calculatedCorte1Grade;
  const c1Contribution = c1Val * 0.3;
  const pendingNeeded = Math.max(0, TARGET_GRADE - c1Contribution);

  if (c1Val === 0) {
    c1SummaryText.innerHTML = `Mueve el control arriba para definir la nota del Corte 1 (o simúlala en la Opción A). Necesitando el <strong>3,0 completo</strong> en los cortes restantes:`;
  } else {
    c1SummaryText.innerHTML = `Con tu Corte 1 en <strong>${formatGradePrecise(c1Val)}</strong> (aporta ${formatGradePrecise(c1Contribution)} a la nota final), necesitas acumular <strong>${formatGradePrecise(pendingNeeded)}</strong> puntos ponderados entre el Corte 2 (30%) y Corte 3 (40%) para aprobar en <strong>3,0</strong>:`;
  }

  const baseC2List = [3.0, 2.0, 4.0, 2.5, 4.5];
  scenariosContainer.innerHTML = baseC2List
    .map((c2Val, idx) => {
      const neededC3 = (pendingNeeded - c2Val * 0.3) / 0.4;
      const c3Text =
        neededC3 <= 0
          ? "0,0 (Ganas la materia)"
          : neededC3 > 5.0
            ? "> 5,0 (Inalcanzable)"
            : formatGradePrecise(neededC3);

      const c3ColorClass = getGradeColorClass(neededC3);

      return `
      <div class="scenario-card">
        <strong>Escenario ${idx + 1}</strong>
        <span>C2 (30%): ${formatGrade(c2Val)}</span><br>
        <span class="${c3ColorClass}">C3 (40%): ${c3Text}</span>
      </div>
    `;
    })
    .join("");

  if (c1Val === 0) {
    aiFeedback.innerHTML = `🤖 <strong>CoreAI:</strong> Selecciona tu nota del Corte 1. Si no sumas puntos en este corte, necesitarás un promedio sostenido de <strong>4,3</strong> entre el Corte 2 y 3.`;
  } else if (c1Val < 2.0) {
    aiFeedback.innerHTML = `⚠️ <strong>CoreAI:</strong> Un Corte 1 en <strong>${formatGradePrecise(c1Val)}</strong> exige recuperar terreno. Apunta a sacar al menos <strong>4,0 en el Corte 2</strong> para evitar depender de una nota perfecta al final.`;
  } else if (c1Val < 3.0) {
    aiFeedback.innerHTML = `📊 <strong>CoreAI:</strong> Quedaste muy cerca del mínimo con un <strong>${formatGradePrecise(c1Val)}</strong>. Subiendo levemente tu promedio a <strong>3,3</strong> en los dos cortes restantes apruebas la asignatura.`;
  } else if (c1Val < 4.2) {
    aiFeedback.innerHTML = `🤖 <strong>CoreAI:</strong> ¡Vas por buen camino! Con un <strong>${formatGradePrecise(c1Val)}</strong> en el primer corte, mantener un promedio de <strong>3,0</strong> en lo que resta te asegura ganar la materia.`;
  } else {
    aiFeedback.innerHTML = `🚀 <strong>CoreAI:</strong> ¡Excelente nota de primer corte (<strong>${formatGradePrecise(c1Val)}</strong>)! Tienes un gran colchón de puntos acumulados.`;
  }
}
