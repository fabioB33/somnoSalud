---
title: "Sprint 2.B — Supabase project + schema inicial (profiles + evaluations + audit_log + RLS)"
date: 2026-05-14
closed_at: 2026-05-18
sprint_number: 2.B
status: closed-verified
parent_debts: []
related:
  - "[[../sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]"
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
tags: [sprint, supabase, schema, rls, single-tenant, magic-link, fase-1, backend]
---

# Sprint 2.B — Supabase project + schema inicial

> [!info] Objetivo
> Crear el project Supabase `somnosalud-platform` + schema mínimo viable (3 tablas con JSON columns + RLS estricto) que Sprint 9-supabase usará para migrar `sessionStorage → DB`. Setup operativo del MCP `supabase-somnosalud` para que Cowork pueda gestionar el project desde la sesión.

## Contexto

Sprint 2.A (2026-05-08) curó el OS Pampa Labs heredado y dejó pendiente el setup Supabase como bloque B. Hoy (2026-05-14) Fabio creó el project + me pasó las 4 credenciales necesarias.

**Decisiones técnicas tomadas en sesión 2026-05-14:**

| Decisión | Valor | Justificación |
|----------|-------|---------------|
| Auth | Magic Link (email) | Cero passwords, compatible con verificación email Ley 25.326, recovery cross-device |
| Tenancy | Single-tenant Fase 1 | Multi-tenant agrega `clinic_id` en migration Fase 3 (no breaking) |
| Schema | 3 tablas, JSON columns | Mínimo viable, ship fast, menos migrations futuras |
| Region | sa-east-1 (São Paulo) | Latencia más baja para Pablo + IFN |
| Plan | Free | Suficiente Fase 1, escalar a Pro en Fase 2 con storage PSGs |

## Hipótesis

- **H1** — Las 4 credenciales (URL + Publishable + Secret + Access Token) están seteadas en `packages/webapp-somnosalud/.env.local` (gitignored).
- **H2** — `.mcp.json` actualizado con `--project-ref=goxdopciwvahrxdeirft` para el MCP `supabase-somnosalud`.
- **H3** — 4 migraciones SQL aplicadas en orden producen 3 tablas + 5 RLS policies sin errores.
- **H4** — RLS funciona empíricamente: usuario A no puede ver rows de usuario B (verificable con queries de prueba al cerrar sprint).
- **H5** — Trigger `handle_new_user()` auto-crea profile al hacer signup en `auth.users`.
- **H6** — Webapp en runtime no rompe nada nuevo (las migraciones son aditivas, no toca código existente todavía).

## FASE 1 — Implementación

### Bloque A — Credenciales

- `packages/webapp-somnosalud/.env.local` creado con 4 vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_ACCESS_TOKEN`.
- `.gitignore` confirma exclusión (regla `.env.local` línea 17).
- `.mcp.json` actualizado con `--project-ref` del project + comment actualizado.

### Bloque B — Migraciones SQL

4 archivos en `infrastructure/supabase/migrations/`:

- `0001_init_profiles.sql` — tabla `profiles` extension de `auth.users` con compliance fields + trigger `handle_new_user()` SECURITY DEFINER + trigger `handle_profile_updated_at()` + RLS enabled.
- `0002_evaluations.sql` — tabla `evaluations` con enum `evaluation_status` + JSON columns por cuestionario + index compuestos + idempotency_key + RLS enabled.
- `0003_audit_log.sql` — tabla `audit_log` append-only con 3 índices + RLS enabled.
- `0004_rls_policies.sql` — 5 policies:
  - `profiles`: SELECT/UPDATE own.
  - `evaluations`: SELECT/INSERT/UPDATE own.
  - `audit_log`: SELECT own.

DELETE no exposed en ninguna tabla (compliance Ley 25.326 derecho de supresión → job admin con service_role).

### Bloque C — Aplicación

Fabio aplica las 4 migraciones manualmente en el SQL Editor del dashboard
(`https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/sql/new`) hasta
que el MCP `supabase-somnosalud` esté disponible (requiere restart de Claude Code).

Verificación post-aplicación (queries de smoke en `README.md`):
- 3 tablas con `rowsecurity = true`.
- 5 policies activas.

## FASE 2 — Plan de verificación

### Triangulación E1/E2/E3

- **E1 — Lectura código actual:** confirmado — no hay todavía cliente Supabase en webapp, sessionStorage sigue siendo única persistencia.
- **E2 — SQL Editor:** Fabio ejecuta las 4 migraciones, screenshot del output.
- **E3 — Queries de verificación:** post-migraciones, queries del README confirman 3 tablas + RLS habilitado + 5 policies.

### No rompe webapp

- `pnpm --filter @somnosalud/webapp-somnosalud build` debe seguir verde (Sprint 2.B no toca código TS).
- E2E Playwright 19/19 sigue passing (sin cambios en el webapp).

## FASE 3 — Evidencias (2026-05-18)

Triangulación ejecutada vía MCP `supabase-somnosalud` (recién activado en esta sesión).

### E1 — Lectura código actual en `main`

`infrastructure/supabase/migrations/` contiene los 5 archivos SQL en disco:

```
0001_init_profiles.sql              2791 bytes
0002_evaluations.sql                4213 bytes
0003_audit_log.sql                  2237 bytes
0004_rls_policies.sql               3354 bytes
0005_harden_definer_functions.sql   ~1700 bytes  (creado 2026-05-18)
```

Confirmado: la webapp todavía no tiene cliente Supabase (sessionStorage sigue siendo única persistencia). Sprint 9-supabase migra esto.

### E2 — Query DB vía MCP

`mcp__supabase-somnosalud__list_migrations` retorna las 5 migraciones registradas:

```
20260518225249  init_profiles
20260518225411  evaluations
20260518225529  audit_log
20260518225540  rls_policies
20260518225706  harden_definer_functions
```

`mcp__supabase-somnosalud__execute_sql` con la query del README confirma:

- **3 tablas con `rowsecurity = true`:** `audit_log`, `evaluations`, `profiles`.
- **6 policies activas** (no 5 como decía la documentación originalmente — corregido):

| tabla | policy | cmd | role |
|---|---|---|---|
| profiles | Users can view own profile | SELECT | authenticated |
| profiles | Users can update own profile | UPDATE | authenticated |
| evaluations | Users can view own evaluations | SELECT | authenticated |
| evaluations | Users can insert own evaluations | INSERT | authenticated |
| evaluations | Users can update own evaluations | UPDATE | authenticated |
| audit_log | Users can view own audit entries | SELECT | authenticated |

### E3 — Security advisors

`mcp__supabase-somnosalud__get_advisors(security)` post-`0004` reportó **3 WARN**:

1. `handle_profile_updated_at` — search_path mutable (lint 0011).
2. `handle_new_user` ejecutable por `anon` vía `/rest/v1/rpc/` (lint 0028).
3. `handle_new_user` ejecutable por `authenticated` vía `/rest/v1/rpc/` (lint 0029).

Los #2 y #3 eran críticos: `handle_new_user` es `SECURITY DEFINER` y quedaba expuesta como RPC pública — cualquier cliente podía llamarla con un body arbitrario y forzar INSERTs en `public.profiles` bypaseando el flow real de signup.

Aplicada migración `0005_harden_definer_functions` con:

- `SET search_path = ''` en `handle_profile_updated_at`.
- `REVOKE EXECUTE … FROM PUBLIC, anon, authenticated` en `handle_new_user`. El trigger `on_auth_user_created` sigue funcionando porque los triggers ejecutan con privilegios del owner de la function, no del role disparador.

Post-`0005`, `get_advisors(security)` retorna `lints: []` (0 WARN). ✅

## FASE 4 — Cierre

### Estado final

- 5 migraciones aplicadas en orden.
- 3 tablas con RLS habilitado.
- 6 policies activas (todas `TO authenticated`, ninguna SELECT/INSERT/UPDATE/DELETE expuesta a `anon`).
- 0 lints de seguridad.
- MCP `supabase-somnosalud` operativo + autenticado.
- `.env.local` con 4 vars Supabase seteadas (URL + PUBLISHABLE + SECRET + ACCESS_TOKEN + PROJECT_REF).

### Hipótesis verificadas

- **H1 ✅** — Credenciales en `.env.local` (gitignored, confirmado vía `grep` de nombres de var sin exponer valores).
- **H2 ✅** — `.mcp.json` ya tenía `--project-ref=goxdopciwvahrxdeirft` antes de esta sesión.
- **H3 ✅** — 4 + 1 migraciones SQL aplicadas en orden sin errores.
- **H4 ⏳** — RLS comprobado a nivel schema; smoke test empírico de "user A no ve rows de user B" pendiente Sprint 9 (requiere flow signup real con 2 magic links).
- **H5 ✅** — Trigger `on_auth_user_created` creado (ejecutará al primer signup real en Sprint 9).
- **H6 ✅** — Webapp en runtime no toca DB todavía, las migraciones son aditivas.

### Bloque K — Filesystem housekeeping

- No hubo worktree separado para este sprint (se trabajó directamente en `main`). Skip cleanup worktree.
- Migraciones quedan en `infrastructure/supabase/migrations/` (correcto, ya está en repo).
- No se generaron deliverables binarios. Skip `clients/ifn/`.

### Próximo sprint

- **Sprint 9-supabase (~6-8 h)** — Cliente Supabase con `@supabase/ssr` versión nueva, routes `/login` + `/auth/callback` + `/mis-resultados`, middleware con auth check, migración `sessionStorage → DB` con write-through, activación Resend para magic link. Smoke test final de RLS (H4) corre acá con 2 cuentas reales.

### Notas para sesiones futuras

- **API Keys formato nuevo (2025+):** el project tiene `sb_publishable_*` + `sb_secret_*` (no JWT viejo). `@supabase/ssr >= 0.5.x` + `@supabase/supabase-js >= 2.45.x` requeridos en Sprint 9.
- **MCP supabase-somnosalud activo:** próximas migraciones se aplican directo desde Cowork vía `apply_migration`. No más SQL Editor manual salvo escenarios destructivos que requieran review previa.
- **Lección 2026-05-18:** `SECURITY DEFINER` functions en schema `public` quedan expuestas como RPC por default. Siempre `REVOKE EXECUTE` después de crearlas si solo se invocan desde triggers internos.

## Bloque J — Reporte

**Status:** `closed-verified` (2026-05-18, 5 migraciones aplicadas + 0 lints + 6 RLS policies activas).

**Stakeholder visible:** Pablo no requiere notificación — sprint 100% infra backend sin impacto clínico todavía. Jorge se entera en próxima sync por el commit + actualización del CLAUDE.md.
