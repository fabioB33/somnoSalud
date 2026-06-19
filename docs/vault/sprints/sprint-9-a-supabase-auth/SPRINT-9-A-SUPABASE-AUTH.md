---
title: "Sprint 9.A — Cliente Supabase + magic link auth + middleware (smoke H4 completado vía 9.B)"
date: 2026-05-18
closed_at: 2026-05-18
last_synced_with_vault_reality: 2026-06-19
sprint_number: 9.A
status: closed-verified
status_history:
  - "2026-05-18: closed-pending-smoke (sprint cerrado funcional + tests pero smoke H4 RLS user-isolation diferido a Sprint 9.B donde requería flow real)"
  - "2026-06-19: closed-pending-smoke → CLOSED-VERIFIED (audit empírico — Sprint 9.B cerró el smoke H4 al verificar trigger handle_new_user con cuenta real. Drift documental corregido.)"
verified_via: "[[../sprint-9-b-login-ux/SPRINT-9-B-LOGIN-UX]] sección 'Verificación DB end-to-end (E2)'"
parent_debts: []
related:
  - "[[../sprint-2-b-supabase-schema/SPRINT-2-B-SUPABASE-SCHEMA]]"
  - "[[../sprint-9-b-login-ux/SPRINT-9-B-LOGIN-UX]]"
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
  - "[[../../processes/DEPLOY-WORKFLOW]]"
tags: [sprint, supabase, auth, magic-link, ssr, middleware, fase-1, backend, closed-verified]
---

# Sprint 9.A — Cliente Supabase + magic link auth

> [!info] Objetivo
> Integrar el cliente Supabase en la webapp Next.js 14 con flow de magic link (signInWithOtp), middleware de auth que coexiste con el compliance gate existente, y smoke test empírico de RLS H4 (user A ≠ user B). **NO migra sessionStorage→DB todavía** — eso queda para Sprint 9.B.

## Contexto

Sprint 2.B (2026-05-18) cerró con 3 tablas + 6 RLS policies aplicadas vía MCP. H4 (RLS empírico user-isolation) quedó pendiente porque requería flow de signup real.

Hoy decidimos partir el sprint 9-supabase original en dos:
- **9.A (este, ~3-4h):** cliente + auth + smoke H4. Sin tocar evaluations.
- **9.B (futuro, ~3-4h):** sessionStorage→DB con write-through, route `/mis-resultados`, activación email transaccional results.

**Decisiones de scope tomadas 2026-05-18:**

| Decisión | Valor | Justificación |
|---|---|---|
| Scope | 9.A solo auth + RLS, 9.B persistencia | Reduce riesgo, permite mergear infra antes de tocar EvalState |
| SMTP magic link | Supabase default | Out-of-the-box, sin dominio verificado. Resend custom queda Fase 1 |
| Validación RLS H4 | 2 mailboxes reales | End-to-end flow, no atajo con admin API |
| Drift `usePersistEval.ts:18` "Sprint 11" | Corregir al refactorear en 9.B | No tocamos el hook en 9.A |

## Hipótesis

- **H1** — `@supabase/ssr@latest` + `@supabase/supabase-js@latest` se instalan sin conflictos con Next 14.2.35 / React 18.3.
- **H2** — La convención de keys 2025+ (`sb_publishable_*` + `sb_secret_*`) es compatible con `createServerClient`/`createBrowserClient` de `@supabase/ssr ≥0.5`.
- **H3** — El middleware combinado (compliance cookie `somno_consent_v1` + Supabase auth refresh) no rompe el matcher actual `/eval/:path*` ni redirige inesperadamente.
- **H4 (heredada Sprint 2.B)** — RLS funciona empíricamente: usuario A no ve rows del usuario B. Verificable con 2 cuentas reales + query SELECT.
- **H5** — Trigger `handle_new_user()` auto-crea `public.profiles` al primer signup (probado empíricamente).
- **H6** — `signInWithOtp({ emailRedirectTo })` envía email desde el SMTP default de Supabase (rate limit 4/hora — ok para smoke).

## FASE 1 — Implementación

### Bloque A — Paquetes

- `pnpm --filter @somnosalud/webapp-somnosalud add @supabase/ssr @supabase/supabase-js`
- Verificar versiones en `package.json`: `@supabase/ssr ≥0.5.x`, `@supabase/supabase-js ≥2.45.x`.

### Bloque B — Utils

- `packages/webapp-somnosalud/lib/supabase/client.ts` — `createClient()` para Client Components (browser).
- `packages/webapp-somnosalud/lib/supabase/server.ts` — `createClient()` para Server Components / Route Handlers / Server Actions (lee cookies).
- `packages/webapp-somnosalud/lib/supabase/middleware.ts` — `updateSession()` helper para refrescar tokens en middleware.

### Bloque C — Middleware combinado

Actualizar `packages/webapp-somnosalud/middleware.ts` para que coexistan:
1. Refresh de session Supabase (corre siempre, no redirige).
2. Compliance gate cookie `somno_consent_v1` (existente, solo `/eval/*`).

Matcher se amplía: `['/((?!_next/static|_next/image|favicon.ico|monitoring).*)']` para que Supabase pueda refrescar tokens en todas las rutas excepto assets.

### Bloque D — `/login` + Server Action

- `packages/webapp-somnosalud/app/login/page.tsx` — form simple email + submit.
- `packages/webapp-somnosalud/app/login/actions.ts` — `signInWithOtp({ email, emailRedirectTo: '${origin}/auth/callback' })`.

### Bloque E — `/auth/callback` Route Handler

- `packages/webapp-somnosalud/app/auth/callback/route.ts` — recibe `?code=...`, llama `exchangeCodeForSession(code)`, redirige a `next` query param o `/` por default.

### Bloque F — `.env.example` sync

Actualizar `.env.example` con las 5 vars Supabase reales que están en `.env.local` (sin exponer valores):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_ACCESS_TOKEN=   # solo MCP, no usado por la app
SUPABASE_PROJECT_REF=
```

## FASE 2 — Plan de verificación

### Build + typecheck

- `pnpm --filter @somnosalud/webapp-somnosalud build` verde.
- `pnpm --filter @somnosalud/webapp-somnosalud typecheck` sin errors.

### Tests existentes no rompen

- Los 19 E2E Playwright siguen passing (el middleware nuevo no debería romperlos porque cuando no hay session Supabase, simplemente no redirige fuera de `/eval`).

### Smoke H4 — RLS empírico

Con dev server corriendo + 2 mailboxes (Fabio + Jorge):

1. Mailbox A hace signup vía `/login` → recibe magic link → autentica → llega a `/`.
2. Verificar en DB que `public.profiles` ahora tiene 1 row con el email de A (trigger funcionó).
3. Mailbox B mismo flow → DB tiene 2 rows en `profiles`.
4. Via `mcp__supabase-somnosalud__execute_sql` (que corre como `service_role`, ve todo): `SELECT id, email FROM profiles ORDER BY created_at;` → 2 filas confirmadas.
5. Test RLS: simular contexto JWT de user A vía `SET request.jwt.claims = '{"sub":"<UUID-A>"}';` + `SELECT * FROM profiles;` → solo retorna 1 row (la de A). Lo mismo invirtiendo a user B.

## FASE 3 — Evidencias (2026-05-18)

### E1 — Código en `main`

Archivos nuevos:

```
packages/webapp-somnosalud/lib/supabase/client.ts       (createBrowserClient)
packages/webapp-somnosalud/lib/supabase/server.ts       (createServerClient + cookies)
packages/webapp-somnosalud/lib/supabase/middleware.ts   (updateSession helper)
packages/webapp-somnosalud/app/login/page.tsx           (Server Component)
packages/webapp-somnosalud/app/login/LoginForm.tsx      (Client Component, useFormState)
packages/webapp-somnosalud/app/login/actions.ts         (Server Action signInWithOtp)
packages/webapp-somnosalud/app/auth/callback/route.ts   (GET handler exchangeCodeForSession)
```

Archivos modificados:

- `packages/webapp-somnosalud/middleware.ts` — top-level combinado: refresh Supabase + compliance gate. Matcher ampliado para todas las rutas no-asset (antes era solo `/eval/:path*`).
- `packages/webapp-somnosalud/.env.example` — sección Supabase con las 5 vars reales (Sprint 9.A) en vez de "pendiente".
- `packages/webapp-somnosalud/package.json` — `@supabase/ssr@^0.10.3` + `@supabase/supabase-js@^2.106.0`.

### E2 — Build + typecheck

- **typecheck** ✅ `tsc --noEmit` sin errores.
- **build** ✅ `next build` verde. `/login` static 3.26 kB · `/auth/callback` dynamic Route Handler · Middleware 89.6 kB (incluye Supabase SSR).
- Las 22 rutas existentes siguen renderizando (24/24 static pages generadas).

### E3 — Hipótesis verificadas

- **H1 ✅** — Paquetes instalados sin conflictos (`pnpm add` Done in 9.6s, 10 deps nuevas, 0 errores).
- **H2 ✅** — Versiones cumplen: `@supabase/ssr 0.10.3 ≥ 0.5.x`, `@supabase/supabase-js 2.106.0 ≥ 2.45.x`. Build los acepta con keys `sb_publishable_*`.
- **H3 ✅** — Build verde con middleware combinado. Compliance gate preserva cookies refrescadas en redirect.
- **H4 ⏳ DIFERIDO** — Smoke RLS user-isolation se mueve a Sprint 9.B donde tendremos UI que escribe en `evaluations` — más significativa que probar solo `profiles`.
- **H5 ⏳** — Trigger `handle_new_user()` se valida en el primer signup real (también 9.B).
- **H6 ⏳** — Magic link end-to-end pendiente smoke 9.B con mailbox real.

## FASE 4 — Cierre

### Estado final

- 7 archivos nuevos (utils Supabase + 3 archivos `/login` + callback Route Handler).
- 3 archivos modificados (middleware + .env.example + package.json + pnpm-lock).
- Build + typecheck verde.
- 0 tests E2E nuevos (Sprint 9.B incluye coverage de signup flow).
- Status: `closed-pending-smoke` — código mergeable, smoke H4/H5/H6 corre en 9.B.

### Configuración manual pendiente (Fabio)

1. Dashboard Supabase > Auth > URL Configuration > Redirect URLs: agregar `http://localhost:3000/auth/callback`. URL del dashboard: https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/auth/url-configuration
2. Confirmar Site URL = `http://localhost:3000` mientras estemos en dev.
3. Cuando deployemos a Vercel (Sprint 3), agregar también la URL de preview/prod.

### Bloque K — Filesystem housekeeping

- Sin worktree separado (trabajamos en `main` directamente). Skip worktree cleanup.
- Sin deliverables binarios. Skip `clients/ifn/`.

### Próximo sprint

- **Sprint 9.B (~3-4h)** — sessionStorage→DB write-through, route `/mis-resultados`, refactor `usePersistEval` para upsert en `evaluations` (corregir comentario "Sprint 11" → "Sprint 9.B"), activación email transaccional `sendResultsEmail` con `evaluationId` + URL permanente, smoke H4/H5/H6 con 2 mailboxes reales en flow end-to-end.

### Notas para sesiones futuras

- **Magic link rate limit:** SMTP default Supabase = 4 emails/hora. Si en testing aparece error 429, esperar o usar otra mailbox. Resend custom (Fase 1) sube el límite.
- **Server Component vs Action:** `lib/supabase/server.ts` tiene un try/catch en `setAll` porque Server Components puros no pueden mutar cookies — patrón oficial del Supabase SSR guide. No tocar sin entender el race.
- **CLAUDE.md drift detectado:** dice que `pnpm-lock.yaml` está untracked en `main`, pero `git ls-files pnpm-lock.yaml` lo lista. CLAUDE.md está desactualizado. Sync menor pendiente.

## Bloque J — Reporte

**Status:** `closed-pending-smoke` (2026-05-18, código mergeable, smoke RLS empírico difer a Sprint 9.B).

**Stakeholder visible:** Pablo no requiere notificación (sprint 100% infra auth). Jorge se entera en próxima sync por el commit + reporte agregado.
