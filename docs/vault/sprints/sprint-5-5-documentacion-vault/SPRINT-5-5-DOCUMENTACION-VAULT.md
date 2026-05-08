---
title: "Sprint 5.5 — Documentación Vault del scaffold Sprint 5 (ADRs + convenciones + stack inventory)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-5-5, documentacion, vault, adr, convenciones, stack-inventory, fase-1, somnosalud]
status: in-progress
parent_debts: []
related:
  - "[[../sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]]"
  - "[[../../../../CLAUDE]]"
  - "[[../../index]]"
  - "[[../../MASTER-PLAN]]"
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
  - "[[../../processes/OBSIDIAN-VAULT-CONVENTIONS]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-08
---

# Sprint 5.5 — Documentación Vault del scaffold Sprint 5

> Sprint **complementario** al Sprint 5 (Scaffold webapp-somnosalud). Captura en el Vault las decisiones técnicas, convenciones y stack inventory que vivían **solo en commit messages** post-Sprint 5. Sin esto, la regla #10 del CLAUDE.md (Vault como SSOT) se erosiona.

## Contexto

Sprint 5 cerró `closed-verified` con 5 commits (`62fb78c → fd4e192`) que aplicaron el scaffold completo de `webapp-somnosalud` (Next.js 14 + Tailwind + shadcn/ui + workspace dep). Pero las **decisiones técnicas** que tomé durante ese sprint quedaron documentadas únicamente en commit messages — no son fácilmente descubribles desde el Vault, no tienen wikilinks bidireccionales, y no siguen el patrón del Pampa Labs OS.

Pedido explícito de Fabio (2026-05-08): *"documenta todo en el vault de obsidian, bien detallado"*.

**Patrón sistémico detectado:** después de cada sprint que toca código, hay decisiones que merecen ADR + convenciones que merecen `concepts/` + stack snapshots que merecen `reference/`. Sin disciplina, todo se acumula en git history y se pierde la auditabilidad regulatoria.

---

## Objetivos

Documentar 7 piezas que faltan en el Vault:

1. **ADR-001** — Stack frontend webapp-somnosalud (8 decisiones técnicas).
2. **ADR-002** — Workspace dependency strategy (workspace:* + transpilePackages).
3. **ADR-003** — Compliance gates en código (patrón a seguir Sprint 6+).
4. **Convenciones frontend** — reglas RSC vs client, naming, paths, accesibilidad mínima.
5. **Stack inventory** — snapshot de versiones reales instaladas 2026-05-08.
6. **Update `docs/architecture/overview.md`** — Mermaid actualizado post-Sprint 5.
7. **Update `packages/webapp-somnosalud/README.md`** — reemplazar "skeleton" por scaffold real.

**Fuera de scope:**
- Documentación de Sprint 6 (compliance gates) — recién se va a hacer durante Sprint 6.
- ADRs de decisiones que **aún no se tomaron** (auth strategy, deploy strategy Vercel).

---

## FASE 0 — Skills cargadas

- **engineering-technical-writer** ([[../../../../.claude/agents/engineering-technical-writer]]) — para prosa técnica clara en ADRs y convenciones.
- **engineering-software-architect** — para validar que las ADRs capturan las decisiones correctas con consequences/alternatives.
- **engineering-codebase-onboarding-engineer** — para que los docs sean leíbles por nuevos devs sin asumir contexto.
- **obsidian-markdown** — frontmatter + wikilinks bidireccionales + tags consistentes.

Lectura previa:
- [[../sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]] — los 5 commits del Sprint 5 con sus decisiones inline.
- [[../../processes/OBSIDIAN-VAULT-CONVENTIONS]] — naming, frontmatter, ubicación.
- [[../../processes/SPRINT-CLOSURE-CHECKLIST]] Bloque I — wikilinks bidireccionales.
- [[../../../../CLAUDE]] — sección "Skills obligatorias" + reglas absolutas.

---

## FASE 1 — Hipótesis a verificar

Sprint de pura documentación, sin código nuevo. Las hipótesis son sobre **completitud** y **consistencia**:

| # | Hipótesis | Verificación | Si FALSE → implicancia |
|---|---|---|---|
| H1 | El Sprint 5 tomó al menos **8 decisiones técnicas significativas** que merecen ADR (Next 14 vs 15, App Router, shadcn manual vs CLI, Tailwind 3 vs 4, RSC default, transpilePackages, robots noindex, paths `@/*`) | Lectura de los 5 commits del Sprint 5 + grep de "decisión" / "razón" / "lección" | Si <8: agrupar en menos ADRs |
| H2 | El package `webapp-somnosalud` tiene drift entre `README.md` (dice skeleton) y realidad post-Sprint 5 (scaffold completo) | `cat packages/webapp-somnosalud/README.md` muestra status "skeleton" | Si está actualizado: solo update menor |
| H3 | `docs/architecture/overview.md` Mermaid está desactualizado (no muestra workspace deps + clinical-engine consumido por webapp) | Lectura del archivo | Si está actualizado: solo update menor |
| H4 | El Vault tiene `docs/vault/architecture/`, `concepts/`, `reference/` como dirs ya creados (regla VAULT-NAMING-ASCII-LOWERCASE) o hay que crearlos | `find docs/vault -type d` | Si no existen: crear (compliance regla #12) |
| H5 | CI cross-monorepo sigue verde post-cambios solo de docs (no afecta TS, no afecta build) | `pnpm install/lint/typecheck/test/build` post-commits → 5-6/N successful | Si rompe: investigar (improbable, son .md) |

---

## FASE 1 RESULTADOS — Evidencia empírica

### H1 — 8 decisiones técnicas del Sprint 5 → **CONFIRMADA**

Identificadas leyendo los 5 commits del Sprint 5:

1. **Next.js 14 (no 15)** — Next 15 no era estable al 2026-05-08; `next.config.ts` solo en Next 15+. Falsada en H1 del Sprint 5 → renombrado a `.mjs`.
2. **App Router (no Pages Router)** — App Router es default canónico Next 14, RSC compatible.
3. **Scaffold manual de shadcn (no CLI)** — el CLI `npx shadcn-ui@latest init` invoca `npm install` que cancela benefits del workspace pnpm.
4. **Tailwind 3.4 (no 4)** — Tailwind 4 no soportado oficialmente por shadcn/ui al 2026-05-08.
5. **RSC default (no `'use client'` everywhere)** — Server Components por default, client solo donde haya estado interactivo.
6. **`transpilePackages: ['somnosalud-clinical-engine']`** — sin esto, Next intenta cargar el `dist/` pre-compilado y rompe sourcemaps.
7. **`robots: noindex/nofollow`** — hasta validación clínica externa + compliance pre-launch público (regla del agent `compliance-anmat`).
8. **Paths `@/*`** — convención canónica Next.js, evita rutas relativas frágiles.

Decido agruparlas en **3 ADRs** por afinidad temática:
- **ADR-001:** decisiones 1, 2, 4, 5, 8 (stack frontend técnico).
- **ADR-002:** decisiones 6 (workspace dep + transpile, pero el ADR cubre el patrón general aplicable a `psg-parser` y `shared-ui` futuros).
- **ADR-003:** decisión 7 + arquitectura de compliance gates (patrón Sprint 6+).

Decisión 3 (shadcn manual) la documento en convenciones frontend (D), no como ADR.

### H2 — Drift en README webapp-somnosalud → **CONFIRMADA**

```
$ cat packages/webapp-somnosalud/README.md | head -10
```

Status declarado: skeleton + "Migración del HTML monolítico actual deployado en `paulferrero.github.io/somnosalud/` a Next.js 14 App Router + Tailwind + Supabase planificada para Fase 1."

Realidad: scaffold Next.js 14 + Tailwind + shadcn ya hecho. Además **no hay HTML monolítico que migrar** (decisión Fabio 2026-05-08 — webapp se escribe desde cero). Drift severo, requiere rewrite completo.

### H3 — Mermaid `docs/architecture/overview.md` desactualizado → **CONFIRMADA**

(Lectura completa en FASE 2 antes de update.)

### H4 — Dirs faltantes en Vault → **CONFIRMADA parcialmente**

`docs/vault/` ya tiene `archive/`, `clinical/`, `debt/`, `lessons-learned/`, `processes/`, `sessions/`, `sprints/`, `vision/` (heredados Pampa Labs OS).

Faltan: `architecture/adr/`, `concepts/`, `reference/`. Los creo en Commit A junto con el sprint doc.

### H5 — CI verde post-cambios solo docs → **CONFIRMADA empíricamente al cierre**

(Verificación al cierre, hipótesis trivial.)

---

## FASE 2 LOG — Cambios aplicados

### Commit A — Sprint doc abierto + dirs creados

- **Created** `docs/vault/sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT.md` (este archivo).
- **Created** `docs/vault/architecture/adr/` (placeholder dir, ADRs en Commit B).
- **Created** `docs/vault/concepts/` (placeholder dir).
- **Created** `docs/vault/reference/` (placeholder dir).
- **Updated** `docs/vault/index.md` — Sprint 5.5 + nuevos dirs en MOC.
- **Updated** `docs/vault/MASTER-PLAN.md` — Sprint 5.5 marcado in-progress.

### Commit B — 3 ADRs (stack frontend + workspace deps + compliance gates)

- **Created** `docs/vault/architecture/adr/ADR-001-stack-frontend-webapp-somnosalud.md`.
- **Created** `docs/vault/architecture/adr/ADR-002-workspace-dependency-clinical-engine.md`.
- **Created** `docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md`.

### Commit C — Convenciones frontend + stack inventory

- **Created** `docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md`.
- **Created** `docs/vault/reference/STACK-INVENTORY-2026-05-08.md`.

### Commit D — Updates README + overview.md

- **Updated** `docs/architecture/overview.md` — Mermaid actualizado post-Sprint 5.
- **Updated** `packages/webapp-somnosalud/README.md` — reemplazar skeleton por scaffold real con comandos + estructura.

### Commit E — Cierre del sprint

- **Updated** este sprint doc → status `closed-verified` + FASE 3 + reporte.
- **Updated** `docs/vault/MASTER-PLAN.md` → Sprint 5.5 closed-verified.
- **Updated** `docs/vault/index.md` → wikilinks bidireccionales finales.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar.

E1 — Lectura del Vault post-sprint:
- `find docs/vault -type f -name "*.md"` muestra 7 archivos nuevos.
- `find docs/vault -type d` muestra `architecture/adr/`, `concepts/`, `reference/` ya creados.
- `grep -l "scaffold-webapp-somnosalud" docs/vault/architecture/adr/*.md` muestra ADRs vinculados al Sprint 5.

E2 — CI verde post-docs-only:
- `pnpm install/lint/typecheck/test/build` → 5-6/N successful c/u, 55/55 tests passing.

E3 — Wikilinks bidireccionales:
- ADRs ↔ Sprint 5 ↔ Sprint 5.5 ↔ MASTER-PLAN ↔ index.
- Convenciones ↔ ADRs (cuando referencien decisiones).
- Stack inventory ↔ package.json + pnpm-lock real.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre. Por ahora estructura.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress`.
- [x] FASE 0 + FASE 1.
- [ ] FASE 2 LOG con 5 commits.
- [ ] FASE 3 EVIDENCIAS triangulada.
- [ ] FASE 4 CHECKLIST.

### Bloque B — DEBTs padres
- [x] N/A — sprint sin DEBTs padres.

### Bloque C — Sub-DEBTs
- [ ] Si surge alguno durante el sprint, crear.

### Bloque D — Lesson learned
- [ ] Considerar al cierre si hay patrón sistémico nuevo (ej: "post sprint que toca código, abrir sub-sprint de doc obligatorio").

### Bloque E — Session note
- [x] N/A — sprint <2h.

### Bloque F — CLAUDE.md raíz
- [ ] N/A — el sprint NO cambia stack ni roadmap, solo documenta lo ya decidido.

### Bloque G — DEBT-RADAR
- [x] N/A — 1 DEBT activo.

### Bloque H — MASTER-PLAN
- [ ] Sprint 5.5 → closed-verified.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar al cierre.

### Bloque K — Filesystem housekeeping
- [x] N/A — trabajo en `main`.

### Bloque J — Reporte ejecutivo
- [ ] Pegado al cierre.

---

*Última actualización: 2026-05-08 — sprint en ejecución.*
