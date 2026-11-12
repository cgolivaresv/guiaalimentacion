/* ============================================================
   app.js — Lógica de la Guía de Alimentación
   ------------------------------------------------------------
   Flujo:
     1) El usuario indica HAMBRE o SED.
     2) Si es hambre -> sugerimos primero probar un vaso de agua
        (la evidencia es mixta, pero es un paso sin costo; si el
        hambre persiste tras unos minutos, es hambre real).
     3) Sugerimos un alimento/bebida según: momento del día +
        gustos del usuario + ciencia (saciedad, densidad).
     4) "No lo tengo" -> preguntamos qué hay en la despensa y
        sugerimos la mejor alternativa disponible.
   ============================================================ */

const LS_KEY = "guiaalim_prefs_v1";

const estado = {
  prefs: cargarPrefs(),
  ultimaSugerencia: null,
  tipoActual: null,      // "hambre" | "sed"
  yaProboAgua: false,
  descartados: []        // ids ya sugeridos y rechazados en esta ronda
};

/* ---------- Preferencias ---------- */
function prefsPorDefecto() {
  return { gustos: [], noMeGusta: [], nombre: "" };
}
function cargarPrefs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? Object.assign(prefsPorDefecto(), JSON.parse(raw)) : prefsPorDefecto();
  } catch (e) {
    return prefsPorDefecto();
  }
}
function guardarPrefs() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(estado.prefs)); } catch (e) {}
}

/* ---------- Momento del día ---------- */
function momentoActual() {
  const h = new Date().getHours();
  if (h >= 6 && h < 10) return "desayuno";
  if (h >= 10 && h < 12) return "media_manana";
  if (h >= 12 && h < 15) return "almuerzo";
  if (h >= 15 && h < 20) return "once";
  if (h >= 20 && h < 23) return "cena";
  return "noche";
}
const MOMENTO_LABEL = {
  desayuno: "el desayuno", media_manana: "media mañana", almuerzo: "el almuerzo",
  once: "la once / tarde", cena: "la cena", noche: "la noche"
};

/* ---------- Filtrado y ranking ---------- */
function pasaGustos(item) {
  const g = estado.prefs.gustos;
  const etq = item.etiquetas || [];
  // Restricciones duras: si el usuario marcó una restricción, debe cumplirse
  if (g.includes("vegetariano") && !etq.includes("vegetariano")) return false;
  if (g.includes("sin_gluten") && !etq.includes("sin_gluten")) return false;
  // Dislikes por categoría o id
  const nm = estado.prefs.noMeGusta || [];
  if (nm.includes(item.id)) return false;
  if ((item.categorias || []).some(c => nm.includes(c))) return false;
  return true;
}

function puntuar(item, momento) {
  let score = (item.saciedad || 0) * 10;
  // Bonus por momento del día
  if ((item.momentos || []).includes(momento)) score += 15;
  // Preferencias "blandas": suman si coinciden
  const g = estado.prefs.gustos;
  const etq = item.etiquetas || [];
  if (g.includes("mediterranea") && etq.includes("mediterranea")) score += 8;
  if (g.includes("proteina_alta") && etq.includes("proteina_alta")) score += 8;
  // De noche penalizamos densidad alta
  if ((momento === "cena" || momento === "noche") && item.densidad === "alta") score -= 12;
  // Pequeña aleatoriedad para variar las sugerencias
  score += Math.random() * 6;
  return score;
}

function mejoresAlimentos(momento, universo) {
  return (universo || ALIMENTOS)
    .filter(pasaGustos)
    .filter(i => !estado.descartados.includes(i.id))
    .map(i => ({ item: i, score: puntuar(i, momento) }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}

function mejoresBebidas() {
  // Agua primero, luego el resto por saciedad baja->alta neutral
  return BEBIDAS
    .filter(i => !estado.descartados.includes(i.id))
    .filter(i => {
      const nm = estado.prefs.noMeGusta || [];
      return !nm.includes(i.id);
    });
}

/* ---------- Render ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function mostrarPantalla(id) {
  $$(".pantalla").forEach(p => p.classList.remove("activa"));
  $("#" + id).classList.add("activa");
}

function tarjetaSugerencia(item, tipo) {
  const momento = momentoActual();
  const extra = tipo === "hambre"
    ? `<div class="meta">
         <span class="chip">Saciedad ${"●".repeat(item.saciedad)}${"○".repeat(5 - item.saciedad)}</span>
         <span class="chip">Densidad: ${item.densidad}</span>
         ${item.proteina === "alta" ? '<span class="chip">Proteína alta</span>' : ""}
         ${item.fibra === "alta" ? '<span class="chip">Fibra alta</span>' : ""}
       </div>
       <p class="porcion">Porción sugerida: <strong>${item.porcion}</strong></p>`
    : `<p class="porcion">${item.porcion}</p>`;

  return `
    <div class="sugerencia-emoji">${item.emoji}</div>
    <h2>${item.nombre}</h2>
    ${extra}
    <p class="porque">💡 ${item.porque}</p>
  `;
}

function sugerir(tipo, universo) {
  estado.tipoActual = tipo;
  const momento = momentoActual();
  let item;

  if (tipo === "sed") {
    const lista = mejoresBebidas();
    item = lista[0] || BEBIDAS[0];
  } else {
    const lista = mejoresAlimentos(momento, universo);
    if (lista.length === 0) {
      $("#contenido-sugerencia").innerHTML =
        `<p class="porque">No encuentro una opción que encaje con tus filtros y lo que tienes.
         Prueba quitar alguna restricción en Ajustes, o un vaso de agua y espera 15 minutos.</p>`;
      $("#acciones-sugerencia").style.display = "none";
      mostrarPantalla("pantalla-sugerencia");
      return;
    }
    item = lista[0];
  }

  estado.ultimaSugerencia = item;
  $("#momento-label").textContent = "Según la hora (" + MOMENTO_LABEL[momento] + ")";
  $("#contenido-sugerencia").innerHTML = tarjetaSugerencia(item, tipo);
  $("#acciones-sugerencia").style.display = "flex";
  mostrarPantalla("pantalla-sugerencia");
}

/* ---------- Flujo HAMBRE: probar agua primero ---------- */
function iniciarHambre() {
  estado.tipoActual = "hambre";
  estado.yaProboAgua = false;
  estado.descartados = [];
  if (!estado.yaProboAgua) {
    mostrarPantalla("pantalla-agua");
  } else {
    sugerir("hambre");
  }
}

function iniciarSed() {
  estado.tipoActual = "sed";
  estado.descartados = [];
  sugerir("sed");
}

/* ---------- Despensa: "no lo tengo" ---------- */
function abrirDespensa() {
  const cont = $("#despensa-opciones");
  cont.innerHTML = DESPENSA_OPCIONES.map(o =>
    `<button class="pill-despensa" data-id="${o.id}">${o.emoji} ${o.label}</button>`
  ).join("");
  cont.querySelectorAll(".pill-despensa").forEach(b => {
    b.addEventListener("click", () => b.classList.toggle("sel"));
  });
  mostrarPantalla("pantalla-despensa");
}

function sugerirDesdeDespensa() {
  const sel = $$("#despensa-opciones .pill-despensa.sel").map(b => b.dataset.id);
  if (sel.length === 0) {
    alert("Marca al menos un alimento que tengas.");
    return;
  }
  // ids de alimentos posibles según lo marcado
  const idsPosibles = new Set();
  sel.forEach(dId => {
    const opt = DESPENSA_OPCIONES.find(o => o.id === dId);
    if (opt) opt.match.forEach(id => idsPosibles.add(id));
  });
  const universo = ALIMENTOS.filter(a => idsPosibles.has(a.id));
  estado.descartados = []; // nueva ronda con lo disponible
  sugerir("hambre", universo);
}

/* ---------- Ajustes (gustos) ---------- */
function abrirAjustes() {
  const cont = $("#ajustes-gustos");
  cont.innerHTML = ETIQUETAS_GUSTOS.map(g => {
    const on = estado.prefs.gustos.includes(g.id);
    return `<label class="fila-ajuste">
      <span><strong>${g.label}</strong><br><small>${g.desc}</small></span>
      <input type="checkbox" data-gusto="${g.id}" ${on ? "checked" : ""}>
    </label>`;
  }).join("");

  // Dislikes por categoría simple
  const cats = [
    { id: "pescado", label: "Pescado" },
    { id: "legumbre", label: "Legumbres" },
    { id: "huevo", label: "Huevos" },
    { id: "lacteo", label: "Lácteos" },
    { id: "verdura", label: "Verduras" }
  ];
  const nm = estado.prefs.noMeGusta || [];
  $("#ajustes-dislikes").innerHTML = cats.map(c =>
    `<label class="fila-ajuste">
      <span>No me gusta: ${c.label}</span>
      <input type="checkbox" data-dislike="${c.id}" ${nm.includes(c.id) ? "checked" : ""}>
    </label>`
  ).join("");

  $("#input-nombre").value = estado.prefs.nombre || "";
  mostrarPantalla("pantalla-ajustes");
}

function guardarAjustes() {
  estado.prefs.gustos = $$('#ajustes-gustos input[data-gusto]:checked').map(i => i.dataset.gusto);
  estado.prefs.noMeGusta = $$('#ajustes-dislikes input[data-dislike]:checked').map(i => i.dataset.dislike);
  estado.prefs.nombre = $("#input-nombre").value.trim();
  guardarPrefs();
  actualizarSaludo();
  mostrarPantalla("pantalla-inicio");
}

function actualizarSaludo() {
  const n = estado.prefs.nombre;
  $("#saludo").textContent = n ? `Hola, ${n}` : "¿Qué necesitas?";
}

/* ---------- Eventos ---------- */
function initEventos() {
  $("#btn-hambre").addEventListener("click", iniciarHambre);
  $("#btn-sed").addEventListener("click", iniciarSed);

  // Pantalla agua
  $("#agua-la-probare").addEventListener("click", () => {
    mostrarPantalla("pantalla-inicio");
  });
  $("#agua-sigo-hambre").addEventListener("click", () => {
    estado.yaProboAgua = true;
    sugerir("hambre");
  });

  // Sugerencia
  $("#btn-no-tengo").addEventListener("click", abrirDespensa);
  $("#btn-otra").addEventListener("click", () => {
    if (estado.ultimaSugerencia) estado.descartados.push(estado.ultimaSugerencia.id);
    sugerir(estado.tipoActual);
  });
  $("#btn-gracias").addEventListener("click", () => mostrarPantalla("pantalla-inicio"));

  // Despensa
  $("#btn-despensa-sugerir").addEventListener("click", sugerirDesdeDespensa);
  $("#btn-despensa-volver").addEventListener("click", () => mostrarPantalla("pantalla-sugerencia"));

  // Ajustes
  $("#btn-ajustes").addEventListener("click", abrirAjustes);
  $("#btn-guardar-ajustes").addEventListener("click", guardarAjustes);
  $("#btn-cancelar-ajustes").addEventListener("click", () => mostrarPantalla("pantalla-inicio"));

  // Volver genéricos
  $$("[data-volver]").forEach(b =>
    b.addEventListener("click", () => mostrarPantalla("pantalla-inicio")));
}

document.addEventListener("DOMContentLoaded", () => {
  initEventos();
  actualizarSaludo();
  mostrarPantalla("pantalla-inicio");
  // Registrar service worker (PWA)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
});
