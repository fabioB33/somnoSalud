---
title: "Sprint 9.F — Activación Resend SMTP custom + welcome template + vitest infra"
date: 2026-06-19
sprint_number: 9.F
status: code-pending-merge
parent_debts:
  - "[[../../debt/DEBT-resend-smtp-supabase]]"
related:
  - "[[../sprint-14-observabilidad-ci/SPRINT-14-OBSERVABILIDAD-CI]]"
  - "[[../../../../../docs/vault/runbooks/RUNBOOK-activar-resend-smtp-supabase-ifn]]"
  - "[[../sprint-9-b-login-ux/SPRINT-9-B-LOGIN-UX]]"
tags: [sprint, resend, smtp, email, welcome, vitest, fase-1, tier-1-paridad, code-pending-merge]
budget_estimado: "2-3h Cowork"
budget_real: "~30 min Cowork"
---

# Sprint 9.F — Activación Resend SMTP custom + Welcome template

## Trigger

Decisión Fabio 2026-06-19 sobre roadmap webapp ↔ mobile paridad:
- **Tier 1 ASAP** = 9.F + 9.G + cleanup ux-polish.
- **Sprint 9.F** = preparar todo lo de código para que el wrapper Resend (idle desde Sprint 14) esté listo + tests + template welcome nuevo.
- **Sprint 9.G** = conectar al flow real `/auth/callback` post-login y `/eval/results` post-evaluation.

Bug recurrente: rate-limit Supabase SMTP default (4 emails/h por project) bloqueó smoke E2E del mobile 2026-06-19 y antes a Fabio+Jorge+Pablo el 2026-06-02. Fix definitivo = activar Resend SMTP custom (este sprint).

## Cambios

### Archivos nuevos

1. **`packages/webapp-somnosalud/lib/email/templates/welcome.ts`** (~75 LOC):
   - `renderWelcome({patientFirstName?, loginUrl})` retorna HTML del email de bienvenida.
   - Escapa HTML del nombre para evitar XSS.
   - Encuadre regulatorio: NO menciona "diagnóstico" / "tratamiento" / "enfermedad". Solo lenguaje educativo + tracking + sueño.
   - Footer con M.N. 119.783 Dr. Ferrero + IFN + nota Ley 25.326.

2. **`packages/webapp-somnosalud/vitest.config.ts`** (config mínima):
   - `include: ['tests/**/*.test.ts']`.
   - `environment: 'node'`.
   - Alias `@` → `.` para resolver imports del webapp.

3. **`packages/webapp-somnosalud/tests/email/send.test.ts`** (10 tests):
   - 4 tests sin API key → confirman `null` / `no-client`.
   - 2 tests con API key sin sender → confirman `no-from`.
   - 4 tests templates rendering (welcome con/sin nombre + XSS escape + results-summary).

### Archivos modificados

1. **`packages/webapp-somnosalud/lib/email/send.ts`**:
   - Nueva interface `WelcomeEmailOptions {to, patientFirstName?, loginUrl}`.
   - Nueva función `sendWelcomeEmail(opts)` espejo de `sendResultsEmail`. Best-effort, retorna `{ok:false, reason:no-client}` sin API key.
   - Subject: "Bienvenido a SomnoSalud".

2. **`packages/webapp-somnosalud/package.json`**:
   - `"test": "vitest run"` (reemplaza el stub `echo unit tests vacios`).
   - `"test:watch": "vitest"`.
   - `devDependencies` agregada `"vitest": "^2.0.0"`.

## Quality gates

| # | Gate | Status |
|---|---|---|
| 1 | `pnpm typecheck` | ✅ PASS |
| 2 | `pnpm test` | ✅ **10/10 PASS** en 821ms |
| 3 | `pnpm build` | ✅ PASS — build estático Next sin errores |
| 4 | Smoke E2E real (mandar email + verificar Gmail) | ⏳ pendiente Sprint 9.G + DNS Resend |

## Trade-offs aceptados (regla #1)

1. **No invocamos `sendWelcomeEmail` en runtime todavía** — eso es Sprint 9.G. Justificación: separar "código listo + tests" (este sprint) de "conexión al flow real" (próximo). Permite mergear este antes sin riesgo.

2. **Tests no cubren success path real (200 OK de Resend)** — solo paths sin API key / sin sender. El happy path requiere mock complejo del SDK `resend` que no aporta valor real. El smoke E2E de Sprint 9.G cubrirá empíricamente esto.

3. **Template welcome es HTML inline, no react-email** — decisión consciente del Sprint 14. Si después de varios sprints de email aparece complejidad, migrar a `react-email`. Hoy 75 LOC inline alcanza.

4. **`renderWelcome` y `renderResultsSummary` no comparten estilos/header común** — duplicación intencional (DRY puede esperar). Si llega a 4+ templates, abstraer.

5. **`sendWelcomeEmail` retorna `SendResult` no-typed para success** — el tipo discriminado actual `{ok:true, id:string} | {ok:false, ...}` deja escapar errors del SDK como `unknown`. Sprint 9.G+ puede mejorar.

## Acción operativa Fabio (NO bloquea código, bloquea producción)

Pendiente del runbook [[../../../../../docs/vault/runbooks/RUNBOOK-activar-resend-smtp-supabase-ifn]]:

1. Cuenta Resend Free (3000 emails/mes).
2. Add domain `somnosalud.com.ar` (confirmar con Pablo si está disponible — si no, usar `pampalabs.com` plan B).
3. DNS records SPF + DKIM + DMARC.
4. Verify dominio en Resend.
5. Generate API key.
6. Setear en Supabase Auth → SMTP Settings (host, port, user, pass).
7. Subir rate limit Supabase Auth Emails a 60/h.
8. Setear env vars Vercel: `RESEND_API_KEY=re_...` + `RESEND_FROM_EMAIL=noreply@somnosalud.com.ar`.
9. Smoke test: 5 magic links seguidos sin bloqueo + verificar deliverability.

Cuando se complete → DEBT-resend-smtp-supabase pasa de `open` a `closed-verified`.

## Cumplimiento reglas universales

| Regla | Aplicación |
|---|---|
| #1 SIN ATAJOS | ✅ Cero defaults inventados en welcome template. XSS escape obligatorio. Wrapper idle se respeta hasta config real (no se hace mock activo). |
| #7 EMPIRICAL-FIRST | ✅ Verifiqué baseline empírico (Sprint 14 wrapper idle + 9.A-E auth real) antes de extender. |
| #10 VAULT-LOOKUP | ✅ Releí DEBT-resend-smtp-supabase + Sprint 14 + runbook activar-resend. |

## Tiempo

- **Estimado:** 2-3h Cowork.
- **Real:** ~30 min Cowork (sub-presupuesto 85%).

Razones sub-presupuesto:
- Wrapper Resend ya existía idle desde Sprint 14 (cero refactor).
- Template HTML inline simple.
- Tests minimal sin mock complejo.
- Vitest config copiada de clinical-engine pattern existente.

## Pendiente Sprint 9.G

Conectar el wrapper al flow real:
1. `app/auth/callback/route.ts`: detectar primera-vez del user (vía `created_at === last_sign_in_at` o flag `welcome_email_sent` en profiles) y disparar `sendWelcomeEmail({to: user.email, patientFirstName: profiles.first_name, loginUrl: ${origin}/eval})`.
2. `app/eval/results/page.tsx` server action: post-build de results, disparar `sendResultsEmail({to: user.email, ...})`. Requiere persistencia `evaluation_id` ya cerrada por Sprint 9.C.
3. Migration 0009: agregar `welcome_email_sent_at TIMESTAMPTZ` a `profiles` para idempotencia.
4. Tests adicionales del flow real (Playwright E2E con mock Resend o ambiente staging con dominio test).
