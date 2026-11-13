/* ============================================================
   store.js — Estado persistente (localStorage)
   ------------------------------------------------------------
   Todo lo que la app recuerda vive aquí. Un solo objeto 'estado'
   serializado bajo una clave, con helpers de lectura/escritura,
   más export/import en JSON para respaldar o migrar.
   ============================================================ */

const STORE_KEY = "guiaalim_v2";

const Store = (() => {
  function base() {
    return {
      prefs: {
        nombre: "",
        gustos: [],
        noMeGusta: [],
        super: "ambos",        // "jumbo" | "lider" | "ambos"
        metaAgua: 8,           // vasos/día
        metaCalorias: null,    // kcal/día objetivo (de la calculadora)
        metaProteina: null,    // g/día objetivo
        tema: "auto"           // "auto" | "claro" | "oscuro"
      },
      favoritos: [],           // ids de alimentos
      registros: {},           // { "2026-11-12": { agua: 3, comidas: [ {id,nombre,kcal,prot,hora} ] } }
      pesos: [],               // [ { fecha:"2026-11-12", kg: 82.4 } ]
      aprendizaje: {},         // { alimentoId: aceptaciones }
      recordatorios: { agua: false, comidas: false }
    };
  }

  let data = cargar();

  function cargar() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return base();
      return deepMerge(base(), JSON.parse(raw));
    } catch (e) { return base(); }
  }
  function guardar() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function deepMerge(a, b) {
    const out = Array.isArray(a) ? b : Object.assign({}, a);
    if (a && typeof a === "object" && !Array.isArray(a) && b && typeof b === "object") {
      Object.keys(b).forEach(k => {
        out[k] = (a[k] && typeof a[k] === "object" && !Array.isArray(a[k]))
          ? deepMerge(a[k], b[k]) : b[k];
      });
    }
    return out;
  }

  /* ---- Fecha de hoy (local) ---- */
  function hoyKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ---- Preferencias ---- */
  function prefs() { return data.prefs; }
  function setPref(k, v) { data.prefs[k] = v; guardar(); }

  /* ---- Favoritos ---- */
  function esFavorito(id) { return data.favoritos.includes(id); }
  function toggleFavorito(id) {
    const i = data.favoritos.indexOf(id);
    if (i >= 0) data.favoritos.splice(i, 1); else data.favoritos.push(id);
    guardar();
    return esFavorito(id);
  }
  function favoritos() { return data.favoritos.slice(); }

  /* ---- Registro diario ---- */
  function registroDe(fecha) {
    const k = fecha || hoyKey();
    if (!data.registros[k]) data.registros[k] = { agua: 0, comidas: [] };
    return data.registros[k];
  }
  function sumarAgua(n) {
    const r = registroDe();
    r.agua = Math.max(0, r.agua + n);
    guardar();
    return r.agua;
  }
  function agregarComida(c) {
    const r = registroDe();
    r.comidas.push(Object.assign({ hora: horaAhora() }, c));
    guardar();
    return r.comidas;
  }
  function quitarComida(idx) {
    const r = registroDe();
    r.comidas.splice(idx, 1);
    guardar();
  }
  function horaAhora() {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  /* ---- Racha: días consecutivos (hasta hoy) que cumplieron la meta de agua ---- */
  function racha() {
    const meta = data.prefs.metaAgua || 8;
    let n = 0;
    let d = new Date();
    // Si hoy aún no cumple, la racha se cuenta hasta ayer
    for (let i = 0; i < 400; i++) {
      const k = hoyKey(d);
      const reg = data.registros[k];
      const cumple = reg && reg.agua >= meta;
      if (cumple) {
        n++;
      } else if (i === 0) {
        // hoy no cumplido todavía: no corta la racha previa, seguimos a ayer
      } else {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  function totalesHoy() {
    const r = registroDe();
    const kcal = r.comidas.reduce((s, c) => s + (c.kcal || 0), 0);
    const prot = r.comidas.reduce((s, c) => s + (c.prot || 0), 0);
    return { agua: r.agua, kcal, prot, comidas: r.comidas.length };
  }

  /* ---- Peso ---- */
  function pesos() { return data.pesos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)); }
  function registrarPeso(kg, fecha) {
    const f = fecha || hoyKey();
    const ex = data.pesos.find(p => p.fecha === f);
    if (ex) ex.kg = kg; else data.pesos.push({ fecha: f, kg });
    guardar();
  }
  function quitarPeso(fecha) {
    data.pesos = data.pesos.filter(p => p.fecha !== fecha);
    guardar();
  }

  /* ---- Aprendizaje: cuántas veces aceptó un alimento ---- */
  function registrarAceptacion(id) {
    data.aprendizaje[id] = (data.aprendizaje[id] || 0) + 1;
    guardar();
  }
  function bonusAprendizaje(id) { return data.aprendizaje[id] || 0; }

  /* ---- Recordatorios ---- */
  function recordatorios() { return data.recordatorios; }
  function setRecordatorio(k, v) { data.recordatorios[k] = v; guardar(); }

  /* ---- Export / Import ---- */
  function exportar() { return JSON.stringify(data, null, 2); }
  function importar(json) {
    const obj = JSON.parse(json);
    data = deepMerge(base(), obj);
    guardar();
  }
  function borrarTodo() { data = base(); guardar(); }

  return {
    hoyKey, prefs, setPref,
    esFavorito, toggleFavorito, favoritos,
    registroDe, sumarAgua, agregarComida, quitarComida, totalesHoy, racha,
    pesos, registrarPeso, quitarPeso,
    registrarAceptacion, bonusAprendizaje,
    recordatorios, setRecordatorio,
    exportar, importar, borrarTodo
  };
})();

if (typeof module !== "undefined") module.exports = { Store };
