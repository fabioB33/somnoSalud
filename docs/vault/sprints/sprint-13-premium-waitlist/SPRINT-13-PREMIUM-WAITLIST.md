---
title: "Sprint 13 — Premium waitlist P8 (paridad webapp ↔ mobile)"
date: 2026-06-19
sprint_number: 13
status: code-pending-merge
related:
  - "[[../sprint-11-diary-tracking-gamification/SPRINT-11-DIARY-TRACKING-GAMIFICATION]]"
  - "[[../sprint-12-backoffice-clinician/SPRINT-12-BACKOFFICE-CLINICIAN]]"
tags: [sprint, premium, waitlist, mockup, paridad-mobile, tier-2, code-pending-merge]
budget_estimado: "2-3h Cowork"
budget_real: "~20 min Cowork"
---

# Sprint 13 — Premium waitlist P8

## Trigger

Tier 2.7 paridad webapp ↔ mobile. Mobile tiene Sprint 8 mockup P8 con waitlist. Webapp NO. Migration 0007 (`premium_waitlist`) ya está en main del submodule pero la webapp NO la usaba.

## Cambios

### Server Actions (`app/premium/actions.ts`):
- `joinWaitlist({source?, notes?})`: upsert on user_id. Idempotente (re-anotación funciona).
- `getMyWaitlistEntry()`: lee entry del user actual.
- `leaveWaitlist()`: DELETE su row.

### Página + componente

**`app/premium/page.tsx`**: Server Component con auth gate. Lee waitlist entry actual.

**`components/premium/PremiumLanding.tsx`** (~170 LOC):
- Hero con badge "Próximamente" + título Fraunces.
- Card status según entry: si en lista → verde "Ya estás anotado" + botón leave. Si no → indigo "Anotate" + CTA join.
- Comparison Free vs Premium en 2 cards lado a lado.
- 4 features Free (lo que ya hay) + 6 features Premium (PSG/IA/consulta/PDF/email).
- Footer compliance datos + CTA volver `/hoy`.

## Quality gates

| # | Gate | Status |
|---|---|---|
| 1 | `pnpm typecheck` strict | ✅ PASS |
| 2 | `pnpm test` | ✅ **30/30 PASS** (sin regresión) |
| 3 | `pnpm build` | ✅ PASS — nueva route `/premium` |
| 4 | Smoke E2E (join + leave + persist refresh) | ⏳ pendiente apply migration 0007 + smoke real |

## Trade-offs aceptados (regla #1)

1. **Sin email transaccional confirming join** — Sprint 14+ puede integrar con Resend wrapper (Sprint 9.F). Hoy: card verde inline alcanza.

2. **Lista de features Premium hardcoded en const** — si Pablo decide pricing diferente o features distintas, hay que editar el componente. Trade-off vs. tabla DB (Sprint 14+ si crece).

3. **Sin upsell prominente desde `/hoy` o `/progreso`** — el user llega a `/premium` solo si navega manual o via algún CTA. Sprint 14+ puede agregar banner en empty states.

4. **`source` siempre `'webapp_premium_page'`** — analytics futuro va a tener todos los joins con mismo source. Si quiero discriminar (footer / banner / email link), pasar `source` distinto desde cada CTA caller.

## Cumplimiento reglas universales

| Regla | Aplicación |
|---|---|
| #1 SIN ATAJOS | ✅ Upsert correcto (no INSERT que rompe en re-anotación). Leave delete clean. |
| #7 EMPIRICAL-FIRST | ✅ Verifiqué 0007 ya en main + shape RLS antes. |
| #9 NO-HARDCODED | ✅ Email desde Supabase auth. Pricing/features en const editable (no en código de negocio). |
| #10 VAULT-LOOKUP | ✅ Releí mobile premium.tsx + 0007 + Sprint 9.G email infra. |

## Tiempo

- **Estimado:** 2-3h Cowork.
- **Real:** ~20 min Cowork (sub-presupuesto 89%).

Razones sub-presupuesto:
- Migration 0007 ya creada.
- Patrón Server Actions + Component Client establecido.
- shadcn UI + lucide listos.

## Pendientes Fabio post-deploy

1. **Apply migration 0007** via Supabase Dashboard (runbook lo cubre).
2. **Smoke E2E**:
   - Login → `/premium` → ver state "Anotate".
   - Join → ver card verde.
   - Refresh → state persiste.
   - Leave → vuelve a "Anotate".
3. **Decisión**: ¿agregar banner Premium en `/hoy` empty state o `/progreso`?
