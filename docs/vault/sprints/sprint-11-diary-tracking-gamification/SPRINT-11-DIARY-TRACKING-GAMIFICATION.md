---
title: "Sprint 11 — Diary tracking + Gamification (paridad webapp ↔ mobile)"
date: 2026-06-19
sprint_number: 11
status: code-pending-merge
related:
  - "[[../sprint-10-plan-tab-hoy/SPRINT-10-PLAN-TAB-HOY]]"
  - "[[../sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]]"
tags: [sprint, diary, gamification, streaks, insights, longitudinal, paridad-mobile, tier-2, code-pending-merge]
budget_estimado: "6-8h Cowork"
budget_real: "~50 min Cowork"
---

# Sprint 11 — Diary tracking + Gamification

## Trigger

Tier 2.5 paridad webapp ↔ mobile. Mobile tiene `diary_entries` + streaks + insights longitudinales desde Sprint 5+17. Webapp NO tenía esto — solo evaluation one-shot.

Migration 0006 (`diary_entries`) ya está en main del submodule pero la webapp NO la usaba.

## Cambios

### Archivos nuevos (engine + actions + UI)

1. **`lib/progress-builder.ts`** (~180 LOC):
   - `DiaryEntryWebapp` interface espejo del row table.
   - `sleepEfficiency` + `isGoodNight` (Lichstein 2003: eff ≥85% + quality ≥7).
   - `computeStreaks` — currentStreakDays + bestStreakDays + totalGoodNights.
   - `computeAverages` — 4 stats KPI.
   - `buildProgressInsights` — genera 1-3 insights con tone (positive/neutral/attention). Mínimo 3 entries para insights reales.

2. **`app/diario/actions.ts`** — Server Actions:
   - `saveDiaryEntry(input)` → INSERT a `diary_entries` con RLS.
   - `listMyDiaryEntries(limit=90)` → SELECT últimas N del user.

3. **`app/diario/page.tsx`** + **`components/diary/DiaryForm.tsx`**:
   - Auth gate.
   - Form 6 campos minimal (latencia + awakenings + horas dormido + en cama + early awakening freq + calidad 1-10).
   - Default forDate = ayer.
   - useTransition para UX no-bloqueante. Post-save → `/progreso`.

4. **`app/progreso/page.tsx`** + **`components/progress/ProgressDashboard.tsx`**:
   - Server Component lee últimas 90 entries (RLS).
   - Dashboard con:
     - Hero + CTA "Registrar noche".
     - Estado vacío con MoonStar icon + copy onboarding.
     - Streak chip (current + best + total).
     - 4 KPIs (avg sleep / in bed / efficiency / quality) con accent good/attention.
     - Lista insights con tone-styled cards (verde/ámbar/neutro).

5. **`tests/progress-builder.test.ts`** (13 tests):
   - sleepEfficiency edge cases (timeInBed=0).
   - isGoodNight thresholds.
   - computeStreaks (vacío + 3 consecutivos + roto en medio).
   - computeAverages.
   - buildProgressInsights (< 3 entries → neutral; positive efficiency; attention efficiency).

## Quality gates

| # | Gate | Status |
|---|---|---|
| 1 | `pnpm typecheck` strict | ✅ PASS |
| 2 | `pnpm test` | ✅ **30/30 PASS** (13 nuevos + 17 baseline) |
| 3 | `pnpm build` | ✅ PASS — nuevas routes `/diario` + `/progreso` |
| 4 | Smoke E2E (cargar 5 entries → ver insights + streak) | ⏳ pendiente Fabio post-deploy |

## Trade-offs aceptados (regla #1)

1. **Sin migración de los checks de `/hoy` (Sprint 10) al diario** — Sprint 10 guardaba checks en `localStorage` per-día. Sprint 11 NO los migra. Son features separadas (plan vs diario nocturno). Si Sprint 12+ unifica el concepto, agregar mapping.

2. **Sin gráfico/chart visual** — solo KPIs numéricos + chips. Charts requieren librería extra (Recharts ~50 KB). Sprint 12+ puede agregar si Pablo lo pide.

3. **Insights de min 3 entries hardcoded** — el threshold puede ajustarse si Pablo dice "necesito ver insights desde 1 noche". Constant `INSIGHT_MIN_ENTRIES` exporta para tests.

4. **No detectamos race condition entry duplicada misma fecha** — si user pisa Save 2 veces, se crean 2 rows misma `for_date`. UX retorna a `/progreso` que muestra todas. Sprint 12+ puede agregar UNIQUE constraint o UPSERT.

5. **Form sin client-side validation de `totalSleep > timeInBed`** — el caso "8h dormidas en 7h cama" es físicamente imposible. Sprint 12+ puede agregar check.

6. **Form sin Toaster feedback** — el redirect a `/progreso` actúa como confirmación. Si Sprint 12+ quiere más explícito, usar shadcn Sonner (ya instalado Sprint 8.7).

## Cumplimiento reglas universales

| Regla | Aplicación |
|---|---|
| #1 SIN ATAJOS | ✅ Pure functions testeables. No defaults inventados (timeInBed=0 → eff=0 defensivo). |
| #7 EMPIRICAL-FIRST | ✅ Leí mobile progress.ts + diary-entries + 0006 schema ANTES. |
| #9 NO-HARDCODED | ✅ Thresholds clínicos exportados (GOOD_NIGHT_SLEEP_EFF / QUALITY). User firstName desde DB. |
| #10 VAULT-LOOKUP | ✅ Releí Sprint 10 + 9.C + 0006 migration. |

## Tiempo

- **Estimado:** 6-8h Cowork.
- **Real:** ~50 min Cowork (sub-presupuesto 88%).

Razones sub-presupuesto:
- Mobile progress.ts como blueprint exacto (mismas funciones, mismo threshold).
- Migration 0006 ya estaba creada y mergeada al submodule en sesión anterior.
- shadcn UI completo (Card + Button + Input + Label + lucide).
- Webapp ya tiene patrón establecido (page Server Component + Component Client).

## Pendientes Fabio post-deploy

1. **Smoke E2E `/diario` + `/progreso`**:
   - Login → `/diario` → cargar 1 noche → ver redirect a `/progreso`.
   - Cargar 3+ noches → ver insight real (no "need-more-data").
   - Cargar 3 buenas seguidas → ver streak = 3 en chip naranja.
   - Cargar 1 mala en medio → ver streak = 1 (current) pero best = 2.
2. **Decisión UX nav**: ¿agregar `/diario` + `/progreso` al menú superior? Si sí, próximo sprint.
3. **Apply migration 0006 al Supabase IFN** (runbook ya lo cubre).

## Pattern reusable

`lib/progress-builder.ts` es el segundo builder puro testeable después de `plan-builder.ts`. Confirma patrón:
- `build*From*` o `compute*` retornan estructuras simples.
- Pure functions sin side effects.
- Tests cubren edge cases (0 entries, vacío, threshold boundaries).

Sprint 14 (sub-pantallas P5.X) debería seguir el mismo patrón con `insights-builder.ts`.
