/* ============================================================
   app.js — Guía de Alimentación v2.0
   Núcleo + todas las funciones (sugerencias, registro diario,
   arma tu plato, lista de compras, progreso de peso, ajustes).
   ============================================================ */

const APP_VERSION = "2.4.2";

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const estado = { tipoActual: null, ultimaSugerencia: null, descartados: [] };

/* ---------- Navegación ---------- */
function navegar(id) {
  $$(".pantalla").forEach(p => p.classList.remove("activa"));
  const el = $("#" + id);
  if (el) el.classList.add("activa");
  $$(".nav-item").forEach(b => b.classList.toggle("activo", b.dataset.goto === id));
  // Refrescos al entrar
  if (id === "pantalla-hoy") renderHoy();
  if (id === "pantalla-productos") renderProductos();
  if (id === "pantalla-progreso") renderProgreso();
  if (id === "pantalla-plato") renderPlato();
  if (id === "pantalla-inicio") actualizarSaludo();
  window.scrollTo(0, 0);
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
const MOMENTO_LABEL = { desayuno: "el desayuno", media_manana: "media mañana", almuerzo: "el almuerzo", once: "la once / tarde", cena: "la cena", noche: "la noche" };

/* ---------- Filtrado y ranking ---------- */
function pasaGustos(item) {
  const p = Store.prefs();
  const etq = item.etiquetas || [];
  if (p.gustos.includes("vegetariano") && !etq.includes("vegetariano")) return false;
  if (p.gustos.includes("sin_gluten") && !etq.includes("sin_gluten")) return false;
  const nm = p.noMeGusta || [];
  if (nm.includes(item.id)) return false;
  if ((item.categorias || []).some(c => nm.includes(c))) return false;
  return true;
}
function puntuar(item, momento) {
  const p = Store.prefs();
  let score = (item.saciedad || 0) * 10;
  if ((item.momentos || []).includes(momento)) score += 15;
  if (p.gustos.includes("mediterranea") && (item.etiquetas || []).includes("mediterranea")) score += 8;
  if (p.gustos.includes("proteina_alta") && (item.etiquetas || []).includes("proteina_alta")) score += 8;
  if (Store.esFavorito(item.id)) score += 12;
  score += Math.min(Store.bonusAprendizaje(item.id) * 3, 15); // aprende de lo que aceptas
  if ((momento === "cena" || momento === "noche") && item.densidad === "alta") score -= 12;
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

/* ---------- Margen del día y extras elegibles ---------- */
function margenKcal() {
  const meta = Store.prefs().metaCalorias;
  if (!meta) return null;                       // sin meta no hay margen que calcular
  return meta - Store.totalesHoy().kcal;
}
// Un extra (antojo/alcohol) solo es elegible si hay meta y aún cabe en el día
function extrasEligibles(tipo) {
  const rem = margenKcal();
  if (rem == null) return [];
  const nm = Store.prefs().noMeGusta || [];
  return EXTRAS.filter(e => e.tipo === tipo && e.kcal <= rem && !nm.includes(e.id));
}
function esExtra(item) { return item && item.saciedad === undefined && !!item.perfil; }

/* ---------- Tarjeta de sugerencia ---------- */
function tarjetaSugerencia(item, tipo) {
  const fav = Store.esFavorito(item.id);
  let extra = "";
  if (esExtra(item)) {
    const info = PERFIL_INFO[item.perfil] || PERFIL_INFO.ocasional;
    const rem = margenKcal();
    extra = `<div class="meta">
        ${item.kcal ? `<span class="chip">~${item.kcal} kcal</span>` : ""}
        ${item.prot ? `<span class="chip">${item.prot} g proteína</span>` : ""}
        <span class="perfil-tag ${info.cls}">${info.txt}</span>
      </div>
      ${rem != null ? `<p class="margen-nota">🎉 Te queda margen hoy (~${Math.max(0, rem)} kcal). Un gusto medido entra; disfrútalo sin culpa.</p>` : ""}`;
  } else if (tipo === "hambre") {
    const n = nutriDe(item.id);
    extra = `<div class="meta">
        <span class="chip">Saciedad ${"●".repeat(item.saciedad)}${"○".repeat(5 - item.saciedad)}</span>
        <span class="chip">Densidad: ${item.densidad}</span>
        ${n ? `<span class="chip">~${n.kcal} kcal</span>` : ""}
        ${n && n.prot ? `<span class="chip">${n.prot} g proteína</span>` : ""}
      </div>
      <p class="porcion">Porción sugerida: <strong>${item.porcion}</strong></p>`;
  } else {
    extra = `<p class="porcion">${item.porcion}</p>`;
  }

  let productos = "";
  if (tipo === "hambre" && !esExtra(item)) {
    const ps = productosDe(item.id).filter(p => superActivo(p));
    if (ps.length) {
      productos = `<div class="productos-super">
        <p class="productos-titulo">🛒 Ejemplos en el súper</p>
        ${ps.slice(0, 3).map(tarjetaProducto).join("")}
      </div>`;
    }
  }

  return `
    <button class="fav-btn ${fav ? "on" : ""}" data-fav="${item.id}" aria-label="Favorito">${fav ? "★" : "☆"}</button>
    <div class="sugerencia-emoji">${item.emoji}</div>
    <h2>${item.nombre}</h2>
    ${extra}
    <p class="porque">💡 ${item.porque || item.nota || ""}</p>
    ${productos}`;
}

function sugerir(tipo, universo) {
  estado.tipoActual = tipo;
  const momento = momentoActual();
  let lista;
  if (tipo === "sed") {
    lista = BEBIDAS.filter(b => !estado.descartados.includes(b.id))
      .map(b => ({ item: b, score: (BEBIDAS.length - BEBIDAS.indexOf(b)) * 10 }));
    extrasEligibles("sed").filter(e => !estado.descartados.includes(e.id))
      .forEach(e => lista.push({ item: e, score: 5 + Math.random() * 8 }));
    lista = lista.sort((a, b) => b.score - a.score).map(x => x.item);
  } else {
    lista = (universo || ALIMENTOS).filter(pasaGustos).filter(i => !estado.descartados.includes(i.id))
      .map(i => ({ item: i, score: puntuar(i, momento) }));
    extrasEligibles("hambre").filter(e => !estado.descartados.includes(e.id))
      .forEach(e => lista.push({ item: e, score: 5 + Math.random() * 8 }));
    lista = lista.sort((a, b) => b.score - a.score).map(x => x.item);
  }
  if (!lista.length) {
    $("#contenido-sugerencia").innerHTML = `<p class="porque">No encuentro una opción con tus filtros. Prueba quitar alguna restricción en Ajustes, o un vaso de agua y espera 15 minutos.</p>`;
    $("#acciones-sugerencia").style.display = "none";
    navegar("pantalla-sugerencia");
    return;
  }
  const item = lista[0];
  estado.ultimaSugerencia = item;
  $("#momento-label").textContent = "Según la hora (" + MOMENTO_LABEL[momento] + ")";
  $("#contenido-sugerencia").innerHTML = tarjetaSugerencia(item, tipo);
  $("#acciones-sugerencia").style.display = "flex";
  $("#btn-comi").style.display = (tipo === "hambre" || esExtra(item)) ? "block" : "none";
  bindFav(item, tipo);
  navegar("pantalla-sugerencia");
}

function bindFav(item, tipo) {
  const fb = $("#contenido-sugerencia [data-fav]");
  if (!fb) return;
  fb.addEventListener("click", () => {
    Store.toggleFavorito(fb.dataset.fav);
    $("#contenido-sugerencia").innerHTML = tarjetaSugerencia(item, tipo);
    bindFav(item, tipo);
  });
}

function iniciarHambre() { estado.descartados = []; navegar("pantalla-agua"); }
function iniciarSed() { estado.descartados = []; sugerir("sed"); }

/* ---------- Buscador de alimentos/bebidas ---------- */
function abrirBuscador(filtro) {
  estado.filtroBuscar = filtro || null; // "sed" | "hambre" | null
  $("#buscar-input").value = "";
  renderBuscar("");
  navegar("pantalla-buscar");
  setTimeout(() => $("#buscar-input").focus(), 150);
}
function renderBuscar(q) {
  let items = buscar(q);
  if (estado.filtroBuscar) items = items.filter(i => i.tipo === estado.filtroBuscar);
  const cont = $("#buscar-resultados");
  if (!items.length) { cont.innerHTML = `<p class="sub">Sin resultados para "${q}".</p>`; return; }
  cont.innerHTML = items.slice(0, 40).map(i => {
    const perfil = i.perfil ? PERFIL_INFO[i.perfil] : null;
    return `<div class="buscar-item">
      <div class="buscar-info">
        <span class="buscar-emoji">${i.emoji}</span>
        <div>
          <strong>${i.nombre}</strong>
          <div class="buscar-tags">
            ${i.kcal ? `<span class="chip">~${i.kcal} kcal</span>` : ""}
            ${i.prot ? `<span class="chip">${i.prot} g prot</span>` : ""}
            ${perfil ? `<span class="perfil-tag ${perfil.cls}">${perfil.txt}</span>` : ""}
          </div>
        </div>
      </div>
      <button class="btn-mini" data-reg="${i.id}">Registrar</button>
      <p class="buscar-nota">${i.nota || ""}</p>
    </div>`;
  }).join("");
  cont.querySelectorAll("[data-reg]").forEach(b => b.addEventListener("click", () => {
    const it = items.find(x => x.id === b.dataset.reg);
    if (!it) return;
    Store.agregarComida({ id: it.id, nombre: it.nombre, kcal: it.kcal || 0, prot: it.prot || 0 });
    if (it.esAlimento) Store.registrarAceptacion(it.id);
    toast(it.nombre + " registrado ✓");
    navegar("pantalla-hoy");
  }));
}

/* ---------- Buscador EN LÍNEA (Open Food Facts + USDA) ---------- */
let _onlineItems = [];
function tarjetaOnline(n, idx) {
  const sellos = (n.sellos || []).map(s => `<span class="sello">${SELLO_LABEL[s]}</span>`).join("");
  const extras = [];
  if (n.nutriscore) extras.push(`<span class="chip">Nutri-Score ${n.nutriscore}</span>`);
  if (n.nova) extras.push(`<span class="chip">NOVA ${n.nova}</span>`);
  return `<div class="buscar-item">
    <div class="buscar-info">
      <span class="buscar-emoji">📦</span>
      <div>
        <strong>${n.nombre}</strong>
        <div class="buscar-tags">
          ${n.kcal != null ? `<span class="chip">~${n.kcal} kcal/${n.por}</span>` : ""}
          ${n.prot != null ? `<span class="chip">${n.prot} g prot</span>` : ""}
          ${extras.join("")}
        </div>
      </div>
    </div>
    <button class="btn-mini" data-online="${idx}">Registrar</button>
    ${sellos ? `<div class="sellos" style="grid-column:1/-1">${sellos}</div>` : ""}
    <p class="buscar-nota">Fuente: ${n.fuente}</p>
  </div>`;
}
function pintarOnline(items, titulo) {
  _onlineItems = items;
  const cont = $("#buscar-online-res");
  if (!items.length) { cont.innerHTML = `<p class="sub">Sin resultados en línea.</p>`; return; }
  cont.innerHTML = `<h3 class="sub-titulo">${titulo || "Resultados en línea"}</h3>` + items.map((n, i) => tarjetaOnline(n, i)).join("");
  cont.querySelectorAll("[data-online]").forEach(b => b.addEventListener("click", () => {
    const n = _onlineItems[+b.dataset.online]; if (!n) return;
    Store.agregarComida({ id: "off_" + (n.codigo || Date.now()), nombre: n.nombre, kcal: n.kcal || 0, prot: n.prot || 0 });
    toast(n.nombre + " registrado ✓");
    navegar("pantalla-hoy");
  }));
}
async function buscarEnLinea() {
  const q = $("#buscar-input").value.trim();
  if (!q) { toast("Escribe algo para buscar"); return; }
  const cont = $("#buscar-online-res");
  cont.innerHTML = `<p class="sub">Buscando en línea…</p>`;
  try {
    let items = await offBuscarTexto(q);
    if (!items.length) {
      try { items = await usdaBuscar(q, Store.prefs().usdaKey); } catch (e) {}
    }
    pintarOnline(items, "Open Food Facts / USDA");
  } catch (e) {
    cont.innerHTML = `<p class="sub">No se pudo consultar en línea. Esta función necesita conexión y funciona en el sitio publicado (GitHub Pages), no en la vista previa.</p>`;
  }
}
function abrirEscaner() {
  $("#escaner-overlay").style.display = "flex";
  $("#escaner-estado").textContent = "Apunta al código de barras…";
  iniciarEscaner(async (code) => {
    cerrarEscaner();
    navegar("pantalla-buscar");
    $("#buscar-online-res").innerHTML = `<p class="sub">Buscando producto ${code}…</p>`;
    try {
      const p = await offPorCodigo(code);
      if (p) pintarOnline([p], "Producto escaneado");
      else $("#buscar-online-res").innerHTML = `<p class="sub">No encontré ese código en Open Food Facts. Puedes agregarlo tú en openfoodfacts.org.</p>`;
    } catch (e) {
      $("#buscar-online-res").innerHTML = `<p class="sub">No se pudo consultar. Prueba en el sitio publicado con conexión.</p>`;
    }
  }, (msg) => { $("#escaner-estado").textContent = msg; });
}
function cerrarEscaner() {
  detenerEscaner();
  $("#escaner-overlay").style.display = "none";
}

/* ---------- Despensa ---------- */
function abrirDespensa() {
  const cont = $("#despensa-opciones");
  cont.innerHTML = DESPENSA_OPCIONES.map(o => `<button class="pill-despensa" data-id="${o.id}">${o.emoji} ${o.label}</button>`).join("");
  cont.querySelectorAll(".pill-despensa").forEach(b => b.addEventListener("click", () => b.classList.toggle("sel")));
  navegar("pantalla-despensa");
}
function sugerirDesdeDespensa() {
  const sel = $$("#despensa-opciones .pill-despensa.sel").map(b => b.dataset.id);
  const aviso = $("#despensa-aviso");
  if (!sel.length) { aviso.textContent = "Marca al menos un alimento que tengas."; return; }
  aviso.textContent = "";
  const ids = new Set();
  sel.forEach(dId => { const o = DESPENSA_OPCIONES.find(x => x.id === dId); if (o) o.match.forEach(i => ids.add(i)); });
  estado.descartados = [];
  sugerir("hambre", ALIMENTOS.filter(a => ids.has(a.id)));
}

/* ---------- Productos del súper ---------- */
const PERFIL_INFO = { recomendado: { txt: "Recomendado", cls: "perfil-reco" }, moderar: { txt: "Con moderación", cls: "perfil-mod" }, ocasional: { txt: "Ocasional", cls: "perfil-ocas" } };
const PERFIL_ORDEN = { recomendado: 0, moderar: 1, ocasional: 2 };
function perfilP(p) { return PERFIL_ORDEN[(typeof perfilDe === "function" ? perfilDe(p) : (p.perfil || "recomendado"))]; }

function superActivo(p) {
  const pref = Store.prefs().super;
  if (pref === "ambos") return true;
  const sup = supersDe(p);
  return pref === "jumbo" ? sup.includes("Jumbo") : sup.includes("Líder");
}
function tarjetaProducto(p) {
  const perfil = perfilDe(p);
  const info = PERFIL_INFO[perfil] || PERFIL_INFO.recomendado;
  const sellos = (SELLOS_PRODUCTO[p.id] || []).map(s => `<span class="sello">${SELLO_LABEL[s]}</span>`).join("");
  return `<div class="producto">
      <strong>${p.marca} — ${p.nombre}</strong>
      <div class="producto-tags">
        <span class="perfil-tag ${info.cls}">${info.txt}</span>
        <span class="super-tag">${p.super}</span>
      </div>
      ${sellos ? `<div class="sellos">${sellos}</div>` : ""}
      <small>${p.nota}</small>
    </div>`;
}
function renderProductos() {
  // Selector de súper
  $$("#filtro-super .seg").forEach(b => b.classList.toggle("activo", b.dataset.super === Store.prefs().super));
  const cont = $("#lista-productos");
  const lista = PRODUCTOS.filter(superActivo);
  const grupos = {};
  lista.forEach(p => {
    const a = ALIMENTOS.find(x => x.id === p.refAlimento) || BEBIDAS.find(x => x.id === p.refAlimento);
    const key = a ? (a.emoji + " " + a.nombre) : (p.grupo || "🛒 Otros");
    (grupos[key] = grupos[key] || []).push(p);
  });
  const claves = Object.keys(grupos).sort((a, b) => (a.includes("Caprichos") ? 1 : 0) - (b.includes("Caprichos") ? 1 : 0) || a.localeCompare(b));
  cont.innerHTML = claves.length ? claves.map(g => `
    <div class="grupo-productos"><h3 class="grupo-titulo">${g}</h3>
      ${grupos[g].sort((a, b) => perfilP(a) - perfilP(b)).map(tarjetaProducto).join("")}
    </div>`).join("") : `<p class="sub">No hay productos para ese súper.</p>`;
}

/* ---------- HOY: registro de agua y comidas ---------- */
function renderHoy() {
  const t = Store.totalesHoy();
  const meta = Store.prefs().metaAgua || 8;
  const metaKcal = Store.prefs().metaCalorias;
  const racha = Store.racha();

  $("#agua-vasos").textContent = t.agua;
  $("#agua-meta").textContent = meta;
  const pct = Math.min(100, Math.round(t.agua / meta * 100));
  $("#agua-barra-fill").style.width = pct + "%";
  $("#racha").textContent = racha;

  const metaProt = Store.prefs().metaProteina;
  $("#hoy-kcal").textContent = t.kcal;
  $("#hoy-prot").textContent = t.prot;
  $("#hoy-kcal-meta").textContent = metaKcal ? ("/ " + metaKcal) : "";
  // Barras de progreso de kcal y proteína (si hay meta)
  const barra = (id, val, meta, color) => {
    const wrap = $(id);
    if (!meta) { wrap.style.display = "none"; return; }
    wrap.style.display = "block";
    const pct = Math.min(100, Math.round(val / meta * 100));
    wrap.querySelector(".mini-fill").style.width = pct + "%";
    wrap.querySelector(".mini-fill").style.background = color;
    wrap.querySelector(".mini-lbl").textContent = `${val} / ${meta} ${wrap.dataset.unidad} (${pct}%)`;
  };
  barra("#barra-kcal", t.kcal, metaKcal, "var(--azul)");
  barra("#barra-prot", t.prot, metaProt, "var(--verde)");

  // Selector de comida rápida
  const sel = $("#comida-select");
  if (!sel.dataset.filled) {
    sel.innerHTML = '<option value="">Agregar comida…</option>' +
      ALIMENTOS.slice().sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map(a => { const n = nutriDe(a.id); return `<option value="${a.id}">${a.emoji} ${a.nombre}${n ? " (~" + n.kcal + " kcal)" : ""}</option>`; }).join("");
    sel.dataset.filled = "1";
  }

  // Lista comidas de hoy
  const r = Store.registroDe();
  $("#lista-comidas").innerHTML = r.comidas.length ? r.comidas.map((c, i) => `
    <div class="comida-row">
      <span>${c.hora} · ${c.nombre}</span>
      <span>${c.kcal ? c.kcal + " kcal" : ""} <button class="x" data-del-comida="${i}">✕</button></span>
    </div>`).join("") : `<p class="sub">Aún no registras comidas hoy.</p>`;
  $$("#lista-comidas [data-del-comida]").forEach(b => b.addEventListener("click", () => { Store.quitarComida(+b.dataset.delComida); renderHoy(); }));
}

/* ---------- ARMA TU PLATO ---------- */
function elegirAzar(cat) {
  const op = ALIMENTOS.filter(a => (a.categorias || []).includes(cat) && pasaGustos(a));
  return op.length ? op[Math.floor(Math.random() * op.length)] : null;
}
let platoActual = null;
function renderPlato() {
  if (!platoActual) generarPlato();
}
function generarPlato() {
  const prote = elegirAzar("proteina") || elegirAzar("legumbre");
  const verdura = elegirAzar("verdura");
  const carbo = ALIMENTOS.filter(a => (a.categorias || []).includes("carbohidrato") || (a.categorias || []).includes("tuberculo") || (a.categorias || []).includes("legumbre")).filter(pasaGustos);
  const c = carbo.length ? carbo[Math.floor(Math.random() * carbo.length)] : null;
  platoActual = { prote, verdura, carbo: c };
  const kcal = [prote, verdura, c].reduce((s, x) => s + (x && nutriDe(x.id) ? nutriDe(x.id).kcal * (x === c ? 0.6 : x === verdura ? 1 : 1) : 0), 0);
  const fila = (lbl, x, prop) => x ? `<div class="plato-fila"><span class="plato-prop">${prop}</span><span>${x.emoji} <strong>${x.nombre}</strong></span></div>` : "";
  $("#plato-contenido").innerHTML = `
    <div class="plato-visual">
      <div class="plato-mitad verde">½ Verduras</div>
      <div class="plato-cuarto azul">¼ Proteína</div>
      <div class="plato-cuarto naranja">¼ Carbo</div>
    </div>
    ${fila("Proteína", platoActual.prote, "¼ 🖐️ palma")}
    ${fila("Verdura", platoActual.verdura, "½ plato")}
    ${fila("Carbo", platoActual.carbo, "¼ ✊ puño")}
    <p class="porque">💡 Medio plato de verduras, un cuarto de proteína y un cuarto de carbohidrato: el "plato saludable" que llena con menos calorías. Aprox. ${Math.round(kcal)} kcal.</p>`;
}

/* ---------- LISTA DE COMPRAS ---------- */
function generarCompras() {
  // Favoritos + recomendados del súper activo, deduplicados por alimento
  const items = [];
  const vistos = new Set();
  const add = (nombre) => { if (!vistos.has(nombre)) { vistos.add(nombre); items.push(nombre); } };
  // de favoritos, sus productos recomendados
  Store.favoritos().forEach(id => productosDe(id).filter(superActivo).forEach(p => add(`${p.marca} — ${p.nombre}`)));
  // productos recomendados del súper
  PRODUCTOS.filter(p => perfilDe(p) === "recomendado" && superActivo(p)).slice(0, 14).forEach(p => add(`${p.marca} — ${p.nombre}`));
  const cont = $("#lista-compras");
  cont.innerHTML = items.map((t, i) => `<label class="compra-row"><input type="checkbox" data-c="${i}"> <span>${t}</span></label>`).join("");
  $("#compras-texto").value = items.join("\n");
}

/* ---------- PROGRESO DE PESO ---------- */
function renderProgreso() {
  const ps = Store.pesos();
  const cont = $("#progreso-lista");
  if (!ps.length) { cont.innerHTML = `<p class="sub">Registra tu peso para ver el progreso.</p>`; $("#grafico-peso").innerHTML = ""; $("#peso-delta").textContent = ""; return; }
  // delta
  const ini = ps[0].kg, ult = ps[ps.length - 1].kg, delta = +(ult - ini).toFixed(1);
  $("#peso-delta").textContent = ps.length > 1 ? `${delta <= 0 ? "▼" : "▲"} ${Math.abs(delta)} kg desde el inicio (${ini} → ${ult} kg)` : `${ult} kg`;
  // gráfico SVG
  $("#grafico-peso").innerHTML = svgPeso(ps);
  // lista
  cont.innerHTML = ps.slice().reverse().map(p => `
    <div class="comida-row"><span>${p.fecha}</span><span>${p.kg} kg <button class="x" data-del-peso="${p.fecha}">✕</button></span></div>`).join("");
  $$("#progreso-lista [data-del-peso]").forEach(b => b.addEventListener("click", () => { Store.quitarPeso(b.dataset.delPeso); renderProgreso(); }));
}
function svgPeso(ps) {
  const W = 320, H = 150, m = 24;
  const xs = ps.map((_, i) => m + (ps.length === 1 ? (W - 2 * m) / 2 : i * (W - 2 * m) / (ps.length - 1)));
  const kgs = ps.map(p => p.kg);
  const min = Math.min(...kgs), max = Math.max(...kgs);
  const rng = (max - min) || 1;
  const ys = kgs.map(k => H - m - (k - min) / rng * (H - 2 * m));
  const pts = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const dots = xs.map((x, i) => `<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3.5" fill="var(--verde)"/>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Gráfico de peso">
    <line x1="${m}" y1="${H - m}" x2="${W - m}" y2="${H - m}" stroke="var(--borde)"/>
    <polyline fill="none" stroke="var(--verde)" stroke-width="2.5" points="${pts}"/>
    ${dots}
    <text x="${m}" y="14" font-size="11" fill="var(--gris)">${max} kg</text>
    <text x="${m}" y="${H - m + 14}" font-size="11" fill="var(--gris)">${min} kg</text>
  </svg>`;
}

/* ---------- AJUSTES ---------- */
function abrirAjustes() {
  const p = Store.prefs();
  // Gustos
  $("#ajustes-gustos").innerHTML = ETIQUETAS_GUSTOS.map(g => `<label class="fila-ajuste"><span><strong>${g.label}</strong><br><small>${g.desc}</small></span><input type="checkbox" data-gusto="${g.id}" ${p.gustos.includes(g.id) ? "checked" : ""}></label>`).join("");
  const cats = [{ id: "pescado", label: "Pescado" }, { id: "legumbre", label: "Legumbres" }, { id: "huevo", label: "Huevos" }, { id: "lacteo", label: "Lácteos" }, { id: "verdura", label: "Verduras" }];
  $("#ajustes-dislikes").innerHTML = cats.map(c => `<label class="fila-ajuste"><span>No me gusta: ${c.label}</span><input type="checkbox" data-dislike="${c.id}" ${(p.noMeGusta || []).includes(c.id) ? "checked" : ""}></label>`).join("");
  $("#input-nombre").value = p.nombre || "";
  $("#input-meta-agua").value = p.metaAgua || 8;
  $("#input-meta-prot").value = p.metaProteina || "";
  $("#input-usda").value = p.usdaKey || "";
  $$("#ajustes-super .seg").forEach(b => b.classList.toggle("activo", b.dataset.super === p.super));
  $$("#ajustes-tema .seg").forEach(b => b.classList.toggle("activo", b.dataset.tema === p.tema));
  $("#rec-agua").checked = Store.recordatorios().agua;
  $("#rec-comidas").checked = Store.recordatorios().comidas;
  navegar("pantalla-ajustes");
}
function guardarAjustes() {
  const p = Store.prefs();
  p.gustos = $$('#ajustes-gustos input[data-gusto]:checked').map(i => i.dataset.gusto);
  p.noMeGusta = $$('#ajustes-dislikes input[data-dislike]:checked').map(i => i.dataset.dislike);
  p.nombre = $("#input-nombre").value.trim();
  p.metaAgua = Math.max(1, parseInt($("#input-meta-agua").value) || 8);
  const mp = parseInt($("#input-meta-prot").value);
  p.metaProteina = mp > 0 ? mp : null;
  Store.setPref("gustos", p.gustos); Store.setPref("noMeGusta", p.noMeGusta);
  Store.setPref("nombre", p.nombre); Store.setPref("metaAgua", p.metaAgua);
  Store.setPref("metaProteina", p.metaProteina);
  Store.setPref("usdaKey", $("#input-usda").value.trim());
  navegar("pantalla-inicio");
}

/* ---- Calculadora de calorías (Mifflin-St Jeor) ---- */
function calcularCalorias() {
  const num = s => parseFloat(String(s || "").replace(",", ".").replace(/[^0-9.]/g, ""));
  const sexo = $("#calc-sexo").value;
  const edad = num($("#calc-edad").value), peso = num($("#calc-peso").value), talla = num($("#calc-talla").value);
  const act = +$("#calc-actividad").value;
  if (!edad || !peso || !talla) { $("#calc-resultado").innerHTML = "Completa edad, peso y talla."; return; }
  let tmb = 10 * peso + 6.25 * talla - 5 * edad + (sexo === "h" ? 5 : -161);
  const tdee = tmb * act;
  const objetivo = Math.round(tdee - 500);
  const protObj = Math.round(peso * 1.6);
  Store.setPref("metaCalorias", objetivo);
  Store.setPref("metaProteina", protObj);
  const mpInput = $("#input-meta-prot"); if (mpInput) mpInput.value = protObj;
  $("#calc-resultado").innerHTML = `Metabolismo basal: <strong>${Math.round(tmb)} kcal</strong><br>
    Gasto diario estimado: <strong>${Math.round(tdee)} kcal</strong><br>
    Para bajar ~0,5 kg/semana: <strong>${objetivo} kcal/día</strong><br>
    Meta de proteína: <strong>${protObj} g/día</strong> <small>(guardadas como tus metas)</small>`;
}

/* ---- Tema ---- */
function aplicarTema() {
  const t = Store.prefs().tema;
  const root = document.documentElement;
  root.classList.remove("tema-claro", "tema-oscuro");
  if (t === "claro") root.classList.add("tema-claro");
  else if (t === "oscuro") root.classList.add("tema-oscuro");
  // auto: usa prefers-color-scheme vía CSS
}

/* ---- Recordatorios (notificaciones) ---- */
let recInterval = null;
function configurarRecordatorios() {
  if (recInterval) clearInterval(recInterval);
  const r = Store.recordatorios();
  if (!r.agua && !r.comidas) return;
  if ("Notification" in window && Notification.permission === "granted") {
    recInterval = setInterval(() => {
      const h = new Date().getHours();
      if (r.agua && h >= 8 && h <= 22) {
        try { new Notification("💧 Hora de tomar agua", { body: "Un vaso ahora te ayuda a no confundir sed con hambre." }); } catch (e) {}
      }
    }, 2 * 60 * 60 * 1000); // cada 2 h mientras la app esté abierta
  }
}
function pedirPermisoNotif(cb) {
  if (!("Notification" in window)) { cb(false); return; }
  if (Notification.permission === "granted") { cb(true); return; }
  Notification.requestPermission().then(p => cb(p === "granted"));
}

/* ---- Export / Import ---- */
function exportarDatos() {
  const blob = new Blob([Store.exportar()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "guiaalimentacion-datos.json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Saludo ---------- */
function actualizarSaludo() {
  const n = Store.prefs().nombre;
  $("#saludo").textContent = n ? `Hola, ${n}` : "¿Qué necesitas?";
}

/* ---------- Eventos ---------- */
function initEventos() {
  // Al enfocar un campo, súbelo al centro para que el teclado no lo tape
  document.addEventListener("focusin", e => {
    if (e.target.matches && e.target.matches("input, select, textarea")) {
      setTimeout(() => { try { e.target.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (x) {} }, 300);
    }
  });

  // Nav
  $$(".nav-item").forEach(b => b.addEventListener("click", () => navegar(b.dataset.goto)));
  $("#btn-ajustes").addEventListener("click", abrirAjustes);
  $("#btn-buscar").addEventListener("click", () => abrirBuscador(null));

  // Buscador
  $("#buscar-input").addEventListener("input", e => renderBuscar(e.target.value));
  $("#btn-buscar-volver").addEventListener("click", () => navegar("pantalla-inicio"));
  $("#btn-buscar-online").addEventListener("click", buscarEnLinea);
  $("#btn-escanear").addEventListener("click", abrirEscaner);
  $("#btn-escaner-cerrar").addEventListener("click", cerrarEscaner);
  $$("#buscar-filtros .seg").forEach(b => b.addEventListener("click", () => {
    estado.filtroBuscar = b.dataset.filtro === "todo" ? null : b.dataset.filtro;
    $$("#buscar-filtros .seg").forEach(x => x.classList.toggle("activo", x === b));
    renderBuscar($("#buscar-input").value);
  }));

  // Inicio
  $("#btn-hambre").addEventListener("click", iniciarHambre);
  $("#btn-sed").addEventListener("click", iniciarSed);
  $("#btn-porcion").addEventListener("click", () => navegar("pantalla-porcion"));

  // Agua (prueba)
  $("#agua-la-probare").addEventListener("click", () => { Store.sumarAgua(1); navegar("pantalla-inicio"); });
  $("#agua-sigo-hambre").addEventListener("click", () => sugerir("hambre"));

  // Sugerencia
  $("#btn-comi").addEventListener("click", () => {
    const it = estado.ultimaSugerencia; if (!it) return;
    const n = nutriDe(it.id) || { kcal: it.kcal || 0, prot: it.prot || 0 };
    Store.agregarComida({ id: it.id, nombre: it.nombre, kcal: n.kcal || 0, prot: n.prot || 0 });
    if (!esExtra(it)) Store.registrarAceptacion(it.id);
    navegar("pantalla-hoy");
  });
  $("#btn-no-tengo").addEventListener("click", abrirDespensa);
  $("#btn-otra").addEventListener("click", () => { if (estado.ultimaSugerencia) estado.descartados.push(estado.ultimaSugerencia.id); sugerir(estado.tipoActual); });
  $("#btn-compartir").addEventListener("click", () => {
    const it = estado.ultimaSugerencia; if (!it) return;
    const txt = `Guía de Alimentación sugiere: ${it.nombre}. ${it.porque || it.nota || ""}`;
    if (navigator.share) navigator.share({ text: txt }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast("Copiado ✓")).catch(() => {});
  });
  $("#btn-buscar-otra").addEventListener("click", () => abrirBuscador(estado.tipoActual));
  $("#btn-sug-volver").addEventListener("click", () => navegar("pantalla-inicio"));

  // Despensa
  $("#btn-despensa-sugerir").addEventListener("click", sugerirDesdeDespensa);
  $("#btn-despensa-volver").addEventListener("click", () => navegar("pantalla-sugerencia"));

  // Productos — filtro súper
  $$("#filtro-super .seg").forEach(b => b.addEventListener("click", () => { Store.setPref("super", b.dataset.super); renderProductos(); }));

  // Hoy
  $("#agua-mas").addEventListener("click", () => { Store.sumarAgua(1); renderHoy(); });
  $("#agua-menos").addEventListener("click", () => { Store.sumarAgua(-1); renderHoy(); });
  $("#comida-select").addEventListener("change", e => {
    const id = e.target.value; if (!id) return;
    const a = ALIMENTOS.find(x => x.id === id); const n = nutriDe(id) || {};
    Store.agregarComida({ id, nombre: a.nombre, kcal: n.kcal || 0, prot: n.prot || 0 });
    e.target.value = ""; renderHoy();
  });

  // Plato
  $("#btn-plato-otro").addEventListener("click", generarPlato);
  $("#btn-plato-compras").addEventListener("click", () => { generarCompras(); navegar("pantalla-compras"); });

  // Compras
  $("#btn-compras-volver").addEventListener("click", () => navegar("pantalla-plato"));
  $("#btn-compras-copiar").addEventListener("click", () => {
    const t = $("#compras-texto").value;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast("Lista copiada ✓")).catch(() => {});
  });

  // Progreso
  $("#btn-peso-guardar").addEventListener("click", () => {
    const kg = parseFloat($("#input-peso").value);
    if (!kg) return;
    Store.registrarPeso(kg);
    $("#input-peso").value = "";
    renderProgreso();
  });

  // Ajustes
  $("#btn-guardar-ajustes").addEventListener("click", guardarAjustes);
  $("#btn-cancelar-ajustes").addEventListener("click", () => navegar("pantalla-inicio"));
  $$("#ajustes-super .seg").forEach(b => b.addEventListener("click", () => { Store.setPref("super", b.dataset.super); $$("#ajustes-super .seg").forEach(x => x.classList.toggle("activo", x === b)); }));
  $$("#ajustes-tema .seg").forEach(b => b.addEventListener("click", () => { Store.setPref("tema", b.dataset.tema); $$("#ajustes-tema .seg").forEach(x => x.classList.toggle("activo", x === b)); aplicarTema(); }));
  $("#btn-calc").addEventListener("click", calcularCalorias);
  $("#rec-agua").addEventListener("change", e => {
    if (e.target.checked) pedirPermisoNotif(ok => { Store.setRecordatorio("agua", ok); if (!ok) { e.target.checked = false; toast("Permiso de notificaciones denegado"); } configurarRecordatorios(); });
    else { Store.setRecordatorio("agua", false); configurarRecordatorios(); }
  });
  $("#rec-comidas").addEventListener("change", e => {
    if (e.target.checked) pedirPermisoNotif(ok => { Store.setRecordatorio("comidas", ok); if (!ok) e.target.checked = false; configurarRecordatorios(); });
    else { Store.setRecordatorio("comidas", false); configurarRecordatorios(); }
  });
  $("#btn-exportar").addEventListener("click", exportarDatos);
  $("#input-importar").addEventListener("change", e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { Store.importar(rd.result); toast("Datos importados ✓"); aplicarTema(); } catch (err) { toast("Archivo inválido"); } };
    rd.readAsText(f);
  });
  $("#btn-borrar").addEventListener("click", () => { if ($("#btn-borrar").dataset.c) { Store.borrarTodo(); location.reload(); } else { $("#btn-borrar").dataset.c = "1"; $("#btn-borrar").textContent = "¿Seguro? Toca de nuevo"; } });
  $("#btn-porcion-volver").addEventListener("click", () => navegar("pantalla-inicio"));
}

/* ---------- Toast ---------- */
function toast(msg) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  aplicarTema();
  initEventos();
  actualizarSaludo();
  configurarRecordatorios();
  const v = $("#app-version"); if (v) v.textContent = "v" + APP_VERSION;
  navegar("pantalla-inicio");
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
});
