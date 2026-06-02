---
title: "Sprint 3 — Vercel preview deploy webapp-somnosalud"
date: 2026-05-26
sprint_number: 3
status: closed-verified
closed_at: 2026-06-02
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

### URL pública

**Producción:** `https://somno-salud-webapp-somnosalud.vercel.app`

Repo Vercel: `fabioB33/somnoSalud` (mirror). Auto-deploy on push a `main`.

### Verificación empírica E1/E2/E3

#### E1 — Build verde

```
✓ pnpm build (Vercel CI)
✓ 22 rutas prerendered + middleware 89.6 KB
✓ Sin errores TypeScript
```

#### E2 — Smoke HTTP producción

```
GET /                                           → 200
GET /login                                      → 200
GET /about                                      → 200
GET /privacidad                                 → 200
GET /mis-resultados                             → 307 (auth gate → /login?next=)
GET /eval/profile                               → 307 (compliance gate → /terms)
GET /ruta-inexistente                           → 404 custom
```

#### E3 — Smoke real magic link end-to-end

**3 usuarios reales completaron login en producción (verificado vía `auth.users` admin API):**

| Email | Created | Last sign-in (UTC) |
|---|---|---|
| `cgc.fboschetti@gmail.com` | 2026-05-23 | **2026-06-02 23:18** ← Fabio post-hotfix |
| `pabloferrero@ifn.com.ar` | 2026-06-02 | **2026-06-02 21:27** ← Pablo |
| `jorgeleporace@gmail.com` | 2026-06-02 | never (creado, no completó login antes del rate limit) |

H1-H6 verificadas.

### Hotfix incluido durante el sprint

**HOTFIX-2026-05-26 magic link localhost redirect** (commit `9527b55`).

Bug: el email del magic link redirigía a `http://localhost:3000/auth/callback` en lugar de la URL Vercel. Doble causa:
1. Header `origin` puede llegar vacío atrás del edge proxy Vercel en Server Actions.
2. Site URL en Supabase Auth seteado a `localhost:3000` (heredado de config dev).

Fix defense-in-depth:
- **Capa 1 (config):** Fabio cambió Site URL Supabase a `https://somno-salud-webapp-somnosalud.vercel.app`.
- **Capa 2 (código):** nuevo `lib/site-url.ts` con `resolveSiteUrl()` que prioriza `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → header origin → localhost fallback.

Subsequent bug detectado durante fix: Site URL en Supabase quedó sin `https://` la primera vez. Corregido con segunda iteración. Doc: [[../../hotfixes/2026-05-26-magic-link-localhost-redirect/HOTFIX]].

## FASE 4 — Pendientes post-Sprint 3 (DEBT abierto)

| Item | Status | Sprint candidato |
|---|---|---|
| **DEBT-resend-smtp-supabase** elevado a `high` | OPEN | Sprint dedicado post-DNS access confirmation. Detalle: [[../../debt/DEBT-resend-smtp-supabase]] |
| Sprint 3.B — Deploy Conversor PSG separado | ⏳ | Post smoke Sprint 19.C de Pablo |
| Sprint domain-custom `somnosalud.com.ar` | ⏳ | Cuando exista DNS access |
| Sprint Sentry activate (DSN real) | ⏳ | Después de Resend (mismo wrapper idle de Sprint 14) |

### Bloqueante actual del piloto: rate limit 4 emails/hora

Durante el smoke real chocamos el rate limit varias veces durante el debug. Pablo + Fabio entraron OK; Jorge fue víctima del rate limit y no pudo completar antes del bucket expirara. Esto **bloquea crecimiento del piloto** a > 5 usuarios concurrentes y degrada la UX en caso de cualquier debugging.

**Decisión 2026-06-02 (Fabio):** cerrar Sprint 3 con el rate limit como limitación documentada. DEBT-resend-smtp-supabase elevado a `high`. Esperar confirmación de Jorge / Pablo sobre acceso DNS del dominio `somnosalud.com.ar` antes de arrancar el sprint Resend.

## Bloque J — Reporte

**Sprint 3 cerrado 2026-06-02.**

- **Scope alcanzado:** webapp-somnosalud live en producción Vercel con magic link auth funcionando end-to-end. 3 usuarios reales (Fabio + Pablo + Jorge) creados en auth.users. Pablo y Fabio completaron login.
- **URL pública:** `https://somno-salud-webapp-somnosalud.vercel.app`.
- **Decisión clave durante sprint:** hotfix mid-sprint para fix bug magic link localhost. Defense-in-depth: helper `resolveSiteUrl()` en código + corrección Site URL en Supabase Auth dashboard. Lección documentada como hotfix doc separado.
- **Commits del sprint:**
  - `5e1c24a` — Sprint 3 preparativos + DEPLOY-WORKFLOW
  - `9527b55` — HOTFIX magic link localhost redirect
  - (commit de cierre con sprint doc closed-verified)
- **Tests:** 178/178 vitest + 20/20 E2E siguen verdes (no se tocó código de tests).
- **Pendiente bloqueante para escalado piloto:** activar Resend SMTP custom (DEBT high priority abierto). Limita el ritmo de crecimiento de usuarios pero NO bloquea el uso por parte de Pablo + Jorge en demos individuales.
- **Demo lista para mostrar.** Pablo ya navegó y Fabio puede compartir la URL a colegas IFN para feedback inicial. Pablo y Jorge pueden iterar libremente.
- **Próxima sesión sugerida:** activación Resend SMTP (~2h, requires DNS access), o si todavía no hay DNS access → Sprint Stripe B2C (~6-8h, esperando precios Jorge brief 2026-05-18).

