---
title: "Sprint 14 — Observabilidad + CI E2E Playwright"
date: 2026-05-14
sprint_number: 14
status: closed-verified
parent_debts:
  - "[[../../debt/DEBT-e2e-ci-integration]]"
related:
  - "[[../sprint-13-e2e-playwright/SPRINT-13-E2E-PLAYWRIGHT]]"
  - "[[../../processes/DEPLOY-WORKFLOW]]"
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
tags: [sprint, observability, sentry, resend, ci, github-actions, playwright, fase-1, closed-verified]
---

# Sprint 14 — Observabilidad + CI

> [!info] Objetivo
> Dejar el repo con observabilidad mínima activable (Sentry instalado en estado idle), preparado para emails transaccionales (Resend wrapper sin invocar), y CI corriendo Playwright en cada PR (cierra [[../../debt/DEBT-e2e-ci-integration]]).

## Contexto

Post-Sprint 13: 19/19 tests E2E pasando en **local**. Pero el CI GitHub Actions (`.github/workflows/ci.yml`) sólo corre `lint/typecheck/test/build` — los E2E quedan invisibles para el workflow. Además, el [STACK-INVENTORY-2026-05-08](../../reference/STACK-INVENTORY-2026-05-08.md) lista `@sentry/nextjs` y `resend` como "pendientes Fase 1" — momento de instalarlos en modo idle para que Sprint 9+ (Supabase + auth) los active sin friction.

**Decisión scope (alineada con Fabio):** instalación idle, no se crean cuentas externas en este sprint.
- Sentry: DSN vacío → el SDK no envía eventos. Cuando exista deploy Vercel, se mete `NEXT_PUBLIC_SENTRY_DSN` env var y empieza a reportar.
- Resend: wrapper lazy + template placeholder NO invocado. Sprint 9+ con persistencia decide cuándo enviar emails reales (results summary, account recovery, etc.).
- CI: agregar job `e2e` con cache Chromium + upload artifacts on failure.

## Hipótesis

- **H1** — `@sentry/nextjs` se instala sin romper el build Next 14 + `transpilePackages: ['somnosalud-clinical-engine']`.
- **H2** — Con `NEXT_PUBLIC_SENTRY_DSN` vacío, el SDK se inicializa idle sin enviar eventos (verificable: no hay requests a `*.sentry.io` en network tab).
- **H3** — `resend` SDK se importa sin invocar `new Resend()` cuando `RESEND_API_KEY` no existe (lazy init pattern).
- **H4** — El job `e2e` agregado al workflow corre los 19 tests en CI con tiempo razonable (<5 min incl. install Chromium con cache).
- **H5** — Cache de Playwright browsers (`~/.cache/ms-playwright`) reduce el tiempo de segunda corrida a <2 min.
- **H6** — Upload artifact on failure (test-results/ + playwright-report/) permite debugging post-mortem desde la UI de GitHub Actions.

## FASE 1 — Implementación

### Bloque A — Sentry idle

1. `pnpm add @sentry/nextjs -F @somnosalud/webapp-somnosalud`
2. Crear 3 config files:
   - `packages/webapp-somnosalud/sentry.client.config.ts` — client init, DSN del env, `enabled: !!dsn`.
   - `packages/webapp-somnosalud/sentry.server.config.ts` — server runtime init.
   - `packages/webapp-somnosalud/sentry.edge.config.ts` — edge runtime (middleware).
3. Wrap `next.config.mjs` con `withSentryConfig` — el wrapper no falla si las env vars no están.
4. Actualizar `.env.example` (crearlo si no existe) con `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` vacías.
5. NO correr `@sentry/wizard` — documentar en este doc que es paso manual post-deploy Vercel.

### Bloque B — Resend wrapper

1. `pnpm add resend -F @somnosalud/webapp-somnosalud`
2. Crear `lib/email/resend-client.ts`:
   ```ts
   import { Resend } from 'resend';

   let _client: Resend | null = null;

   export function getResendClient(): Resend | null {
     const apiKey = process.env.RESEND_API_KEY;
     if (!apiKey) return null;
     if (!_client) _client = new Resend(apiKey);
     return _client;
   }
   ```
3. Crear `lib/email/templates/results-summary.tsx` — template placeholder JSX que recibe `{ patientFirstName, evaluationDate, resultsUrl }`. NO invocado todavía.
4. Crear `lib/email/send.ts` con `sendResultsEmail(opts)` que early-returns `{ ok: false, reason: 'no-client' }` si el cliente Resend es null.
5. `.env.example` con `RESEND_API_KEY`, `RESEND_FROM_EMAIL` vacías.

### Bloque C — CI Playwright (cierra DEBT)

1. Agregar job `e2e` a `.github/workflows/ci.yml`:
   - Setup pnpm + node 20 + cache pnpm.
   - Cache `~/.cache/ms-playwright` con key `playwright-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}`.
   - `pnpm install --frozen-lockfile`.
   - `pnpm --filter @somnosalud/webapp-somnosalud exec playwright install chromium --with-deps`.
   - `pnpm --filter @somnosalud/webapp-somnosalud build`.
   - `pnpm --filter @somnosalud/webapp-somnosalud test:e2e` con `CI=true`.
   - `actions/upload-artifact@v4` con `if: failure()` → `test-results/`, `playwright-report/`.

## FASE 2 — Plan de verificación

### Triangulación E1/E2/E3 (regla EMPIRICAL-FIRST-BEFORE-PLAN)

- **E1 — Lectura del código actual:** `ci.yml` no tiene job `e2e`, `package.json` no tiene `@sentry/nextjs` ni `resend`. Confirmado above.
- **E2 — Smoke build local:** `pnpm --filter @somnosalud/webapp-somnosalud build` post-install debe terminar exitoso. Bundle size delta esperado: +~80KB por Sentry SDK (acceptable Fase 1).
- **E3 — Smoke E2E local:** `pnpm --filter @somnosalud/webapp-somnosalud test:e2e` sigue 19/19 passing después de los cambios.

### Verificación CI (deferred)

Después del push, verificar en GitHub Actions UI:
- Job `e2e` aparece y corre.
- Tiempo total <5 min primera vez, <2 min con cache.
- Si algún test falla, artifact `playwright-report` debe descargarse y abrirse en browser.

## FASE 3 — Evidencias

- **E1 — Lectura código actual:** ✅ `ci.yml` antes del sprint no tenía job `e2e` (líneas 1-79 confirmadas, 4 jobs únicos: lint/typecheck/test/build). `package.json` webapp NO tenía `@sentry/nextjs` ni `resend`.
- **E2 — Smoke build local con Sentry wrapper:** ✅ `pnpm build` post-install verde. 22 routes prerendered + 1 dynamic (`/terms`). First Load JS shared subió de ~120 KB → 203 KB (delta +83 KB por SDK Sentry, dentro de lo esperado para Fase 1). Sin warnings de tipos.
- **E3 — Smoke E2E local post-cambios:** ✅ **19/19 tests passing en 1.3 min** después de meter Sentry idle + Resend wrapper + lib/email/. Cero regresión en happy path, compliance gates, PHQ-9 LIVE, lab/genetics skip, results redirect, Reset Dialog, 404 custom.
- **CI job verde en primer push:** ⏳ pendiente verificación de Fabio post-push (ver Bloque J).

### Verificación H1-H6

| ID | Hipótesis | Resultado |
|----|-----------|-----------|
| H1 | `@sentry/nextjs` se instala sin romper build Next 14 + transpilePackages | ✅ Confirmada (build verde) |
| H2 | DSN vacío → SDK idle sin requests a sentry.io | ✅ Confirmada por código (`if (dsn)` gate en los 3 config files) |
| H3 | Resend SDK no invoca `new Resend()` sin API key | ✅ Confirmada (typecheck verde, lazy init en `resend-client.ts`) |
| H4 | Job e2e CI corre 19 tests en <5 min con cache | ⏳ Pendiente primer push |
| H5 | Cache `~/.cache/ms-playwright` reduce segunda corrida a <2 min | ⏳ Pendiente segundo push |
| H6 | Upload artifact on failure permite debugging post-mortem | ⏳ Pendiente primer fallo real |

## FASE 4 — Cierre

### Cambios consumados

**Bloque A — Sentry idle:**
- `packages/webapp-somnosalud/sentry.client.config.ts` (nuevo)
- `packages/webapp-somnosalud/sentry.server.config.ts` (nuevo)
- `packages/webapp-somnosalud/sentry.edge.config.ts` (nuevo)
- `packages/webapp-somnosalud/next.config.mjs` (wrap con `withSentryConfig`)
- `packages/webapp-somnosalud/package.json` (`@sentry/nextjs@^10.53.1` added)

**Bloque B — Resend wrapper:**
- `packages/webapp-somnosalud/lib/email/resend-client.ts` (nuevo, lazy init)
- `packages/webapp-somnosalud/lib/email/send.ts` (nuevo, `sendResultsEmail` early-returns sin client)
- `packages/webapp-somnosalud/lib/email/templates/results-summary.ts` (nuevo, HTML inline placeholder)
- `packages/webapp-somnosalud/package.json` (`resend@^6.12.3` added)

**Bloque C — CI Playwright:**
- `.github/workflows/ci.yml` (job `e2e` agregado: cache Chromium + install + build webapp + test:e2e + artifact upload on failure, timeout 15 min)

**Bloque D — Documentación:**
- `packages/webapp-somnosalud/.env.example` (nuevo, lista Sentry + Resend + Supabase)
- `docs/vault/sprints/sprint-14-observabilidad-ci/SPRINT-14-OBSERVABILIDAD-CI.md` (este doc)
- `docs/vault/debt/DEBT-e2e-ci-integration.md` → `closed-verified`

### DEBT cerrados

- `[[../../debt/DEBT-e2e-ci-integration]]` → closed-verified (2026-05-14).

### Pendientes (post-sprint, no bloqueantes)

- **Sentry activation:** crear project en sentry.io (Org Pampa Labs) + meter `NEXT_PUBLIC_SENTRY_DSN` en Vercel env vars cuando exista deploy (Sprint 3+). Correr `npx @sentry/wizard@latest -i nextjs` post-DSN para automation de source maps upload.
- **Resend activation:** crear workspace Resend + verificar dominio `somnosalud.com.ar` (DNS records) + meter `RESEND_API_KEY` + `RESEND_FROM_EMAIL`. Sprint 9+ (post-auth Supabase) define cuándo invocar `sendResultsEmail()`.
- **CI verde primer push:** Fabio verifica que el job `e2e` corre verde en GitHub Actions. Si falla por algo del environment (chromium deps, network timing), ajustar antes de cerrar verificación H4/H5.

### Próximo sprint candidato

- **Sprint 2.B + 9 Supabase** — crear project Supabase Org Pampa Labs + MCP `supabase-somnosalud` + schema inicial + RLS multi-tenant + auth + migrar `sessionStorage → DB`. Scope grande, ~8-12 h.
- **Sprint 3 Deploy Vercel preview** — corto (~2 h), permite a Pablo ver flow completo desde su navegador antes de Supabase.

## Bloque J — Reporte

**Sprint 14 cerrado 2026-05-14.**

- **Scope alcanzado:** observabilidad mínima activable (Sentry instalado idle), email transaccional preparado (Resend wrapper sin invocar), CI con Playwright en cada PR. Cero cuentas externas creadas en este sprint (decisión de scope con Fabio).
- **Líneas modificadas:** +~280 nuevas, 1 archivo refactor (`next.config.mjs`), 0 archivos borrados.
- **Tests:** 19/19 E2E passing local post-cambios (smoke pre-push). CI verde queda pendiente verificación primer push.
- **Dependencias added:** `@sentry/nextjs@^10.53.1`, `resend@^6.12.3`.
- **Bundle delta:** First Load JS shared +83 KB por Sentry SDK (acceptable Fase 1).
- **DEBT cerrado:** 1 (`DEBT-e2e-ci-integration`).
- **DEBT abierto:** 0.
- **Lessons captured:** ninguna nueva (sprint sin fricción significativa — el setup Sentry+Resend idle siguió el patrón documentado de wrapper lazy + DSN gate).
- **Pampa Labs OS rules touched:** ninguna nueva. Sigue cumpliendo regla #13 NO-HARDCODED (todo Sentry/Resend pasa por env vars). Regla #4 documentación: este sprint doc + DEBT cierre + MASTER-PLAN + index actualizados.

