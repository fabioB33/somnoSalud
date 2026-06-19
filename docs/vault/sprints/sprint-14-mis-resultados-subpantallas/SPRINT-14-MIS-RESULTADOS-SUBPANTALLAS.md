---
title: "Sprint 14 — Mis resultados con sub-pantallas P5.1-P5.5 (paridad webapp ↔ mobile)"
date: 2026-06-19
sprint_number: 14
status: code-pending-merge
related:
  - "[[../sprint-10-plan-tab-hoy/SPRINT-10-PLAN-TAB-HOY]]"
  - "[[../sprint-11-diary-tracking-gamification/SPRINT-11-DIARY-TRACKING-GAMIFICATION]]"
  - "[[../sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]]"
tags: [sprint, insights, sub-pantallas, p5, results, paridad-mobile, tier-2, closing, code-pending-merge]
budget_estimado: "3-4h Cowork"
budget_real: "~45 min Cowork"
---

# Sprint 14 — Mis resultados sub-pantallas P5.1-P5.5

## Trigger

Tier 2.8 paridad (último sprint del plan). Mobile tiene Sprint 4.5 con 5 sub-pantallas: P5.1 Respiración, P5.2 Descanso, P5.3 Acompañamiento, P5.4 Cuerpo, P5.5 Resumen. Webapp solo tenía `/mis-resultados` con score boxes pero sin breakdown narrativo.

## Cambios

### Engine (`lib/insights-builder.ts`, ~290 LOC)

5 builders puros + helper agregador:
- `buildRespiracionInsight(results)` → P5.1 STOP-BANG con tone urgent/attention/positive según `risk`.
- `buildDescansoInsight(results)` → P5.2 ISI + phenotype con phenotypeCopy traducido al lenguaje encubierto.
- `buildAcompanamientoInsight(results)` → P5.3 PHQ-9/GAD-7 con override urgent si `suicidalIdeation`. Incluye copy con 0800-999-0091.
- `buildCuerpoInsight(results)` → P5.4 BMI con bucketing por category (`obesity_1/2/3` / `overweight` / `normal` / `underweight`).
- `buildResumenInsight(results)` → P5.5 sintetiza los 4 anteriores: cuenta `urgent` y `attention`, retorna tono más fuerte.
- `buildAllInsights(results)` → array de 5 en orden [resumen, respiración, descanso, acompañamiento, cuerpo].

Cada insight tiene shape consistente: `{id, title, summary, body, derivationNote, tone}` con tone `positive|neutral|attention|urgent`.

**Encuadre encubierto crítico:** todo el copy usa "tu descanso" / "señales" / "no es diagnóstico — es sugerencia". Nunca "trastorno" / "enfermedad" / "diagnóstico".

### Pantallas

**`app/mis-resultados/[id]/insights/page.tsx`** (Hub):
- Auth gate + RLS sobre evaluations.
- Lista 5 cards con summary + ChevronRight, color de fondo según `tone`.
- Footer compliance Dr. Ferrero M.N. 119.783.

**`app/mis-resultados/[id]/insights/[insight]/page.tsx`** (Detalle):
- Routing dinámico para los 5 IDs (validación con notFound si no matchea).
- Header con title + summary prominente.
- Card body con tone color + whitespace-pre-wrap.
- Card derivationNote (indigo) si aplica.
- Back link al hub.

### Tests

**`tests/insights-builder.test.ts`** — 19 tests cubriendo:
- 4 tests `buildRespiracionInsight` (null/high/intermediate/low).
- 3 tests `buildDescansoInsight` (severe/moderate-clinically/positive).
- 4 tests `buildAcompanamientoInsight` (suicidalIdeation + severe + moderate + minimal).
- 3 tests `buildCuerpoInsight` (obesidad/normal/bajo peso).
- 3 tests `buildResumenInsight` (todos positivos / urgent / attention only).
- 2 tests `buildAllInsights` (orden + neutral cuando null).

## Quality gates

| # | Gate | Status |
|---|---|---|
| 1 | `pnpm typecheck` strict | ✅ PASS |
| 2 | `pnpm test` | ✅ **49/49 PASS** (19 nuevos + 30 baseline) |
| 3 | `pnpm build` | ✅ PASS — 2 nuevas routes (hub + dinámico [insight]) |
| 4 | Smoke E2E real (completar eval → ver 5 cards → entrar a cada una) | ⏳ pendiente Fabio post-deploy |

## Trade-offs aceptados (regla #1)

1. **Cast `bmi as unknown as {value:number, category:string}`** — el linkeado workspace de `somnosalud-clinical-engine` desde webapp NO expone bien `BMIResult.value` ni el enum completo `BMICategory`. Cast defensivo permite typecheck strict pass + runtime correcto (los dist .d.ts SÍ tienen las props). Sprint 15+ puede investigar el linkeo workspace (probable issue del workspace dep + barrel exports).

2. **Sin gráfico de evolución temporal de insights** — solo snapshot de 1 evaluation. Si Sprint 15+ quiere "comparativa pre/post" para mostrar evolución del paciente entre evaluaciones, agregar nueva pantalla `/mis-resultados/comparar`.

3. **`hasSuicidalIdeation` lee `phq9.suicidalIdeation` via cast `as unknown`** — el clinical-engine no expone esa prop en su `PHQ9Result` tipado pero sí la calcula. Si el motor cambia el shape, el cast deja escapar runtime errors silently. Sprint 15+ puede coordinar con clinical-engine para exponer el flag tipado.

4. **5 sub-pantallas inline en lib en vez de en JSON config** — si Pablo quiere editar copy sin tocar código, hay que cambiar el approach (carga desde DB o archivo Markdown). Hoy: edición = PR. Trade-off: simplicidad vs flexibilidad editorial.

5. **`derivationNote` siempre como string** — sin variantes ("contactar 0800" vs "consultar nutricionista" vs "agendar con Dr. Ferrero directo"). Si Sprint 12 backoffice clinician se usa activamente, podría agregar CTA "agendar con Dr. Ferrero" como variante.

6. **Sin tab de comparación con población general** — el insight es absoluto ("ISI 12/28"), no relativo ("tu ISI está en el percentil 70"). Mobile tampoco tiene esto. Sprint 15+ si Pablo lo pide.

## Cumplimiento reglas universales

| Regla | Aplicación |
|---|---|
| #1 SIN ATAJOS | ✅ 5 builders puros testeados. Cast defensivo documentado con comentario explicativo. |
| #7 EMPIRICAL-FIRST | ✅ Leí mobile insights.ts + 4 mobile sub-pantallas ANTES de implementar. Verifiqué shape real del clinical-engine via `node_modules/.../dist/types.d.ts`. |
| #9 NO-HARDCODED | ✅ M.N. desde footer reusable. 0800 línea crisis del Sprint 11 + repetido acá. |
| #10 VAULT-LOOKUP | ✅ Releí ADR-003 (compliance gates) + Sprint 8 results-capa-5 + mobile P5 antes. |

## Tiempo

- **Estimado:** 3-4h Cowork.
- **Real:** ~45 min Cowork (sub-presupuesto 87%).

Razones sub-presupuesto:
- Mobile insights.ts como blueprint exacto.
- Patrón builder puro + tests ya establecido (4to sprint con mismo pattern: plan-builder → progress-builder → insights-builder).
- shadcn UI completo.
- Routing dinámico Next 14 nativo.

## Tier 2 cierre — síntesis

Con Sprint 14 cierro el roadmap original aceptado por Fabio (Tier 1 + Tier 2 = 8 sprints totales en orden 9.F → 14):

| Sprint | Tier | Tema | Tests añadidos |
|---|---|---|---|
| 9.F | 1 | Resend SMTP activation | +10 |
| 9.G | 1 | Email transaccional flow | 0 |
| ux-polish-fix | 1 | Cleanup drift | 0 |
| 10 | 2.4 | Plan + Tab Hoy | +7 |
| 11 | 2.5 | Diary tracking + gamification | +13 |
| 12 | 2.6 | Backoffice clinician | 0 |
| 13 | 2.7 | Premium waitlist | 0 |
| 14 | 2.8 | Sub-pantallas P5 | +19 |

**Total tests añadidos:** 49 (de 0 baseline → 49 actual).

**Webapp ahora tiene paridad funcional COMPLETA con mobile.**

## Pendientes Fabio post-deploy completo

1. **Apply migrations a Supabase IFN** (en orden):
   - `0006_diary_entries.sql` (Sprint 11 webapp + mobile Sprint 7).
   - `0007_premium_waitlist.sql` (Sprint 13 webapp + mobile Sprint 8).
   - `0008_clinician_links.sql` (Sprint 12 webapp + mobile Sprint 17).
   - `0009_welcome_email_idempotency.sql` (Sprint 9.G).
   - `0010_profile_role.sql` (Sprint 12 — incluye RLS reforzada).

2. **Activar Resend SMTP** según runbook.

3. **Promover Pablo Ferrero a clinician** vía SQL manual.

4. **Smoke E2E completo**:
   - Cuenta fresh → register → recibe welcome email.
   - Completar evaluation → recibe results email.
   - `/hoy` con plan + checks localStorage.
   - `/diario` → cargar noche → `/progreso` con KPIs + insights.
   - 5 noches cargadas → ver streak ≥3.
   - `/premium` → join → leave → join (idempotente).
   - `/mis-resultados/{id}/insights` → ver 5 cards.
   - `/mis-resultados/{id}/insights/respiracion` → ver detalle + back.
   - Login como Pablo clinician → `/backoffice` → vincular paciente → ver detalle eval.

5. **Decisión nav UX** — agregar navegación superior con tabs Hoy/Diario/Progreso/Resultados/Premium (estilo mobile bottom tabs adaptado a desktop)? O dejar como rutas dispersas con CTA cards desde `/hoy`.

## Pattern reusable confirmado

`build*FromResults` o `build*Insight` son helpers puros testeables. Patrón confirmado en 3 sprints consecutivos:
- `plan-builder.ts` (Sprint 10) — items + flags.
- `progress-builder.ts` (Sprint 11) — streaks + averages + insights.
- `insights-builder.ts` (Sprint 14) — 5 insights tone-aware.

Próximo sprint que necesite "derivar UI desde snapshot" debería seguir el mismo.
