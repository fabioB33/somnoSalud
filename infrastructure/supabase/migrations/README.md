# Supabase Migrations

Migraciones SQL del project `somnosalud-platform` (ref `goxdopciwvahrxdeirft`, region `sa-east-1`).

## Convención

- Archivos numerados `NNNN_<descripcion-corta>.sql`.
- Migraciones **monótonas**: una vez aplicadas en prod, NUNCA se editan. Si hay que cambiar algo, se crea una migración nueva (`0005_xxx.sql`).
- Cada migración:
  - Documenta decisiones de diseño en comentarios al tope.
  - Es idempotente cuando es posible (`CREATE TABLE IF NOT EXISTS`, `CREATE POLICY IF NOT EXISTS`).
  - Habilita RLS en las tablas que crea (policies pueden ir en migration aparte).

## Sprint 2.B (2026-05-14) — schema inicial

| # | Archivo | Propósito |
|---|---------|-----------|
| 0001 | `init_profiles.sql` | Extensión de `auth.users` con compliance fields + trigger auto-create. |
| 0002 | `evaluations.sql` | 1 row por intento de evaluación, JSON columns por cuestionario. |
| 0003 | `audit_log.sql` | Append-only audit trail (Ley 25.326). |
| 0004 | `rls_policies.sql` | RLS estricto single-tenant: usuario ve sólo sus propias rows. |
| 0005 | `harden_definer_functions.sql` | Hardening post-advisors: `search_path = ''` en `handle_profile_updated_at` + REVOKE EXECUTE en `handle_new_user` para `PUBLIC`/`anon`/`authenticated`. |

## Cómo aplicar

### Opción A — Supabase SQL Editor (Sprint 2.B)

1. Abrí [https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/sql/new](https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/sql/new)
2. Copiá el contenido de `0001_init_profiles.sql` → pegá → click **Run**.
3. Verificá output "Success. No rows returned" o similar.
4. Repetí con `0002`, `0003`, `0004` en orden.

### Opción B — MCP `supabase-somnosalud` (Sprint 9+)

Una vez que el MCP esté activo (requiere restart de Claude Code post-Sprint 2.B), Cowork puede aplicarlas directamente desde la sesión.

### Opción C — Supabase CLI (futuro Fase 2+)

```bash
npx supabase link --project-ref goxdopciwvahrxdeirft
npx supabase db push
```

Requiere `supabase` CLI instalado globalmente + login con tu Access Token. No setup todavía Sprint 2.B porque las migraciones son chicas y manejables manualmente.

## Verificación post-aplicación

Después de aplicar las 4 migraciones, en el SQL Editor correr:

```sql
-- Las 3 tablas deberían existir.
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Esperado: audit_log, evaluations, profiles

-- RLS habilitado en las 3.
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Esperado: rowsecurity = true en las 3.

-- Policies activas.
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Esperado: 6 policies (profiles: 2, evaluations: 3, audit_log: 1).
```

## Aplicación efectiva (2026-05-18)

Las 5 migraciones se aplicaron vía MCP `supabase-somnosalud` desde Cowork
una vez que Fabio puso el `SUPABASE_ACCESS_TOKEN` en `.env.local` y reinició
Claude Code. Confirmación en `mcp__supabase-somnosalud__list_migrations`:

```
20260518225249  init_profiles
20260518225411  evaluations
20260518225529  audit_log
20260518225540  rls_policies
20260518225706  harden_definer_functions
```

Post-aplicación, `get_advisors(security)` retornó `lints: []` (0 WARN).

## Aplicación efectiva (2026-06-19) — migraciones 0006, 0007, 0008, 0010

Las migraciones `0006_diary_entries`, `0007_premium_waitlist`, `0008_clinician_links`
y `0010_profile_role` se aplicaron al project IFN (`goxdopciwvahrxdeirft`) el
**2026-06-19** durante la preparación de la demo de SomnoSalud Mobile
(validación interna / inversor).

**Contexto:** la app móvil (`products/somnosalud-mobile-app`) hace `INSERT` en
`diary_entries` y consulta `clinician_links` + `profiles.role`. Esas tablas/columnas
existían como archivos de migración acá pero **no estaban aplicadas en prod**, por
lo que el diario fallaba en silencio (diseño best-effort) y el backoffice del doctor
quedaba vacío. Verificado empíricamente vía REST API antes de aplicar.

**Cómo se aplicaron:** vía Management API (`POST /v1/projects/{ref}/database/query`)
con el `SUPABASE_ACCESS_TOKEN` del entorno, usando un SQL consolidado e idempotente.
Bundle reproducible + runbook en
`products/somnosalud-mobile-app/demo-prep/` (`01-migraciones-faltantes.sql`,
`02-verificacion.sql`, `03-seed-datos-demo.sql`, `RUNBOOK-DEMO.md`).

**Verificación post-aplicación:** 6 tablas públicas (audit_log, clinician_links,
diary_entries, evaluations, premium_waitlist, profiles), RLS=true en las 6,
`profiles.role` con default `'patient'`, 11 policies en las tablas nuevas + la policy
`evaluations_select_linked_clinician`.

> [!warning] El registro `supabase_migrations.schema_migrations` NO refleja estas 4
> Como se aplicaron por query directo (no vía CLI `db push` ni `apply_migration` del
> MCP), el tracker `supabase_migrations.schema_migrations` sigue listando solo las 5
> primeras (init_profiles … harden_definer_functions). La DB tiene las tablas, pero
> el registro de migraciones no las menciona. **Drift conocido, documentado acá.**
> Para cerrarlo formalmente cuando se retome el flujo CLI/MCP: registrar las 4 con
> `apply_migration` (no-op de schema, solo deja el registro) o `supabase migration repair`.
