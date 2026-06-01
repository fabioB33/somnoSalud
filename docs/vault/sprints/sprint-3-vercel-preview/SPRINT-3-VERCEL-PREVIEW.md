---
title: "Sprint 3 — Vercel preview deploy webapp-somnosalud"
date: 2026-05-26
sprint_number: 3
status: in-progress
parent_debts: []
related:
  - "[[../sprint-9-a-supabase-client-auth/SPRINT-9-A-SUPABASE-CLIENT-AUTH]]"
  - "[[../sprint-9-d-auth-gate-eval/SPRINT-9-D-AUTH-GATE-EVAL]]"
  - "[[../sprint-14-observabilidad-ci/SPRINT-14-OBSERVABILIDAD-CI]]"
  - "[[../../processes/DEPLOY-WORKFLOW]]"
tags: [sprint, deploy, vercel, fase-1, infrastructure, preview]
---

# Sprint 3 — Vercel preview deploy webapp-somnosalud

> [!info] Objetivo
> Deployar webapp-somnosalud a Vercel preview para que Pablo y Jorge puedan ver el sitio funcionando en producción cuando se vean esta semana. Sin custom domain (subdomain `*.vercel.app`). Solo webapp-somnosalud — Conversor PSG va en Sprint 19.C.

## Contexto

Sprint 9.A-E dejó toda la app working con auth real + persistence DB + consent + 20/20 E2E + 178 vitest tests. Falta solo deploy productivo. CLAUDE.md lo lista como Fase 0 entregable.

**Decisiones tomadas con Fabio (2026-05-26):**

| Decisión | Valor | Justificación |
|----------|-------|---------------|
| Dominio | Subdomain `*.vercel.app` | Cero setup DNS. Sprint custom domain aparte cuando haya |
| Scope | Solo webapp-somnosalud | Conversor PSG queda para Sprint 19.C post smoke Pablo |
| Sentry/Resend | Siguen idle (DSN/key vacíos) | No deploy externo de observability hasta Sprint dedicado |
| Build region | Vercel default | Sin optimización deliberada — basta para preview |

## Hipótesis

- **H1** — `pnpm build` produce todas las rutas como `ƒ Dynamic` (server-rendered) compatible con Vercel serverless functions. Build verde local pre-push.
- **H2** — Middleware 89.6 KB ejecuta sin crash en Vercel edge runtime. Patrones: `updateSession` + auth gate + compliance gate.
- **H3** — Vercel detecta automáticamente Next.js 14 App Router. No requiere `vercel.json` custom (excepto Root Directory si el monorepo confunde).
- **H4** — Setear 5 env vars en Vercel project (URL + PUBLISHABLE + SECRET + PROJECT_REF + ACCESS_TOKEN opcional) → magic link funciona end-to-end en producción.
- **H5** — Agregar `https://<preview>.vercel.app/auth/callback` a Redirect URLs de Supabase Auth → magic link click redirige correctamente.
- **H6** — Pablo puede acceder desde su teléfono al sitio + completar magic link signup + ver el flow.

## FASE 1 — Implementación

### Bloque A — Auditar config existente

`next.config.mjs` (Sprint 14):
- `reactStrictMode: true` ✅
- `transpilePackages: ['somnosalud-clinical-engine']` ✅ (workspace dep)
- `experimental.typedRoutes: true` ✅
- `withSentryConfig` wrap con `tunnelRoute: '/monitoring'` — funcionará en Vercel sin DSN (idle).

`middleware.ts` (Sprint 9.D):
- `AUTH_PROTECTED_PREFIXES = ['/mis-resultados', '/eval']`.
- Matcher excluye assets + `monitoring` + favicons.
- Compatible Vercel edge runtime (sin Node-only APIs).

`.env.example` (Sprint 14 + 2.B):
- Sentry vars, Resend vars, Supabase vars (5).
- Falta documentar en Vault que las 5 Supabase son **REQUIRED en Vercel**, el resto opcional.

### Bloque B — Crear DEPLOY-WORKFLOW.md (Vault process)

Doc paso-a-paso operativo de Vercel:
1. Conectar repo a Vercel project.
2. Root Directory = `packages/webapp-somnosalud`.
3. Build Command = `pnpm build` (auto-detectado).
4. Install Command = `pnpm install --frozen-lockfile` desde root del monorepo.
5. Setear 5 env vars Supabase.
6. Trigger deploy.
7. Tomar URL preview generada.
8. **Agregar `https://<preview>.vercel.app/auth/callback` a Supabase Redirect URLs** (sin esto magic link rompe).
9. Smoke real: navegar, login magic link, completar eval, ver `/mis-resultados`.

### Bloque C — Sprint doc + commit

Solo cambios documentales esta vez. Cero código.

## FASE 2 — Verificación

- **E1 — Build local:** ✅ `pnpm build` verde. 22 rutas + middleware 89.6 KB.
- **E2 — Setup Vercel:** trabajo operativo de Fabio.
- **E3 — Smoke real preview:** Fabio confirma URL accesible + magic link funciona.

## FASE 3 — Cierre

(post-implementación de Fabio en Vercel)

## FASE 4 — Pendientes post-Sprint 3

- **Sprint 3.B** — Deploy Conversor PSG a Vercel separado (subdomain) cuando Pablo apruebe Sprint 19.C.
- **Sprint domain-custom** — Conectar `somnosalud.com.ar` cuando exista acceso DNS.
- **Sprint Sentry activate** — DSN real para capturar errores de producción.
- **Sprint Resend activate** — Switch SMTP Supabase de default (rate 4/h) a Resend (requiere verify domain).

## Bloque J — Reporte

(post-cierre)
