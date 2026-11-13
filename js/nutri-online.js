/* ============================================================
   nutri-online.js — Nutrición desde fuentes públicas
   ------------------------------------------------------------
   - Open Food Facts (OFF): productos por código de barras o texto.
   - USDA FoodData Central (FDC): alimentos genéricos (en inglés).
   - Sellos "Alto en" calculados según la Ley 20.606 (Chile).
   Nota: las llamadas de red funcionan en el sitio publicado
   (GitHub Pages), no dentro de la vista previa de Claude.
   ============================================================ */

/* Umbrales de la Ley 20.606 (fase vigente desde 2019).
   Sólidos por 100 g; líquidos por 100 ml. */
const UMBRALES_SELLO = {
  solido:  { calorias: 275, azucar: 10, grasaSat: 4, sodio: 400 },
  liquido: { calorias: 70,  azucar: 5,  grasaSat: 3, sodio: 100 }
};
function calcularSellos(n, esLiquido) {
  const u = esLiquido ? UMBRALES_SELLO.liquido : UMBRALES_SELLO.solido;
  const s = [];
  if (n.calorias != null && n.calorias >= u.calorias) s.push("calorias");
  if (n.azucar  != null && n.azucar  >= u.azucar)  s.push("azucar");
  if (n.grasaSat != null && n.grasaSat >= u.grasaSat) s.push("grasas");
  if (n.sodio   != null && n.sodio   >= u.sodio)   s.push("sodio");
  return s;
}

function _round(x) { return (x == null || isNaN(x)) ? null : Math.round(x); }

/* ---------- Open Food Facts ---------- */
function offNormalizar(p) {
  const n = p.nutriments || {};
  let sodioMg = null;
  if (n["sodium_100g"] != null) sodioMg = n["sodium_100g"] * 1000;
  else if (n["salt_100g"] != null) sodioMg = n["salt_100g"] * 400; // sal(g)→sodio(mg): *0.4*1000
  const cats = p.categories || "";
  const nombreIni = (p.product_name || "").trim();
  const esLiquido = /beverage|drink|boisson|bebida|jugo|gaseosa|refresco|soda|agua mineral|néctar|nectar/i.test(cats)
    || /^(agua|bebida|jugo|leche|gaseosa|refresco|néctar|nectar)\b/i.test(nombreIni);
  const out = {
    codigo: p.code,
    nombre: (p.product_name || "Producto") + (p.brands ? " — " + p.brands.split(",")[0] : ""),
    kcal: _round(n["energy-kcal_100g"]),
    prot: _round(n["proteins_100g"]),
    azucar: n["sugars_100g"] != null ? n["sugars_100g"] : null,
    grasaSat: n["saturated-fat_100g"] != null ? n["saturated-fat_100g"] : null,
    sodio: sodioMg,
    nova: p.nova_group || null,
    nutriscore: p.nutriscore_grade ? p.nutriscore_grade.toUpperCase() : null,
    fuente: "Open Food Facts", por: esLiquido ? "100 ml" : "100 g"
  };
  out.sellos = calcularSellos({ calorias: out.kcal, azucar: out.azucar, grasaSat: out.grasaSat, sodio: out.sodio }, esLiquido);
  return out;
}
async function offPorCodigo(code) {
  const url = "https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(code) +
    ".json?fields=code,product_name,brands,categories,nutriments,nova_group,nutriscore_grade,quantity";
  const r = await fetch(url, { headers: { "User-Agent": "GuiaAlimentacion/2.4 (cgolivaresv)" } });
  const j = await r.json();
  if (j.status !== 1 || !j.product) return null;
  return offNormalizar(j.product);
}
async function offBuscarTexto(q) {
  const url = "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" + encodeURIComponent(q) +
    "&search_simple=1&action=process&json=1&page_size=12&fields=code,product_name,brands,categories,nutriments,nova_group,nutriscore_grade";
  const r = await fetch(url);
  const j = await r.json();
  return (j.products || []).filter(p => p.product_name).map(offNormalizar);
}

/* ---------- USDA FoodData Central ---------- */
async function usdaBuscar(q, key) {
  const k = key || "DEMO_KEY"; // DEMO_KEY funciona con bajo volumen
  const url = "https://api.nal.usda.gov/fdc/v1/foods/search?query=" + encodeURIComponent(q) +
    "&pageSize=6&api_key=" + encodeURIComponent(k);
  const r = await fetch(url);
  if (!r.ok) throw new Error("USDA " + r.status);
  const j = await r.json();
  return (j.foods || []).map(f => {
    const get = names => { const fn = (f.foodNutrients || []).find(x => names.includes(x.nutrientName)); return fn ? fn.value : null; };
    const o = {
      nombre: f.description,
      kcal: _round(get(["Energy"])),
      prot: _round(get(["Protein"])),
      azucar: get(["Sugars, total including NLEA", "Sugars, total"]),
      grasaSat: get(["Fatty acids, total saturated"]),
      sodio: get(["Sodium, Na"]),
      fuente: "USDA FoodData Central", por: "100 g"
    };
    o.sellos = calcularSellos({ calorias: o.kcal, azucar: o.azucar, grasaSat: o.grasaSat, sodio: o.sodio }, false);
    return o;
  });
}

/* ---------- Escáner de código de barras (html5-qrcode) ---------- */
let _scanner = null;
function iniciarEscaner(onCode, onError) {
  if (!window.Html5Qrcode) { onError && onError("El lector de códigos no está disponible."); return; }
  const regionId = "escaner-region";
  try {
    _scanner = new window.Html5Qrcode(regionId);
    _scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 160 } },
      (txt) => { detenerEscaner(); onCode(txt); },
      () => {}
    ).catch(err => { onError && onError("No se pudo abrir la cámara. Prueba en el sitio publicado (Pages) y da permiso de cámara."); });
  } catch (e) { onError && onError("No se pudo iniciar el lector."); }
}
function detenerEscaner() {
  if (_scanner) { try { _scanner.stop().then(() => _scanner.clear()).catch(() => {}); } catch (e) {} _scanner = null; }
}

if (typeof module !== "undefined") module.exports = { calcularSellos, offNormalizar, offPorCodigo, offBuscarTexto, usdaBuscar, UMBRALES_SELLO };
