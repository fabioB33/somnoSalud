---
title: "Reference — index"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [reference, index, somnosalud]
status: active
related:
  - "[[../index]]"
  - "[[../../../CLAUDE]]"
---

# Reference — SomnoSalud

> Material de **referencia frozen-in-time**: stack inventories, snapshots de versiones, listados de DOI/PMID consolidados, glosarios de terminología clínica. Distinto a `concepts/` (que son guías vivas) — los reference son **snapshots con fecha** que se versionan agregando archivos nuevos, no editando los viejos.

## Documentos activos

| Doc | Tema | Status |
|---|---|---|
| [[STACK-INVENTORY-2026-05-08\|Stack inventory 2026-05-08]] | Versiones reales instaladas post-Sprint 5 + peer warnings + deprecations | snapshot |

## Cuándo escribir un Reference doc

- **Stack inventory** después de cada upgrade significativo de deps.
- **Glosario clínico** cuando aparezca terminología nueva (ej: "EMA = Early Morning Awakening").
- **Listado consolidado de DOI/PMID** (cuando crezca lo suficiente como para no caber en `clinical-engine/src/references.ts`).
- **Inventarios de archivos importantes** (ej: dump de schemas Supabase prod).

Convención: filename con **fecha en suffix** (ej: `STACK-INVENTORY-2026-05-08.md`) para versionado natural — agregar nuevo archivo en lugar de editar el viejo.

---

*Última actualización: 2026-05-08 — directorio creado durante [[../sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]].*
