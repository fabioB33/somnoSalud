---
title: "Sprint 7.A — Cuestionarios ISI/ESS/STOP-BANG + Capa 4 safety rules + componente genérico QuestionnaireForm"
date: 2026-05-09
last_synced_with_vault_reality: 2026-05-09
tags: [sprint, sprint-7-a, cuestionarios, safety, capa-4, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-6-compliance-gates/SPRINT-6-COMPLIANCE-GATES]]"
  - "[[../../architecture/adr/ADR-003-compliance-gates-en-codigo]]"
  - "[[../../concepts/CONVENCIONES-FRONTEND-WEBAPP]]"
  - "[[../../hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]]"
  - "[[../../../../packages/clinical-engine/README]]"
  - "[[../../../../CLAUDE]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-09
---

# Sprint 7.A — Cuestionarios ISI/ESS/STOP-BANG + Capa 4 safety rules

> Implementa **Capa 4 de [[../../architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]]** (`/eval/safety` con safety rules SAFE-010..040) + componente genérico `QuestionnaireForm` reutilizable + 3 primeras pantallas de cuestionarios (ISI, ESS, STOP-BANG).
>
> Sprint 7.B continuará con PHQ-9 + GAD-7 + DASS-21 + sleep diary + lab + genetics.

## Contexto

Sprint 6 dejó el flow de compliance gates funcional hasta `/eval/safety` (placeholder). Sprint 7.A:
1. Reemplaza el placeholder de `/eval/safety` con la implementación real (Capa 4): invoca `evaluateAllSafetyRules` del clinical-engine con los inputs de profile + datos nuevos (pregnancy + medications + anticoagulants), y según severidad bloquea/permite continuar.
2. Crea componente `QuestionnaireForm` genérico para cuestionarios escalares (ISI, ESS, PHQ-9, GAD-7).
3. Implementa las 3 primeras pantallas de cuestionarios: ISI (7 ítems escala 0-4), ESS (8 ítems escala 0-3), STOP-BANG (5 manuales boolean + 3 auto-calculados desde profile).

**Hotfix crítico aplicado en este sprint (lección Sprint 6 → 7):** **smoke visual de cada pantalla en navegador real** antes de cerrar (regla derivada de [[../../lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]]).

---

## Objetivos

1. **Capa 4 — `/eval/safety`** real:
   - Form: pregnancy status + pregnancy weeks (condicional) + medications free-text + anticoagulant flag + medical conditions free-text + allergies free-text + shift work + shift type (condicional).
   - Submit invoca `evaluateAllSafetyRules({patient, screening, medications})`.
   - Si `evaluation.anyBlocking === true` → redirige a `/eval/derivacion-especialista` con detalle de la rule (Decisión D1 hard block).
   - Si `evaluation.anyRestricting === true` → muestra alert + checkbox "entiendo y quiero seguir" antes de habilitar "Continuar" (Decisión D2 warning).
   - Si `evaluation.maxSeverity === 'clear'` o `'warn'` → persiste y avanza a `/eval/isi`.
2. **Componente genérico `<QuestionnaireForm>`** en `components/eval/QuestionnaireForm.tsx`:
   - Props: `instrumentName`, `items` (array de strings o `{number, text}`), `scale` (array de `{value, label}`), `responses` initial, `onSubmit(responses) => void`, `nextRoute`.
   - Feature: progress bar visible (item N de M).
   - Feature: validación inline (todos los items requeridos antes de habilitar submit).
   - Feature: navegación con teclado entre items (Tab).
   - RadioGroup native HTML (no shadcn por ahora — agregar shadcn `RadioGroup` solo si necesitamos styling extra).
3. **Pantallas Sprint 7.A**:
   - `/eval/isi` — 7 ítems × escala 5 niveles (Bastien 2001).
   - `/eval/ess` — 8 ítems × escala 4 niveles (Johns 1991).
   - `/eval/stopbang` — 5 manual boolean + 3 auto-calculados visible-only desde profile (BMI, age, sex).
4. **Pantalla `/eval/derivacion-especialista`** — destino del block hard de Capa 4.
5. **Estado**: `usePersistEval` extendido con campos nuevos (`safety`, `isi`, `ess`, `stopBang`).
6. **Pipeline CI verde** + **smoke visual obligatorio** (lección hotfix 2026-05-09).

**Fuera de scope (Sprint 7.B):**
- PHQ-9 (con detección ítem 9), GAD-7, DASS-21.
- Sleep diary, lab, genetics opcionales.
- Pantalla `/eval/results` (Capa 5, Sprint 8).

---

## FASE 0 — Skills cargadas

- **engineering-frontend-developer** — patrón canónico Next.js 14 + RSC + components co-located.
- **engineering-minimal-change-engineer** — anti-scope-creep. Sprint 7.A se queda en 3 cuestionarios + safety, NO meter PHQ-9.
- **clinical-engine domain knowledge** — `references.ts` + tests/scoring.test.ts ya inspeccionados:
  - ISI: 7 ítems, escala 0-4, cutoffs Bastien 2001.
  - ESS: 8 ítems, escala 0-3 con labels específicos.
  - STOP-BANG: 5 manual boolean (snoring, tired, observed, pressure, neckOver40cm) + 3 auto desde profile (bmiOver35, ageOver50, isMale).
  - Safety: `evaluateAllSafetyRules(patient, screening, medications)` → `SafetyEvaluation { rules, maxSeverity: 'block'|'restrict'|'warn'|'clear', anyBlocking, anyRestricting }`.
- **compliance-anmat** — validar que el block hard de SAFE-020 (embarazo) y SAFE-040 (melatonina+anticoagulantes) tiene UI + texto canónico.
- **testing-accessibility-auditor** — RadioGroups requieren `<fieldset><legend>` + `aria-labelledby`.
- **obsidian-markdown** — sprint doc + actualizaciones.

Lectura previa empírica:
- [[../../../../packages/clinical-engine/src/scoring/isi.ts]] — ISI_ITEMS shape.
- [[../../../../packages/clinical-engine/src/scoring/ess.ts]] — ESS_ITEMS + ESS_OPTIONS.
- [[../../../../packages/clinical-engine/src/scoring/stop-bang.ts]] — STOPBANG_MANUAL_ITEMS + STOPBANG_AUTO_ITEMS.
- [[../../../../packages/clinical-engine/src/safety/rules.ts]] — `evaluateAllSafetyRules` signature + `SafetyEvaluation` shape.
- [[../../../../packages/clinical-engine/src/types.ts]] — `SafetyScreening` interface (10 campos).

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | `evaluateAllSafetyRules({patient, screening, medications})` se puede invocar client-side desde Next.js sin importar deps de Node | `import { evaluateAllSafetyRules } from 'somnosalud-clinical-engine'` en client component → typecheck + build OK | Si rompe: invocar via Server Action |
| H2 | El componente `<QuestionnaireForm>` genérico puede manejar ISI (5 niveles), ESS (4 niveles, con labels distintos), PHQ-9 futuro (4 niveles) sin if/else específicos | Implementación + uso en 2 pantallas (ISI, ESS) + smoke visual | Si necesita branching por instrumento: separar componentes (Decisión C2 retroactiva) |
| H3 | RadioGroup native HTML con `<input type="radio">` + `<fieldset><legend>` cumple accesibilidad WCAG 2.1 A sin shadcn `RadioGroup` | Lighthouse Accessibility score >85 + navegación con teclado verificada | Si falla: agregar shadcn RadioGroup en Sprint 7.B |
| H4 | El form `/eval/safety` puede capturar todos los 10 campos de `SafetyScreening` con UX razonable en una pantalla (sin paginación) | Pantalla diseñada + smoke visual desktop + mobile | Si overwhelming: paginar en 2 (preguntas básicas + condiciones médicas) |
| H5 | `usePersistEval` permite agregar fields nuevos (`safety`, `isi`, `ess`, `stopBang`) sin breaking changes a `profile` existente | Update interface + verificar que profile sigue cargando post-update | Si rompe: migración explícita del shape sessionStorage |
| H6 | Smoke visual de las 4 pantallas nuevas en navegador real muestra paleta correcta + paginación correcta + navegación funcional | Curl + visual check en Chrome/Firefox | Si rompe: hotfix antes de cerrar |
| H7 | CI cross-monorepo sigue verde post-cambios (clinical-engine intacto, webapp build OK) | `pnpm install/lint/typecheck/test/build` → 5-6/N successful, 55/55 tests | Si rompe: investigar qué se rompió |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Captura durante FASE 2.

(A completar mientras se ejecuta el sprint.)

---

## FASE 2 LOG — Cambios aplicados

### Commit 1 — Sprint doc + scaffold genérico QuestionnaireForm

- Sprint doc abierto (este archivo).
- `components/eval/QuestionnaireForm.tsx` (genérico, ~150 LOC).
- `components/eval/ProgressBar.tsx` (compartido).
- Update `hooks/usePersistEval.ts` con campos `safety`, `isi`, `ess`, `stopBang` tipados correctamente.
- Update `index.md` + `MASTER-PLAN.md`.

### Commit 2 — Capa 4: `/eval/safety` real + `/eval/derivacion-especialista`

- `app/eval/safety/page.tsx` reescrito (era placeholder).
- `app/eval/safety/SafetyForm.tsx` (Client Component).
- `app/eval/derivacion-especialista/page.tsx` (Server Component, destino del block hard).

### Commit 3 — `/eval/isi` (7 ítems × 5 niveles, Bastien 2001)

- `app/eval/isi/page.tsx` (Server Component, intro + DOI).
- `app/eval/isi/ISIForm.tsx` (Client Component, usa `<QuestionnaireForm>`).
- Persiste en sessionStorage `state.isi: number[]`.

### Commit 4 — `/eval/ess` (8 ítems × 4 niveles, Johns 1991) + `/eval/stopbang` (5 manual + 3 auto)

- `app/eval/ess/page.tsx` + `ESSForm.tsx`.
- `app/eval/stopbang/page.tsx` + `STOPBangForm.tsx`.
- STOP-BANG muestra los 3 auto-calculados como info visible (read-only).

### Commit 5 — Welcome update + cierre Sprint 7.A

- `app/eval/safety/page.tsx` se conecta con `/eval/isi` siguiente.
- `app/eval/stopbang/page.tsx` redirige a placeholder Sprint 7.B (`/eval/phq9`) para evitar 404.
- `app/eval/phq9/page.tsx` placeholder.
- Sprint doc cerrado + MASTER-PLAN actualizado.
- Smoke visual final documentado.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

### E1 — Lectura de `main`

- `find packages/webapp-somnosalud/app/eval -type d` muestra: profile, safety, derivacion-especialista, isi, ess, stopbang, phq9 (placeholder), menor-no-permitido.
- `find packages/webapp-somnosalud/components/eval -type f` muestra QuestionnaireForm + ProgressBar.
- `grep "evaluateAllSafetyRules" packages/webapp-somnosalud` confirma uso del clinical-engine.

### E2 — CI verde + smoke visual

- `pnpm install/lint/typecheck/test/build` → 5-6/N successful, 55/55 tests.
- `pnpm dev` arranca, navegar:
  - `/eval/safety` → form completo, submit con embarazo+anticoagulant → block hard a `/eval/derivacion-especialista`.
  - `/eval/safety` → submit clear → `/eval/isi`.
  - `/eval/isi` → 7 ítems, progress bar, submit → `/eval/ess`.
  - `/eval/ess` → idem.
  - `/eval/stopbang` → 5 manual + 3 auto visible read-only → submit → `/eval/phq9` (placeholder).

### E3 — Smoke visual paleta + accesibilidad

- Pantallas con gradient SomnoSalud aplicado (post-hotfix 2026-05-09).
- Lighthouse Accessibility >85 en `/eval/safety` y `/eval/isi`.

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
- [ ] Considerar al cierre (smoke visual ahora obligatorio — verificar si hay nuevos patrones).

### Bloque E — Session note
- [ ] N/A si <3h.

### Bloque F — CLAUDE.md raíz
- [ ] N/A si no cambia stack.

### Bloque G — DEBT-RADAR
- [ ] N/A.

### Bloque H — MASTER-PLAN
- [ ] Sprint 7.A → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A — `main` directo.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-09 — sprint en ejecución.*
