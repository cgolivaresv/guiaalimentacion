# 🥗 Guía de Alimentación

App web (PWA) que sugiere **qué comer o beber** en el momento, según:

- **Cómo te sientes**: hambre o sed.
- **La hora del día**: desayuno, media mañana, almuerzo, once, cena o noche.
- **Tus gustos**: vegetariano, estilo mediterráneo, alta proteína, sin gluten, y alimentos que prefieres evitar.
- **La evidencia científica** sobre saciedad y control de peso.

Pensada como apoyo para **bajar de peso** sin pasar hambre, favoreciendo alimentos que sacian más por caloría.

---

## Cómo funciona

1. Tocas **"Tengo hambre"** o **"Tengo sed"**.
2. Si es hambre, la app propone **probar primero un vaso de agua** (paso sin costo; si el hambre sigue tras 10-15 min, es hambre real).
3. Te sugiere **un alimento o bebida** con una porción y el **porqué** científico.
4. Si **no lo tienes**, marcas qué hay en tu despensa y te propone la **mejor alternativa disponible**.
5. "Sugerir otra opción" te da variantes.

Tus gustos se guardan en el navegador (`localStorage`). Funciona **offline** e **instalable** en el teléfono (PWA).

---

## Fundamento científico

El motor de sugerencias prioriza alimentos de **alta saciedad y baja densidad energética**, con estos criterios:

- **Proteína**: comidas más altas en proteína aumentan la sensación de saciedad frente a comidas bajas en proteína; dietas con ~25-30% de las calorías en proteína facilitan comer menos. El huevo en el desayuno produce más saciedad y reduce la ingesta posterior frente a un pan de igual peso.
- **Fibra**: los alimentos ricos en fibra (legumbres, avena, verduras, fruta entera) reducen el apetito a mediano plazo porque actúan en el intestino bajo; la avena (beta-glucano) eleva hormonas de saciedad horas después.
- **Densidad energética baja**: alimentos con mucha agua y fibra (verduras, sopas, fruta) llenan más con menos calorías. Comer menos densidad energética lleva a comer menos sin sentir restricción.
- **Índice de saciedad (U. de Sídney, 1995)**: a igual cantidad de calorías, la **papa hervida** fue el alimento más saciante; frutas, pescado, legumbres y huevo puntúan alto; los snacks ultraprocesados puntúan bajo.
- **Hambre vs. sed**: la evidencia de que "se confunden" es **mixta** — son mecanismos fisiológicos distintos. Por eso la app **no afirma** que tu hambre sea sed, sino que propone el agua como una prueba rápida y sin riesgo antes de comer, útil sobre todo en tardes largas o días con poca ingesta de líquido.

### Referencias

- Holt SHA, Brand Miller JC, et al. *A satiety index of common foods.* European Journal of Clinical Nutrition, 1995.
- Batterham RL, et al. *Critical role for peptide YY in protein-mediated satiation and body-weight regulation.* Cell Metabolism, 2006.
- Rolls BJ. Investigaciones sobre densidad energética y saciedad, Pennsylvania State University.
- McKiernan F, Hollis JH, McCabe GP, Mattes RD. *Thirst-drinking, hunger-eating; tight coupling?* J Am Diet Assoc, 2009.
- Revisiones sobre proteína y saciedad, y sobre fibra/beta-glucano de avena y control del apetito.

> ⚠️ **Aviso**: es orientación general basada en evidencia. **No reemplaza** la indicación de tu médico ni de un nutricionista, sobre todo si tienes alguna condición de salud. Para un plan personalizado y seguro, consulta a un profesional.

---

## Estructura

```
guiaalimentacion/
├── index.html              # Interfaz
├── css/styles.css          # Estilos (mobile-first)
├── js/
│   ├── data.js             # Base de datos de alimentos/bebidas + razones científicas
│   └── app.js              # Lógica: flujo hambre/sed, filtros, ranking, despensa
├── manifest.webmanifest    # PWA
├── sw.js                   # Service worker (offline)
└── icons/                  # Iconos PWA
```

### Cómo probarla localmente

```bash
# Un servidor estático cualquiera, p. ej.:
python3 -m http.server 8080
# luego abre http://localhost:8080
```

---

## Ideas para seguir

- Más alimentos y platos chilenos en `data.js`.
- Registro del día (qué comiste / cuánta agua) y racha.
- Recordatorios de hidratación por hora.
- Ajuste del tamaño de porción según objetivo de calorías.
- Sincronización entre dispositivos (hoy los gustos viven solo en el navegador).
