# ANÁLISIS EXHAUSTIVO — Stack SomnoSalud / Conversor PSG

**Fecha:** 2026-05-07
**Cliente:** Dr. Pablo Ferrero (IFN — Instituto Ferrero de Neurología y Sueño)
**Partner técnico:** Pampa Labs (Cowork + Jorge Leporace)
**Status:** Análisis pre-migración a repo GitHub estructurado
**Insumos analizados:**
- `Conversor_PSG_Philips_a_CSV.html` (94 KB · 1887 líneas · SHA256 `348262ad…985c789`)
- `somnosalud-engine.js` (190 KB · 3118 líneas · bundle compilado · SHA256 `73437fea…ade3bee`)
- 30+ docs satellites en Drive (PRD, árboles de decisión, mockups, prompts, mockups admin)
- `DOCUMENTO_FUNCIONAL_SOMNOSALUD_v1.0.md` propio que armé el 5/5

---

## 0. TL;DR — Lo que descubrí en la primera lectura

**Pablo no tiene UN producto. Tiene DOS productos distintos** que conviene mantener separados o como módulos de un mismo monorepo:

| # | Producto | Estado real | Ubicación actual |
|---|---|---|---|
| 1 | **SomnoSalud** — App SPA evaluación de insomnio (12 pasos, 6 cuestionarios) | Bundle TypeScript compilado funcional + frontend HTML/React monolítico en GitHub Pages | `https://paulferrero.github.io/somnosalud/` |
| 2 | **Conversor PSG → CSV** — Utility standalone para parsear PDFs polisomnográficos de 7 equipos distintos + Engine Hipóxico | HTML autocontenido 96 KB con pdf.js + JSZip | Drive Pablo (NO publicado aún) |

> **El mensaje de Pablo del 5/5 que te pasó se refiere al producto 2 (Conversor PSG)**, no a SomnoSalud completo.
> Para subir el código fuente que pidió → priorizar producto 2.
> Para "armar para que escale" → ambos productos necesitan tratamiento.

**Lo que NO encontré en Drive (alerta):**
- ❌ El source TypeScript del engine de SomnoSalud (solo está el `.js` compilado/minificado)
- ❌ El source del frontend de SomnoSalud (la app que está deployada en `paulferrero.github.io/somnosalud/`)
- ⚠️ Solo encontré el HTML generado deployado y el `engine.js` bundle. El source `.ts` está en algún lugar de Pablo.

**Recomendación inmediata:** pedirle a Pablo el repo `itsomnosalud/Somnosalud` (canónico Private, owner del cliente) + cualquier carpeta local con los `.ts` originales antes de migrar. Si NO tiene los `.ts` (porque trabajó en Lovable.dev y solo bajó el bundle), tenemos que reconstruir desde el bundle (factible pero más lento).

> [!info] Update post-bootstrap 2026-05-07 noche
> El repo canónico es `https://github.com/itsomnosalud/Somnosalud`. El primer push del bootstrap fue al repo equivocado `PaulFerrero/somnosalud` por confusión inicial — corregido el mismo día con `git remote set-url` + force push. Las menciones a `PaulFerrero/somnosalud` que quedan en este doc son históricas; el remote activo es el de itsomnosalud.

---

## 1. Inventario completo de assets en Drive

### Archivos críticos (descargados y analizados)

| Archivo | Tamaño | Tipo | Comentario |
|---|---|---|---|
| `Conversor_PSG_Philips_a_CSV.html` | 94 KB | HTML monolítico | App standalone client-side, 1887 líneas, vanilla JS + pdf.js + JSZip |
| `somnosalud-engine.js` | 190 KB | JS bundle compilado | IIFE bundle de TypeScript (esbuild output). Exports: 30+ funciones clínicas |
| `DOCUMENTO_FUNCIONAL_SOMNOSALUD_v1.0.md` | 22 KB | PRD | Documento que armé el 5/5 con visión + estado + roadmap |

### Archivos en Drive NO descargados todavía (priorizar siguiente sesión)

| Archivo / Carpeta | Tamaño | Importancia | Por qué importa |
|---|---|---|---|
| `SOMNOSALUD_PRD_v1.2.html` | 54 KB | 🔴 CRÍTICO | PRD completo de SomnoSalud — comparar con mi v1.0 |
| `SOMNOSALUD_ARBOL_DECISIONES.html` | 60 KB | 🔴 CRÍTICO | Lógica clínica de decisiones (qué recomendar cuándo) |
| `SOMNOSALUD_INTERACCIONES_CLINICAS.html` | 32 KB | 🟠 ALTO | Interacciones medicamentosas — compliance médico |
| `SOMNOSALUD_ARBOL_DECISIONES_BACKUP.html` | 40 KB | 🟡 MEDIO | Backup viejo — verificar si tiene info adicional |
| `Analisis_PSG_Philips_Alice.html` | 40 KB | 🟠 ALTO | Spec de análisis PSG (anterior al Conversor) |
| `LISTA_MAESTRA_v3_SOMNOSALUD.md` | 29 KB | 🔴 CRÍTICO | Lista maestra de tareas/features |
| `SOMNOSALUD_Admin_Dashboard.html` | 74 KB | 🟡 MEDIO | Mockup admin estático |
| `somnosalud-engine.js` (75 KB versión vieja) | 75 KB | 🟢 BAJO | Versión anterior del engine (190 KB es la actual) |
| Carpeta `somnosalud/` | varios | 🔴 CRÍTICO | Assets app actual (productos del frontend) |
| Carpeta `somnosalud-app/` | varios | 🔴 CRÍTICO | Probable source code/build app |
| Carpeta `somnosalud-clinical-engine/` | varios | 🔴 CRÍTICO | **Probable source TypeScript del engine** |
| Carpeta `somnosalud-vite/` | varios | 🟠 ALTO | Versión Vite/React (la que conviene mantener para Next.js migration) |
| Carpeta `somnosalud-github-pages/` | varios | 🟠 ALTO | Versión deployada en GH Pages |
| `Perfil_Dr_Ferrero_2026-04-29` | Doc | 🟢 BAJO | Brief profesional de Pablo |
| `Global instructions claude cowork PIF Mayo 2026` | Doc | 🟡 MEDIO | Instrucciones que Pablo le da a Claude Cowork — útil para entender su mental model |

---

## 2. Análisis del Producto 2 — `Conversor_PSG_Philips_a_CSV.html`

### 2.1 Qué hace (resumen funcional)

Aplicación 100% client-side. Drag & drop de uno o varios PDFs de informes polisomnográficos → auto-detección del equipo → parsing con regex → CSV de salida en formato long (3 columnas) + opcional "Engine Hipóxico" que calcula score 0-100 con 6 componentes clínicos.

**Tecnología:**
- HTML/CSS/Vanilla JS (sin framework)
- `pdf.js 3.11.174` (CDN cdnjs) para extraer texto de PDFs
- `JSZip 3.10.1` (CDN cdnjs) para empaquetar múltiples CSV en un .zip
- Sin backend, sin base de datos, sin auth
- Sin build step (single HTML deployable)

### 2.2 Equipos soportados (auto-detectados)

| Equipo | Tipo | Parser interno |
|---|---|---|
| Philips Sleepware G3 | PSG completa | `parsePhilipsSleepwareG3` (~322 líneas, ~212 campos) |
| Philips Alice NightOne | Poligrafía | `parsePhilipsNightOne` |
| BrainWave | PSG completa (formato similar a G3 sin tag G3) | `parseBrainWavePSG` |
| ResMed AirView | Diagnóstico | `parseResMedDiagnostico` |
| ResMed AirView | Tratamiento (CPAP) | `parseResMedTratamiento` |
| BMC | Tratamiento (CPAP) | `parseBMCTratamiento` |
| BMC | Poligrafía diagnóstica | `parseBMCPoligrafo` (limitado — datos en imágenes) |
| Sleepware-like (genérico) | PSG fallback | reuse de `parsePhilipsSleepwareG3` |

### 2.3 Pipeline funcional (línea por línea)

```
[PDF input] (drag/drop o file picker)
  ↓
extractText(file)              // L203 — pdf.js extrae texto crudo página por página
  ↓
detectFormat(text)             // L229 — regex sobre el texto para identificar equipo
  ↓
parseByFormat(text, format)    // L292 — router
  ↓
parseXxx(text)                 // L314+ — parser específico con ~50-200 regex puntuales
  ↓
toCSV(data)                    // L1422 — genera CSV long (parametro, valor, campo_informe_personalizado)
  ↓
buildFilename(data)            // L1441 — Apellido_Nombre_YYYYMMDD_HHMM.csv
  ↓
[CSV download] (BOM UTF-8 para Excel ES) o [ZIP download] (todos juntos)
```

**Engine Hipóxico paralelo (solo para tipo "diagnostico"):**

```
showEnginePSG(idx)             // L1746 — orquesta render
  ↓
computeHypoxicScorePSG(d)      // L1648 — calcula score en 6 pasos
  ↓
buildMethodologyTabPSG()       // L1847 — render metodología (tabla referencias DOI)
  ↓
[Panel UI con score + categoría + perfil + flags + breakdown + tabla detalle]
```

### 2.4 Engine Hipóxico — análisis del cálculo

Score 0-100 en **6 componentes**, alineado con literatura científica (Azarbarzin 2019 — Hypoxic Burden):

| Paso | Componente | Rango | Inputs | Computable desde PDF |
|---|---|---|---|---|
| 1 | Carga acumulativa | 0-40 | T90, T85, T80, HB | Parcial (24/40) — falta HB que requiere señal cruda SpO₂ |
| 2 | Ciclicidad | 0-16 | ODI | ✅ Total |
| 3 | Profundidad | 0-20 | Nadir, % nadir<80 | Parcial (16/20) — falta % nadir<80 que requiere análisis evento por evento |
| 4 | Modulador basal | 0-8 | SpO₂ basal vigilia | ✅ Total |
| 5 | Modulador temporal | 0-8 | IAH REM/NREM ratio + clustering | Parcial (4/8) — sin clustering |
| 6 | Modulador clínico | 0-8 | Comorbilidades (manual input) | ❌ No implementado todavía |

**Score máximo computable desde PDF:** 76/100. **Categorías:**
- 1-15 → Carga hipóxica leve
- 16-39 → Carga hipóxica moderada
- 40-69 → Carga hipóxica alta
- 70-100 → Carga hipóxica crítica

**Referencias científicas integradas (DOI):**
- Azarbarzin A, et al. (2019) Eur Heart J — el paper fundacional de Hypoxic Burden
- Lavie L. (2003) Sleep Med Rev
- Dewan NA, et al. (2015) Chest
- Somers VK, et al. (2008) Circulation
- Berry RB, et al. AASM Manual v3. 2023

### 2.5 Fortalezas del código actual

✅ **Bien comentado en español** — secciones claras con `// ============== HEADERS ==============`
✅ **Defensive parsing** — cada extracción usa `get(re, name)` que pushea a `miss[]` si falla, no rompe
✅ **Type safety implícito** — helper `num()` convierte strings con coma decimal (`"3,5"`) a number, devuelve `""` si falla
✅ **Internacionalización** — soporta fechas españolas `26/3/2026` y americanas `2026-03-26`, números con coma decimal
✅ **CSV con BOM UTF-8** — compatible con Excel español out-of-the-box
✅ **JSZip para batch** — múltiples CSV → 1 zip con timestamp
✅ **`loadFromBuffer` bridge** (línea 217) — pensado para integración como microservice (iframe injection desde otra app, ej. SomnoSalud)
✅ **Schema-driven** — `SCHEMA[]` define el orden + nombre de los 200+ campos del CSV; `MAPPING_INFORME[]` mapea a labels del informe IFN; `EXTRA_INFORME[]` agrega campos manuales (calidad, conclusión)
✅ **Engine Hipóxico modular** — separado del parser, fácil de extender
✅ **UI dark mode profesional** — paleta consistente (slate + sky accent), responsive básico

### 2.6 Debilidades / debt técnico

❌ **Single-file architecture** — 1887 líneas en 1 HTML, no escalable a múltiples devs
❌ **Sin tests** — los parsers tienen casos peculiares (ej. "R: minutos 315.5 minutos") que cualquier cambio puede romper
❌ **Sin TypeScript** — tipos implícitos, fácil meter bugs en parsers (object shape inferido)
❌ **Sin CI/CD** — no hay validación pre-deploy
❌ **Sin error reporting** — log local en `<details>`, no se persiste, no llega a Sentry
❌ **Sin storage de resultados** — el CSV se descarga y se pierde; no hay historial de procesos
❌ **CDN dependencies** — si cdnjs cae, la app no carga (no hay self-hosted fallback)
❌ **Sin auth** — cualquiera con la URL puede usarlo (pero es 100% client-side, no tiene mucho sentido auth solo para esto)
❌ **BMC Poligrafo limitado** — el propio comentario del código dice "datos mayormente imágenes" → ese parser está incompleto by design
❌ **Compliance médico no formalizado** — no hay disclaimer obligatorio, no hay T&C, no hay registro de consentimiento informado, sin trazabilidad de qué clínico procesó qué reporte

### 2.7 Hallazgos clínicos en el código

🟢 **Auto-detección robusta** — usa firmas regex específicas (ej. "Sleepware G3 Philips Respironics", "Alice NightOne", "ResMed AirView Informe de cumplimiento")

🟡 **Schema BrainWave divergente** — el código maneja BrainWave como variante de Sleepware G3 con diferencias documentadas (fecha DD-MM-YYYY, hora con AM/PM, SpO₂ desde <88% en vez de <95%). Eso es bueno pero implica fragilidad si Philips/BrainWave cambian formato.

🔴 **HB no se computa** — el Engine Hipóxico explícitamente marca HB como "N/A" porque requiere señal cruda de SpO₂ continua (no está en el PDF). Esto es una limitación científica del approach, no un bug. El score parcial alcanza máx 76/100. **Para llegar a 100% requiere integrar EDF/oxímetros como Wellue O2Ring** (ya documentado en mi PRD v1.0 sección 15.8).

🟡 **Sin validación clínica externa** — los algoritmos no fueron validados contra polisomnografías re-leídas por terceros. Se valida solo internamente con `60/60 tests E2E` (según mi PRD), pero esos tests son de software, no de criterio clínico independiente.

---

## 3. Análisis del Producto 1 — Engine clínico TypeScript (`somnosalud-engine.js`)

### 3.1 Qué descubrí del bundle compilado

`somnosalud-engine.js` es un **bundle IIFE** (probablemente `esbuild --bundle --format=iife --globalName=SomnoSalud`) del source TypeScript organizado en módulos:

```
src/
├── index.ts                    (entry point — re-exports)
├── scoring/
│   ├── ess.ts                  (Epworth Sleepiness Scale — 8 ítems)
│   ├── stop-bang.ts            (STOP-BANG OSA risk — 8 ítems)
│   ├── isq.ts                  (Insomnia Screening Questionnaire — CUSTOM SomnoSalud)
│   ├── emq.ts                  (Emotional Mood Questionnaire — CUSTOM SomnoSalud)
│   └── bmi.ts                  (IMC + clasificación OMS)
├── safety/
│   └── rules.ts                (SAFE-010 edad, SAFE-020 embarazo, SAFE-021 lactancia, SAFE-040 melatonina+anticoag)
├── engine/
│   ├── phenotype.ts            (clasificación insomnio inicio/mantenimiento/mixto — ICSD-3)
│   ├── recommendations.ts      (motor recomendaciones tratamientos A/B/C — ~1552 líneas — el más grande)
│   ├── risk-integrator.ts      (8 flags + 3 niveles de riesgo)
│   └── precision.ts            (calculador precisión 5 dimensiones, output 0-100%)
├── lab/
│   ├── parameters.ts           (7 parámetros: vit D, B12, hierro, ferritina, magnesio, TSH, glucosa)
│   └── genetics.ts             (5 variantes: CLOCK, PER2, ADORA2A, COMT, MTHFR)
└── references.ts               (DB centralizada de referencias DOI/PMID)
```

### 3.2 Hallazgos críticos de discrepancia documental

🚨 **El motor NO tiene PHQ-9 implementado** (depresión). El `index.ts` del bundle expone:
- `scoreESS`, `scoreSTOPBANG`, `scoreISQ`, `scoreEMQ`, `scoreGAD7`, `scoreDASS21`

Pero NO `scorePHQ9`. Sin embargo el PRD v1.0 dice "PHQ-9 (depresión)" como feature integrada.

**Hipótesis:** la depresión se evalúa via DASS-21 (que incluye factor depresión × 2) o via EMQ (custom), no via PHQ-9 estándar. **Aclarar con Pablo.**

🚨 **ISI vs ISQ** — el PRD habla de ISI (Insomnia Severity Index Bastien 2001 — instrumento estándar internacional). El motor implementa **ISQ** (Insomnia Screening Questionnaire — algo CUSTOM de SomnoSalud, no es ISI).

**Implicancia clínica:** el ISI es validado en literatura. Un "ISQ custom" no es validado externamente — eso debilita el claim de "6 instrumentos clínicos validados internacionalmente" del PRD.

**Posibilidades:**
1. Pablo cambió ISI → ISQ con algún rationale (pidamos que documente cuál y por qué)
2. Es un error de documentación y en realidad sí usa ISI (pero el código lo nombra "ISQ")
3. Un mix híbrido (ISI + items propios)

**Acción recomendada:** revisar el código del módulo `src/scoring/isq.ts` (líneas 199-267 del bundle) y comparar contra ISI estándar. Si NO es ISI, hay que decidir: (a) volver a ISI, (b) mantener ISQ + validarlo formalmente, o (c) usar ambos.

### 3.3 Calidad del bundle

✅ **Modular** — 13 módulos bien delimitados por responsabilidad
✅ **Tipado** — TypeScript en source (aunque acá veamos solo el output IIFE)
✅ **Independent del front-end** — el header del bundle dice explícitamente *"Este módulo es INDEPENDIENTE del front-end y puede ser consumido por cualquier framework (Lovable, Next.js, etc.)"* → eso es **excelente** porque permite reusar en backend Node y en cualquier UI (Next, React Native, Vue).
✅ **Referencias DOI/PMID centralizadas** — `src/references.ts` con `validateReferences()` que verifica integridad
✅ **Validation guards** — cada `score*` función valida número de items, rangos, lanza errores específicos
✅ **Inmutabilidad implícita** — devuelve objetos nuevos, no muta inputs
✅ **Cutoffs documentados** — cada cuestionario tiene tabla de cutoffs con label legible (`"Somnolencia diurna leve"`)
✅ **Retorna referencia bibliográfica en cada score** — ej. ESS devuelve `reference: "Johns MW. Sleep. 1991;14(6):540-545."`

⚠️ **Solo tengo el compilado** — el repo de Pablo en GitHub probablemente tiene los `.ts` originales. Hay que pedirlos. Si no los tiene (caso Lovable.dev download-bundle), reconstruirlos desde el bundle es factible pero costoso (8-15h de trabajo).

⚠️ **`/* @license Proprietary */`** — Pablo declara propietario. Eso es OK para repo privado pero hay que clarificar con él la licencia final cuando publique.

---

## 4. Cómo levantarlo localmente para probarlo (HOY)

### 4.1 Conversor PSG (5 minutos — 0 setup)

```bash
# Opción A: simple
open "/Users/elizabethuribe/Pampa-Labs-Core/somnosalud-analysis-2026-05-07/source-files/Conversor_PSG_Philips_a_CSV.html"

# Opción B: servidor local (mejor — evita CORS issues con pdf.js worker)
cd /Users/elizabethuribe/Pampa-Labs-Core/somnosalud-analysis-2026-05-07/source-files/
python3 -m http.server 8765
# después abrir: http://localhost:8765/Conversor_PSG_Philips_a_CSV.html
```

**Para probarlo necesitamos:** PDFs reales de polisomnografía. Pedirle a Pablo 1-2 muestras anonimizadas (Philips Sleepware G3 + ResMed sería ideal).

### 4.2 Engine SomnoSalud (10 minutos)

```bash
# Crear sandbox HTML que cargue el bundle
mkdir -p /tmp/somnosalud-sandbox && cd /tmp/somnosalud-sandbox

cp /Users/elizabethuribe/Pampa-Labs-Core/somnosalud-analysis-2026-05-07/source-files/somnosalud-engine.js .

cat > index.html <<'EOF'
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>SomnoSalud Engine Sandbox</title></head>
<body>
<h1>SomnoSalud Engine — Test sandbox</h1>
<script src="./somnosalud-engine.js"></script>
<script>
  // Probar ESS con respuestas mock
  const result = SomnoSalud.scoreESS([2,2,1,3,3,2,2,1]);
  console.log("ESS Score:", result);
  document.body.insertAdjacentHTML('beforeend',
    '<pre>' + JSON.stringify(result, null, 2) + '</pre>'
  );

  // Listar todos los exports disponibles
  document.body.insertAdjacentHTML('beforeend',
    '<h2>Exports disponibles:</h2><pre>' +
    Object.keys(SomnoSalud).join('\n') +
    '</pre>'
  );
</script>
</body></html>
EOF

python3 -m http.server 8766
# después abrir http://localhost:8766/
```

### 4.3 SomnoSalud app deployada (1 minuto)

Visitá directamente: **https://paulferrero.github.io/somnosalud/**

Probá el flujo completo de 12 pasos (welcome → profile → safety → 6 cuestionarios → sleep → lab opcional → genetics opcional → results).

---

## 5. Plan de migración a repo GitHub estructurado

### 5.1 Propuesta de estructura del monorepo

```
somnosalud-platform/                          # repo nuevo (privado al inicio)
├── README.md
├── LICENSE.md                                # decidir con Pablo (proprietary o algo más permisivo)
├── COMPLIANCE.md                             # disclaimer médico, T&C, política de privacidad, Ley 25.326
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                            # lint + typecheck + test on PR
│   │   ├── deploy-app.yml                    # auto-deploy a Vercel on main
│   │   └── deploy-conversor.yml              # auto-deploy del Conversor a GH Pages
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── packages/                                 # monorepo style (pnpm workspaces o turborepo)
│   ├── clinical-engine/                      # Producto base — el motor TypeScript
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── scoring/
│   │   │   │   ├── ess.ts
│   │   │   │   ├── stop-bang.ts
│   │   │   │   ├── isq.ts                    # ⚠️ aclarar con Pablo si es ISI o custom
│   │   │   │   ├── emq.ts
│   │   │   │   ├── bmi.ts
│   │   │   │   ├── phq9.ts                   # NUEVO — agregar si aplica
│   │   │   │   ├── gad7.ts                   # ya existe en bundle
│   │   │   │   ├── dass21.ts                 # ya existe en bundle
│   │   │   │   └── README.md
│   │   │   ├── safety/
│   │   │   │   ├── rules.ts
│   │   │   │   └── README.md
│   │   │   ├── engine/
│   │   │   │   ├── phenotype.ts
│   │   │   │   ├── recommendations.ts        # ~1.5K líneas — sub-modular si conviene
│   │   │   │   ├── risk-integrator.ts
│   │   │   │   ├── precision.ts
│   │   │   │   └── hypoxic-score.ts          # NUEVO — extraer del Conversor PSG
│   │   │   ├── lab/
│   │   │   │   ├── parameters.ts
│   │   │   │   ├── genetics.ts
│   │   │   │   └── README.md
│   │   │   └── references.ts
│   │   ├── tests/
│   │   │   ├── scoring/
│   │   │   ├── safety/
│   │   │   ├── engine/
│   │   │   └── e2e/                          # los 60/60 tests existentes
│   │   ├── dist/                             # bundle output (gitignored)
│   │   └── README.md
│   ├── psg-parser/                           # Producto 2 — Parser PSG multi-equipo
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── extract.ts                    # extractText con pdf.js
│   │   │   ├── detect.ts                     # detectFormat router
│   │   │   ├── parsers/
│   │   │   │   ├── philips-sleepware-g3.ts
│   │   │   │   ├── philips-nightone.ts
│   │   │   │   ├── brainwave.ts
│   │   │   │   ├── resmed-diagnostico.ts
│   │   │   │   ├── resmed-tratamiento.ts
│   │   │   │   ├── bmc-tratamiento.ts
│   │   │   │   ├── bmc-poligrafo.ts          # marcado como limited
│   │   │   │   └── README.md
│   │   │   ├── schema.ts                     # SCHEMA[] con tipos TS de los 212 campos
│   │   │   ├── mapping.ts                    # MAPPING_INFORME + EXTRA_INFORME
│   │   │   └── output/
│   │   │       ├── csv.ts
│   │   │       └── filename.ts
│   │   ├── tests/
│   │   │   ├── fixtures/                     # PDFs reales anonimizados
│   │   │   └── parsers/
│   │   └── README.md
│   ├── webapp-somnosalud/                    # Frontend Next.js — la app de evaluación
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── src/
│   │   │   ├── app/                          # App Router
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx                  # P0.1 Splash
│   │   │   │   ├── disclaimer/page.tsx       # P0.2
│   │   │   │   ├── terms/page.tsx            # P0.3
│   │   │   │   ├── auth/                     # P1.1 cuenta
│   │   │   │   ├── eval/                     # 12 pasos
│   │   │   │   │   ├── profile/
│   │   │   │   │   ├── safety/
│   │   │   │   │   ├── isi/                  # o isq según decisión
│   │   │   │   │   ├── stopbang/
│   │   │   │   │   ├── phq9/
│   │   │   │   │   ├── gad7/
│   │   │   │   │   ├── dass21/
│   │   │   │   │   ├── sleep/
│   │   │   │   │   ├── lab/
│   │   │   │   │   ├── genetics/
│   │   │   │   │   └── results/
│   │   │   │   ├── dashboard/                # P6.3 diario sueño + P6.4 evolución
│   │   │   │   └── api/                      # Edge Functions Next.js
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   ├── supabase/
│   │   │   │   ├── analytics/
│   │   │   │   └── compliance/               # disclaimer enforce + T&C accept tracking
│   │   │   └── styles/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── e2e/                          # Playwright
│   │   └── README.md
│   ├── webapp-conversor-psg/                 # Frontend del Conversor PSG (migrado de monolito a Next o React)
│   │   ├── package.json
│   │   └── ...
│   └── shared-ui/                            # Design system (paleta + tipografía + componentes base)
│       └── ...
├── infrastructure/
│   ├── supabase/
│   │   ├── migrations/                       # versioned SQL migrations
│   │   ├── seed.sql                          # datos iniciales (catalog tratamientos, etc.)
│   │   └── README.md
│   └── vercel/
│       └── README.md
├── docs/
│   ├── product/
│   │   ├── PRD-somnosalud-v1.2.md
│   │   ├── PRD-conversor-psg-v1.0.md
│   │   ├── ARBOL-DECISIONES.md
│   │   └── INTERACCIONES-CLINICAS.md
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── adr/                              # Architecture Decision Records
│   │   └── compliance.md
│   ├── clinical/
│   │   ├── instruments-rationale.md          # ISI vs ISQ + DASS21 vs PHQ9 — decisiones
│   │   ├── safety-rules.md
│   │   └── references.md                     # DB DOIs
│   └── operations/
│       ├── deployment.md
│       ├── runbook.md
│       └── incidents.md
├── scripts/
│   ├── migrate-from-html.ts                  # script one-shot para extraer parsers del HTML monolítico
│   └── reconstruct-engine-source.ts          # si Pablo no tiene los .ts originales
├── package.json                              # root con workspaces
├── pnpm-workspace.yaml                       # o turbo.json
└── tsconfig.base.json
```

### 5.2 Stack recomendado (consistente con resto Pampa Labs)

| Capa | Tech |
|---|---|
| Lenguaje | **TypeScript 5.x estricto** en todo el monorepo |
| Build / monorepo | **pnpm workspaces + turborepo** (cache de builds) |
| Frontend SomnoSalud | **Next.js 14 App Router + Tailwind + shadcn/ui** |
| Frontend Conversor PSG | **Vite + React** (más liviano para una utility, no necesita SSR) |
| Backend / DB / Auth | **Supabase** (PostgreSQL + RLS multi-tenant + Auth + Storage) |
| Deploy | **Vercel** (somnosalud) + **GitHub Pages** (conversor utility, sigue siendo client-side) |
| Tests unitarios | **Vitest** |
| Tests E2E | **Playwright** |
| Error tracking | **Sentry** (compartido con resto Pampa Labs) |
| Email transaccional | **Resend** |
| Pagos (cuando aplique) | **Stripe** |
| Analytics | **PostHog** |
| CI/CD | **GitHub Actions** |
| Linter | **ESLint flat config** (alineado con resto Pampa Labs) |

### 5.3 Branching strategy

- `main` → protegida, solo via PR + 1 review + CI verde
- `develop` → integration branch (opcional, podemos ir directo a main si team chico)
- Feature branches: `feat/<scope>-<description>` (ej. `feat/conversor-bmc-poligrafo`, `feat/somnosalud-isi-canonical`)
- Fix branches: `fix/<scope>-<description>`
- Sprint branches: `sprint/<numero>-<topic>` para sprints largos

---

## 6. Roadmap de mejoras priorizado (3 fases)

### FASE 0 — Setup repo + ship-it (Semana 1, ~5-8 horas)

**Goal:** repo limpio en GitHub, CI verde, ambos productos deployados con dominio profesional.

| # | Tarea | Owner | Tiempo | Dependencia |
|---|---|---|---|---|
| 0.1 | Pedirle a Pablo el repo `itsomnosalud/Somnosalud` (canónico) + carpetas locales con `.ts` source | Jorge | 30 min | — |
| 0.2 | Crear repo `pampalabs/somnosalud-platform` privado en GitHub org | Jorge | 5 min | — |
| 0.3 | Setup monorepo skeleton (pnpm + turbo + tsconfig base + ESLint) | Pampa Labs | 2 h | 0.2 |
| 0.4 | Migrar `Conversor_PSG_Philips_a_CSV.html` a `packages/webapp-conversor-psg/` (ya en TS modular o como first iteration con HTML legacy) | Pampa Labs | 2 h | 0.3 |
| 0.5 | Migrar `engine.js` bundle + reconstruir `.ts` (o copiar si Pablo los tiene) a `packages/clinical-engine/` | Pampa Labs | 3-8 h dependiendo de si tiene los .ts | 0.1 |
| 0.6 | Setup Vercel para `webapp-somnosalud` + GH Pages para `webapp-conversor-psg` | Pampa Labs | 1 h | 0.4, 0.5 |
| 0.7 | Decidir y comprar dominio (sugerencias en §7) | Pablo | 15 min | — |
| 0.8 | DNS apuntar a Vercel/GH Pages | Pampa Labs | 30 min | 0.7 |
| 0.9 | First README con quick start | Pampa Labs | 1 h | 0.5 |

### FASE 1 — Robustez clínica + persistencia (Semanas 2-5, ~25-35 horas)

**Goal:** clinical-engine con tests + el frontend SomnoSalud con auth/persistencia + compliance legal mínimo.

| # | Tarea | Subgoal |
|---|---|---|
| 1.1 | Tests unitarios para todos los `score*` del clinical-engine (60+ tests existentes + nuevos) | Vitest, ≥90% coverage del módulo `scoring/` |
| 1.2 | **Aclarar con Pablo: ISI vs ISQ + PHQ-9 status** + actualizar `clinical-engine/scoring/` | docs/clinical/instruments-rationale.md |
| 1.3 | Setup Supabase project — schemas: `users`, `evaluations`, `eval_responses`, `lab_results`, `genetic_variants`, `recommendations`, `audit_log` | RLS multi-tenant por user_id |
| 1.4 | Auth Supabase (email/pass + Google + Apple) | webapp-somnosalud/auth/ |
| 1.5 | Migrar el flujo de 12 pasos del HTML monolítico actual a Next.js App Router con persistencia | webapp-somnosalud/eval/ |
| 1.6 | **Disclaimer médico obligatorio + T&C + consentimiento informado con timestamp registrado en DB** | BLOQUEANTE LEGAL — Ley 25.326 |
| 1.7 | Verificación de edad formal (gate <18) | safety SAFE-010 enforced |
| 1.8 | Responsive mobile (Tailwind breakpoints) | UX 70%+ tráfico salud es mobile |
| 1.9 | Sentry + PostHog setup | Error tracking + funnels |
| 1.10 | Email de welcome + resultados PDF post-evaluación | Resend |

### FASE 2 — Conversor PSG modular + storage (Semanas 6-9, ~25-35 horas)

**Goal:** `psg-parser` package independiente con tests + integración opcional dentro de SomnoSalud + storage de PSGs procesadas.

| # | Tarea | Subgoal |
|---|---|---|
| 2.1 | Refactor del HTML monolítico Conversor a `packages/psg-parser/` modular TS | extract → detect → parse → output |
| 2.2 | Test fixtures con PDFs reales anonimizados de cada equipo (Philips, BrainWave, ResMed, BMC) | tests/fixtures/ con 1-2 por equipo mínimo |
| 2.3 | Tests unitarios por parser (regex coverage) | ≥80% coverage de cada `parsers/*.ts` |
| 2.4 | Tipos TypeScript estrictos para los 212 campos del SCHEMA | type `PSGData` bien definido |
| 2.5 | Hypoxic Score Engine extraído a `clinical-engine/engine/hypoxic-score.ts` | reusable desde Conversor + SomnoSalud |
| 2.6 | webapp-conversor-psg con UI mejorada en React (mantener feel actual) + drag-drop |
| 2.7 | Integración SomnoSalud × Conversor PSG: bridge ya existe en código (`loadFromBuffer`) — formalizar como API |
| 2.8 | Storage de PSGs procesadas en Supabase con RLS por médico | tabla `psg_processed_reports` |
| 2.9 | Export a EHR (HL7 FHIR? CSV? PDF?) — decidir con Pablo el formato |

### FASE 3 — Producto B2B + escalado (Semanas 10-16, ~40-60 horas)

**Goal:** plataforma white-label para sleep specialists colegas + features avanzadas.

| # | Tarea | Subgoal |
|---|---|---|
| 3.1 | Multi-tenant white-label (cada sleep specialist con su subdomain + branding) | Subdomains `<clinica>.somnosalud.com` |
| 3.2 | Panel admin para sleep specialist (ver pacientes, evaluaciones, gestionar) | webapp-somnosalud/admin/ |
| 3.3 | Modelo de pago (B2B SaaS subscription) — Stripe | Stripe Subscriptions |
| 3.4 | OCR de PDFs de laboratorio (auto-fill lab values) | Tesseract.js o Google Vision API |
| 3.5 | Integraciones wearables OAuth2 (Oura, Whoop, Apple Health, Fitbit, Garmin) | Wearables → Supabase rows |
| 3.6 | Upload de raw genéticos (23andMe, AncestryDNA) + parsing | Variantes → recommendations |
| 3.7 | PWA + offline | service worker |
| 3.8 | Multi-idioma (ES + EN como mínimo) | i18n |
| 3.9 | Accesibilidad WCAG 2.1 AA | a11y audit |
| 3.10 | Diario de sueño longitudinal + gráficos evolución | webapp-somnosalud/dashboard/ |
| 3.11 | Gamificación (badges, desafíos semanales, ranking) | engagement |
| 3.12 | Audit logs completos para compliance HIPAA-ready (si se escala USA) | Supabase Enterprise tier |

---

## 7. Decisiones técnicas pendientes con Pablo

| # | Decisión | Opciones | Pampa Labs recomienda |
|---|---|---|---|
| 7.1 | ¿Repo público o privado al inicio? | privado / público | **Privado** hasta validación clínica externa + compliance legal aprobado |
| 7.2 | Licencia | Proprietary / MIT / Apache 2 / AGPL | **Proprietary** mientras esté en pre-launch; revisar al go-live B2B |
| 7.3 | Org GitHub | `pampalabs/...` o `paulferrero/...` o nuevo `somnosalud/...` | **`pampalabs/somnosalud-platform`** durante development; transferir a `somnosalud-org/` al spin-off si aplica |
| 7.4 | Dominio | `somnosalud.com.ar` / `somnosalud.com` / `lab.ifn.com.ar` / otro | **`somnosalud.com.ar`** (genérico, escalable, propio de SomnoSalud como producto independiente — NO atado a IFN brand) |
| 7.5 | ISI vs ISQ — instrumento de insomnio canonical | ISI Bastien 2001 / ISQ custom / ambos | Decisión clínica de Pablo. Si ISQ es híbrido válido, **documentarlo en `docs/clinical/instruments-rationale.md`** con rationale + comparación cutoffs ISI |
| 7.6 | PHQ-9 implementar o no | sí / no / usar DASS-21 sub-scale | Recomiendo **sí implementarlo** — PHQ-9 es estándar internacional, validado, breve, complementa DASS-21 |
| 7.7 | Stack frontend SomnoSalud | Next.js 14 / Remix / SvelteKit | **Next.js 14 App Router** — alineado con resto Pampa Labs, gran community, edge runtime |
| 7.8 | Backend | Supabase / Firebase / custom Node | **Supabase** — alineado con resto Pampa Labs, RLS multi-tenant, HIPAA tier disponible |
| 7.9 | Modelo de monetización Fase 1 | B2C freemium / B2B SaaS / IFN-only / mixto | Sugerencia inicial: **gratis end-user (B2C) + Pampa Labs cobra retainer técnico a IFN ($2K/mes ya activo)** mientras se valida producto. Activar B2B SaaS a sleep specialists en Fase 3. |
| 7.10 | ¿Se mantiene el Conversor PSG como producto separado o se absorbe dentro de SomnoSalud? | separado / módulo interno | Recomiendo **mantener separado** como utility client-side (los médicos lo van a usar standalone también, sin cuenta), pero con bridge `loadFromBuffer` para integrarlo dentro de SomnoSalud cuando un paciente sube su PSG |

---

## 8. Riesgos y compliance

### 8.1 Riesgos clínicos

🔴 **CRÍTICO — Sin validación clínica externa.** Los 60/60 tests son de software, no de criterio clínico. Se necesita workshop con 2-3 sleep specialists colegas para validar:
- Algoritmos de scoring (los cutoffs internacionales sí están, pero la combinación de instrumentos + recommendations engine es propio)
- Criterios de derivación (cuándo enviar a polisomnografía, cuándo a TCC-I, cuándo a especialista urgente)
- Wording educativo a paciente
- Nivel de evidencia A/B/C de cada recomendación

🟠 **ALTO — Recomendaciones de suplementos.** Mencionar dosis específicas (ej. "Melatonina 0.5-3 mg") puede ser interpretado como prescripción no autorizada. **Mitigación:** disclaimer riguroso + "consultar con médico antes de usar" en cada recomendación + niveles de evidencia explícitos + contraindicaciones visibles.

🟠 **ALTO — Datos genéticos sensibles.** Si se permite upload de raw 23andMe/AncestryDNA, hay que cumplir con normativa específica (Ley 26.529 derechos del paciente + Decreto 1089 datos genéticos). **Mitigación:** consentimiento separado para datos genéticos + encriptación at-rest + opt-in granular.

🟡 **MEDIO — Score Hipóxico parcial mal comunicado.** El paciente puede ver "score 50/100" y pensar que es un score completo. El código actual ya tiene la `na-note` que avisa que es parcial — bien, pero hay que reforzar UX.

### 8.2 Compliance legal Argentina (mercado primario)

✅ Lo que YA está identificado en el PRD:
- Ley 25.326 Protección Datos Personales (consentimiento, encriptación, derecho acceso/rectificación/supresión, notificación breach)
- Disclaimer médico obligatorio
- T&C con timestamp en DB
- Verificación de edad formal

🔴 **Falta agregar:**
- **Ley 26.529** (derechos del paciente, consentimiento informado escrito) — específica para salud
- **Resolución 1480/2011** ANMAT — investigación clínica si se hace research
- **Disposición 18/2017** ANMAT — software médico si se clasifica como dispositivo médico digital (verificar si SomnoSalud califica)
- **Habeas data** — derecho del paciente a obtener todos sus datos en formato portable

### 8.3 Compliance internacional (Fase 3)

- HIPAA (USA) — Supabase Enterprise tier
- GDPR (UE) — RGPD compliance kit Supabase
- PIPEDA (Canadá) — similar a Ley 25.326

---

## 9. Lo que recomiendo hacer EN PRIORIDAD HOY (antes de cerrar la sesión)

### 9.1 Acciones inmediatas (Pampa Labs / yo)

✅ Documentar este análisis en vault: **HECHO** — este archivo.

🔵 **Crear sub-task GitHub repo skeleton:** levantar `pampalabs/somnosalud-platform` privado, cargar los 2 archivos descargados como first-commit en `legacy-source/` para preservar el estado actual auditado.

🔵 **Pull de archivos restantes Drive:** descargar los 4 docs críticos pendientes (PRD v1.2, Árbol decisiones, Interacciones clínicas, Lista maestra v3) — ya están identificados con sus IDs en §1.

🔵 **Generar diagrama de arquitectura** simple (mermaid) para incluir en el README.

### 9.2 Pedidos a Pablo

1. **Acceso al repo `itsomnosalud/Somnosalud`** (ahora) — Jorge ya está como owner/contributor, repo Private. Para Pablo + Cowork acceso: agregar como collaborators desde Settings → Manage access.
2. **Carpeta local con `.ts` originales del clinical-engine** — si trabajó en local, comprimir y subir a Drive `Claude/somnosalud-clinical-engine/source-ts.zip`.
3. **2-3 PDFs reales anonimizados** de polisomnografía de cada equipo (Philips Sleepware G3, ResMed AirView, BMC, BrainWave) para tests fixtures.
4. **Confirmar las 7 decisiones técnicas pendientes** de §7 — especialmente: ISI vs ISQ, PHQ-9, dominio, stack confirmation.
5. **Identificar 2-3 sleep specialists colegas** disponibles para workshop validación clínica antes Fase 1 launch.

### 9.3 Pedidos a Jorge (vos)

1. Confirmar si avanzamos con **Fase 0 esta semana** (5-8h Pampa Labs) o esperamos respuesta de Pablo a §9.2 puntos 1-2 antes.
2. Confirmar **dominio**: ¿`somnosalud.com.ar` o el que sugiera Pablo?
3. Confirmar **org GitHub**: `pampalabs/somnosalud-platform` (recomendado).
4. **¿Querés que arranque ya el repo skeleton hoy** mientras Pablo responde lo demás?

---

## 10. Anexo A — Quick reference comandos

### Levantar Conversor PSG localmente
```bash
cd /Users/elizabethuribe/Pampa-Labs-Core/somnosalud-analysis-2026-05-07/source-files/
python3 -m http.server 8765
open http://localhost:8765/Conversor_PSG_Philips_a_CSV.html
```

### Probar engine SomnoSalud localmente
```bash
mkdir -p /tmp/somnosalud-sandbox && cd /tmp/somnosalud-sandbox
cp /Users/elizabethuribe/Pampa-Labs-Core/somnosalud-analysis-2026-05-07/source-files/somnosalud-engine.js .
# Crear index.html como mostrado en §4.2
python3 -m http.server 8766
```

### Verificar exports del bundle
```bash
node -e "
  const fs = require('fs');
  eval(fs.readFileSync('somnosalud-engine.js','utf8'));
  console.log(Object.keys(SomnoSalud).sort().join('\n'));
"
```

---

## 11. Changelog

| Versión | Fecha | Cambios | Autor |
|---|---|---|---|
| 1.0 | 2026-05-07 | Versión inicial — análisis exhaustivo Conversor PSG (1887 líneas) + engine.js bundle (3118 líneas) | Pampa Labs (Cowork + Jorge) |

---

*Análisis generado por Pampa Labs (Partner Técnico IFN) en colaboración con Dr. Pablo Ferrero. Última actualización: 2026-05-07.*
