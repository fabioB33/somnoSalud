---
title: "Deuda Técnica — procesos heredados asumen Content Factory + VPS Docker"
date: 2026-05-08
updated: 2026-05-08
tags: [deuda-tecnica, processes, qa-checklist, deploy-workflow, pampalabs-os, governance, sprint-2a, closed-verified]
status: closed-verified
priority: medium
scope: sprint-2
detected_during: sprint-1-cleanup-os-heredado
closed_by: sprint-2-curar-os-heredado
related:
  - "[[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]"
  - "[[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]"
  - "[[DEBT-curar-agents-pampalabs-os]]"
  - "[[../../../CLAUDE]]"
---

> [!success] Status update 2026-05-08 — CLOSED-VERIFIED
> **Sprint:** [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]] (commits `d24bc6e`, `63c781a`, `af2408d`).
> **Resumen:** los 3 procesos heredados con drift severo fueron reescritos para SomnoSalud:
> - `QA-CHECKLIST.md` reescrito completo: §A (clinical-engine 7 items + signoff Pablo obligatorio), §B (webapp placeholder Fase 1), §C (conversor-psg placeholder Fase 2).
> - `DEPLOY-WORKFLOW.md` reescrito completo: §A (pre-requisitos universales), §B (Vercel webapp-somnosalud), §C (GitHub Pages webapp-conversor-psg), §D (schema checkpoint Supabase Sprint 5+), §E (lifecycle universal preservado), §F-G (frecuencia + cuándo NO deployar).
> - `SPRINT-CLOSURE-CHECKLIST.md` Bloque F: path absoluto `/Users/elizabethuribe/Pampa-Labs-Core/CLAUDE.md` reemplazado por referencia relativa `./CLAUDE.md`.
> - `TEMPLATE-DEBT.md`: ejemplos hardcoded de DEBTs cross-product reemplazados por los 3 DEBTs reales de SomnoSalud (Sprint 1).
> - 5 LLs heredados (no el de filesystem que ya tenía callout): disclaimer "Lección heredada Pampa Labs Core" + analogía aplicable a SomnoSalud + ref regla #8.
> **Hipótesis falsadas/confirmadas:** H5 (procesos con drift severo Content Factory) CONFIRMADA con margen (>5 hits hardcoded).
> **Triangulación 3 evidencias:**
> - **E1 código:** `grep -n "82.29.61.151\|elizabethuribe\|content-factory" docs/vault/processes/QA-CHECKLIST.md docs/vault/processes/DEPLOY-WORKFLOW.md docs/vault/processes/SPRINT-CLOSURE-CHECKLIST.md docs/vault/processes/TEMPLATE-DEBT.md` → solo hits en secciones de "Referencia histórica" / "Nota histórica" intencionales.
> - **E2 CI local:** `pnpm install/lint/typecheck/test/build` → 5/5 successful c/u (los procesos son docs, no afectan pipeline).
> - **E3 Vault:** los 4 procesos reescritos tienen frontmatter actualizado `last_synced_with_vault_reality: 2026-05-08` + cross-link a Sprint 2.A. Los 5 LLs tienen disclaimer.

# DEBT-procesos-heredados-content-factory

> [!info] Origen
> Detectado durante el análisis exhaustivo del repo (2026-05-07 noche). Los 12 procesos en `docs/vault/processes/` se importaron literalmente del Vault de Pampa Labs Core (commit `6f8f6c9`). Varios asumen el stack Content Factory (VPS Docker, Meta Ads, Tiendanube) en lugar del stack SomnoSalud (Vercel + GitHub Pages, Supabase, clinical-engine).

## Contexto

El CLAUDE.md raíz (sección "Procesos obligatorios") referencia a estos procesos como autoridad operativa de cada sprint. Pero su contenido apunta a otra realidad operacional:

**Procesos con drift directo:**

- **`QA-CHECKLIST.md` §A** ([docs/vault/processes/QA-CHECKLIST.md:14](../processes/QA-CHECKLIST.md)) — empieza con: *"deploys de `products/content-factory/` (API, crones, services, migrations)"*. SomnoSalud no tiene `products/content-factory/`. Los 7 items "core" listados (TypeScript strict, build limpio, tests, smoke endpoint, boot signals, git state, Vault actualizado) son aplicables PERO los ejemplos referencian sprints viejos (`sprint-meta-rate-limiter-buc-aware`, `sprint-rls-brand-integrations-hotfix`, `sprint-meta-app-secret-rotation`) que no son del repo SomnoSalud.

- **`QA-CHECKLIST.md` §B** — describe rutas frontend de Playbook (`/landing-v2`, `/playbook/creatives`, `/playbook/campaigns`, `/brand-library`, `/chat`, `/video-studio`). Ninguna existe en SomnoSalud. Acá hay que reescribir el §B completo cuando exista la webapp-somnosalud (Sprint 5+).

- **`DEPLOY-WORKFLOW.md`** ([docs/vault/processes/DEPLOY-WORKFLOW.md:21](../processes/DEPLOY-WORKFLOW.md)) — `target: "VPS 82.29.61.151 (Ubuntu 24.04, Docker)"` hardcoded. SomnoSalud no usa VPS — usa Vercel (webapp-somnosalud) + GitHub Pages (webapp-conversor-psg). Todo el doc habla de `docker compose up -d --force-recreate` y `git pull origin main` en VPS.

- **`SPRINT-CLOSURE-CHECKLIST.md`** Bloque F (línea 109) referencia hardcoded path `/Users/elizabethuribe/Pampa-Labs-Core/CLAUDE.md`. Ese path no existe en máquinas de Fabio. Tampoco hay un CLAUDE.md raíz cross-product que actualizar — el CLAUDE.md de SomnoSalud es self-contained.

- **Ejemplos de DEBTs en TEMPLATE-DEBT** (línea 107-108) referencian `DEBT-tiendanube-granularity-gap`, `DEBT-luna-escalation-antipattern`, `DEBT-luna-semantic-memory-pinecone` — que viven en otro Vault, no acá.

**Procesos cross-product que sí aplican tal cual:**
- `AUDITORIA-METODOLOGIA.md` — metodología de auditoría Fase A.
- `LOOP-7-STEPS.md`.
- `TEMPLATE-DEBT.md` — solo borrar los ejemplos hardcoded del final.
- `OBSIDIAN-VAULT-CONVENTIONS.md`.
- `GSD-WORKFLOW.md`, `SUPERPOWERS-MULTI-AGENT-WORKFLOW.md`.
- `VERIFICATION-QUERY-SCHEMA.md`.

**Impacto:** mismo que el agents heredados (DEBT hermano) — la disciplina del Vault como SSOT (regla #10 CLAUDE.md) se erosiona si los procesos referencian realidad ajena. Cualquier nuevo dev / Cowork que lea estos procesos para "cómo se hace deploy en SomnoSalud" obtiene la respuesta equivocada.

Además: los 6 LLs en `docs/vault/lessons-learned/` son **todos cross-product Pampa Labs** (Meta Ads, OAuth Tiendanube, Lure brand, RPC validar name). Útiles como cultura, pero no se aplicaron a sprints SomnoSalud — no existen sprints SomnoSalud todavía. Hoy son contenido aspiracional, no instrumental.

## Evidencia

- `grep -n "products/content-factory" docs/vault/processes/*.md` → 7 hits en QA-CHECKLIST y DEPLOY-WORKFLOW.
- `grep -n "82.29.61.151\|VPS\|docker compose" docs/vault/processes/*.md` → 18 hits en DEPLOY-WORKFLOW.
- `grep -n "elizabethuribe\|Pampa-Labs-Core" docs/vault/processes/*.md` → 3 hits.
- `grep -l "luna\|tiendanube\|meta-ads" docs/vault/processes/*.md` → 4 archivos con referencias a sprints viejos.
- `ls docs/vault/lessons-learned/` → 6 LLs, todos cross-product Pampa Labs.

## Propuesta

Sprint 2 dedicado, ~4-5h, dividido en 3 sub-tareas:

1. **Reescribir `QA-CHECKLIST.md` §A** para SomnoSalud — los 7 items core con ejemplos reales de SomnoSalud (clinical-engine tests, safety rules signoff Pablo, etc.). El §B se queda en placeholder hasta que webapp exista.

2. **Reescribir `DEPLOY-WORKFLOW.md`** para deploy a Vercel (webapp-somnosalud) + GH Pages (webapp-conversor-psg). Mantener §C (Hotfix lifecycle + closed-verified pattern + triangulación 3 evidencias) que es el patrón universal aplicable.

3. **Adaptar `SPRINT-CLOSURE-CHECKLIST.md` Bloque F** — quitar referencia hardcoded a path Mac, usar referencia relativa al CLAUDE.md raíz del propio repo.

4. **Limpiar `TEMPLATE-DEBT.md`** — quitar ejemplos hardcoded del final que referencian DEBTs de otro Vault.

5. **Sub-decisión:** los 6 LLs en `lessons-learned/` ¿se mantienen como referencia cultural cross-product, o se mueven a `docs/vault/archive/lessons-learned-pampalabs-core/`? Recomiendo: **mantener tal cual + agregar disclaimer en cada uno: "Esta lección es cross-product, originada en Pampa Labs Core. Aplicable a SomnoSalud por analogía."**

## Scope

Sprint 2 (mismo sprint que cura agents — son trabajos hermanos).

## Prioridad

**medium** — no bloquea Sprint 2 Supabase + Sprint 3 Vercel (ahí se aplica el DEPLOY-WORKFLOW reescrito), pero **bloquea hacer un deploy bien hecho** según el proceso. Si arrancamos Sprint 3 con el DEPLOY-WORKFLOW actual, vamos a tener confusión sobre qué pasos seguir.

## Relacionados

- [[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]] — sprint origen.
- [[DEBT-curar-agents-pampalabs-os]] — DEBT hermano.
- [[../processes/QA-CHECKLIST]] — proceso a reescribir.
- [[../processes/DEPLOY-WORKFLOW]] — proceso a reescribir.
- [[../processes/SPRINT-CLOSURE-CHECKLIST]] — proceso a adaptar.
- [[../MASTER-PLAN]] — Sprint 3 (deploy Vercel) depende de este DEBT cerrado.
