---
title: "AUDITORÍA — Metodología (proceso reusable)"
date: 2026-04-19
last_synced_with_vault_reality: 2026-04-19
tags: [proceso, auditoria, metodologia, governance, vault, pampa-labs]
status: active
owner: jorge
related:
  - "[[TEMPLATE-DEBT]]"
  - "[[MASTER-PLAN]]"
  - "[[VAULT-PUBLISH]]"
  - "[[WEEK-1-HALLAZGOS-EMPIRICOS]]"
  - "[[../sprints/sprint-doc-integrity-pattern-3-complete/SPRINT-DOC-INTEGRITY-PATTERN-3-COMPLETE]]"
  - "[[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]"
  - "[[GSD-WORKFLOW]]"
  - "[[OBSIDIAN-VAULT-CONVENTIONS]]"
  - "[[LOOP-7-STEPS]]"
---

# Auditoría Sistemática — Metodología

> [!info] Propósito
> Definir cómo se ejecutan auditorías recurrentes del estado real de los productos Pampa Labs. Reusable literal: copiar la estructura de carpetas + docs + reglas para nueva fecha.

## Origen

Creado el 2026-04-18 como parte de la Auditoría Fase A de Pampa Labs Playbook. Primer detonante: el hallazgo de Tiendanube sync "de fachada" (provider trae órdenes granulares pero el consumer descarta todo y persiste solo 6 agregados). Ese caso enseñó que el código puede existir sin cumplir la promesa de su diseño, y que el vault es el único mecanismo para mantener verdad vs ficción.

## Reglas de ejecución (no negociables)

1. **READ-ONLY TOTAL sobre código y Supabase.** Cero `INSERT/UPDATE/DELETE`. Cero edits sobre código. Solo `SELECT` + `information_schema` + `pg_*` + `Read/Grep/Glob`.
2. **ESCRITURA PERMITIDA Y OBLIGATORIA sobre el vault `docs/vault/`.** Cada hallazgo se documenta AL MOMENTO en el archivo correspondiente. No acumular.
3. **Skills obligatorias a leer PRIMERO** (según `CLAUDE.md` del monorepo + `pampalabs-context`). Para auditorías read-only sin output UI, se pueden referenciar-en-cache las skills de UI/design/GSAP; `obsidian-markdown` y `pampalabs-context` son obligatorias siempre.
4. **Multi-agent obligatorio** para auditorías de >3 secciones: paralelizar con Superpowers donde el scope es disjunto. Default: MCP Supabase centralizado en el orquestador para evitar dispersión de acceso a DB.
5. **No inventar.** Si algo no es validable sin tocar prod o ejecutar, se marca `PENDING-PHASE-B` con justificación explícita.
6. **Scope estricto por producto.** Cross-product refs se documentan en `CROSS-PRODUCT-REFS.md` del audit sin auditar el otro lado.
7. **Leer el vault existente ANTES de escribir.** Contradicciones vault-vs-código se documentan como hallazgo propio — nunca se silencian.
8. **Candado intermedio** obligatorio post-sección 4 (o ~50% del inventario): reporte + validación de Jorge antes de continuar.
9. **Pausa limpia por saturación de contexto.** Si se detecta presión de contexto en medio de ejecución, se documenta estado parcial + commit + notificación a Jorge para abrir sesión nueva. No forzar cierre.
10. **NO cerrar tasks previas sin validación empírica** — la auditoría puede sugerir, no cerrar.
11. **Sync pass obligatorio post-auditoría (nuevo, 2026-04-19).** Si la auditoría detecta drift >5 claims en [[MASTER-PLAN]] o [[PRODUCT-VISION]], el sync pass es **OBLIGATORIO antes de cerrar la auditoría** como concluida. Incluye:
    - `MASTER-PLAN.md` actualizado con claims corregidos (RLS count, Sentry status, DEBT totals, brands activos, launch date)
    - `PRODUCT-VISION.md` alineado (launch date + rule count + brands activas + versión semver bump)
    - `/CLAUDE.md` root si hay drift >1 mes en frontmatter date
    - Commits atómicos por doc (no un commit monolítico)
    - Cada edit cita **línea + claim viejo + claim nuevo + razón empírica**
    - DEBTs correspondientes (`DEBT-master-plan-critical-drift`, `DEBT-product-vision-drift`, `DEBT-processes-aspirational-vs-real`) se mueven a `closed-verified` solo tras el commit que los cierra.

    Origen empírico: [[../debt/DEBT-master-plan-critical-drift]] detectó 2026-04-18 que MASTER-PLAN tenía 4 claims desactualizados (RLS 63 vs 76 real, Sentry "pendiente" vs deployado, 6 DEBTs hardcoded vs 45 reales, Boken aspiracional). La ausencia de esta regla causó decisiones mal-informadas durante ~14 días (entre el último edit de MASTER-PLAN y la auditoría). Ver [[../sprints/sprint-doc-integrity-pattern-3-complete/SPRINT-DOC-INTEGRITY-PATTERN-3-COMPLETE]] para el sprint que aplicó el sync pass por primera vez.

12. **Empirical verification antes de tags `no-blocker` / `resuelto` / `closed` (nuevo, 2026-04-19).** Ninguna observación, DEBT o hallazgo puede etiquetarse como **no-blocker**, **resuelto**, **completo** o equivalente **sin 3 evidencias trianguladas** documentadas inline:
    - **Signal 1 — Log literal de la ejecución** (script output, test run, cron report, HTTP response). No "se corrió OK", sino el string literal con timestamps y counts.
    - **Signal 2 — Query empírica contra la fuente de verdad** (Supabase MCP sobre tabla target, `curl` contra endpoint, `docker logs` de container). La query debe verificar **row counts + rango temporal + aggregates esperados**.
    - **Signal 3 — Schema / infra introspection** (`information_schema` + `pg_*` para DB, `docker ps` + `docker inspect` para containers, `gh api` para GitHub state). Captura el estado del sistema **cuando se aplicó la etiqueta**.

    Los 3 signals DEBEN aparecer en el doc que aplica la etiqueta (DEBT, sprint, audit section) con:
    - **Bloque code-fence** con el comando literal ejecutado.
    - **Output literal** (no parafraseado) del resultado.
    - **Fecha ISO** de ejecución (UTC-3 Buenos Aires).

    Si uno de los 3 signals NO se puede obtener (ej. herramienta no disponible, acceso restringido), la etiqueta NO se aplica — se queda en `ready-for-verify` o `investigation-in-progress` hasta triangulación completa.

    **Origen empírico:** [[../debt/DEBT-tiendanube-granularity-gap]] fue etiquetada "Observación no-blocker — Tiendanube API retornó solo últimos ~7 días" en FASE 3.B sin ejecutar query sobre `pb_ecom_orders`. Re-ejecución empírica 2026-04-19 reveló drift ×23.5 (2985 orders / 7754 items / 147 días histórico real vs 127 / 341 / 7 días documentados). La etiqueta fue aplicada sobre `Progress complete 127/127` del log — Signal 1 self-consistent pero falso sin Signal 2 (query DB) que hubiera detectado la pagination truncada. Ver [[../sprints/sprint-tiendanube-granularity-fix/LESSONS-LEARNED-TIENDANUBE-GRANULARITY]] #L1, #L4 para análisis completo. Aplicable retroactivamente: cualquier DEBT / observación en `closed-verified` pre-2026-04-19 que no tenga los 3 signals documentados se considera `requires-re-verification`.

    **Cross-ref operacional:** [[DEPLOY-WORKFLOW#Paso 4.5 — Schema checkpoint post-deploy]] formaliza la aplicación de esta regla al contexto deploy.

## Estructura de carpetas

```
docs/vault/audits/YYYY-MM-DD-AUDITORIA-FASE-X/
├── README.md                    ← MOC (Map Of Content)
├── 01-INTEGRACIONES.md
├── 02-FEATURES-<PRODUCTO>.md
├── 03-PAGINAS-FRONTEND.md
├── 04-CRONES.md
├── 05-TABLAS-SUPABASE.md
├── 06-MULTITENANT-CONFIG.md
├── 07-VAULT-EXISTENTE.md
├── 08-BACKLOG-DETECTADO.md
├── 99-HALLAZGOS-CRITICOS.md
└── CROSS-PRODUCT-REFS.md
```

Cada sección **DEBE** usar frontmatter YAML consistente con `title`, `date`, `tags`, `status`, `related`.

## Criterio de DEBT vs observación

- **DEBT:** se crea solo si hay **acción recomendada concreta** (fix, expandir, completar, decidir). Genera archivo separado `docs/vault/debt/DEBT-<nombre-descriptivo>.md` siguiendo [[TEMPLATE-DEBT]].
- **Observación:** informativa, no accionable. Queda en el doc de sección sin crear DEBT. Evita inflar backlog con ruido.

## Criterios de severity

Mismo calibrado que `WEEK-1-HALLAZGOS-EMPIRICOS`:

| Severity | Criterio | Ejemplos |
|---|---|---|
| `critical` | Stopper de lanzamiento self-service | Tenant leak, data loss, cobro incorrecto, auth bypass, RLS recursion 42P17 |
| `high` | Degrada UX crítico pero lanzable con workaround | Rate limiter saturado, feature a medias, data incompleta para reportes clave |
| `medium` | Fix eventual | Documentación desfasada, debt operacional (ej. `CRON_SECRET` duplicado) |
| `low` | Nice-to-have | Polish UI, naming inconsistente, slugify case-sensitive |

## Criterios de escalación (cuándo una auditoría se convierte en sprint de corrección)

Una auditoría genera **sprint dedicado** cuando:

- **>3 DEBTs `critical`** detectados.
- **>1 DEBT `critical` + >5 DEBTs `high`.**
- Cualquier DEBT que bloquee una feature firmada en [[MASTER-PLAN]] activo.
- Cualquier DEBT operacional con timestamp reciente (ej. incidente últimas 48h).

Si la auditoría no cumple esos criterios, los DEBTs entran al backlog y se programan por priority en sprint de polish post-launch.

## Frecuencia recomendada

- **Auditoría Fase A (inventario):** trimestral.
- **Auditoría Fase B (validación funcional):** al cierre de cada sprint mayor (pre-launch, pre-release, pre-churn).
- **Auditoría ad-hoc:** detonada por hallazgo operacional concreto (como el caso Tiendanube 2026-04-18).

## Template de DEBT

Ver [[TEMPLATE-DEBT]] — archivo reusable literal por copia.

## Ejemplo ejecutado (primer ciclo)

[[../audits/2026-04-18-AUDITORIA-FASE-A/README]] — primera auditoría aplicando esta metodología.

## Changelog

- **v1.0 — 2026-04-18** — Metodología inicial extraída de la Auditoría Fase A de Pampa Labs Playbook.
- **v1.1 — 2026-04-19** — Regla #11 agregada (sync pass obligatorio post-auditoría con drift >5 claims). Origen: [[../sprints/sprint-doc-integrity-pattern-3-complete/SPRINT-DOC-INTEGRITY-PATTERN-3-COMPLETE]] FASE C. Cross-ref: [[../debt/DEBT-processes-aspirational-vs-real]], [[../debt/DEBT-master-plan-critical-drift]], [[../debt/DEBT-product-vision-drift]].
- **v1.2 — 2026-04-19** — Regla #12 agregada (empirical verification antes de tags `no-blocker` / `resuelto` / `closed` — triangulación 3 signals obligatoria inline). Origen: [[../debt/DEBT-tiendanube-granularity-gap]] drift ×23.5 detectado en sprint-cierre-tiendanube-definitivo FASE A. Cross-ref operacional: [[DEPLOY-WORKFLOW#Paso 4.5 — Schema checkpoint post-deploy]]. Cross-ref retrospectivo: [[../sprints/sprint-tiendanube-granularity-fix/LESSONS-LEARNED-TIENDANUBE-GRANULARITY]] #L1, #L4, #L12.
