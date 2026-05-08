---
title: "VERIFICATION-QUERY SCHEMA — self-validation field for DEBT files"
date: 2026-05-04
last_synced_with_vault_reality: 2026-05-04
tags: [proceso, debt, verification, vault-robustening, empirical-first, cross-brand-leakage-postmortem]
status: active
related:
  - "[[TEMPLATE-DEBT]]"
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[DEPLOY-WORKFLOW]]"
  - "[[../lessons-learned/LL-2026-05-04-debt-status-drift-cross-brand-leakage-false-alarm]]"
---

# VERIFICATION-QUERY SCHEMA

> [!info] Origen
> Sesión 2026-05-04 pre-demo Lure. Estuvimos a punto de gastar 4hs reimplementando un fix de multi-tenancy (Sprint 72.H propuesto) que **ya estaba resuelto en producción** vía Sprint 73.R (1/5). El bug "cross-brand leakage" era falso alarma: la DEBT seguía con `status: code-pending-merge` aunque empíricamente Lure ya solo veía sus propios datos. Si Jorge no recordaba el merge de 73.R, perdíamos el día. Este schema existe para que la DEBT misma se autovalide vía query empírica y elimine este tipo de drift.

## Problema que resuelve

Las DEBT tienen status (`open`, `code-pending-merge`, `deployed-pending-empirical-validation`, `closed-verified`) que describen una **intención** del autor en el momento de escribirla. Pero el sistema cambia: PRs se mergean en otros sprints, hotfixes silenciosos resuelven bugs accidentalmente, deploys ocurren sin que el autor de la DEBT lo sepa. El status queda **stale**.

Sin un mecanismo de autovalidación, cada vez que Cowork (o Jorge) toma una decisión basada en el status de un DEBT, está confiando en una afirmación que puede tener semanas de antigüedad sin ground-truth.

## Schema

Agregar al frontmatter de cada DEBT un bloque `verification_query` con esta forma:

```yaml
verification_query:
  type: <sql | file_grep | http_get | chrome_smoke | bash>
  description: <una línea explicando qué se está chequeando>
  command: |
    <el query/comando exacto, multilínea OK>
  mcp: <opcional — qué MCP server ejecutarlo (supabase-cf | supabase-db | github | bash | manual)>
  expected_if_bug_present: <descripción de lo que se ve si el bug sigue activo>
  expected_if_bug_absent: <descripción de lo que se ve si el bug fue resuelto>
  last_run: YYYY-MM-DD              # cuándo se ejecutó última vez
  last_result: <bug-present | bug-absent | inconclusive | not-run>
  last_runner: <jorge | cowork-cron-weekly | claude-pre-flight | manual>
```

## Tipos de query

### `type: sql`
Para DEBTs que se autoexpresan en datos del DB.
- Casi siempre `mcp: supabase-cf` para Content Factory o `supabase-db` para Kelly
- Ejemplo: "este DEBT dice que la columna X no tiene constraint Y → consultá `information_schema`"

### `type: file_grep`
Para DEBTs sobre código que sigue presente / fue removido.
- `mcp: bash`
- Ejemplo: "este DEBT dice que `getAdCreatives` no setea diagnostics → grep el archivo prod-deployed"

### `type: http_get`
Para DEBTs sobre endpoints que devuelven cierta shape.
- `mcp: manual` o `bash` con curl
- Ejemplo: "este DEBT dice que `/api/agency/overview` filtra por user_brands → curl + verificar response"

### `type: chrome_smoke`
Para DEBTs visuales / UX que solo se manifiestan en el browser.
- `mcp: manual` (requiere navegación humana o Chrome MCP con sesión auth)
- Ejemplo: "este DEBT dice que el botón Fonseca aparece en cuenta Lure → navegar + screenshot"

### `type: bash`
Para DEBTs sobre artifacts en disco / config / migrations aplicadas.
- Ejemplo: "este DEBT dice que migration 023 no fue ejecutada → query `supabase_migrations.schema_migrations` o equivalente"

## Reglas de uso

1. **Toda DEBT con status ≠ `closed-verified` DEBE tener `verification_query`.** Sin esto, el DEBT no es chequeable y queda zombie. Si no se puede expresar como query, declarar `type: manual` + describir el smoke test que un humano debe hacer (peor pero válido).
2. **`closed-verified` opcional pero recomendado.** Útil para detectar regresiones (si un DEBT cerrado vuelve a estar `bug-present`, hay regression).
3. **`last_run` se actualiza cada vez que la query corre.** El cron weekly (Item 2C del robustening) es el caso default. Si Jorge corre la query manual, también lo actualiza.
4. **`last_result: inconclusive` es válido.** Si el query depende de una sesión auth que expiró, o de un brand que ya no existe, marcar inconclusive y agregar nota.
5. **Discrepancia status vs last_result = drift.** Si `status: code-pending-merge` pero `last_result: bug-absent`, el DEBT está stale. Pre-flight script (Item 2D) lista estos casos.

## Ejemplos canónicos

### Ejemplo 1 — DEBT cross-brand leakage (el que motivó este schema)

```yaml
verification_query:
  type: sql
  description: "Verificar que /api/agency/overview filtre por user_brands JOIN (Sprint 73.R helper)"
  command: |
    -- Sol Traficante (CEO Lure) NO debe tener acceso a Fonseca:
    SELECT u.email, ub.brand_id, b.name
    FROM auth.users u
    JOIN user_brands ub ON ub.user_id = u.id
    JOIN brands b ON b.id = ub.brand_id
    WHERE u.email = 'straficante@administracionpuertomadero.com';
  mcp: supabase-cf
  expected_if_bug_present: "Sol aparece con 2+ brands (Lure + Fonseca u otras)"
  expected_if_bug_absent: "Sol aparece SOLO con Lure (1c3f6ca6-1399-4138-ba84-df7be89658a2)"
  last_run: 2026-05-03
  last_result: bug-absent
  last_runner: cowork-empirical-pre-demo
```

### Ejemplo 2 — DEBT KB botón Fonseca hardcoded

```yaml
verification_query:
  type: file_grep
  description: "Verificar que el botón 'Cargar seed Fonseca' tenga conditional render por business_type"
  command: |
    grep -n "showFonsecaSeed\|business_type === 'lead_gen'" \
      /Users/elizabethuribe/Pampa-Labs-Core/products/content-factory-web/src/pages/PlaybookKnowledgeBase.tsx
  mcp: bash
  expected_if_bug_present: "Sin matches → botón se muestra siempre (hardcoded)"
  expected_if_bug_absent: "Match en 2+ líneas → conditional render activo"
  last_run: 2026-05-04
  last_result: bug-absent
  last_runner: cowork-pre-demo-fix
```

### Ejemplo 3 — DEBT migration 023 multi-tenancy

```yaml
verification_query:
  type: sql
  description: "Verificar si migration 023-agency-multitenancy fue aplicada en prod"
  command: |
    SELECT version, statements, name
    FROM supabase_migrations.schema_migrations
    WHERE name LIKE '%agency-multitenancy%' OR name LIKE '%023%'
    ORDER BY version DESC LIMIT 5;
  mcp: supabase-cf
  expected_if_bug_present: "Sin filas → migration no aplicada (DEBT abierto válido)"
  expected_if_bug_absent: "1+ fila → migration aplicada (DEBT debería transicionar)"
  last_run: 2026-05-03
  last_result: bug-present
  last_runner: cowork-empirical-pre-demo
```

### Ejemplo 4 — DEBT visual con chrome_smoke

```yaml
verification_query:
  type: chrome_smoke
  description: "Verificar que el botón 'Cargar seed Fonseca' NO aparezca en la cuenta Lure"
  command: |
    1. Login en https://app.pampalabs.com con cuenta straficante@administracionpuertomadero.com
    2. Navegar a /playbook/whatsapp/knowledge
    3. Inspeccionar header derecho: debe NO haber botón "Cargar seed Fonseca"
    4. Empty state debe decir "Agregá tu primer documento manualmente"
  mcp: manual
  expected_if_bug_present: "Botón visible → cross-brand UX leakage"
  expected_if_bug_absent: "Botón ausente + texto generic → fix activo"
  last_run: not-run
  last_result: not-run
  last_runner: pending-jorge-post-deploy
```

## Workflow integration

1. **Crear DEBT** → incluir `verification_query` desde el inicio (no opcional para DEBTs nuevos a partir de hoy).
2. **Cron weekly** ([[CRON-WEEKLY-DEBT-VALIDATOR]]) → corre todos los `verification_query` con `mcp` automatizable (sql / file_grep / bash). Reporta drift en Slack/log.
3. **Pre-flight check** ([[PRE-FLIGHT-CHECK-TECHNICAL-SESSION]]) → lista los `verification_query` cuyo `last_result` discrepa del `status` actual del DEBT. Bloquea el inicio de cualquier sesión técnica-producto hasta que Jorge revise.
4. **Cerrar DEBT (`closed-verified`)** → DEBE incluir el `last_result: bug-absent` reciente como evidencia adicional al boot log + smoke (per [[DEPLOY-WORKFLOW#§C]]).

## Anti-patterns

- ❌ `verification_query: null` o ausente → DEBT zombie potencial
- ❌ Query que no es ejecutable sin contexto humano cuando el bug es ejecutable (ej. "verificar visualmente" cuando hay un endpoint que se puede curl-ear)
- ❌ `last_run` desactualizado >30d en DEBT abierto → asumir drift, re-ejecutar antes de tomar decisiones
- ❌ Editar `last_result` sin re-ejecutar el query (fraude empírico)

## Migración retroactiva

Los ~150 DEBTs existentes no tienen `verification_query`. Plan de catch-up:
1. **Pri 1 (esta sesión 2026-05-04):** los ~15 DEBTs con status `code-pending-merge`, `deployed-pending-empirical-validation`, o `open` con priority `critical|high`. Ver [[../debt/]] filtrado.
2. **Pri 2 (próxima sprint cleanup):** todos los `open` priority `medium`.
3. **Pri 3 (backlog):** `low` priority.

Los `closed-verified` se hacen on-demand (cuando hay sospecha de regression).

## Changelog

- **v1.0 — 2026-05-04** — Schema inicial extraído del postmortem cross-brand-leakage falso alarma. Origen: sesión pre-demo Lure 2026-05-03/04 + lesson learned [[../lessons-learned/LL-2026-05-04-debt-status-drift-cross-brand-leakage-false-alarm]].
