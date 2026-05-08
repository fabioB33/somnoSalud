---
type: lesson-learned
date: 2026-05-05
sprint: 76.Y
severity: high
category: schema-drift
tags:
  - supabase
  - schema-drift
  - empirical-first
  - rule-8
  - vps-logs
related_sprints:
  - SPRINT-76-Y-PB-BRAND-CONFIG-BUSINESS-TYPE-HOTFIX
  - SPRINT-68-ONBOARDING-ATOMIC-BRAND
related_rules:
  - "regla #8 EMPIRICAL-FIRST-BEFORE-PLAN"
---

# LL-2026-05-05 — VPS logs revelaron schema drift entre RPC y tabla

## Resumen

El bug de Sprint 76.Y (POST `/api/onboarding/brand` → 500) NO fue detectable por:
- Code review del repo (la RPC `create_brand_for_onboarding` tiene sintaxis válida)
- Tests unitarios (no existían tests E2E sobre la RPC contra la DB real)
- Auditoría manual del schema (asumimos que columnas referenciadas en migrations 019 existían)

**Solo fue detectable corriendo el flow self-service E2E desde una cuenta nueva FRESH y leyendo los logs Postgres del VPS prod.**

## Lo que pasó

1. **Sprint 68 (2026-04-23):** Agent A creó la RPC `create_brand_for_onboarding` que hace `INSERT INTO pb_brand_config (brand_id, plan, business_type)`.
2. **Brands existentes (Lure, Fonseca, Boken):** alguien (manual? script no versionado?) hizo `ALTER TABLE pb_brand_config ADD COLUMN business_type` + `UPDATE` con valores correctos. No quedó migration en repo.
3. **2 semanas (23/4 → 5/5):** la RPC funcionó bien para usuarios existentes (idempotency guard hacía SELECT y retornaba sin INSERT). Nadie llegó a un INSERT real por self-service.
4. **2026-05-05 14:35:** primer signup self-service FRESH (icao4pilots2@gmail.com post-fix AuthCallback Sprint 76.A.1.3). RPC intentó INSERT real → SQLSTATE 42703.

## Por qué la auditoría empírica no lo detectó

La auditoría Fase A (2026-04-18) listó 76 tablas y verificó RLS policies, pero **no diff'eó schema empírico vs migrations en repo**. Asumió que si migration existe en repo + DB tiene la tabla, las columnas matchean.

**Falso.** Las columnas pueden divergir si:
- Alguien hace `ALTER TABLE` manual desde el Dashboard sin commitear.
- Alguien aplica migration en dev/staging pero no en prod.
- Un script .sql se corre por error solo en algunos brands.

## Insight

**`information_schema.columns` es la única fuente de verdad del schema empírico.** El repo es aspiracional. Para detectar drift, hay que comparar:

```sql
-- Para cada tabla mencionada en sql/*.sql:
SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = '<table>';

-- vs grep -E "ADD COLUMN|CREATE TABLE" sql/*.sql
```

## Patrón sistémico detectado

Esto NO es el primer caso. Patrón equivalente:
- `sql/020-retroactive-brands-business-type-check.sql` — backfill retroactivo a `brands.business_type` que tampoco había sido agregada formalmente.
- Vault tiene tag implícito de sub-DEBT: cualquier columna referenciada en RPCs creadas pre-Sprint 60 podría tener este problema.

## Acción sistémica recomendada

**Crear sub-DEBT estructural:**
- Auto-generar diff `repo migrations vs information_schema empírico` como check de CI.
- Cron mensual que corre el diff y abre issue automático si hay drift.
- Estimación: 4-6h Cowork. Bajo esfuerzo, alto valor preventivo.

**Hasta entonces, regla operativa:**
- Cualquier RPC nueva que haga INSERT/UPDATE en tabla `pb_*`, primer paso es **probar el INSERT real desde `psql` directo** antes de mergear, no confiar en code review.

## Vínculo con regla #8 EMPIRICAL-FIRST

Si Cowork hubiera triangulado **antes** de proponer el plan original (Sprint 76.A.1.3 NUCLEAR AuthCallback), habría descubierto este bug en E2 (DB query) o E3 (logs prod) y resuelto los 2 launch-blockers en una sola sesión vs dos sprints separados. La regla funcionó correctamente esta vez (triangulé antes de proponer fix), pero la lección es que **Sprint 76.A.1.3 originalmente NO triangulé E3 (logs prod) porque el síntoma (spinner colgado) era frontend** — solo descubrí el bug backend al hacer smoke E2E post-deploy.

**Refinamiento a regla #8:**
- Cualquier sprint que toque flows self-service (signup, onboarding, billing) requiere un smoke E2E **end-to-end desde cuenta FRESH como evidencia E3 obligatoria**, no solo logs/sentry de errores reportados.
- Razón: bugs que afectan solo a usuarios nuevos no aparecen en logs hasta que un usuario nuevo los dispara, lo que puede no pasar nunca si nadie hace E2E.

## Related

- [[SPRINT-76-Y-PB-BRAND-CONFIG-BUSINESS-TYPE-HOTFIX]]
- [[SPRINT-76-A-1-3-AUTHCALLBACK-NUCLEAR]]
- [[docs/vault/processes/AUDITORIA-METODOLOGIA]] — agregar paso "schema drift diff" a metodología
- [[CLAUDE.md]] regla #8 EMPIRICAL-FIRST-BEFORE-PLAN
