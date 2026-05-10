---
title: "Sprint 8 — /eval/results (Capa 5 ADR-003): scoring real + recomendaciones + perfil + export PDF"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-8, results, capa-5, scoring, recomendaciones, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-7-b-mental-health-sleep-lab-genetics/SPRINT-7-B-MENTAL-HEALTH-SLEEP-LAB-GENETICS]]"
  - "[[../../architecture/adr/ADR-003-compliance-gates-en-codigo]]"
  - "[[../../clinical/COMPLIANCE-ARGENTINA]]"
  - "[[../../../../.claude/agents/compliance-anmat]]"
  - "[[../../../../packages/clinical-engine/README]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-09
---

# Sprint 8 — /eval/results (Capa 5 ADR-003)

> Última pantalla del flow de evaluación. Cierra **Capa 5 de [[../../architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]]**: invoca todas las funciones del clinical-engine sobre las responses persistidas, renderiza scoring + perfil + recomendaciones (respetando safety rules) + opcionalmente lab/genetics, con disclaimer reforzado + M.N. visible + export PDF + reset.
>
> Sprint 9+ migra la persistencia de `sessionStorage` a Supabase (auth + RLS multi-tenant + tabla `evaluations`). Este sprint cierra la **Fase 1 client-side**.

## Contexto

Sprint 7.B dejó un placeholder `/eval/results` y un flow funcional de 13 pantallas que recolectan responses pero no las analizan. Sprint 8:

1. Crea **`lib/results-builder.ts`** — función pura que toma `EvalState` (lo que vive en sessionStorage) y devuelve un `BuildResultsOutput` con todos los scoring + flag de campos faltantes. **Separa lógica de UI** — testeable, reutilizable, fácil de migrar a Supabase server-side en Sprint 9+.
2. Reescribe `/eval/results` page como Server Component (header + disclaimer reforzado) + `<ResultsContent>` Client Component que invoca `buildResults` y renderiza secciones colapsables.
3. Implementa **export PDF** vía `window.print()` + CSS `@media print`.
4. Implementa **reset** que limpia sessionStorage + redirect a `/`.
5. Maneja **PHQ-9 ítem 9 ≥ 1** mostrando `<CrisisHotlineCard variant="reinforced">` arriba (replica del Sprint 7.B).

**Compliance crítico:** las recomendaciones deben respetar safety rules (`generateRecommendations(phenotype, blockedIds, ...)` recibe `blockedIds` derivados de `safety.blockedRecommendations`).

## Decisiones del sprint (defaultadas con OK del usuario)

- **A. Accordion** colapsable por sección (shadcn nuevo).
- **B. Client Component** ejecuta scoring (responses viven en sessionStorage).
- **C. Verificar campos obligatorios** (profile + safety + 6 cuestionarios + sleep). Si falta: redirect al primer paso incompleto.
- **D. `window.print()` + CSS print media** — sin libs externas.
- **E. Panel debug** sólo con `?debug=1`.
- **F. Recalcular cada visita** — no persistir results.
- **G. `<DisclaimerBanner variant="reinforced">`** arriba y abajo del contenido.

## Objetivos

1. **`lib/results-builder.ts`** — función pura `buildResults(state: EvalState): BuildResultsOutput`.
2. **`<DisclaimerBanner variant="reinforced">`** — extension del componente Capa 2.
3. **`components/ui/accordion.tsx`** — shadcn Accordion (Radix accordion).
4. **`/eval/results/page.tsx`** real (rewrite del placeholder Sprint 7.B).
5. **`/eval/results/ResultsContent.tsx`** — Client Component con secciones, export PDF, reset.
6. **CSS `@media print`** — para que el export PDF no incluya botones, headers nav, etc.
7. **Pipeline CI verde** + smoke E2E.

**Fuera de scope:**
- Persistencia Supabase (Sprint 9+).
- Tests E2E Playwright (Sprint 13+).
- Auth login (Sprint 10).

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** — patrón canónico Next.js 14 + RSC + co-located components.
- **engineering-minimal-change-engineer** — anti-scope-creep. Sprint 8 cierra Capa 5, NO empezar Supabase.
- **clinical-engine domain knowledge** — APIs ya inspeccionadas:
  - `scoreISI/ESS/STOPBANG/PHQ9/GAD7/DASS21/calculateBMI` con sus result types (totalScore + severity + label + reference).
  - `classifyInsomniaPhenotype(sleepData, isiTotal)` → `PhenotypeResult` con `hasOnsetComponent`, `hasMaintenanceComponent`.
  - `assessRisk(RiskInputs)` → `RiskAssessment` con `overallRisk`, `triggeredFlags`, `requiresSpecialistReferral`, `referralReasons`.
  - `generateRecommendations(phenotype, blockedIds, hasAnxiety, hasDepression)` → `RecommendationSet` con `primary`, `adjunctive`, `optional`, `blockedRecommendations`.
  - `calculatePrecision(AvailableData)` → `PrecisionResult` con `confidencePercent`, `confidenceLevel`.
  - `analyzeLabPanel(values: Record<code, number>)` → `LabPanel`.
  - `analyzeGeneticProfile(variants: Record<gene, genotype>)` → `GeneticProfile`.
- **compliance-anmat** — validar texto canónico del disclaimer reforzado + signoff del compliance.
- **engineering-code-reviewer** — review pre-merge code Capa 5 que toca compliance.
- **obsidian-markdown** — sprint doc + actualizaciones.

Lectura previa empírica:
- `packages/clinical-engine/src/engine/recommendations.ts` — RecommendationSet + Recommendation shapes.
- `packages/clinical-engine/src/engine/risk-integrator.ts` — RiskAssessment + RiskFlag + RiskInputs.
- `packages/clinical-engine/src/engine/phenotype.ts` — PhenotypeResult + sleepEfficiency.
- `packages/clinical-engine/src/engine/precision.ts` — AvailableData inputs (15+ flags).
- `packages/clinical-engine/src/types.ts` — `SleepData` interface (algunos campos no capturados en Sprint 7.B SleepForm — defaults necesarios).

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | El `state.sleep` de Sprint 7.B se puede mappear a `SleepData` del clinical-engine con defaults razonables para campos no capturados (`earlyAwakening`, `earlyMorningAwakeningMinutes`, etc.) | Implementación + test manual de phenotype con sleep data parcial | Si phenotype incorrecto: agregar campos al SleepForm Sprint 9 |
| H2 | `state.safety.blockedRecommendations` (del clinical-engine `evaluateAllSafetyRules`) se puede pasar a `generateRecommendations(phenotype, blockedIds)` para excluir recomendaciones contraindicadas | Implementación + smoke con paciente embarazada → ver melatonina excluida | Si rompe: rehacer mapping de blocked rules |
| H3 | `assessRisk` con sleep efficiency calculado correctamente devuelve `overallRisk: severe` cuando hay STOP-BANG ≥6 + ISI ≥22 | Smoke E2E manual con responses canónicas | Si falla: revisar mapping de `RiskInputs` |
| H4 | shadcn Accordion (Radix) compila con TS strict + paleta SomnoSalud sin issues | typecheck + smoke visual | Si rompe: usar `<details>` HTML5 nativo |
| H5 | `window.print()` + CSS `@media print` produce PDF razonable (sin botones, sin nav, con disclaimer + scoring + recomendaciones legibles) | Print preview en Chrome | Si rompe: agregar lib jsPDF/react-pdf en Fase 3 |
| H6 | Si el paciente no completó algún paso obligatorio y llega directo a `/eval/results`, `buildResults` devuelve `missingSteps[]` y `<ResultsContent>` redirige al primer paso faltante | Smoke E2E con sessionStorage parcial | Si falla: explicit redirect en page Server Component |
| H7 | Pipeline CI cross-monorepo sigue verde + 19 routes detectadas + smoke E2E | `pnpm install/lint/typecheck/test/build` + curl tests | Si rompe: investigar |
| H8 | PHQ-9 ítem 9 ≥ 1 en `state.phq9[8]` dispara `<CrisisHotlineCard variant="reinforced">` arriba del contenido en /eval/results | Smoke E2E con state.phq9 que tenga índice 8 ≥ 1 | Si falla: replicar lógica de PHQ9Form |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Sprint doc + DisclaimerBanner reinforced + shadcn Accordion

- Sprint doc abierto (este archivo).
- Extension `<DisclaimerBanner variant?>` con variant `'reinforced'`.
- `components/ui/accordion.tsx` shadcn (Radix).
- Add dep `@radix-ui/react-accordion`.
- Update index.md + MASTER-PLAN.

### Commit 2 — `lib/results-builder.ts` función pura

- `lib/results-builder.ts` (~250 LOC): toma `EvalState`, valida campos obligatorios, ejecuta scoring de los 6 instrumentos + BMI + phenotype + risk + precision + recommendations + lab (si presente) + genetics (si presente). Devuelve `BuildResultsOutput { complete: boolean, missingSteps: string[], scoring, phenotype, risk, recommendations, precision, labPanel?, geneticProfile?, item9Triggered }`.

### Commit 3 — `/eval/results` real con secciones Accordion

- `app/eval/results/page.tsx` rewrite: Server Component con header + `<DisclaimerBanner variant="reinforced">` + `<ResultsContent />` + footer.
- `app/eval/results/ResultsContent.tsx` Client Component: invoca `buildResults`, redirige si `!complete`, renderiza Accordion con 5 secciones: resumen, recomendaciones, lab (si presente), genetics (si presente), banderas (si triggeredFlags).

### Commit 4 — CSS print + acciones (PDF/reset) + ?debug=1

- Update `app/globals.css` con bloque `@media print`.
- Botones "Imprimir / Exportar PDF" + "Empezar de nuevo" en ResultsContent.
- Panel debug (JSON raw) condicional con `?debug=1`.

### Commit 5 — Cierre Sprint 8

- Sprint doc → `closed-verified` + reporte ejecutivo.
- MASTER-PLAN actualizado.
- index.md actualizado.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura del código

- `find packages/webapp-somnosalud -type f -name "results-builder*"` muestra `lib/results-builder.ts`.
- `grep "buildResults\|@media print" packages/webapp-somnosalud` confirma uso.
- `find packages/webapp-somnosalud/app/eval/results -type f` muestra page.tsx + ResultsContent.tsx.

### E2 — CI verde + smoke E2E

- `pnpm install/lint/typecheck/test/build` → 5-6/N successful + 55/55 tests.
- `pnpm build` → 19 routes detectadas.
- Smoke con curl + cookie:
  - GET `/eval/results` con state completo en sessionStorage → 200 + render scoring.
  - GET `/eval/results` sin state → redirect a `/eval/profile`.

### E3 — Compliance Capa 5 auditable

- DisclaimerBanner reforzado visible top + bottom.
- M.N. visible en footer.
- Recomendaciones excluidas por safety rules → muestran badge "excluido por SAFE-XXX".
- PHQ-9 ítem 9 ≥ 1 → CrisisHotlineCard reinforced arriba.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress`.
- [x] FASE 0 + FASE 1.
- [ ] FASE 2 LOG con 5 commits.
- [ ] FASE 3 EVIDENCIAS.
- [ ] FASE 4 CHECKLIST.

### Bloque B — DEBTs padres
- [x] N/A.

### Bloque C — Sub-DEBTs
- [ ] Probable: `DEBT-sleep-form-fields-faltantes` (Sprint 9 + clinical signoff Pablo).

### Bloque D — Lesson learned
- [ ] Considerar al cierre.

### Bloque E — Session note
- [ ] N/A si <4h.

### Bloque F — CLAUDE.md raíz
- [ ] N/A si no cambia stack.

### Bloque G — DEBT-RADAR
- [ ] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 8 → closed-verified + Fase 1 client-side cerrada.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-09 — sprint en ejecución.*
