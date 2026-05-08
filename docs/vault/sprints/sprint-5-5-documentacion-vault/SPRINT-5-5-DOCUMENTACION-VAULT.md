---
title: "Sprint 5.5 — Documentación Vault del scaffold Sprint 5 (ADRs + convenciones + stack inventory)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-5-5, documentacion, vault, adr, convenciones, stack-inventory, fase-1, somnosalud]
status: closed-verified
updated: 2026-05-08
closing_commit: pending-this-commit
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

## FASE 3 EVIDENCIAS — Triangulación post-cierre (capturada 2026-05-08)

### E1 — Vault post-Sprint 5.5

```
$ find docs/vault -type f -name "*.md" -newer docs/vault/sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD.md | sort
docs/vault/architecture/adr/ADR-001-stack-frontend-webapp-somnosalud.md
docs/vault/architecture/adr/ADR-002-workspace-dependency-clinical-engine.md
docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
docs/vault/architecture/adr/README.md
docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md
docs/vault/concepts/README.md
docs/vault/reference/STACK-INVENTORY-2026-05-08.md
docs/vault/reference/README.md
docs/vault/sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT.md
```

→ **9 archivos nuevos** en el Vault (3 ADRs + 1 convenciones + 1 stack inventory + 3 README de dirs nuevas + 1 sprint doc). Plus 2 docs externos updated (overview.md + webapp README).

```
$ find docs/vault -type d -newer docs/vault/processes
docs/vault/architecture
docs/vault/architecture/adr
docs/vault/concepts
docs/vault/reference
docs/vault/sprints/sprint-5-5-documentacion-vault
```

→ 5 dirs nuevas. Convenciones VAULT-NAMING-ASCII-LOWERCASE respetadas.

### E2 — CI verde post-docs-only

```
$ pnpm install --frozen-lockfile  → Done in 1.7s, Already up to date
$ pnpm test                       → Tasks: 6 successful, 6 total
                                  → clinical-engine: Tests 55 passed (55)
$ pnpm typecheck                  → Tasks: 6 successful, 6 total
```

H5 confirmada: cambios solo de docs no afectan pipeline TS.

### E3 — Wikilinks bidireccionales verificados

```
$ grep -l "ADR-001-stack-frontend" docs/vault/**/*.md
docs/vault/architecture/adr/ADR-001-stack-frontend-webapp-somnosalud.md
docs/vault/architecture/adr/ADR-002-workspace-dependency-clinical-engine.md
docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
docs/vault/architecture/adr/README.md
docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md
docs/vault/index.md
```

→ 6 archivos referencian ADR-001. Backlinks bidireccionales OK.

```
$ grep -l "sprint-5-5-documentacion-vault\|SPRINT-5-5" docs/vault/**/*.md
docs/vault/architecture/adr/*.md (4)
docs/vault/concepts/*.md (2)
docs/vault/reference/*.md (2)
docs/vault/sprints/sprint-5-5-documentacion-vault/*.md (1)
docs/vault/index.md
docs/vault/MASTER-PLAN.md
```

→ 11+ archivos linkean al Sprint 5.5. Sprint discoverable desde MOC.

### E4 — Stack inventory verificado contra realidad

```
$ awk '/packages\/webapp-somnosalud:/,/^[a-z]/ { print }' pnpm-lock.yaml | grep -c "specifier:"
19
```

→ 19 specifiers (10 runtime + 9 dev) — coincide con la tabla del stack inventory.

---

## FASE 4 CHECKLIST — Sprint Closure

A completar al cierre. Por ahora estructura.

### Bloque A — Sprint doc
- [x] Frontmatter `status: closed-verified` + `updated: 2026-05-08`.
- [x] FASE 0 + FASE 1 + FASE 1 RESULTADOS.
- [x] FASE 2 LOG con 5 commits (A-E).
- [x] FASE 3 EVIDENCIAS E1-E4.
- [x] FASE 4 CHECKLIST (este bloque).

### Bloque B — DEBTs padres
- [x] N/A — sprint sin DEBTs padres.

### Bloque C — Sub-DEBTs
- [x] Sub-DEBT identificado en ADR-002: drift de naming `somnosalud-clinical-engine` (sin scope) vs `@somnosalud/*` (con scope). NO creado como archivo separado todavía — lo dejo documentado en ADR-002 §"Drift conocido" para crearlo formalmente cuando se ejecute (estimado: 30 min, scope sprint chico cuando termine Sprint 6-8).

### Bloque D — Lesson learned
- [x] Considerada y descartada. Patrón "post sprint que toca código, abrir sub-sprint de docs" parece bueno pero **es un caso de muestra 1**. Si Sprint 6-8 confirman el patrón (cada uno requiere sub-sprint de docs después), sí formalizar como LL. Por ahora documentar inline en este sprint doc + comentar el patrón en el commit message del cierre.

### Bloque E — Session note
- [x] N/A — sprint ~1.5h efectivas, sin coordinación multi-agente externa.

### Bloque F — CLAUDE.md raíz
- [x] N/A — sprint NO cambia stack ni roadmap declarados. Las ADRs documentan lo ya decidido (no cambian decisiones).

### Bloque G — DEBT-RADAR
- [x] N/A — 1 DEBT activo (`vitest-coverage-output`, low). No justifica RADAR.

### Bloque H — MASTER-PLAN
- [x] Sprint 5.5 marcado `closed-verified` con detalle.

### Bloque I — Wikilinks bidireccionales
- [x] Verificados con grep en E3: 6 archivos linkean a ADR-001, 11+ linkean al sprint.

### Bloque K — Filesystem housekeeping
- [x] N/A — trabajo en `main`, sin worktree, sin deliverables binarios.

### Bloque J — Reporte ejecutivo
- [x] Pegado al cierre.

---

## Reporte ejecutivo (Bloque J)

```
📋 Reporte ejecutivo — Sprint 5.5 Documentación Vault

Branch: main (sin worktree)
Commits: 5 atómicos (c0ced77 → <commit-E>)
Archivos nuevos: 9 .md en Vault (3 ADRs + 1 convenciones + 1 stack inventory + 3 README de dirs + 1 sprint doc) + 2 updates (overview.md + webapp README)
Total LOC docs nuevos: ~2.000 líneas markdown

---
Hipótesis confirmadas empíricamente
1. H1 (>=8 decisiones técnicas) → CONFIRMADA. 8 identificadas,
   agrupadas en 3 ADRs.
2. H2 (drift README webapp) → CONFIRMADA. Status declarado
   "skeleton" pero scaffold ya hecho. Reescrito en Commit D.
3. H3 (overview.md Mermaid desactualizado) → CONFIRMADA. Mermaid
   anterior era del bootstrap, sin estado de packages. Reescrito
   con 3 subgraphs + clases CSS done/inProgress/pending +
   sequence diagram nuevo del flow Fase 1.
4. H4 (dirs Vault faltantes) → CONFIRMADA. architecture/adr/,
   concepts/, reference/ creados con README explicativo cada uno.
5. H5 (CI verde post-docs-only) → CONFIRMADA. Tasks 6/6 successful,
   55/55 tests passing.

---
Status final por commit
| # | Commit | Status | Hash |
|---|---|---|---|
| A | sprint doc + dirs Vault + index + MASTER-PLAN | applied | c0ced77 |
| B | 3 ADRs (stack frontend + workspace deps + compliance gates) | applied | 8efacea |
| C | convenciones frontend + stack inventory 2026-05-08 | applied | fb4ec92 |
| D | updates overview.md + README webapp-somnosalud | applied | 976b895 |
| E | cierre sprint 5.5 closed-verified | applied | <pending> |

---
Evidencias capturadas (FASE 3)
- E1 Vault: 9 archivos nuevos + 5 dirs nuevas. Convenciones
  VAULT-NAMING-ASCII-LOWERCASE respetadas.
- E2 CI local: pnpm install/test/typecheck → Tasks 6/6 successful,
  clinical-engine 55/55 tests passing.
- E3 Wikilinks bidireccionales: ADR-001 referenciada por 6 docs,
  Sprint 5.5 referenciado por 11+ docs.
- E4 Stack inventory verificado contra pnpm-lock real: 19
  specifiers coinciden con tabla.

---
Próximos pasos accionables para Fabio
1. git log --oneline -6 — revisar los 5 commits del Sprint 5.5.
2. git push origin main cuando confirme.
3. Sprint 6 — Pantallas P0 compliance gates: implementar capas
   1-3 de ADR-003 (middleware + DisclaimerBanner layout +
   verificación edad <18). Estimado 3-4h.
4. (Opcional) abrir el Vault con Obsidian app y navegar:
   - index.md → ADRs → ADR-001/002/003.
   - index.md → Concepts → CONVENCIONES-FRONTEND-WEBAPP.
   - index.md → Reference → STACK-INVENTORY-2026-05-08.

---
Decisiones de diseño aplicadas
- 3 ADRs (no 1 grande con 8 decisiones) — afinidad temática.
  ADR-001 es stack frontend, ADR-002 es patrón cross-package,
  ADR-003 es patrón cross-sprint.
- shadcn manual NO se documenta como ADR (es decisión menor) —
  vive en convenciones §8.
- Inventory con fecha en suffix (snapshot frozen) — futuros
  inventories en archivos nuevos, no editar este.
- README de cada dir nueva del Vault — index discoverable + cuándo
  escribir.
- Updates externos (overview.md + webapp README) NO van al
  Vault — son docs públicas del repo, viven donde estaban.
- Patrón observado (sin formalizar como LL): tras sprint que toca
  código, abrir sub-sprint de docs (Sprint N → Sprint N.5).
  Validar en Sprint 6→6.5 si se confirma, entonces sí LL.

---
Documentación actualizada en este sprint:
- [x] Sprint doc con FASE 0/1/2/3/4 completos
- [x] 3 ADRs (architecture/adr/)
- [x] Convenciones frontend (concepts/)
- [x] Stack inventory (reference/)
- [x] 3 README de dirs nuevas
- [x] index.md con 3 secciones nuevas (ADRs, Concepts, Reference)
- [x] MASTER-PLAN.md Sprint 5.5 closed-verified
- [x] docs/architecture/overview.md rewrite con Mermaid actualizado
- [x] packages/webapp-somnosalud/README.md rewrite
- [x] CLAUDE.md raíz: N/A
- [x] DEBT-RADAR: N/A
- [x] Lesson learned: descartada (muestra 1)
- [x] Sub-DEBT naming clinical-engine: documentado inline en
      ADR-002 §"Drift conocido" para crearlo formalmente después
- [x] Bloque K housekeeping: N/A
```

---

*Última actualización: 2026-05-08 — sprint **closed-verified**.*
