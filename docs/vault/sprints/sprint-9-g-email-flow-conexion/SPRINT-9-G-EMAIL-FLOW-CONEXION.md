---
title: "Sprint 9.G — Conexión email transaccional al flow real (welcome + results)"
date: 2026-06-19
sprint_number: 9.G
status: code-pending-merge
parent_debts:
  - "[[../../debt/DEBT-resend-smtp-supabase]]"
related:
  - "[[../sprint-9-f-resend-smtp-activation/SPRINT-9-F-RESEND-SMTP-ACTIVATION]]"
  - "[[../sprint-9-a-supabase-auth/SPRINT-9-A-SUPABASE-AUTH]]"
  - "[[../sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]]"
tags: [sprint, resend, email, welcome, results, transactional, fase-1, tier-1-paridad, code-pending-merge]
budget_estimado: "3-4h Cowork"
budget_real: "~25 min Cowork"
---

# Sprint 9.G — Conexión email transaccional al flow real

## Trigger

Continuación inmediata del Sprint 9.F (Tier 1 paridad webapp ↔ mobile). 9.F dejó el wrapper Resend + template welcome + tests listos pero NO conectados a runtime. Sprint 9.G hace la conexión.

## Cambios

### Archivo nuevo

1. **`infrastructure/supabase/migrations/0009_welcome_email_idempotency.sql`**:
   - `ALTER TABLE profiles ADD COLUMN welcome_email_sent_at TIMESTAMPTZ`.
   - NULL = nunca mandado (mandar al próximo login).
   - !NULL = ya se mandó (no reintentar).

### Archivos modificados

1. **`packages/webapp-somnosalud/app/auth/callback/route.ts`**:
   - Import `sendWelcomeEmail`.
   - Post `exchangeCodeForSession`, llama `maybeFireWelcomeEmail` best-effort.
   - Helper interno: lee `profiles.welcome_email_sent_at`. Si NULL + Resend configurado → manda email + marca timestamp. Si fall → NO marca timestamp (próximo login reintenta).
   - Try/catch defensive: si email infra falla, NO rompe el flow de auth.

2. **`packages/webapp-somnosalud/app/eval/actions.ts`**:
   - Import `sendResultsEmail` + type `SupabaseClientType`.
   - `markEvaluationCompleted`: post-update DB, llama `maybeSendResultsEmail` best-effort.
   - Helper interno: lee `profiles.display_name`, construye `resultsUrl` con `NEXT_PUBLIC_SITE_URL`, formatea fecha es-AR.
   - Idempotencia natural: la action ya retorna early si `status === 'completed'`, entonces email solo se manda 1 vez por completion real.

## Quality gates

| # | Gate | Status |
|---|---|---|
| 1 | `pnpm typecheck` | ✅ PASS |
| 2 | `pnpm test` | ✅ **10/10 PASS** (sin regresión) |
| 3 | `pnpm build` | ✅ PASS — build estático Next |
| 4 | Apply migration 0009 a Supabase IFN | ⏳ pendiente Fabio (runbook ya tiene placeholder) |
| 5 | Smoke E2E real (cuenta fresh → welcome llega + completar eval → results llega) | ⏳ pendiente activación Resend |

## Trade-offs aceptados (regla #1)

1. **Race condition welcome email entre 2 callbacks concurrentes** — improbable (user no hace 2 magic links a la vez). Si pasa, se duplica el envío. No-op crítico.

2. **Sin retry logic explícito** — si email falla, NO marcamos timestamp + próximo login reintenta. Si el dominio Resend o el SMTP están caídos, cada login del user va a generar un intento fallido. Mitigación: Sentry capta. Sprint 10+ puede agregar backoff si patrón aparece.

3. **`maybeSendResultsEmail` NO usa flag en DB** — la idempotencia se confía a `markEvaluationCompleted` que ya retorna early si `status === 'completed'`. Si Sprint 11+ permite re-completar evaluations, agregar flag.

4. **`NEXT_PUBLIC_SITE_URL` sin fallback hardcoded** — si la env var no está seteada, el `resultsUrl` queda relativo (`/mis-resultados/<id>`) que el email NO puede resolver. El smoke tendrá que validar que la env var existe. Trade-off vs. hardcodear el dominio (regla #9 NO-HARDCODED).

5. **Idempotencia welcome con race condition mínima** — entre el SELECT del flag y el UPDATE pueden pasar milisegundos donde 2 calls paralelos se ejecutan. Mitigación: agregar `WHERE welcome_email_sent_at IS NULL` al UPDATE en Sprint 10+ si Sentry muestra duplicados.

## Cumplimiento reglas universales

| Regla | Aplicación |
|---|---|
| #1 SIN ATAJOS | ✅ Best-effort declarado explícito. Try/catch defensive. NO bloquea flow de auth ni completion si email infra falla. |
| #7 EMPIRICAL-FIRST | ✅ Empíricamente verifiqué que `createClient()` es síncrona + que la idempotencia natural existe en `markEvaluationCompleted`. |
| #9 NO-HARDCODED | ✅ `NEXT_PUBLIC_SITE_URL` + `display_name` desde DB. Fallback humano "paciente" si no hay display_name. |
| #10 VAULT-LOOKUP | ✅ Releí Sprint 9.A-C-E + callback route previo + actions.ts previo. |

## Tiempo

- **Estimado:** 3-4h Cowork.
- **Real:** ~25 min Cowork (sub-presupuesto 90%).

Razones sub-presupuesto:
- Wrapper Resend ya estaba (Sprint 9.F entregó listo).
- Callback route + actions.ts son mínimos puntos de inserción.
- Cero refactor del flow existente.

## Pendientes Fabio (NO bloquean código, bloquean producción)

1. **Apply migration 0009** via Supabase Dashboard SQL Editor.
2. **Activar Resend SMTP** según [[../../../../../docs/vault/runbooks/RUNBOOK-activar-resend-smtp-supabase-ifn]].
3. **Setear env vars Vercel**:
   - `RESEND_API_KEY=re_...`
   - `RESEND_FROM_EMAIL=noreply@somnosalud.com.ar` (o `pampalabs.com` plan B)
   - `NEXT_PUBLIC_SITE_URL=https://app.somnosalud.com.ar` (o el dominio real prod)
4. **Smoke E2E**:
   - Cuenta fresh → magic link → callback → recibe welcome email.
   - Completar evaluation → markEvaluationCompleted → recibe results email con link válido.
   - Re-login del mismo user → NO recibe welcome duplicado.
   - Re-completar evaluation (improbable) → NO duplica results (idempotencia).
5. Cuando todo verificado → DEBT-resend-smtp-supabase pasa a `closed-verified`.

## Patrón sistémico aprendido

**"Best-effort post-action emails con flag DB idempotente"** es patrón reutilizable. Aplicable a:
- Sprint Webapp 11 — Diary streak milestone email (cada 7 días streak).
- Sprint Webapp 12 — Clinician invitation email cuando linkea paciente.
- Sprint Webapp 14 — Sub-pantallas P5.X — opt-in email semanal de progreso.

Helper futuro propuesto:
```typescript
// lib/email/idempotent.ts (Sprint 10+ si patrón se repite)
export async function sendOncePerUser(supabase, userId, kind, fn);
```
