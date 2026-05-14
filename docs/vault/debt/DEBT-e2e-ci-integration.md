---
title: "Deuda Técnica — tests E2E Playwright NO se corren en GitHub Actions CI"
date: 2026-05-09
tags: [deuda-tecnica, e2e, playwright, ci, github-actions, fase-1, closed-verified]
status: closed-verified
closed_date: 2026-05-14
closed_by: sprint-14-observabilidad-ci
priority: low
scope: sprint-14
detected_during: sprint-13-e2e-playwright
related:
  - "[[../sprints/sprint-13-e2e-playwright/SPRINT-13-E2E-PLAYWRIGHT]]"
  - "[[../sprints/sprint-14-observabilidad-ci/SPRINT-14-OBSERVABILIDAD-CI]]"
---

> [!success] Cerrado 2026-05-14 (Sprint 14)
> Job `e2e` agregado a `.github/workflows/ci.yml` con cache Chromium (~113 MB), `playwright install-deps` separado en cache-hit branch, build webapp + `pnpm test:e2e` con `CI=true`, artifact upload on failure (playwright-report/ + test-results/, retention 14d), timeout 15 min. Smoke local pre-push: 19/19 tests passing post-cambios Sentry+Resend. Verificación CI verde queda pendiente al primer push de Fabio.


# DEBT-e2e-ci-integration

> [!info] Origen
> Sprint 13 entregó 19 tests E2E Playwright passing en local. Pero CI GitHub Actions actual (`.github/workflows/ci.yml`) solo corre `pnpm lint/typecheck/test/build` — los E2E quedan SOLO en local de Fabio.

## Contexto

Hoy:
- `pnpm test` cross-monorepo NO incluye E2E (es script noop en webapp).
- `pnpm test:e2e` se corre **manualmente** en local.
- CI GitHub Actions desconoce los E2E.

Riesgos:
1. Refactor futuro (Sprint 9+ Supabase migration, etc.) puede romper el flow sin que el CI lo detecte.
2. Pull Requests no muestran E2E status — review humano debería correr E2E manual, no escala.

## Evidencia

- `cat .github/workflows/ci.yml` muestra solo lint/typecheck/test/build jobs.
- `cat packages/webapp-somnosalud/package.json` script `test:e2e` separado.

## Propuesta

Sprint 14 (~1.5h):

1. Agregar job nuevo `e2e` al workflow:
   ```yaml
   e2e:
     name: E2E Playwright
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: pnpm/action-setup@v3
       - uses: actions/setup-node@v4
         with:
           node-version: 20
           cache: 'pnpm'
       - run: pnpm install --frozen-lockfile
       - name: Cache Playwright browsers
         uses: actions/cache@v4
         with:
           path: ~/.cache/ms-playwright
           key: playwright-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
       - run: cd packages/webapp-somnosalud && ./node_modules/.bin/playwright install chromium --with-deps
       - run: pnpm --filter @somnosalud/webapp-somnosalud build
       - run: pnpm --filter @somnosalud/webapp-somnosalud test:e2e
         env:
           CI: true
   ```

2. Cache Chromium browser (113MB) entre runs para evitar download cada vez.

3. Upload artifacts (test-results/, playwright-report/) on failure para debugging.

4. Considerar matrix con chromium + firefox si Pablo o algún usuario reporta issue cross-browser.

## Scope

Sprint 14 (junto con Sentry + Resend). Estimado ~1.5h.

## Prioridad

**Low**. No bloquea desarrollo — E2E local funciona. Pero al meter Supabase (Sprint 9+) y team grow, CI integration vale más.

## Relacionados

- [[../sprints/sprint-13-e2e-playwright/SPRINT-13-E2E-PLAYWRIGHT]] — sprint origen.
- [[../processes/QA-CHECKLIST]] — debería referenciar `pnpm test:e2e` cuando esté en CI.
