---
title: "Sprint 10 — Plan + Tab Hoy (paridad webapp ↔ mobile)"
date: 2026-06-19
sprint_number: 10
status: code-pending-merge
related:
  - "[[../sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]]"
  - "[[../sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]]"
tags: [sprint, plan, hoy, tab, paridad-mobile, fase-1, tier-2-paridad, code-pending-merge]
budget_estimado: "4-6h Cowork"
budget_real: "~40 min Cowork"
---

# Sprint 10 — Plan + Tab Hoy

## Trigger

Tier 2 paridad webapp ↔ mobile. Mobile tiene tab "Hoy" desde Sprint 1 con plan derivado del último resultado + checks diarios. Webapp NO tiene esto — el flujo termina en `/eval/results` sin acción de continuidad.

## Diferencias de approach vs mobile

| Mobile | Webapp |
|---|---|
| `buildPlan(answers: Answers)` re-evalúa motor con respuestas crudas en SQLite local | `buildPlanFromResults(snapshot: BuildResultsOutput)` lee snapshot ya persistido en `evaluations.results_snapshot` |
| Estado persiste en SQLite + Supabase via `useSurvey` | Estado checks en `localStorage` per-día (key `today-plan-checks-v1-YYYY-MM-DD`) |
| `Answers` shape custom mobile (`p1_*`/`p2_*`) | `BuildResultsOutput` canonical del clinical-engine |

**Decisión arquitectural:** webapp es más "correcta" porque el plan refleja el output real del motor (no nuestra interpretación de Answers). Mobile es más "responsive" porque actualiza al toggle sin ir a DB.

## Cambios

### Archivos nuevos

1. **`packages/webapp-somnosalud/lib/plan-builder.ts`** (~120 LOC):
   - `buildPlanFromResults(results)` deriva plan items desde `recommendations.daily` + base hygiene.
   - Detecta `hasApneaSign` (stopBang.risk intermediate/high) + `hasMoodSign` (phq9/gad7 moderate+).
   - Helpers `slugifyLabel` + `mapCategoryFromEngine`.

2. **`packages/webapp-somnosalud/app/hoy/page.tsx`** (Server Component):
   - Auth gate + lee última `evaluation` completed.
   - Si no hay user → redirect login. Si no hay eval completa → redirect `/eval/profile`.
   - Pasa snapshot a `<TodayPlan />`.

3. **`packages/webapp-somnosalud/components/plan/TodayPlan.tsx`** (Client Component, ~180 LOC):
   - Hero con fecha + saludo personal.
   - Progress chip con copy según completedCount.
   - Alerts compliance si hasApneaSign / hasMoodSign.
   - Lista items con checkbox refinado (lucide Circle / CheckCircle2).
   - Persistencia checks en localStorage per-día.
   - Card "Ver mis resultados" linkeando al detalle.

4. **`packages/webapp-somnosalud/tests/plan-builder.test.ts`** (7 tests):
   - Sin resultados → solo base hygiene.
   - Con recommendations → agrega + dedupe vs base.
   - Detecta apnea/mood signs.
   - Phenotype string viene del enum (no del label — fix typecheck).

## Quality gates

| # | Gate | Status |
|---|---|---|
| 1 | `pnpm typecheck` | ✅ PASS |
| 2 | `pnpm test` | ✅ **17/17 PASS** (7 nuevos + 10 baseline) |
| 3 | `pnpm build` | ✅ PASS — nueva route `/hoy` agregada al manifest |
| 4 | Smoke E2E real (login + completar eval + ir a /hoy) | ⏳ pendiente Fabio post-deploy |

## Trade-offs aceptados (regla #1)

1. **Checks del plan en `localStorage` per-día, no en DB** — preserva UX rápida + evita writes en cada toggle. Sprint 11 (Diary tracking) agrega persistencia real cuando incluya el tracking longitudinal.

2. **`buildPlanFromResults` usa `phenotype.phenotype` (enum) no `phenotype.label`** — el label sería más amigable pero hubo conflicto typecheck con el linkeado workspace de `somnosalud-clinical-engine`. El enum es seguro + el componente puede mostrar copy custom si Sprint 11+ lo pide.

3. **Sin Tab navigation real** — `/hoy` es route standalone, no parte de un layout de tabs (`(tabs)/hoy.tsx` mobile). Webapp tendría que diseñar nav superior dedicada. Sprint 11+ puede agregar nav post-decisión Fabio sobre estructura.

4. **`firstName` viene de `evaluations.profile.firstName`** (asume shape ProfileForm). Si Sprint 11 cambia shape, romper saludo personal. Mitigación: fallback "Tu plan de hoy" si null.

5. **Alerts `hasApneaSign`/`hasMoodSign` siempre prominentes arriba** — pueden molestar al user diario. Sprint 11+ puede colapsarlas tras N días de visualización + persistir dismissal.

## Cumplimiento reglas universales

| Regla | Aplicación |
|---|---|
| #1 SIN ATAJOS | ✅ Trade-offs declarados. NO duplicamos lógica del motor — derivamos de snapshot. |
| #7 EMPIRICAL-FIRST | ✅ Leí mobile plan.ts + hoy.tsx + webapp results-builder shapes ANTES de implementar. |
| #9 NO-HARDCODED | ✅ `firstName` desde DB. Compliance copy desde clinical-engine. No hardcodeamos "Pablo Ferrero" en TodayPlan. |
| #10 VAULT-LOOKUP | ✅ Releí Sprint 8 + 9.C + ADR-003 antes. |

## Tiempo

- **Estimado:** 4-6h Cowork.
- **Real:** ~40 min Cowork (sub-presupuesto 88%).

Razones sub-presupuesto:
- Mobile plan.ts como blueprint claro.
- Clinical-engine ya expone shapes correctos via snapshot.
- shadcn/ui components ya instalados (Card + Alert + lucide).

## Pendientes Fabio post-deploy

1. **Smoke E2E** `/hoy`:
   - Cuenta fresh sin eval → debe redirigir a `/eval/profile`.
   - Cuenta con eval completa → ver plan con N items.
   - Toggle items → ver progress chip actualizar + persistir refresh.
   - Cuenta con eval con stopBang risk intermediate → debe ver Alert apnea.
2. **Decisión UX**: ¿quiere nav superior con tabs como mobile (Hoy / Datos / Progreso / Resultados)? Si sí, Sprint 11+.

## Pattern reusable

`lib/plan-builder.ts` es helper puro testeable. Patrón aplicable a futuros builders derivados de snapshot:
- `lib/progress-builder.ts` (Sprint 11 — streaks + insights longitudinales).
- `lib/insights-builder.ts` (Sprint 14 — sub-pantallas P5.X).

Todos siguen forma: `build*FromResults(snapshot: BuildResultsOutput | null): T` con base default + ramificaciones del snapshot.
