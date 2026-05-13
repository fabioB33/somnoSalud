---
title: "Sprint 8.5 — UX polish QuestionnaireForm (pills horizontales + progress sticky + number badge + separators DASS-21)"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-8-5, ux, polish, questionnaire, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]]"
  - "[[../sprint-7-a-cuestionarios-safety/SPRINT-7-A-CUESTIONARIOS-SAFETY]]"
  - "[[../../concepts/CONVENCIONES-FRONTEND-WEBAPP]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-09
---

# Sprint 8.5 — UX polish QuestionnaireForm

> Iteración rápida sobre `<QuestionnaireForm>` post-feedback usuario:
> *"es un bodrio contestar"*. Sin cambiar el flow (1 instrumento por
> pantalla) ni la lógica clínica — solo mejoras visuales que reducen
> overload y fricción.
>
> **Sprint chico — Opción A + sub-mejoras** de la propuesta del 2026-05-09.

## Contexto

Sprint 7.A creó `<QuestionnaireForm>` con stack vertical de radios por ítem. Funciona pero:

1. DASS-21 = 21 fieldsets × 4 opciones = 84 radios apilados verticalmente. Scroll infinito.
2. Progress "X de N respondidas" abajo del submit — no visible mientras avanzás.
3. Número del ítem chiquito y gris ("1. ..."). Difícil ubicarse.
4. Mismo layout para 4 niveles (ESS, PHQ-9, GAD-7) que para 5 niveles (ISI). Las opciones se ven amontonadas.
5. Touch target chico en mobile.

## Decisiones de implementación

**Opción A** de la propuesta original (pills horizontales) + sub-mejoras:

1. **Pills horizontales**: opciones en fila horizontal con número grande encima del label. Responsive: si no entran horizontalmente, fallback a grid 2x2 (4 niveles) o stack vertical (5 niveles mobile).
2. **Progress sticky arriba**: barra de progreso pegada al top del form (sticky), visible siempre. Hoy está fuera del componente como `<ProgressBar>` separado en el page Server Component — agregar **segundo progress contextual interno** (items respondidos / total) sticky.
3. **Number badge grande**: cada ítem con badge circular con el número del ítem grande + bg primary cuando respondido.
4. **Separators DASS-21**: 3 headers visuales informativos cada 7 ítems: "Parte 1 de 3", "Parte 2 de 3", "Parte 3 de 3" (NO menciona qué subscale es — eso rompería validación clínica). Solo descanso visual.
5. **Smooth scroll opcional al siguiente ítem cuando se responde** — feature flag `autoScroll = true` por default, configurable por prop (testing E2E lo desactivará para evitar flakiness).
6. **Highlight visual del ítem actual** (último que tocó el paciente): borde primary + leve bg. Faded states para items no tocados (opacity 60%).

**NO cambiamos:**
- Patrón page Server + Form Client (ADR-001).
- 1 instrumento por pantalla (NO Typeform-style B).
- API del componente (props existentes mantienen compat).
- ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21 forms NO se modifican (solo el componente compartido).

## Objetivos

1. **Refactor `<QuestionnaireForm>`** con pills horizontales + responsive.
2. **Number badge** prominente por ítem.
3. **Progress sticky interno** del form.
4. **Separators DASS-21** opcionales via prop existente `itemSeparators`.
5. **Smooth scroll** al siguiente ítem (configurable).
6. **Highlight item actual + faded states** para mejor foco visual.
7. **Pipeline CI verde** + smoke visual con curl.

**Fuera de scope:**
- shadcn RadioGroup formal (queda en Sprint 8.8 polish).
- Opción B Typeform-style (rechazada por costo de refactor).
- Cambios en otros componentes (SafetyForm, ProfileForm, SleepForm tienen su propia UX).

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** — Tailwind + responsive patterns.
- **engineering-minimal-change-engineer** — anti-scope-creep. Sprint chico, no expandir.
- **testing-accessibility-auditor** — verificar que pills horizontales preservan WCAG (radio name único + fieldset/legend + keyboard nav).
- **obsidian-markdown** — sprint doc.

Lectura previa:
- `packages/webapp-somnosalud/components/eval/QuestionnaireForm.tsx` — componente actual.
- `packages/webapp-somnosalud/app/eval/dass21/DASS21Form.tsx` — uso DASS-21.

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | Pills horizontales caben en mobile 375px para escalas de 5 niveles (ISI) | DevTools 375×667 + smoke visual | Fallback a 2x2 grid o stack vertical en breakpoint < sm |
| H2 | Number badge + label + pills + reference no rompen lint warnings a11y | `next lint` exit 0 con max-warnings=0 | Revisar focus states o aria attributes |
| H3 | `scrollIntoView({ behavior: 'smooth' })` no rompe E2E futuro (Playwright Sprint 13) | Comment en código que diga "deshabilitar via prop si testing" | Mantener prop `autoScroll` para opt-out |
| H4 | Separators DASS-21 visuales no confunden al paciente (siguen ítems en orden canónico intercalado) | Verificar wording sea "Parte 1/3" SIN mencionar subscale | Cambiar wording |
| H5 | CI cross-monorepo verde post-cambios | `pnpm install/lint/typecheck/test/build` → 5-6/N successful, 55/55 tests | Investigar |
| H6 | Smoke visual confirma mejora de UX en /eval/isi y /eval/dass21 | Curl HTTP 200 + verificación manual humana en navegador | Iterar si visualmente sigue feo |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Sprint doc + refactor QuestionnaireForm (pills + badge + sticky progress + scroll auto)

- Sprint doc abierto (este archivo).
- Refactor `components/eval/QuestionnaireForm.tsx` con todas las mejoras visuales.
- index.md + MASTER-PLAN actualizados.

### Commit 2 — Update DASS21Form con separators "Parte 1/2/3"

- `app/eval/dass21/DASS21Form.tsx` pasa el prop `itemSeparators` con 3 headers cada 7 ítems.

### Commit 3 — Cierre sprint + smoke E2E con curl

- Sprint doc → `closed-verified`.
- MASTER-PLAN + index actualizados.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura del código

- `grep "rounded-md.*flex.*gap-2" packages/webapp-somnosalud/components/eval/QuestionnaireForm.tsx` confirma pills horizontales.
- DASS21Form pasa `itemSeparators={new Map(...)}`.

### E2 — CI verde

- `pnpm install/lint/typecheck/test/build` → 5-6/N successful + 55/55 tests.
- `pnpm build` → 19 routes prerendered.

### E3 — Smoke visual

- Curl HTTP 200 a `/eval/isi`, `/eval/ess`, `/eval/dass21` (con cookie consent).
- Verificación manual humana pendiente Fabio (lección hotfix 2026-05-09).

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress`.
- [x] FASE 0 + FASE 1.
- [ ] FASE 2 LOG con 3 commits.
- [ ] FASE 3 EVIDENCIAS.
- [ ] FASE 4 CHECKLIST.

### Bloque B — DEBTs padres
- [x] N/A.

### Bloque C — Sub-DEBTs
- [ ] Considerar al cierre (probablemente N/A — sprint puramente UX).

### Bloque D — Lesson learned
- [ ] Considerar al cierre.

### Bloque E — Session note
- [x] N/A — sprint < 2h.

### Bloque F — CLAUDE.md raíz
- [x] N/A.

### Bloque G — DEBT-RADAR
- [x] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 8.5 → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-09 — sprint en ejecución.*
