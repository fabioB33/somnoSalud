---
title: "Deploy Workflow — Playbook a VPS"
date: 2026-04-19
last_synced_with_vault_reality: 2026-04-19
tags: [process, deploy, docker, vps, devops, schema-checkpoint, empirical-verification]
status: active
target: "VPS 82.29.61.151 (Ubuntu 24.04, Docker)"
related:
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[TEMPLATE-DEBT]]"
  - "[[QA-CHECKLIST]]"
  - "[[../sprints/sprint-tiendanube-granularity-fix/LESSONS-LEARNED-TIENDANUBE-GRANULARITY]]"
  - "[[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]"
  - "[[GSD-WORKFLOW]]"
  - "[[OBSIDIAN-VAULT-CONVENTIONS]]"
  - "[[LOOP-7-STEPS]]"
---

# Deploy Workflow

Deploy de `products/content-factory-web` (Playbook) al VPS de producción.

## Pre-requisitos

- [[QA-CHECKLIST]] completo ✓
- Build local limpio
- Cambios commiteados a `main`

## Paso 1 — Verificación local

```bash
cd ~/Pampa-Labs-Core
git status                              # limpio
git log -1 --oneline                    # último commit correcto
cd products/content-factory-web
npm run build                           # ✓ built sin errores
```

## Paso 2 — Commit + push

```bash
cd ~/Pampa-Labs-Core
git add -A
git commit -m "sprint-NN: descripción del cambio"
git push origin main
```

## Paso 3 — Deploy al VPS

SSH al VPS y pull + rebuild:

```bash
ssh root@82.29.61.151

cd /root/Pampa-Labs-Core
git pull origin main

# Rebuild sin caché para garantizar cambios aplicados
docker compose -f products/content-factory-web/docker-compose.yml build --no-cache

# Up con recreate
docker compose -f products/content-factory-web/docker-compose.yml up -d --force-recreate

# Verificar que levantó
docker compose -f products/content-factory-web/docker-compose.yml ps
docker compose -f products/content-factory-web/docker-compose.yml logs --tail=50
```

## Paso 4 — Smoke test en producción

Desde browser (o `curl`):

- [ ] `https://app.pampalabs.com/landing-v2` → 200, cinematic scroll visible
- [ ] `https://app.pampalabs.com/login` → 200, form renderiza
- [ ] `https://app.pampalabs.com/playbook` → redirige a login si sin sesión; renderiza dashboard si logueado

Health check local dentro del VPS:
```bash
curl -s http://localhost:3000/health || echo "FAIL"
```

## Paso 4.5 — Schema checkpoint post-deploy (obligatorio si hubo migration o backfill)

> Formalizado 2026-04-19 como aplicación operacional de [[AUDITORIA-METODOLOGIA#Reglas de ejecución (no negociables)]] **Regla #12** (empirical verification antes de tags `no-blocker` / `resuelto` / `closed`). Origen empírico: [[../sprints/sprint-tiendanube-granularity-fix/LESSONS-LEARNED-TIENDANUBE-GRANULARITY]] #L2 y #L4 (backfill trunco ×23.5 detectado post-hoc).

**Aplicable si el deploy incluye**:
- Migration SQL nueva (`products/content-factory/sql/NNN-*.sql`) que modifica schema.
- Script de backfill histórico ejecutado en el VPS.
- Cutover de legacy → modern (ej. dual-store credentials).
- Cualquier cambio que altere **row counts esperados** en tablas target.

**NO aplicable** si es solo deploy de frontend / código sin cambio de schema / sin backfill. En ese caso, Paso 4 smoke test basta.

### 4.5.1 — Baseline pre-deploy (ejecutar **antes** del Paso 3 deploy)

Capturar snapshot de row counts en tablas target:

```sql
-- Ejemplo para sprint-tiendanube: target tables pb_ecom_orders, pb_ecom_order_items, brand_integrations
SELECT 'pb_ecom_orders' AS table_name, COUNT(*) AS rows_pre FROM pb_ecom_orders WHERE brand_id = '<BRAND_ID>'
UNION ALL
SELECT 'pb_ecom_order_items', COUNT(*) FROM pb_ecom_order_items WHERE brand_id = '<BRAND_ID>'
UNION ALL
SELECT 'brand_integrations', COUNT(*) FROM brand_integrations WHERE brand_id = '<BRAND_ID>' AND platform = 'tiendanube';
```

Guardar el output en `docs/vault/sprints/<sprint-name>/CHECKPOINT-PRE-DEPLOY-<YYYY-MM-DD>.md` (o dentro del sprint doc).

### 4.5.2 — Expectativa declarada por el sprint runbook

El sprint doc DEBE declarar, **antes del deploy**, los valores esperados post-deploy:

```md
## Expectativa post-deploy (schema checkpoint)

- `pb_ecom_orders` rows for brand Lure: esperado ≥ 2985 paid (post-backfill completo con paginación corregida)
- `pb_ecom_order_items` rows: esperado ≥ 7754
- Histórico: `MAX(order_created_at) - MIN(order_created_at)` ≥ 140 días
- `brand_integrations` row for Lure × tiendanube: esperado presente con `access_token IS NOT NULL`
```

Sin esta sección, el sprint NO puede marcarse `closed-verified`.

### 4.5.3 — Verification empírica post-deploy (obligatorio)

Ejecutar la misma query SQL del paso 4.5.1 **post-deploy**, comparar con expectativa 4.5.2:

| Check | Pre | Post | Expected | Status |
|-------|-----|------|----------|--------|
| `pb_ecom_orders` count | 127 (legacy) | 2985 | ≥ 2985 | ✅ |
| `pb_ecom_order_items` count | 341 (legacy) | 7754 | ≥ 7754 | ✅ |
| `MAX - MIN dias` | 7 | 147 | ≥ 140 | ✅ |
| `brand_integrations` stub | ∅ | present + token | present | ✅ |

**Si cualquier check falla**: bloqueo automático del cierre — investigar root cause + agregar lesson learned + fix antes de re-deploy. No etiquetar `closed` sobre dataset parcial.

### 4.5.4 — Triangulación 3 signals (Regla #12)

Adicional a 4.5.3, documentar en el sprint doc los 3 signals:

- **Signal 1 (log literal)**: output del backfill / migration (`Progress X/total`, `Backfill complete`, `Migration applied`).
- **Signal 2 (query DB)**: el SQL del 4.5.3 con output literal.
- **Signal 3 (schema introspection)**: `information_schema.columns` + `pg_indexes` + `pg_policies` para la tabla target — o wikilink a `SCHEMA-EMPIRICAL-YYYY-MM-DD` si se mantiene doc separado.

Los 3 signals DEBEN aparecer inline en el sprint doc bajo sección "Evidencia empírica final" antes de `closed-verified`.

### 4.5.5 — Ejemplos aplicados

- [[../sprints/sprint-tiendanube-granularity-fix/SPRINT-TIENDANUBE-GRANULARITY-FIX#Evidencia empírica final]] — primer sprint que aplicó el checkpoint retroactivamente (FASE A sprint-cierre).
- [[../sprints/sprint-observability-pattern-1-complete/SPRINT-OBSERVABILITY-PATTERN-1-COMPLETE]] — checkpoint de agent_reports (13/13 crones).

## Paso 5 — Rollback si algo falla

```bash
ssh root@82.29.61.151
cd /root/Pampa-Labs-Core
git log --oneline -10                   # identificar último commit bueno
git reset --hard <HASH_ESTABLE>
docker compose -f products/content-factory-web/docker-compose.yml build --no-cache
docker compose -f products/content-factory-web/docker-compose.yml up -d --force-recreate
```

Después del rollback: documentar el bug en [[../sprints/]]`sprint-NN/BUGFIXES-NN.md` y arreglar antes de reintentar deploy.

## Comando único (después del QA OK, para sprints rutinarios)

```bash
ssh root@82.29.61.151 "cd /root/Pampa-Labs-Core && git pull origin main && docker compose -f products/content-factory-web/docker-compose.yml up -d --build"
```

Usar solo cuando no hay cambios de deps (`package.json`, `Dockerfile`); si hay, forzar `--no-cache`.

## Frecuencia recomendada

- **Sprints tech:** deploy al terminar cada sprint con QA OK.
- **Hotfixes:** deploy inmediato tras QA reducido (build + smoke test módulo afectado).
- **Release de features grandes:** ventana de deploy definida (horario de bajo tráfico).

## §C — Hotfix lifecycle + closed-verified pattern

> Patrón establecido empíricamente durante los 5 sprints hotfix del 2026-04-18/19 (meta-rate-limiter-buc-aware, rls-brand-integrations-hotfix, meta-app-secret-rotation, sentry-dsn-prod-complete, observability-pattern-1-complete). Formaliza cuándo un DEBT realmente se cierra.

Un DEBT no se marca como `closed-verified` hasta que haya **evidencia empírica post-deploy**. Status progression:

1. **`open`** — DEBT detectado, sin trabajo aún.
2. **`fix-in-progress`** — código committed pero aún no deployado (o deploy en curso).
3. **`ready-for-deploy`** — push OK + runbook escrito, esperando ventana de deploy.
4. **`closed-verified`** — deploy aplicado + **mínimo 3 de estas evidencias** acumuladas:
   - **Boot log** verifica las señales esperadas (ej. `[sentry] initialized`, `loadPersistedStates`, `crons scheduled`, container `running`).
   - **Smoke test empírico** con output concreto del `curl` / response (status code + body relevante).
   - **Query MCP** sobre tabla target confirma state esperado (ej. `SELECT count(*) FROM agent_reports WHERE agent_type = 'meta_ads_sync' AND created_at > now() - interval '5 min'`).
   - **Dashboard externo** muestra el evento (ej. Sentry Issue nuevo con tags correctos, Meta Business Manager webhook log, Stripe event received).

Si solo hay 1-2 evidencias, el DEBT **se mantiene en `ready-for-deploy`** hasta acumular la 3ra. Nunca saltar directo a `closed-verified` sin evidencia triangulada.

### Los 4 CRITICAL cerrados 2026-04-18/19 siguieron este patrón

| DEBT | Evidencia 1 (boot log) | Evidencia 2 (smoke) | Evidencia 3 (dashboard/MCP) |
|------|------------------------|---------------------|-----------------------------|
| `DEBT-metricsync-failing-100-percent` | `[cron-metrics-sync] register` + `loadPersistedStates BUC total:2, active_blocks:0` | Meta API response 200 + `pb_metrics_snapshot` updated | MCP: agent_reports runs post-deploy con status='ok' |
| `DEBT-rls-brand-integrations-exposes-credentials` | Container `running` post-rebuild | Dual curl (anon + publishable) → 401/empty | MCP: `SELECT * FROM pg_policies WHERE tablename='brand_integrations'` confirma `service_role_all` |
| `DEBT-meta-app-secret-hardcoded-in-git` | Boot sin `META_APP_ID required` errors | OAuth flow functional en UI (Meta callback 200) | Meta Developers dashboard: secret activo nuevo + viejo revoked |
| `DEBT-sentry-no-dsn-prod` | `[sentry] initialized — env=production dsn=***@ingest.us.sentry.io` | Smoke test curl `/api/health` | Sentry dashboard issue visible en 28s con tags `{scope, operation}` |

### Regla importante: nunca cerrar en el mismo commit que deploya

El commit que introduce el fix sube a `ready-for-deploy`. El commit que cierra el DEBT a `closed-verified` **ocurre después** con las evidencias recolectadas. Esto fuerza que el deploy real ocurra antes del cierre documental y evita "closed-on-paper" sin verificación.

Los 4 sprints de hoy siguieron esta separación — ver hashes:
- `1a0d410` fix metricsync + `0387c48` sprint doc update (post-verify)
- `e2caee9` fix RLS + `b68584f` close DEBT (post dual curl)
- `d1db6c8` fix secret + `78ea376` close DEBT (post Meta dashboard)
- `0c5de90` fix Sentry + `323dde0` close DEBT (post dashboard issue visible)

## Cross-links

- [[QA-CHECKLIST]] — §A para hotfix backend, §B para release frontend.
- [[AUDITORIA-METODOLOGIA]] — regla #11 sync pass post-auditoría + regla #12 empirical verification triangulada.
- [[TEMPLATE-DEBT]] — checklist de cierre con 3 evidencias (mismo principio que Regla #12).
- [[../sprints/sprint-tiendanube-granularity-fix/LESSONS-LEARNED-TIENDANUBE-GRANULARITY]] — origen empírico del schema checkpoint (L2, L4).
- [[../MASTER-PLAN#Track D — Procesos|Master Plan Track D]]
- [[../sprints/sprint-30/BUGFIXES#BUG 6 — Docker build falla por workspace local fuera del context|Sprint 30 BUG 6]] — build context del Docker.
- [[../sprints/sprint-30/BUGFIXES#BUG 9 — Vite 8 / rolldown native bindings rompen Docker cross-platform|Sprint 30 BUG 9]] — Vite 5 LTS.
- [[../PAMPALABS-CONTEXT-SKILL]] — comandos canónicos de deploy.
