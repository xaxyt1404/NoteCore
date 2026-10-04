/* ==========================================
   SCRIPT.JS
   Script principal del landing.
   Incluye: navbar, sidebar, contacto por WhatsApp, modal de simulación
   NOTA: la gestión del tema (claro/oscuro/sistema) vive en js/theme.js
   ========================================== */

// Constantes globales
const WHATSAPP_PHONE = '573136297041';
const TARGET_GRADE = 3.0;
let calculatedCorte1Grade = 0.0; // Estado global para conectar la Opción A con la Opción B

// Helper abreviado para document.getElementById
const $ = (id) => document.getElementById(id);

// NOTA: la gestión del tema (claro/oscuro/sistema) vive en js/theme.js
document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // NAVEGACIÓN Y SIDEBAR
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const closeSidebar = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // Abrir sidebar
  const openMenu = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
  };

  // Cerrar sidebar
  const closeMenu = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  };

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (closeSidebar) closeSidebar.addEventListener('click', closeMenu);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMenu);

  // Desplazamiento suave y cierre del menú lateral
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          closeMenu();

          // Un pequeño delay para permitir que la barra se repliegue antes del scroll
          setTimeout(() => {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 150);
        }
      }
    });
  });

  // ==========================================
  // LISTENERS DEL MODAL DE SIMULACIÓN
  // ==========================================
  // Recalcular en vivo al escribir en los inputs de la Opción A
  ['tallerInput', 'quizInput', 'bonusInput'].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    if (id === 'bonusInput') input.max = 2; // los puntos de clase llegan hasta 2.0
    input.addEventListener('input', () => validateAndCalculateA(input));
  });

  // Listener del input numérico de la Opción B
  const corte1Input = document.getElementById('corte1Input');
  corte1Input?.addEventListener('input', () => validateAndCalculateB(corte1Input));
});

// ==========================================
// CONSULTA POR WHATSAPP (ÁMBITO GLOBAL)
// ==========================================
function sendToWhatsApp(event) {
  event.preventDefault();

  const nameInput = document.getElementById('ws-name');
  const messageInput = document.getElementById('ws-message');

  const name = nameInput ? nameInput.value.trim() : '';
  const message = messageInput ? messageInput.value.trim() : '';

  if (!name || !message) return;

  // Texto continuo codificado
  const text = `Hola, mi nombre es ${name}. ${message}`;
  const encodedText = encodeURIComponent(text);

  // URL universal de WhatsApp
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodedText}`;

  // Abre WhatsApp
  window.open(whatsappUrl, '_blank');

  // Limpia el formulario completo
  event.target.reset();
}

// ==========================================
// LÓGICA Y VALIDACIÓN DEL MODAL DE SIMULACIÓN
// ==========================================
const simulationModal = () => document.getElementById('simulationModal');

function openSimulationModal() {
  const modal = simulationModal();
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    calculateOptionA();
  }
}

function closeSimulationModal() {
  const modal = simulationModal();
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');

    // Reiniciar inputs Opción A a 0
    const tallerInput = document.getElementById('tallerInput');
    const quizInput = document.getElementById('quizInput');
    const bonusInput = document.getElementById('bonusInput');

    if (tallerInput) tallerInput.value = 0;
    if (quizInput) quizInput.value = 0;
    if (bonusInput) bonusInput.value = 0;

    // Reiniciar input Opción B a 0
    const corte1Input = document.getElementById('corte1Input');
    if (corte1Input) corte1Input.value = 0;

    // Reiniciar variable global del Corte 1
    calculatedCorte1Grade = 0.0;

    // Volver al inicio del scroll del modal
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;

    // Regresar a la pestaña principal (Opción A) y recalculamos el estado limpio
    switchSimTab('A');
  }
}

// Ajuste rápido de botones (+ / -) en inputs numéricos
function adjustValue(inputId, step) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let val = parseFloat(input.value) || 0;
  val = Math.round((val + step) * 10) / 10; // Redondeo a 1 decimal

  // Respetar min y max
  if (input.min !== "" && val < parseFloat(input.min)) val = parseFloat(input.min);
  if (input.max !== "" && val > parseFloat(input.max)) val = parseFloat(input.max);

  input.value = val;
  // Llama directamente al cálculo según el input ajustado
  if (inputId === 'corte1Input') {
    validateAndCalculateB(input);
  } else {
    validateAndCalculateA(input);
  }
}

// Helper: clamp de valor numérico en un input
function clampInput(input, min, max) {
  let val = parseFloat(input.value);
  if (val > max) input.value = max;
  if (val < min) input.value = min;
  return parseFloat(input.value) || 0;
}

// Validar límites de los Inputs en Opción A (0.0 a 5.0 para notas, 0.0 a 2.0 para puntos)
function validateAndCalculateA(input) {
  const maxVal = input.id === 'bonusInput' ? 2.0 : 5.0;
  clampInput(input, 0, maxVal);
  calculateOptionA();
}

// Validar input de la Opción B (0.0 a 5.0)
function validateAndCalculateB(input) {
  clampInput(input, 0, 5.0);
  // Actualiza la variable global con la nota ingresada manualmente en la Opción B
  calculatedCorte1Grade = parseFloat(input.value) || 0.0;
  calculateOptionB();
}

// Cambio de Pestañas
function switchSimTab(tab) {
  const btnA = document.getElementById('tabOptionA');
  const btnB = document.getElementById('tabOptionB');
  const contentA = document.getElementById('contentOptionA');
  const contentB = document.getElementById('contentOptionB');

  if (tab === 'A') {
    if (btnA) btnA.classList.add('active');
    if (btnB) btnB.classList.remove('active');
    if (contentA) contentA.classList.remove('d-none');
    if (contentB) contentB.classList.add('d-none');
    calculateOptionA();
  } else {
    if (btnB) btnB.classList.add('active');
    if (btnA) btnA.classList.remove('active');
    if (contentB) contentB.classList.remove('d-none');
    if (contentA) contentA.classList.add('d-none');
    calculateOptionB();
  }
}

// OPCIÓN A: Cálculo Nota Requerida en Parcial (Corte 1 - 30%)
function calculateOptionA() {
  const tallerElem = document.getElementById('tallerInput');
  const quizElem = document.getElementById('quizInput');
  const bonusElem = document.getElementById('bonusInput');

  const tallerInput = tallerElem ? tallerElem.value : "";
  const quizInput = quizElem ? quizElem.value : "";
  const bonusInput = bonusElem ? bonusElem.value : "";

  const taller = parseFloat(tallerInput) || 0;
  const quiz = parseFloat(quizInput) || 0;
  const bonus = parseFloat(bonusInput) || 0;

  const resultDisplay = document.getElementById('parcialNeededResult');
  const aiFeedback = document.getElementById('coreAIFeedbackText');

  if (!resultDisplay || !aiFeedback) return;

  // CASO 0: Estado inicial (campos vacíos o todos en 0)
  if ((!tallerInput && !quizInput && !bonusInput) || (taller === 0 && quiz === 0 && bonus === 0)) {
    resultDisplay.textContent = "5.00";
    resultDisplay.style.color = "var(--text-muted)";
    calculatedCorte1Grade = 0.0;
    aiFeedback.innerHTML = `🤖 <strong>CoreAI:</strong> Ingresa tus notas del Taller, Quiz y Puntos adicionales para calcular exactamente cuánto necesitas en el Parcial del Corte 1.`;
    return;
  }

  // Fórmula para el Parcial (50% del corte)
  const parcialNeeded = (TARGET_GRADE - (taller * 0.3) - (quiz * 0.2) - bonus) / 0.5;
  let finalParcial = Math.max(0, parcialNeeded);

  // MÚLTIPLES ESCENARIOS DE RETROALIMENTACIÓN - OPCIÓN A
  if (parcialNeeded > 5.0) {
    resultDisplay.textContent = "> 5.0";
    resultDisplay.style.color = "var(--warning)";
    calculatedCorte1Grade = Math.min(5.0, (taller * 0.3) + (quiz * 0.2) + 2.5 + bonus);

    aiFeedback.innerHTML = `⚠️ <strong>CoreAI:</strong> Matemáticamente necesitarías un <strong>${parcialNeeded.toFixed(1)}</strong> en el parcial para llegar a 3.0. Si sacas 5.0, tu Corte 1 se cerrará en <strong>${calculatedCorte1Grade.toFixed(2)}</strong>. ¡Tranquilo, aún quedan el Corte 2 y 3 para recuperar!`;

  } else if (parcialNeeded > 4.0) {
    resultDisplay.textContent = finalParcial.toFixed(2);
    resultDisplay.style.color = "var(--warning)";
    calculatedCorte1Grade = TARGET_GRADE;

    aiFeedback.innerHTML = `🔥 <strong>CoreAI:</strong> ¡A apretar el acelerador! Necesitas un <strong>${finalParcial.toFixed(2)}</strong> en el parcial. Con los puntos adicionales amortiguaste bastante, pero requiere estudio enfocado.`;

  } else if (parcialNeeded > TARGET_GRADE) {
    resultDisplay.textContent = finalParcial.toFixed(2);
    resultDisplay.style.color = "var(--primary)";
    calculatedCorte1Grade = TARGET_GRADE;

    aiFeedback.innerHTML = `📈 <strong>CoreAI:</strong> Tienes un panorama muy alcanzable. Sacando un <strong>${finalParcial.toFixed(2)}</strong> en el parcial aseguras el 3.0 del Corte 1. ¡Un repaso de los temas claves y lo tienes!`;

  } else if (parcialNeeded > 0) {
    resultDisplay.textContent = finalParcial.toFixed(2);
    resultDisplay.style.color = "var(--success)";
    calculatedCorte1Grade = TARGET_GRADE;

    aiFeedback.innerHTML = `😎 <strong>CoreAI:</strong> ¡Excelente margen! Con solo un <strong>${finalParcial.toFixed(2)}</strong> apruebas el Corte 1. Tus evaluaciones previas y puntos en clase te dejaron súper bien posicionado.`;

  } else {
    calculatedCorte1Grade = Math.min(5.0, (taller * 0.3) + (quiz * 0.2) + bonus);
    resultDisplay.textContent = "0.00";
    resultDisplay.style.color = "var(--success)";

    aiFeedback.innerHTML = `🎉 <strong>CoreAI:</strong> ¡Ya aseguraste el corte! Con tus notas actuales y bonos sumas <strong>${calculatedCorte1Grade.toFixed(2)}</strong> en el Corte 1 sin depender del examen parcial. ¡A sumar puntos extra!`;
  }
}

// OPCIÓN B: 5 Escenarios Conectados con Diagnósticos Variados de CoreAI
function calculateOptionB() {
  const scenariosContainer = document.getElementById('scenariosContainer');
  const aiFeedback = document.getElementById('coreAIFeedbackText');
  const c1SummaryText = document.getElementById('c1SummaryText');
  const c1Input = document.getElementById('corte1Input');

  if (!scenariosContainer || !aiFeedback || !c1SummaryText) return;

  // Si se ingresó un valor en la Opción A previo, sincroniza el input de la Opción B
  if (c1Input && parseFloat(c1Input.value) === 0 && calculatedCorte1Grade > 0) {
    c1Input.value = calculatedCorte1Grade.toFixed(1);
  }

  const c1Val = parseFloat(c1Input ? c1Input.value : 0) || calculatedCorte1Grade;
  const c1Contribution = c1Val * 0.3;
  const pendingNeeded = Math.max(0, TARGET_GRADE - c1Contribution);

  // Mensaje de resumen dinámico
  if (c1Val === 0) {
    c1SummaryText.innerHTML = `Ingresa tu nota del Corte 1 arriba (o simúlala en la Opción A). Asumiendo que necesitas el <strong>3.0 completo</strong> en los cortes restantes:`;
  } else {
    c1SummaryText.innerHTML = `Con tu Corte 1 en <strong>${c1Val.toFixed(2)}</strong> (aporta ${c1Contribution.toFixed(2)} a la nota final), necesitas acumular <strong>${pendingNeeded.toFixed(2)}</strong> puntos ponderados entre el Corte 2 (30%) y Corte 3 (40%) para ganar la asignatura en <strong>3.0</strong>:`;
  }

  // Generación de los 5 escenarios variando el Corte 2
  const baseC2List = [3.0, 2.0, 4.0, 2.5, 4.5];
  scenariosContainer.innerHTML = baseC2List.map((c2Val, idx) => {
    const neededC3 = (pendingNeeded - (c2Val * 0.3)) / 0.4;
    const c3Text = neededC3 <= 0 ? "0.0 (Ganas la materia)" : neededC3 > 5.0 ? "> 5.0 (Inalcanzable)" : neededC3.toFixed(2);
    const c3Color = neededC3 > 5.0 ? "color: var(--warning);" : "color: var(--text-main);";

    return `
      <div class="scenario-card">
        <strong>Escenario ${idx + 1}</strong>
        <span>C2 (30%): ${c2Val.toFixed(1)}</span><br>
        <span style="${c3Color}">C3 (40%): ${c3Text}</span>
      </div>
    `;
  }).join('');

  // MULTI-ESCENARIOS DE COREAI SEGÚN LA NOTA INGRESADA
  if (c1Val === 0) {
    aiFeedback.innerHTML = `🤖 <strong>CoreAI:</strong> Ingresa tu nota del Corte 1 para proyectar tus metas. Si no sumas puntos en este corte, necesitarás un promedio sostenido de <strong>4.3</strong> entre el Corte 2 y 3.`;

  } else if (c1Val < 2.0) {
    aiFeedback.innerHTML = `⚠️ <strong>CoreAI:</strong> Un Corte 1 en <strong>${c1Val.toFixed(2)}</strong> exige recuperar terreno rápido. Apunta a sacar al menos <strong>4.0 en el Corte 2</strong> para evitar depender de una nota perfecta en el examen final.`;

  } else if (c1Val < 3.0) {
    aiFeedback.innerHTML = `📊 <strong>CoreAI:</strong> Quedaste muy cerca del mínimo con un <strong>${c1Val.toFixed(2)}</strong>. Subiendo levemente tu promedio a <strong>3.3</strong> en los dos cortes restantes apruebas la asignatura sin complicaciones.`;

  } else if (c1Val < 4.2) {
    aiFeedback.innerHTML = `🤖 <strong>CoreAI:</strong> ¡Vas por buen camino! Con un <strong>${c1Val.toFixed(2)}</strong> en el primer corte, mantener un promedio de <strong>3.0</strong> en lo que resta del semestre te asegura ganar la materia.`;

  } else {
    aiFeedback.innerHTML = `🚀 <strong>CoreAI:</strong> ¡Excelente nota de primer corte (<strong>${c1Val.toFixed(2)}</strong>)! Tienes un gran colchón de puntos acumulados; incluso con un rendimiento moderado mantendrás la asignatura aprobada.`;
  }
}