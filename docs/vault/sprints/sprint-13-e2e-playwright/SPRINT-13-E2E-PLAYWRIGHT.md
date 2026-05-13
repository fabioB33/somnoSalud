---
title: "Sprint 13 — Tests E2E Playwright (happy path + compliance gates + edge cases)"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-13, tests, e2e, playwright, qa, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-8-7-polish-a11y/SPRINT-8-7-POLISH-A11Y]]"
  - "[[../../processes/QA-CHECKLIST]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-09
---

# Sprint 13 — Tests E2E Playwright

> Tests E2E robustos del flow client-side (sin Supabase todavía).
> Cubre los casos críticos de compliance + happy path + edge cases.
>
> **Por qué importa:** sin tests E2E, cualquier refactor futuro
> (Supabase migration Sprint 11+, UX iteration, accesibilidad Fase 3)
> arriesga romper el flow sin que lo detectemos hasta producción.

## Contexto

Hasta hoy verificación es **smoke con curl** (HTTP 200) + typecheck + lint. Falta validar **comportamiento real del browser**:

- Click flow → llega a `/eval/results`?
- Marcar PHQ-9 ítem 9 ≥ 1 → aparece CrisisHotlineCard reinforced?
- Safety con embarazo + warfarina → redirige a derivación?
- Reset Dialog → sessionStorage realmente se borra?

Playwright permite verificar todo eso programáticamente con Chromium real.

## Objetivos

1. **Setup Playwright** en monorepo:
   - Instalar `@playwright/test` + Chromium en `packages/webapp-somnosalud/`.
   - Config `playwright.config.ts` con webServer auto-launch.
   - Update `package.json` script `test:e2e`.
   - Update `pnpm test` para correr E2E además del clinical-engine (opcional — decisión: NO, mantener `test:e2e` aparte porque tarda más).

2. **8 tests E2E críticos**:
   - **T1 Happy path full** — paciente adulto sin red flags, completa los 12 pasos, llega a `/eval/results` con scoring visible.
   - **T2 Middleware Capa 1** — visitar `/eval/profile` sin cookie → redirige a `/terms?redirect=...`.
   - **T3 Edad <18 (Capa 3)** — `/eval/profile` con DOB que da edad 16 → `/eval/menor-no-permitido`.
   - **T4 Safety block (Capa 4)** — `/eval/safety` con embarazo SÍ + medicación con "warfarina" → `/eval/derivacion-especialista`.
   - **T5 PHQ-9 ítem 9 detection** — marcar el ítem 9 con valor ≥ 1 en `/eval/phq9` → CrisisHotlineCard reinforced visible inmediatamente (no esperar submit).
   - **T6 Lab + genetics skip** — botones "Saltar este paso" funcionan, sessionStorage `lab` y `genetics` quedan `undefined`.
   - **T7 Results redirect si incompleto** — visitar directo `/eval/results` con state vacío → redirige al primer paso faltante.
   - **T8 Reset Dialog** — en `/eval/results` click "Empezar de nuevo" → Dialog visible, click "Sí, empezar de nuevo" → sessionStorage limpio + redirect a `/`.
   - **T9 404 custom** — visitar `/ruta-que-no-existe` → renderiza `<NotFound>` con Moon icon.

3. **Helpers reusables**:
   - `completeConsent(page)` — flow welcome → disclaimer → terms (consent).
   - `completeProfile(page, { age, sex, weight, height })` — fill profile form.
   - `completeQuestionnaire(page, instrumentName, responses)` — fill cualquier QuestionnaireForm.

4. **CI integration deferred** — agregar a GitHub Actions `.github/workflows/ci.yml` queda para Sprint 14 (junto con Sentry). Por ahora `pnpm test:e2e` localmente.

**Fuera de scope:**
- Visual regression (Percy / Chromatic) — Fase 3.
- Tests de print PDF — manual humano.
- Tests cross-browser (Firefox / Safari) — Sprint 15 si aplica.
- Tests de accesibilidad (axe-playwright) — Sprint 14.

---

## FASE 0 — Skills cargadas

- **testing-api-tester** — validation + integration testing patterns.
- **testing-evidence-collector** — screenshot QA para tests visuales.
- **testing-reality-checker** — "NEEDS WORK by default" hasta proof empírica.
- **engineering-frontend-developer** — context de Next 14 App Router + sessionStorage.
- **engineering-minimal-change-engineer** — anti-scope-creep. NO meter visual regression ni axe en este sprint.

Lectura previa empírica:
- [packages/webapp-somnosalud/middleware.ts](../../../../packages/webapp-somnosalud/middleware.ts) — Capa 1.
- [packages/webapp-somnosalud/app/eval/profile/ProfileForm.tsx](../../../../packages/webapp-somnosalud/app/eval/profile/ProfileForm.tsx) — Capa 3.
- [packages/webapp-somnosalud/app/eval/safety/SafetyForm.tsx](../../../../packages/webapp-somnosalud/app/eval/safety/SafetyForm.tsx) — Capa 4.
- [packages/webapp-somnosalud/app/eval/phq9/PHQ9Form.tsx](../../../../packages/webapp-somnosalud/app/eval/phq9/PHQ9Form.tsx) — ítem 9 detection.

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | `@playwright/test` se instala en `packages/webapp-somnosalud/` sin breaking de typecheck/build clinical-engine | `pnpm install` + `pnpm test` cross-monorepo | Si rompe: investigar peerDeps |
| H2 | `playwright.config.ts` con `webServer.command` puede lanzar el dev server de Next y esperar `Ready` antes de correr tests | `pnpm test:e2e` lanza dev + tests pasan | Si rompe: pre-launch manual del server |
| H3 | Helper `completeQuestionnaire(page, name, responses)` puede iterar items de cualquier QuestionnaireForm (ISI/ESS/PHQ/GAD/DASS) sin if/else por instrumento | Test T1 (happy path) usa el helper para 6 instrumentos | Si rompe: helper específico por escala |
| H4 | `page.evaluate(() => sessionStorage.setItem(...))` permite pre-poblar state para tests específicos sin completar flow desde cero | T7 (results redirect) y T8 (reset) usan este patrón | Si rompe: completar flow desde cero (tests más lentos) |
| H5 | Playwright detecta CrisisHotlineCard "reinforced" via texto distintivo "Detectamos que marcaste pensamientos de hacerte daño" | T5 verifica con `page.getByText(...)` | Si rompe: agregar `data-testid` específico |
| H6 | Tests pasan en local. CI integration es Sprint 14+. | `pnpm test:e2e` en local exit 0 con 8/8 tests passing | Si fallan: iterar individualmente |
| H7 | Pipeline CI cross-monorepo sigue verde (los E2E NO se corren en `pnpm test` ni `pnpm build`) | `pnpm install/lint/typecheck/test/build` sin cambios | Investigar |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Setup Playwright + config

- Instalar `@playwright/test` + Chromium.
- `playwright.config.ts` con webServer.
- `package.json` script `test:e2e`.
- `.gitignore` agrega `test-results/`, `playwright-report/`, `playwright/.cache/`.
- Sprint doc + index + MASTER-PLAN.

### Commit 2 — Helpers reusables + tests T1-T4

- `tests/e2e/helpers.ts` con `completeConsent`, `completeProfile`, `completeQuestionnaire`.
- `tests/e2e/01-happy-path.spec.ts` (T1).
- `tests/e2e/02-compliance-gates.spec.ts` (T2 middleware + T3 edad + T4 safety).

### Commit 3 — Tests T5-T9 + cierre sprint

- `tests/e2e/03-phq9-item9.spec.ts` (T5).
- `tests/e2e/04-optional-steps.spec.ts` (T6).
- `tests/e2e/05-results-flow.spec.ts` (T7 + T8).
- `tests/e2e/06-not-found.spec.ts` (T9).
- Sprint doc closed-verified.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura código

- `ls packages/webapp-somnosalud/tests/e2e/` muestra 6 archivos `*.spec.ts` + helpers.
- `cat playwright.config.ts` confirma webServer.

### E2 — Tests passing

- `pnpm test:e2e` → 8/8 tests passing (o N/M con desglose).

### E3 — CI cross-monorepo sin breaking

- `pnpm install/lint/typecheck/test/build` → 5-6/N successful + 55/55 clinical-engine tests.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress`.
- [x] FASE 0 + FASE 1.
- [ ] FASE 2 + 3 + 4.

### Bloque B — DEBTs padres
- [x] N/A.

### Bloque C — Sub-DEBTs
- [ ] `DEBT-e2e-ci-integration` para Sprint 14 (agregar workflow Playwright a GitHub Actions).
- [ ] Posible: `DEBT-axe-playwright-a11y-tests` si querés tests automáticos de a11y.

### Bloque D — Lesson learned
- [ ] Considerar al cierre.

### Bloque E — Session note
- [x] N/A <5h.

### Bloque F — CLAUDE.md raíz
- [x] N/A.

### Bloque G — DEBT-RADAR
- [x] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 13 → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-09 — sprint en ejecución.*
