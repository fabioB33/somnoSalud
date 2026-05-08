---
type: lesson-learned
date: 2026-05-06
sprint: ["79.A"]
severity: high
category: rpc-validation-data-integrity
tags:
  - rpc
  - postgres
  - data-integrity
  - multi-tenancy
  - onboarding
  - empirical-first
  - rule-8
detected_during: sprint-79a-brand-fantasma-cleanup
applies_to:
  - "cualquier RPC que cree resource user-facing (brands, organizations, projects, audiences, campaigns, workspaces)"
  - "patterns de slug autogenerado con loop incremental"
  - "idempotency guards basados en role-membership"
related_sprints:
  - "[[../sprints/sprint-79a-brand-fantasma-cleanup/SPRINT-79A-BRAND-FANTASMA-CLEANUP]]"
related_rules:
  - "regla #8 EMPIRICAL-FIRST-BEFORE-PLAN — la triangulación reveló bug latente al investigar el reportado"
---

# LL-2026-05-06 — RPC validar name unique, no solo slug

> [!info] Lección heredada Pampa Labs Core
> Esta lesson learned se originó en el proyecto **Pampa Labs Core** (Sprint 79.A Lure brand fantasma). Aplicable a SomnoSalud cuando se diseñen RPCs Postgres que creen recursos user-facing con `name + slug`. En SomnoSalud aplica desde Fase 3 multi-tenant white-label (cada sleep specialist con su clínica → tabla `clinics` con `name + slug`). El bug del slug auto-incremental que silenciosamente permite `name` duplicado se reproduciría exactamente igual.
>
> Disclaimer agregado durante [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]] (2026-05-08).

## Resumen

Cuando una RPC crea un resource user-facing con `name` (visible al usuario) + `slug` (identifier técnico), validar **únicamente unicidad de slug** genera **brand fantasma**: el slug es siempre único (loop incremental autogenera `-1`, `-2`, ...) pero el `name` puede colisionar silenciosamente.

Resultado UX: el usuario ve **2 brands con el mismo nombre** en su dashboard. Una con datos, otra vacía. **Confusión total + posible data leakage cross-brand percibido.**

## Contexto

Sprint 79.A nació de un caso reportado por Jorge el 2026-05-06: el usuario `farmendariz@administracionpuertomadero.com` veía 2 brands "Lure by MS" en su dashboard del Playbook. Una con datos del cliente real (slug `lure`), otra vacía (slug `lure-by-ms-morbjspt`).

Triangulación E1+E2+E3 reveló:
- **E1 (código):** `sql/019-create-brand-for-onboarding-rpc.sql:88-138` valida unicidad de slug con loop incremental (cap 1000) pero NO valida unicidad de name. El idempotency guard solo busca `user_brands WHERE role='owner'`.
- **E2 (DB):** 2 brands "Lure by MS" — una real desde 2026-03-15, otra creada el 2026-05-04 14:52:53 cuando farmendariz hizo signup + wizard `/setup`.
- **E3 (auxiliares):** 5 minutos después del fantasma, alguien (probablemente admin del workspace) agregó manualmente a farmendariz como `admin` del brand REAL → dual membership con el fantasma como zombie.

## Las 3 trampas técnicas independientes

### Trampa 1 — Slug uniqueness ≠ name uniqueness

```sql
-- sql/019:128-138 — slug loop garantiza único, pero NO toca name
v_slug := v_slug_base;
WHILE EXISTS (SELECT 1 FROM public.brands WHERE slug = v_slug) LOOP
  v_counter := v_counter + 1;
  v_slug := v_slug_base || '-' || v_counter;
END LOOP;
-- ↑ "Lure by MS" → slug "lure" tomado → autogenera "lure-by-ms-morbjspt"
-- ↑ name "Lure by MS" se inserta tal cual → duplica con la fila existente
```

**Corolario:** un slug autogenerado **es exactamente lo que disfraza un nombre duplicado**. Cuanto más sofisticado el algoritmo de slug uniqueness, más invisible el bug.

### Trampa 2 — Idempotency guard scoped a `role='owner'`

```sql
-- sql/019:93-99 — guard solo busca owner
SELECT ub.brand_id, b.slug
  INTO v_existing_brand_id, v_existing_slug
  FROM public.user_brands ub
  WHERE ub.user_id = p_user_id AND ub.role = 'owner'
  LIMIT 1;
```

Si el user es `admin` o `member` de otro brand (no `owner`), el guard pasa y crea un brand nuevo donde sí es owner. Esto es **correcto para retry** del wizard, pero crea brand fantasma cuando el user fue agregado a un workspace existente como member-no-owner antes de hacer su propio signup.

### Trampa 3 — Cleanup retroactivo bloqueado por test data

Aplicar `UNIQUE INDEX brands(LOWER(TRIM(name)))` retroactivamente requiere que **toda la tabla esté limpia**. Si hay duplicates legacy (ej. test data del Sprint 73.I con 2 brands "Pampa Test 73I" creados por 2 users distintos), el `DO $$` pre-flight aborta la migration.

**Corolario:** la decisión Path A del Sprint 79.A — `RAISE EXCEPTION` en RPC sin `UNIQUE INDEX` en tabla — es la única que avanza sin bloquear por data legacy. Schema-level enforcement queda como sub-DEBT post test-data hygiene.

## La regla generalizable

**Cualquier RPC que cree un resource user-facing con name visible al user DEBE validar:**

1. ✅ Unicidad de **slug** (identifier técnico, autogenerado).
2. ✅ Unicidad de **name** case-insensitive vía `LOWER(TRIM(name))`.
3. ✅ Idempotency guard que considere **todas las roles relevantes** (owner + admin + member, no solo owner) si el patrón "user existe en otro workspace antes de signup propio" es posible en producción.

**Aplicabilidad:**
- `brands` (este caso, Sprint 79.A — sql/036)
- `organizations` (si Pampa Labs evoluciona a multi-org per user)
- `projects` (Mission Control workspaces)
- `audiences` (Meta custom audiences con name user-facing)
- `campaigns` (campaign builder con name colisionable)
- `workspaces` (cualquier futuro Kelly 2.0 / Luna namespace)

## Cómo aplicar a futuros sprints

Cuando diseñes una RPC `create_<resource>_for_<context>`:

1. **Antes de codear**, listar los campos de identidad: name (UI), slug (técnico), id (UUID).
2. **Por cada campo de identidad user-visible**, agregar validación case-insensitive con `RAISE EXCEPTION` + ERRCODE apropiado:
   - `23505` (unique_violation) si es duplicate
   - `23502` (not_null_violation) si está vacío
   - `23514` (check_violation) si viola CHECK
3. **El message del RAISE** debe empezar con marker convencional para que `determineStatus` lo propague friendly al cliente:
   - `"Ya existe ..."` para 23505
   - `"El campo X es requerido."` para 23502
   - `"El valor X no es válido para Y."` para 23514
4. **El idempotency guard** debe considerar el contexto de membership multi-rol — si el user puede ser `admin`/`member` antes de su signup propio, ampliar el query del guard.
5. **NO agregar `UNIQUE INDEX` retroactivo sin cleanup previo** — el `DO $$` pre-flight de sql/019 muestra el patrón canónico. Validation a nivel RPC es enforcement suficiente para flujos self-service nuevos.

## Bonus — heurística de detection en code review

Cuando reviseés una RPC `CREATE OR REPLACE FUNCTION public.create_*_for_*`:

```bash
# Si el RPC tiene un slug uniqueness loop pero el name se inserta sin check → red flag.
grep -A 30 "CREATE OR REPLACE FUNCTION public.create_" *.sql | grep -E "(slug|name)" | grep -v -E "(uniqueness|EXISTS|trim|LOWER)"
```

Si hay líneas como `INSERT INTO ... (name, ...) VALUES (v_name, ...)` SIN un `IF EXISTS (SELECT 1 ... WHERE LOWER(TRIM(name)) ...)` previo → revisar si el name puede colisionar.

## Cross-references

- [[../sprints/sprint-79a-brand-fantasma-cleanup/SPRINT-79A-BRAND-FANTASMA-CLEANUP]] — sprint que cerró el bug.
- [[../debt/DEBT-2026-05-06-wizard-setup-allows-duplicate-brand-names]] — DEBT padre.
- [[../lessons-learned/LL-2026-05-04-debt-status-drift-cross-brand-leakage-false-alarm]] — el LL que motivó la regla #8 EMPIRICAL-FIRST que detectó este bug en triangulación.
- [[../processes/VERIFICATION-QUERY-SCHEMA]] — patrón para query empírica que detecta drift schema vs RPC.
