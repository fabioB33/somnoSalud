---
title: "Sprint 7.B — PHQ-9 (con detección ítem 9) + GAD-7 + DASS-21 + Sleep diary + Lab/Genetics opcionales"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-7-b, cuestionarios, salud-mental, ideacion-suicida, sleep-diary, lab, genetics, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-7-a-cuestionarios-safety/SPRINT-7-A-CUESTIONARIOS-SAFETY]]"
  - "[[../../architecture/adr/ADR-003-compliance-gates-en-codigo]]"
  - "[[../../clinical/COMPLIANCE-ARGENTINA]]"
  - "[[../../../../.claude/agents/compliance-anmat]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-09
---

# Sprint 7.B — PHQ-9 + GAD-7 + DASS-21 + Sleep diary + Lab/Genetics

> Continuación de Sprint 7.A. Implementa los **5 cuestionarios restantes** del flow de evaluación (PHQ-9, GAD-7, DASS-21, sleep diary, lab opcional, genetics opcional). El más sensible es **PHQ-9 ítem 9 (ideación suicida)** que requiere recurso de emergencia visible siempre + alert reforzado si se marca ≥ 1 (Decisión E3 confirmada en sprint anterior).
>
> Sprint 8 viene después con `/eval/results` (Capa 5 ADR-003) que invoca todos los `score*` del clinical-engine + recomendaciones + risk-integrator + phenotype.

## Contexto

Sprint 7.A dejó funcionando: profile → safety → ISI → ESS → STOP-BANG → placeholder phq9. Sprint 7.B reemplaza el placeholder con la implementación real + agrega 5 pantallas más para llegar al fin del flow de evaluación.

Componentes y patrones reutilizables ya disponibles:
- `<QuestionnaireForm>` genérico con `item.options?` per-item OR `scale` global.
- `<ProgressBar>` server component.
- `usePersistEval` con tipos `phq9`, `gad7`, `dass21`, `sleep`, `lab`, `genetics` ya declarados.
- Patrón de pantallas: page Server Component (header + ProgressBar + intro DOI) + Form Client Component (estado + scoring/persist/redirect).

## Objetivos

1. **`/eval/phq9`** real con detección ítem 9 ≥ 1.
   - Si ítem 9 marcado ≥ 1: Alert variant destructive **inmediato** (no esperar al submit) + recurso emergencia 24/7 línea 0800-999-0091.
   - Recurso emergencia visible **siempre** en footer del form (Decisión E3, antes y después de marcar ítem 9).
   - Componente especializado `<PHQ9Form>` extiende `<QuestionnaireForm>` con `onResponseChange` callback para escuchar marcado del ítem 9.

2. **`/eval/gad7`** — 7 items × 4 niveles uniformes (mismo patrón que ESS).

3. **`/eval/dass21`** — 21 items × 4 niveles. Visualmente paginado en 3 secciones por subscale (depresión 7 + ansiedad 7 + estrés 7) usando el campo `subscale` de cada item, **pero todos en una sola pantalla** (sin navegación entre páginas — solo separators visuales). Razón: el clinical-engine espera el array completo de 21 responses, dividir agrega complejidad sin valor real.

4. **`/eval/sleep`** — Sleep diary form custom (no escalar):
   - Latencia de sueño (min para dormirse).
   - Total de horas dormidas (típico).
   - Total horas en cama.
   - Cantidad de despertares por noche.
   - Calidad subjetiva del sueño (1-10 slider).
   - Hora de acostarse típica (time picker).
   - Hora de despertarse típica (time picker).

5. **`/eval/lab`** opcional — 7 parámetros con skip button:
   - Vitamina D, B12, Hierro, Ferritina, Magnesio, TSH, Glucosa.
   - Cada uno: input numérico + unidad + tooltip "rango óptimo".
   - Botón "Saltar este paso" prominente (no obligatorio).

6. **`/eval/genetics`** opcional — 5 variantes con skip button:
   - CLOCK, PER2, ADORA2A, COMT, MTHFR.
   - Cada uno: select normal/variant/desconozco.
   - Skip prominente.

7. **Placeholder `/eval/results`** — destino post-evaluación, Sprint 8 lo implementa.

8. **Pipeline CI verde** + smoke E2E.

**Fuera de scope:**
- `/eval/results` real (Capa 5 ADR-003) → Sprint 8.
- Tests E2E Playwright → Sprint 13.
- Persistencia Supabase → Sprint 11+.

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** — patrón canónico Next.js 14 + RSC + components co-located.
- **engineering-minimal-change-engineer** — anti-scope-creep. Sprint 7.B se queda en 5 pantallas + placeholder, NO meter `/eval/results`.
- **clinical-engine domain knowledge** — APIs ya inspeccionadas en commit 7.A.1:
  - PHQ-9: 9 items × 4 niveles `{value, label}` Nunca/Varios días/Más de la mitad/Casi todos.
  - GAD-7: 7 items × 4 niveles (mismo OPTIONS que PHQ-9).
  - DASS-21: 21 items × 4 niveles + subscale tag (depression/anxiety/stress).
  - **Item 9 PHQ-9:** "Pensamientos de que estarías mejor muerto/a o de hacerte daño de alguna forma" — gate compliance crítico.
- **compliance-anmat** — validar texto del recurso emergencia (línea 0800-999-0091) + reforzamiento item 9.
- **testing-accessibility-auditor** — formularios opcionales con skip buttons accesibles.
- **obsidian-markdown** — sprint doc + actualizaciones.

Lectura previa empírica:
- [[../../../../packages/clinical-engine/src/scoring/phq9.ts]] — PHQ9_ITEMS shape (sin options propios → usa scale global).
- [[../../../../packages/clinical-engine/src/scoring/gad7.ts]] — GAD7_ITEMS shape (idéntico a ESS).
- [[../../../../packages/clinical-engine/src/scoring/dass21.ts]] — DASS21_ITEMS con campo `subscale`.
- [[../../../../packages/clinical-engine/src/lab/parameters.ts]] — 7 parámetros con `unit`, `normalMin`, `normalMax`, `optimalRange`.
- [[../../../../packages/clinical-engine/src/lab/genetics.ts]] — 5 variantes con `name`, `description`, `impact`.

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | `<QuestionnaireForm>` puede aceptar callback `onResponseChange(itemIdx, value)` para detección live del ítem 9 PHQ-9 sin breaking changes a ISI/ESS existentes | Extension del componente + uso en PHQ9Form + smoke en /eval/isi /eval/ess sigue funcionando | Si rompe: separar PHQ9Form como custom (no extender genérico) |
| H2 | DASS-21 (21 items en una pantalla) no degrada UX significativamente — el scroll vertical es aceptable con separators por subscale | Build OK + smoke visual humano | Si overwhelming: paginar real (3 sub-rutas) |
| H3 | Sleep diary form custom (7 campos heterogéneos) compila + persiste correctamente en `state.sleep` con tipos estrictos | typecheck + build OK + ver state.sleep en sessionStorage | Si rompe: simplificar shape inicial |
| H4 | Lab opcional con skip button funcional: si saltea, persiste `state.lab = undefined` y avanza directo a /eval/genetics | Build + smoke E2E | Si falla: explicit `state.lab = null` |
| H5 | Genetics opcional con select "no sé / normal / variant" funciona — el clinical-engine solo necesita variant flags presentes para los que se respondieron | typecheck contra `analyzeGeneticProfile` signature + persistencia | Si falla: forzar valor para todos |
| H6 | El item 9 del PHQ-9 marcado ≥ 1 dispara Alert destructive **inmediato** (no en submit) sin perder el estado del form | Smoke E2E con curl + visual humano | Si rompe: state-less Alert, depender solo del submit |
| H7 | Pipeline CI cross-monorepo sigue verde + 12 → 18 routes detectadas (5 nuevas reales + 1 placeholder) | `pnpm install/lint/typecheck/test/build` | Si rompe: investigar |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Sprint doc + extension QuestionnaireForm con onResponseChange

- Sprint doc abierto.
- Extension `<QuestionnaireForm>` con prop opcional `onResponseChange?: (itemIdx, value) => void`.
- Update `index.md` + `MASTER-PLAN.md`.

### Commit 2 — `/eval/phq9` real con detección ítem 9 + recurso emergencia

- `app/eval/phq9/page.tsx` reescrito (era placeholder).
- `app/eval/phq9/PHQ9Form.tsx` (Client Component, escucha onResponseChange para item 9).
- `components/compliance/CrisisHotlineCard.tsx` (componente compartido reutilizable).

### Commit 3 — `/eval/gad7` + `/eval/dass21`

- `app/eval/gad7/page.tsx` + `GAD7Form.tsx` (mismo patrón que ESS).
- `app/eval/dass21/page.tsx` + `DASS21Form.tsx` con separators visuales por subscale.

### Commit 4 — `/eval/sleep` (form custom) + `/eval/lab` opcional + `/eval/genetics` opcional + placeholder `/eval/results`

- `app/eval/sleep/page.tsx` + `SleepForm.tsx` con 7 campos heterogéneos.
- `app/eval/lab/page.tsx` + `LabForm.tsx` con skip button.
- `app/eval/genetics/page.tsx` + `GeneticsForm.tsx` con skip button.
- `app/eval/results/page.tsx` placeholder Sprint 8.

### Commit 5 — Welcome update opcional + cierre Sprint 7.B

- (Si aplica) update de welcome para reflejar evaluación completa funcional.
- Sprint doc closed-verified + reporte ejecutivo.
- MASTER-PLAN actualizado.
- Smoke visual E2E documentado.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura del código en `main`

- `find packages/webapp-somnosalud/app/eval -type d` muestra: profile, safety, derivacion-especialista, isi, ess, stopbang, phq9, gad7, dass21, sleep, lab, genetics, results, menor-no-permitido (14 dirs).
- `grep "PHQ9_ITEMS\|GAD7_ITEMS\|DASS21_ITEMS" packages/webapp-somnosalud` confirma uso del clinical-engine.

### E2 — CI verde + smoke E2E

- `pnpm test` cross-monorepo: Tasks 6/6 successful, 55/55 tests.
- `pnpm build`: ~18 routes detectadas + Middleware.
- Smoke con curl: todas las rutas /eval/* devuelven HTTP 200 con cookie consent.

### E3 — Compliance gates auditables

- `grep "0800-999-0091" packages/webapp-somnosalud` aparece en al menos 3 archivos (CrisisHotlineCard + PHQ9Form + DerivacionContent).
- Item 9 PHQ-9 con detección live verificable.

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
- [x] N/A — sprint sin DEBTs padres.

### Bloque C — Sub-DEBTs
- [ ] Considerar al cierre.

### Bloque D — Lesson learned
- [ ] Considerar al cierre.

### Bloque E — Session note
- [ ] N/A si <3h.

### Bloque F — CLAUDE.md raíz
- [ ] N/A si no cambia stack.

### Bloque G — DEBT-RADAR
- [ ] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 7.B → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A — `main` directo.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-09 — sprint en ejecución.*
