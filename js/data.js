/* ============================================================
   data.js — Base de datos de alimentos y bebidas
   ------------------------------------------------------------
   Cada ítem está puntuado según evidencia sobre saciedad y
   control de peso (ver README.md). Escala de saciedad 1-5:
     5 = muy saciante por caloría (alta proteína + fibra + agua,
         baja densidad energética)
     1 = poco saciante / fácil de sobreconsumir
   densidad: densidad energética (kcal por gramo)
     "baja"  -> mucha agua/fibra, pocas calorías por bocado
     "media"
     "alta"  -> muchas calorías en poco volumen
   momentos: cuándo encaja mejor en el día
   etiquetas: para filtrar por gustos / dieta
   ============================================================ */

const MOMENTOS = ["desayuno", "media_manana", "almuerzo", "once", "cena", "noche"];

/* ---------- ALIMENTOS (para el HAMBRE) ---------- */
const ALIMENTOS = [
  {
    id: "huevo_cocido",
    nombre: "Huevos cocidos",
    emoji: "🥚",
    categorias: ["proteina", "huevo"],
    saciedad: 5,
    densidad: "baja",
    proteina: "alta", fibra: "baja", agua: "media",
    momentos: ["desayuno", "media_manana", "almuerzo", "once", "cena"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "proteina_alta", "economico"],
    porcion: "1-2 huevos",
    porque: "Desayunar huevo produce más saciedad y reduce la ingesta de calorías de la mañana frente a un pan de igual peso."
  },
  {
    id: "yogur_natural",
    nombre: "Yogur natural / griego sin azúcar",
    emoji: "🥛",
    categorias: ["proteina", "lacteo"],
    saciedad: 5,
    densidad: "baja",
    proteina: "alta", fibra: "baja", agua: "alta",
    momentos: ["desayuno", "media_manana", "once", "noche"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "proteina_alta"],
    porcion: "1 pote (150-170 g)",
    porque: "Alta proteína y mucha agua: sacia con pocas calorías. Mejor sin azúcar añadida."
  },
  {
    id: "queso_fresco",
    nombre: "Queso fresco / cottage",
    emoji: "🧀",
    categorias: ["proteina", "lacteo"],
    saciedad: 4,
    densidad: "media",
    proteina: "alta", fibra: "baja", agua: "media",
    momentos: ["desayuno", "media_manana", "once", "cena"],
    etiquetas: ["vegetariano", "sin_gluten", "proteina_alta"],
    porcion: "80-100 g",
    porque: "Proteína láctea saciante; el cottage suma volumen con pocas calorías."
  },
  {
    id: "lentejas",
    nombre: "Lentejas",
    emoji: "🫘",
    categorias: ["proteina", "legumbre"],
    saciedad: 5,
    densidad: "baja",
    proteina: "alta", fibra: "alta", agua: "alta",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "proteina_alta", "fibra_alta", "economico"],
    porcion: "1 plato (1 taza cocida)",
    porque: "Proteína + fibra + agua. La fibra actúa en el intestino bajo y reduce el apetito horas después."
  },
  {
    id: "porotos",
    nombre: "Porotos / garbanzos",
    emoji: "🫘",
    categorias: ["proteina", "legumbre"],
    saciedad: 5,
    densidad: "baja",
    proteina: "alta", fibra: "alta", agua: "alta",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "proteina_alta", "fibra_alta", "economico"],
    porcion: "1 plato (1 taza cocida)",
    porque: "Legumbre muy saciante por su combinación de fibra y proteína vegetal."
  },
  {
    id: "avena",
    nombre: "Avena",
    emoji: "🥣",
    categorias: ["cereal_integral"],
    saciedad: 5,
    densidad: "media",
    proteina: "media", fibra: "alta", agua: "alta",
    momentos: ["desayuno", "media_manana", "once"],
    etiquetas: ["mediterranea", "vegetariano", "fibra_alta"],
    porcion: "40-50 g en agua o leche",
    porque: "El beta-glucano de la avena aumenta hormonas de saciedad horas después de comer."
  },
  {
    id: "papa_cocida",
    nombre: "Papa cocida (con cáscara)",
    emoji: "🥔",
    categorias: ["tuberculo"],
    saciedad: 5,
    densidad: "baja",
    proteina: "baja", fibra: "media", agua: "alta",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["vegetariano", "sin_gluten", "economico"],
    porcion: "1 unidad mediana",
    porque: "La papa hervida fue el alimento MÁS saciante del índice de saciedad de la U. de Sídney. Hervida, no frita."
  },
  {
    id: "pescado",
    nombre: "Pescado (merluza, jurel, atún al agua)",
    emoji: "🐟",
    categorias: ["proteina", "pescado"],
    saciedad: 5,
    densidad: "baja",
    proteina: "alta", fibra: "baja", agua: "media",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["mediterranea", "sin_gluten", "proteina_alta"],
    porcion: "1 filete (120-150 g)",
    porque: "Proteína magra muy saciante; pilar de la dieta mediterránea."
  },
  {
    id: "pollo",
    nombre: "Pollo o pavo a la plancha",
    emoji: "🍗",
    categorias: ["proteina", "carne_blanca"],
    saciedad: 5,
    densidad: "media",
    proteina: "alta", fibra: "baja", agua: "media",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["sin_gluten", "proteina_alta"],
    porcion: "1 presa (120-150 g)",
    porque: "Dietas con ~25-30% de calorías en proteína facilitan comer menos sin pasar hambre."
  },
  {
    id: "ensalada",
    nombre: "Ensalada de verduras",
    emoji: "🥗",
    categorias: ["verdura"],
    saciedad: 4,
    densidad: "baja",
    proteina: "baja", fibra: "alta", agua: "alta",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "fibra_alta"],
    porcion: "1 plato grande",
    porque: "Mucho volumen con pocas calorías: llena el estómago antes de llegar a muchas calorías."
  },
  {
    id: "verduras_salteadas",
    nombre: "Verduras cocidas / salteadas",
    emoji: "🥦",
    categorias: ["verdura"],
    saciedad: 4,
    densidad: "baja",
    proteina: "baja", fibra: "alta", agua: "alta",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "fibra_alta"],
    porcion: "1 plato",
    porque: "Baja densidad energética: comes menos calorías comiendo el mismo volumen."
  },
  {
    id: "manzana",
    nombre: "Manzana",
    emoji: "🍎",
    categorias: ["fruta"],
    saciedad: 4,
    densidad: "baja",
    proteina: "baja", fibra: "media", agua: "alta",
    momentos: ["media_manana", "once", "noche"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "fibra_alta"],
    porcion: "1 unidad",
    porque: "Agua + fibra la hacen de las frutas más saciantes para picar entre horas. Entera, no en jugo."
  },
  {
    id: "naranja",
    nombre: "Naranja / mandarina",
    emoji: "🍊",
    categorias: ["fruta"],
    saciedad: 4,
    densidad: "baja",
    proteina: "baja", fibra: "media", agua: "alta",
    momentos: ["media_manana", "once", "noche"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten"],
    porcion: "1 unidad",
    porque: "Mucha agua y fibra; sacia e hidrata a la vez. Entera, no en jugo."
  },
  {
    id: "platano",
    nombre: "Plátano",
    emoji: "🍌",
    categorias: ["fruta"],
    saciedad: 3,
    densidad: "media",
    proteina: "baja", fibra: "media", agua: "media",
    momentos: ["desayuno", "media_manana"],
    etiquetas: ["vegetariano", "sin_gluten"],
    porcion: "1 unidad",
    porque: "Saciante y práctico; algo más calórico que otras frutas, mejor de día que de noche."
  },
  {
    id: "frutos_secos",
    nombre: "Frutos secos (nueces, almendras)",
    emoji: "🥜",
    categorias: ["grasa_saludable"],
    saciedad: 3,
    densidad: "alta",
    proteina: "media", fibra: "media", agua: "baja",
    momentos: ["media_manana", "once"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "proteina_alta"],
    porcion: "1 puñado pequeño (20-30 g)",
    porque: "Grasa saludable + fibra saciantes, pero densos en calorías: clave respetar el puñado."
  },
  {
    id: "palta",
    nombre: "Palta",
    emoji: "🥑",
    categorias: ["grasa_saludable"],
    saciedad: 3,
    densidad: "alta",
    proteina: "baja", fibra: "alta", agua: "media",
    momentos: ["desayuno", "almuerzo", "once"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "fibra_alta"],
    porcion: "1/2 unidad",
    porque: "Grasa + fibra dan saciedad prolongada; mejor que el aceite por su fibra. Cuidar la cantidad."
  },
  {
    id: "sopa_verduras",
    nombre: "Sopa / crema de verduras",
    emoji: "🍲",
    categorias: ["verdura", "sopa"],
    saciedad: 5,
    densidad: "baja",
    proteina: "baja", fibra: "alta", agua: "alta",
    momentos: ["almuerzo", "cena", "noche"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten", "fibra_alta"],
    porcion: "1 plato hondo",
    porque: "Satisface hambre y sed a la vez: mucha agua + fibra, muy pocas calorías. Ideal de noche."
  },
  {
    id: "pan_integral",
    nombre: "Pan integral + proteína (huevo/queso/palta)",
    emoji: "🍞",
    categorias: ["cereal_integral"],
    saciedad: 3,
    densidad: "media",
    proteina: "media", fibra: "media", agua: "baja",
    momentos: ["desayuno", "once"],
    etiquetas: ["mediterranea", "vegetariano", "fibra_alta"],
    porcion: "1-2 rebanadas",
    porque: "El integral sacia más que el blanco; acompáñalo de proteína para que dure. Solo, llena poco."
  },
  {
    id: "choclo_quinoa",
    nombre: "Quinoa / choclo",
    emoji: "🌽",
    categorias: ["cereal_integral"],
    saciedad: 4,
    densidad: "media",
    proteina: "media", fibra: "alta", agua: "media",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["vegetariano", "sin_gluten", "fibra_alta"],
    porcion: "3/4 taza cocida",
    porque: "Grano con fibra y algo de proteína; más saciante que el arroz blanco."
  },
  {
    id: "tomate_pepino",
    nombre: "Tomate / pepino / apio",
    emoji: "🍅",
    categorias: ["verdura"],
    saciedad: 3,
    densidad: "baja",
    proteina: "baja", fibra: "media", agua: "alta",
    momentos: ["media_manana", "once", "noche"],
    etiquetas: ["mediterranea", "vegetariano", "sin_gluten"],
    porcion: "a voluntad",
    porque: "Casi pura agua y fibra: para picar sin apenas calorías cuando el hambre es por ansiedad."
  },
  {
    id: "edamame",
    nombre: "Edamame / arvejas",
    emoji: "🫛",
    categorias: ["proteina", "legumbre"],
    saciedad: 4,
    densidad: "baja",
    proteina: "alta", fibra: "alta", agua: "media",
    momentos: ["media_manana", "once", "cena"],
    etiquetas: ["vegetariano", "sin_gluten", "proteina_alta", "fibra_alta"],
    porcion: "1 taza",
    porque: "Snack con proteína + fibra, saciante y bajo en calorías."
  },
  {
    id: "atun_ensalada",
    nombre: "Ensalada con atún o pollo",
    emoji: "🥗",
    categorias: ["proteina", "verdura"],
    saciedad: 5,
    densidad: "baja",
    proteina: "alta", fibra: "alta", agua: "alta",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["mediterranea", "sin_gluten", "proteina_alta", "fibra_alta"],
    porcion: "1 plato",
    porque: "Combina lo mejor: volumen de verduras + proteína magra. Muy saciante por caloría."
  },
  {
    id: "carne_molida",
    nombre: "Carne molida magra",
    emoji: "🥩",
    categorias: ["proteina", "carne_roja"],
    saciedad: 4,
    densidad: "media",
    proteina: "alta", fibra: "baja", agua: "media",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["sin_gluten", "proteina_alta"],
    porcion: "120-150 g",
    porque: "Proteína saciante. Elige la más magra (4-7% de grasa) para menos calorías."
  },
  {
    id: "arroz",
    nombre: "Arroz (mejor integral)",
    emoji: "🍚",
    categorias: ["carbohidrato", "cereal"],
    saciedad: 3,
    densidad: "media",
    proteina: "baja", fibra: "baja", agua: "media",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["vegetariano", "sin_gluten"],
    porcion: "3/4 a 1 taza cocida",
    porque: "Energía práctica, pero sacia menos que legumbres o papa. El integral tiene más fibra; mide la porción y acompáñalo de proteína y verduras."
  },
  {
    id: "fideos",
    nombre: "Fideos / pasta (mejor integral)",
    emoji: "🍝",
    categorias: ["carbohidrato", "cereal"],
    saciedad: 3,
    densidad: "media",
    proteina: "media", fibra: "baja", agua: "media",
    momentos: ["almuerzo", "cena"],
    etiquetas: ["vegetariano"],
    porcion: "80 g en seco",
    porque: "Carbohidrato rápido y rendidor. Prefiere integral o 'proslow' (menor índice glicémico), mide la porción y súmale verduras y proteína para que sacie más."
  }
];

/* ---------- BEBIDAS (para la SED) ---------- */
const BEBIDAS = [
  {
    id: "agua",
    nombre: "Agua",
    emoji: "💧",
    categorias: ["agua"],
    saciedad: 0,
    densidad: "baja",
    etiquetas: ["sin_azucar"],
    porcion: "1 vaso (250 ml)",
    porque: "La mejor opción, cero calorías. Prueba siempre esto primero."
  },
  {
    id: "agua_fruta",
    nombre: "Agua con rodajas de fruta o menta",
    emoji: "🍋",
    categorias: ["agua"],
    saciedad: 0,
    densidad: "baja",
    etiquetas: ["sin_azucar"],
    porcion: "1 vaso",
    porque: "Sabor sin azúcar: ayuda a beber más agua durante el día."
  },
  {
    id: "infusion",
    nombre: "Té o infusión de hierbas sin azúcar",
    emoji: "🍵",
    categorias: ["infusion"],
    saciedad: 0,
    densidad: "baja",
    etiquetas: ["sin_azucar"],
    porcion: "1 taza",
    porque: "Hidrata y da saciedad por volumen, sin calorías. Evita azucararla."
  },
  {
    id: "agua_gas",
    nombre: "Agua con gas (mineral, sin azúcar)",
    emoji: "🫧",
    categorias: ["agua"],
    saciedad: 0,
    densidad: "baja",
    etiquetas: ["sin_azucar"],
    porcion: "1 vaso",
    porque: "Hidrata igual que el agua. Ojo: el gas puede abrir algo el apetito en algunas personas."
  },
  {
    id: "caldo",
    nombre: "Caldo de verduras desgrasado",
    emoji: "🍜",
    categorias: ["caldo"],
    saciedad: 2,
    densidad: "baja",
    etiquetas: ["sin_azucar"],
    porcion: "1 taza",
    porque: "Hidrata y calma algo de hambre con muy pocas calorías. Útil antes de la cena."
  },
  {
    id: "leche_descremada",
    nombre: "Leche descremada o bebida vegetal sin azúcar",
    emoji: "🥛",
    categorias: ["lacteo"],
    saciedad: 1,
    densidad: "media",
    etiquetas: ["sin_azucar"],
    porcion: "1 vaso",
    porque: "Hidrata y aporta algo de proteína; elige la versión sin azúcar añadida."
  }
];

/* Opciones de despensa para '¿qué tienes?' */
const DESPENSA_OPCIONES = [
  { id: "huevos", label: "Huevos", emoji: "🥚", match: ["huevo_cocido", "pan_integral"] },
  { id: "yogur", label: "Yogur", emoji: "🥛", match: ["yogur_natural"] },
  { id: "queso", label: "Queso fresco", emoji: "🧀", match: ["queso_fresco", "pan_integral"] },
  { id: "legumbres", label: "Legumbres", emoji: "🫘", match: ["lentejas", "porotos"] },
  { id: "avena", label: "Avena", emoji: "🥣", match: ["avena"] },
  { id: "papas", label: "Papas", emoji: "🥔", match: ["papa_cocida"] },
  { id: "pescado", label: "Pescado / atún", emoji: "🐟", match: ["pescado", "atun_ensalada"] },
  { id: "pollo", label: "Pollo / pavo", emoji: "🍗", match: ["pollo", "atun_ensalada"] },
  { id: "verduras", label: "Verduras", emoji: "🥦", match: ["ensalada", "verduras_salteadas", "sopa_verduras", "tomate_pepino"] },
  { id: "fruta", label: "Fruta", emoji: "🍎", match: ["manzana", "naranja", "platano"] },
  { id: "frutos_secos", label: "Frutos secos", emoji: "🥜", match: ["frutos_secos"] },
  { id: "palta", label: "Palta", emoji: "🥑", match: ["palta", "pan_integral"] },
  { id: "pan_integral", label: "Pan integral", emoji: "🍞", match: ["pan_integral"] },
  { id: "quinoa", label: "Quinoa / choclo", emoji: "🌽", match: ["choclo_quinoa"] },
  { id: "arroz", label: "Arroz", emoji: "🍚", match: ["arroz"] },
  { id: "fideos", label: "Fideos / pasta", emoji: "🍝", match: ["fideos"] },
  { id: "carne", label: "Carne molida", emoji: "🥩", match: ["carne_molida"] }
];

/* Preferencias configurables (gustos) */
const ETIQUETAS_GUSTOS = [
  { id: "vegetariano", label: "Vegetariano", desc: "Sin carne ni pescado" },
  { id: "mediterranea", label: "Estilo mediterráneo", desc: "Priorizar pescado, verduras, legumbres, aceite de oliva" },
  { id: "proteina_alta", label: "Alta proteína", desc: "Favorecer opciones ricas en proteína" },
  { id: "sin_gluten", label: "Sin gluten", desc: "Evitar trigo, avena no certificada, pan" }
];

/* ---------- PRODUCTOS reales de supermercados chilenos ----------
   Ejemplos concretos que encajan con cada alimento, para que el
   usuario sepa qué comprar. Datos tomados de las fichas de Jumbo y
   Líder (nov 2026); precios y stock varían, no se incluyen.
   refAlimento enlaza con un id de ALIMENTOS o BEBIDAS.            */
const PRODUCTOS = [
  // Yogur griego / proteico
  { id: "p_colun_griego", nombre: "Yogur Griego Light", marca: "Colun", super: "Jumbo", refAlimento: "yogur_natural", nota: "7 g de proteína, 0% grasa, sin azúcar añadida y sin lactosa." },
  { id: "p_oikos", nombre: "Griego Oikos Natural Sin Endulzar 150 g", marca: "Danone", super: "Jumbo", refAlimento: "yogur_natural", nota: "Rico en proteínas y sin azúcares añadidos." },
  { id: "p_soprole_protein", nombre: "Protein+ 155 g", marca: "Soprole", super: "Jumbo", refAlimento: "yogur_natural", nota: "10 g de proteína por porción, sin azúcar añadida, sin lactosa." },
  { id: "p_quillayes_protein", nombre: "Griego Proteína Natural 140 g", marca: "Quillayes", super: "Jumbo", refAlimento: "yogur_natural", nota: "13 g de proteína y sin endulzar." },
  { id: "p_surlat_whey", nombre: "Whey Protein Natural 140 g", marca: "Surlat", super: "Jumbo", refAlimento: "yogur_natural", nota: "Sin lactosa y sin azúcar añadida." },
  { id: "p_quillayes_triple0", nombre: "Griego Triple 0% Natural 400 g", marca: "Quillayes", super: "Jumbo", refAlimento: "yogur_natural", nota: "Sin materia grasa ni azúcar." },

  // Atún en agua
  { id: "p_atun_lider", nombre: "Lomitos de Atún en Agua", marca: "Lider", super: "Líder", refAlimento: "pescado", nota: "Proteína magra; ~98 kcal por lata drenada (91 g)." },
  { id: "p_atun_rc", nombre: "Atún Lomitos en Agua", marca: "Robinson Crusoe", super: "Jumbo", refAlimento: "pescado", nota: "Rico en proteínas y bajo en grasas; ideal para ensaladas." },
  { id: "p_atun_vc", nombre: "Atún Lomitos en Agua", marca: "Van Camp's", super: "Jumbo", refAlimento: "pescado", nota: "Opción al agua (no en aceite): menos calorías que la versión en aceite." },

  // Avena
  { id: "p_avena_quaker", nombre: "Avena Integral Tradicional", marca: "Quaker", super: "Jumbo / Líder", refAlimento: "avena", nota: "Nutri-Score A; aporta el beta-glucano que da saciedad." },
  { id: "p_avena_multi", nombre: "Avena Multisemillas (chía, linaza, sésamo)", marca: "Quaker", super: "Jumbo", refAlimento: "avena", nota: "Avena + semillas: más fibra. Elige la versión sin pasas si cuidas el azúcar." },
  { id: "p_avena_lider", nombre: "Avena Tradicional", marca: "Lider", super: "Líder", refAlimento: "avena", nota: "Avena tradicional económica, misma base de fibra." },

  // Legumbres
  { id: "p_lentejas_iansa", nombre: "Lentejas 6 mm (secas) 1 kg", marca: "Iansa Agro", super: "Líder", refAlimento: "lentejas", nota: "Secas: máximo control de textura y sin sodio añadido." },
  { id: "p_garbanzos_lider", nombre: "Garbanzos Pelados sin Piel 1 kg", marca: "Lider", super: "Líder", refAlimento: "porotos", nota: "Secos, sin piel; cocción más rápida." },
  { id: "p_lentejas_drenadas", nombre: "Lentejas drenadas 230 g (listas)", marca: "Lider", super: "Líder", refAlimento: "lentejas", nota: "Ya cocidas para comida rápida; revisa el sodio y enjuágalas." },

  // Frutos secos (porción controlada)
  { id: "p_mani_tribu", nombre: "Maní Tostado Sin Sal 700 g", marca: "Tribu", super: "Jumbo", refAlimento: "frutos_secos", nota: "Sin sal; cuida la porción (un puñado), son densos en calorías." },
  { id: "p_puronuts", nombre: "Mix Puro Nuts (maní, almendra, cajú)", marca: "Cuisine & Co", super: "Jumbo", refAlimento: "frutos_secos", nota: "Sin sal y sin azúcar añadida; sin pasas, mejor para bajar de peso." },
  { id: "p_millantu", nombre: "Surtido Sin Sal 200 g", marca: "Millantú", super: "Jumbo", refAlimento: "frutos_secos", nota: "Surtido sin sal para colación; respeta el puñado." },

  // Quesos frescos / quesillo
  { id: "p_quesillo_colun", nombre: "Quesillo Pote 320 g", marca: "Colun", super: "Jumbo", refAlimento: "queso_fresco", nota: "Alto en proteínas y liviano; ideal para colación o ensalada." },
  { id: "p_qfresco_colun", nombre: "Queso Fresco 450 g", marca: "Colun", super: "Jumbo", refAlimento: "queso_fresco", nota: "Fresco, suave; buena proteína con menos grasa que un chanco." },
  { id: "p_quesillo_soprole", nombre: "Quesillo Sin Lactosa 300 g", marca: "Soprole", super: "Jumbo", refAlimento: "queso_fresco", nota: "Sin lactosa; proteína liviana para once o cena." },
  { id: "p_ricotta_light", nombre: "Queso Ricotta Light 200 g", marca: "Quillayes", super: "Jumbo", refAlimento: "queso_fresco", nota: "Ricotta baja en grasa; cremosa con pocas calorías." },

  // ---- Carnes y proteínas (recomendado) ----
  { id: "p_molida4", nombre: "Carne Molida Vacuno 4% Grasa 500 g", marca: "Cuisine & Co", super: "Jumbo", refAlimento: "carne_molida", perfil: "recomendado", nota: "La más magra (4% grasa): máxima proteína con menos calorías." },
  { id: "p_molida7", nombre: "Carne Molida Vacuno 7% Grasa 500 g", marca: "Cuisine & Co", super: "Jumbo", refAlimento: "carne_molida", perfil: "recomendado", nota: "Magra (7% grasa); buena para salsas y guisos livianos." },
  { id: "p_pechuga", nombre: "Pechuga de Pollo Deshuesada 800 g", marca: "Cuisine & Co", super: "Jumbo", refAlimento: "pollo", perfil: "recomendado", nota: "Sin marinar: proteína magra, tú controlas sal y aceite." },
  { id: "p_jurel", nombre: "Jurel Natural Bajo en Sodio 300 g", marca: "Cuisine & Co", super: "Jumbo", refAlimento: "pescado", perfil: "recomendado", nota: "Pescado al natural y bajo en sodio; omega-3 y proteína." },
  { id: "p_huevos", nombre: "Huevos Grandes 12 un.", marca: "Cuisine & Co", super: "Jumbo", refAlimento: "huevo_cocido", perfil: "recomendado", nota: "Proteína de alto valor; de los alimentos más saciantes." },

  // ---- Lácteos / bebibles (recomendado) ----
  { id: "p_leche_desc", nombre: "Leche Descremada 1 L", marca: "Colun", super: "Jumbo", refAlimento: "leche_descremada", perfil: "recomendado", nota: "Hidrata y aporta proteína con poca grasa." },
  { id: "p_loncoproteina", nombre: "Leche Extra Proteína 1 L", marca: "Loncoleche", super: "Jumbo", refAlimento: "leche_descremada", perfil: "recomendado", nota: "Más proteína por vaso: suma saciedad." },

  // ---- Carbohidratos / despensa (con moderación) ----
  { id: "p_arroz_tucapel", nombre: "Arroz Grano Largo Grado 2 1 kg", marca: "Tucapel", super: "Jumbo", refAlimento: "arroz", perfil: "moderar", nota: "Básico rendidor; mide la porción (~1 taza cocida) y suma verduras." },
  { id: "p_spag_integral", nombre: "Spaghetti Integral 400 g", marca: "Carozzi", super: "Jumbo", refAlimento: "fideos", perfil: "moderar", nota: "Integral: más fibra que la pasta blanca, sacia algo más." },
  { id: "p_proslow", nombre: "Espirales Proslow 400 g", marca: "Lucchetti", super: "Jumbo", refAlimento: "fideos", perfil: "moderar", nota: "Línea 'Proslow' de menor índice glicémico: energía más estable." },
  { id: "p_spag5", nombre: "Spaghetti N°5 400 g", marca: "Carozzi", super: "Jumbo / Líder", refAlimento: "fideos", perfil: "moderar", nota: "Pasta blanca clásica; porción medida y acompáñala con proteína." },
  { id: "p_hallulla", nombre: "Pan Hallulla Precocida 8 un.", marca: "Cuisine & Co", super: "Jumbo", grupo: "🥖 Pan", perfil: "moderar", nota: "Sacia menos que el integral; mejor con huevo, palta o quesillo encima." },
  { id: "p_harina_int", nombre: "Harina Integral 1 kg", marca: "Selecta", super: "Jumbo", grupo: "🌾 Despensa", perfil: "moderar", nota: "Para hornear con más fibra que la harina blanca." },

  // ---- Para untar / grasas ----
  { id: "p_oliva", nombre: "Aceite de Oliva Extra Virgen 500 ml", marca: "Chef", super: "Jumbo", grupo: "🫒 Aceites y grasas", perfil: "recomendado", nota: "Grasa saludable del estilo mediterráneo; mídelo (es calórico): 1 cdta por plato." },
  { id: "p_quesocrema_light", nombre: "Queso Crema '67 Calorías' 227 g", marca: "Cuisine & Co", super: "Jumbo", grupo: "🧈 Para untar", perfil: "moderar", nota: "Versión reducida en calorías para untar; mejor que el queso crema normal." },
  { id: "p_mantequilla", nombre: "Mantequilla con Sal 250 g", marca: "Colun", super: "Jumbo", grupo: "🧈 Para untar", perfil: "moderar", nota: "Rica pero densa en grasa; úsala en poca cantidad." },

  // ---- Bebidas ----
  { id: "p_cola_zero", nombre: "Bebida Cola Zero / Sin Azúcar", marca: "Coca-Cola", super: "Jumbo / Líder", grupo: "🥤 Bebidas sin azúcar", perfil: "moderar", nota: "Sin azúcar ni calorías; mejor que la azucarada, pero el agua sigue siendo la base." },

  // ---- Caprichos (ocasional) ----
  { id: "p_cola", nombre: "Bebida Cola Original (con azúcar)", marca: "Coca-Cola", super: "Jumbo / Líder", grupo: "🍟 Caprichos (ocasional)", perfil: "ocasional", nota: "Azúcar líquida: muchas calorías que no sacian. Déjala para ocasiones." },
  { id: "p_lays", nombre: "Papas Fritas", marca: "Lay's", super: "Jumbo", grupo: "🍟 Caprichos (ocasional)", perfil: "ocasional", nota: "Alta densidad calórica y muy fáciles de sobreconsumir; porción pequeña y ocasional." },
  { id: "p_doritos", nombre: "Snack Doritos", marca: "Evercrisp", super: "Jumbo", grupo: "🍟 Caprichos (ocasional)", perfil: "ocasional", nota: "Snack ultraprocesado: poco saciante por caloría." },
  { id: "p_nuggets", nombre: "Nuggets de Pollo 400 g", marca: "La Crianza", super: "Jumbo", grupo: "🍟 Caprichos (ocasional)", perfil: "ocasional", nota: "Apanado y frito: más calorías que el pollo a la plancha." },
  { id: "p_manjar", nombre: "Manjar 400 g", marca: "Colun", super: "Jumbo", grupo: "🍟 Caprichos (ocasional)", perfil: "ocasional", nota: "Muy dulce y calórico; una cucharadita de vez en cuando." },
  { id: "p_helado", nombre: "Postre / Helado", marca: "Soprole / Mega", super: "Jumbo", grupo: "🍟 Caprichos (ocasional)", perfil: "ocasional", nota: "Gusto ocasional; busca porciones individuales para controlar la cantidad." }
];

/* Perfil por defecto: los productos antiguos son 'recomendado' */
function perfilDe(p) { return p.perfil || "recomendado"; }

/* Productos recomendados que corresponden a un alimento (para la sugerencia) */
function productosDe(idAlimento) {
  return PRODUCTOS.filter(p => p.refAlimento === idAlimento && perfilDe(p) === "recomendado");
}

if (typeof module !== "undefined") {
  module.exports = { ALIMENTOS, BEBIDAS, DESPENSA_OPCIONES, ETIQUETAS_GUSTOS, MOMENTOS, PRODUCTOS, productosDe, perfilDe };
}
