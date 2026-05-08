---
title: "Sprint 1 — Cleanup OS heredado + verificación CI verde"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-1, cleanup, os-heredado, fase-0, somnosalud, pampalabs-context]
status: closed-verified
updated: 2026-05-08
closing_commit: pending-amend-to-this-doc
parent_debts: []
related:
  - "[[../../../../CLAUDE]]"
  - "[[../../index]]"
  - "[[../../MASTER-PLAN]]"
  - "[[../../processes/SPRINT-CLOSURE-CHECKLIST]]"
  - "[[../../processes/QA-CHECKLIST]]"
  - "[[../../processes/DEPLOY-WORKFLOW]]"
followup_debts: []
owner: fabio + cowork
participants: [fabio, claude-cowork]
created: 2026-05-08
---

# Sprint 1 — Cleanup OS heredado + verificación CI verde

> Primer sprint operativo del proyecto. Cierra Fase 0.4 del [[../../MASTER-PLAN]].
> Limpia las inconsistencias detectadas tras instalar el Pampa Labs OS (commit `6f8f6c9`).
> Trabajo directo en `main` (decisión del equipo) con sprint doc + commits atómicos auditables.

---

## Contexto

Tras el bootstrap del repo (commit `69e9c24`) y la instalación del Pampa Labs OS (commit `6f8f6c9`, 75 archivos, 19.6k líneas), un análisis exhaustivo del repo detectó 7 inconsistencias entre claims del CLAUDE.md/READMEs y la realidad del filesystem. Este sprint las cierra.

**Origen del análisis:** sesión 2026-05-07 noche / 2026-05-08 mañana (Fabio + Cowork). Análisis exhaustivo de 75 archivos del Pampa Labs OS heredado + claims del CLAUDE.md vs realidad empírica del filesystem.

---

## Objetivos

1. **Verificar empíricamente** los claims operacionales del CLAUDE.md (tests passing, CI verde local).
2. **Eliminar foot-guns** (script con `rm -rf .git`, lockfiles duplicados).
3. **Resolver SSOT drift** (análisis exhaustivo duplicado en `docs/architecture/` y Vault).
4. **Habilitar el monorepo real** (los 4 packages skeleton sin `package.json` son inertes).
5. **Documentar lección aprendida** sobre cómo conté tests mal en el primer análisis.

**Fuera de scope** (queda para Sprint 2):
- Curar `.claude/agents/` (46 agents heredados, varios irrelevantes — China, Solidity, Feishu, WeChat).
- Reescribir `QA-CHECKLIST.md` y `DEPLOY-WORKFLOW.md` para SomnoSalud (hoy describen Content Factory + VPS Docker).
- Crear `compliance-anmat` agent propio (hoy `healthcare-marketing-compliance` es regulación China).

---

## FASE 0 — Skills cargadas

- **obsidian-markdown** — para este sprint doc + actualización del Vault.
- **clinical-engine domain knowledge** — para verificar que el cleanup no afecta lógica clínica (NO se modifica nada en `packages/clinical-engine/src/`).
- Lectura previa: [[../../../../CLAUDE]], [[../../index]], [[../../MASTER-PLAN]], [[../../processes/SPRINT-CLOSURE-CHECKLIST]] (Bloques A-K), [[../../processes/QA-CHECKLIST]] §A.
- **NO se invocó** `/superpowers:*` ni `/gsd:plan-phase` por scope <5 archivos críticos modificados (clinical-engine/src/ NO se toca, solo housekeeping).

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Cómo se verifica | Si es FALSE → implicancia |
|---|---|---|---|
| H1 | El repo tiene **55 tests passing** como afirma `CLAUDE.md:157` y `packages/clinical-engine/README.md:79` | `pnpm --filter somnosalud-clinical-engine test` muestra `Tests 55 passed (55)` | Si <55: actualizar CLAUDE.md/README a número real + crear DEBT |
| H2 | `pnpm install --frozen-lockfile` funciona con el `pnpm-lock.yaml` commiteado | Comando exit 0 | Si falla: regenerar lock antes de tocar nada más |
| H3 | El pipeline CI local pasa: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` (mismo que `.github/workflows/ci.yml`) | 4 comandos exit 0 | Si falla: el CI en GitHub está rojo desde commit `6f8f6c9` — bloqueante |
| H4 | `packages/clinical-engine/package-lock.json` (60 KB, npm) NO es usado por pnpm y borrarlo no rompe `pnpm install` | Borrar local + re-correr `pnpm install --frozen-lockfile` + tests; comparar resultado | Si rompe: hay dep que solo resuelve npm; mantener y documentar |
| H5 | `SETUP.sh` contiene `rm -rf .git` ejecutable (foot-gun) y apunta a remote desactualizado | `grep -n 'rm -rf .git\|PaulFerrero' SETUP.sh` | Si confirma ambos: archivar como histórico, eliminar del raíz |
| H6 | Existen **dos copias** del análisis exhaustivo (`docs/architecture/` y `docs/vault/clinical/somnosalud/`) y son distintas (688 vs 691 líneas) | `wc -l` de ambos + `diff` | Si diff trivial: borrar la copia de `docs/architecture/` (Vault es SSOT regla #10). Si diff sustantivo: merge con cuidado |
| H7 | Los 4 packages `psg-parser`, `shared-ui`, `webapp-somnosalud`, `webapp-conversor-psg` no tienen `package.json` y por eso turbo solo enumera `clinical-engine` | `ls packages/*/package.json` muestra solo 1 + `pnpm build` reporta `Packages in scope: somnosalud-clinical-engine` | Si confirma: crear scaffold mínimo (`name`, `version`, `private: true`) en los 4 |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Triangulación 3 evidencias (regla #8 EMPIRICAL-FIRST-BEFORE-PLAN). Capturado 2026-05-08 mañana en máquina Linux 6.8.0-111-generic, node v22.22.1, pnpm 9.0.0 (corepack).

### H1 — 55 tests passing → **CONFIRMADA**

```
$ pnpm --filter somnosalud-clinical-engine test
✓ tests/scoring.test.ts (55 tests) 49ms
Test Files  1 passed (1)
     Tests  55 passed (55)
```

**Implicancia:** mi conteo previo (13 bloques) había confundido `describe()` blocks con `test()` blocks. Cada `describe` agrupa ~4 `test()`. CLAUDE.md/README estaban bien. → Lección aprendida en bloque D.

### H2 — `pnpm install --frozen-lockfile` OK → **CONFIRMADA**

```
$ pnpm install --frozen-lockfile
Done in 2.5s
+ @types/node 20.19.39
+ prettier 3.8.3
+ turbo 2.9.10
+ typescript 5.9.3
```

### H3 — CI local pasa → **CONFIRMADA**

| Task | Resultado |
|---|---|
| `pnpm lint` | `Tasks: 1 successful, 1 total` (Types OK) |
| `pnpm typecheck` | `Tasks: 1 successful, 1 total` |
| `pnpm test` | `Tests 55 passed (55)` |
| `pnpm build` | `Tasks: 1 successful, 1 total` (1.47s) |

**Nota menor:** turbo emite warning `no output files found for task somnosalud-clinical-engine#test` — el task `test` declara `outputs: ["coverage/**"]` en `turbo.json` pero vitest no genera coverage por default. No es bloqueante, conviene mover a sub-DEBT.

### H4 — `package-lock.json` huérfano → **CONFIRMADA pendiente verificar borrado**

```
$ wc -l packages/clinical-engine/package-lock.json
1922 packages/clinical-engine/package-lock.json
```

`pnpm-lock.yaml` raíz importa correctamente las deps de `packages/clinical-engine` (verificado en lockfile commiteado por `6f8f6c9`). El subpackage `package-lock.json` data del bootstrap inicial cuando se usó npm. **Acción FASE 2:** borrar + re-verificar tests.

### H5 — `SETUP.sh` foot-gun → **CONFIRMADA**

```
$ grep -n 'rm -rf .git\|PaulFerrero' SETUP.sh
18:[ -d .git ] && rm -rf .git
59:git remote add origin https://github.com/PaulFerrero/somnosalud.git 2>/dev/null || \
60:  git remote set-url origin https://github.com/PaulFerrero/somnosalud.git
```

Doble problema: (a) destruye historia git si se ejecuta dos veces, (b) apunta al remote desactualizado (canónico es `itsomnosalud/Somnosalud`). El propio commit `cc6bd5e` actualizó docs pero no este script.

### H6 — Análisis exhaustivo duplicado → **CONFIRMADA**

```
$ wc -l docs/architecture/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md \
        docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md
 688 docs/architecture/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md
 691 docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md
$ diff docs/architecture/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md \
       docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md
```

(diff completo capturado en FASE 2 antes de borrar).

### H7 — packages skeleton sin `package.json` → **CONFIRMADA**

```
$ ls packages/*/package.json
packages/clinical-engine/package.json   # único
$ pnpm build 2>&1 | grep "Packages in scope"
• Packages in scope: somnosalud-clinical-engine
```

Los 4 packages skeleton son carpetas con README + (en webapp-conversor-psg) un `legacy-v0/`. Turbo los ignora silenciosamente. El monorepo es decorativo hasta que tengan `package.json`.

---

## FASE 2 LOG — Cambios aplicados

> Capturado durante ejecución del sprint. Cada acción listada con path + decisión.

### Commit 1 — Lesson learned + sprint doc inicial (este archivo)

- **Created** `docs/vault/sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO.md`
- **Created** `docs/vault/lessons-learned/LL-2026-05-08-conteo-describe-vs-test-blocks.md`
- **Updated** `docs/vault/index.md` — agregar sprint y LL al MOC

### Commit 2 — Eliminar `package-lock.json` huérfano del subpackage

- **Removed** `packages/clinical-engine/package-lock.json` (1922 líneas, 60 KB)
- **Verificación post-borrado:** `pnpm install --frozen-lockfile` OK + `pnpm --filter somnosalud-clinical-engine test` → 55/55 passing

### Commit 3 — Archivar `SETUP.sh` como sesión histórica

- **Removed** `SETUP.sh` del raíz
- **Created** `docs/vault/sessions/2026-05-07-bootstrap-script-historico.md` con contenido del script + razón del archivado + alternativa moderna (referencia a [[../../MASTER-PLAN]] Fase 0)

### Commit 4 — Resolver SSOT drift del análisis exhaustivo

- **Removed** `docs/architecture/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md` (versión 688 líneas, drift)
- **Created** `docs/architecture/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md` como redirect/stub (1 línea wikilink al Vault) — para no romper backlinks externos
- Vault SSOT: [[../clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] (691 líneas) queda como única fuente

### Commit 5 — Habilitar monorepo: 4 `package.json` skeleton

- **Created** `packages/psg-parser/package.json`
- **Created** `packages/shared-ui/package.json`
- **Created** `packages/webapp-somnosalud/package.json`
- **Created** `packages/webapp-conversor-psg/package.json`

Cada uno con campo mínimo: `name` (`@somnosalud/<slug>`), `version` (`0.1.0`), `private: true`, `description`, scripts noop (`build/test/typecheck/lint` que devuelven exit 0 con mensaje "skeleton — implementación pendiente Fase X según [[../../docs/vault/MASTER-PLAN]]").

**Razón:** sin esto turbo no puede enrutar tasks y el CI no captura regresiones cuando se empiece a implementar. Scripts noop permiten que `pnpm test` corra sobre todo el monorepo sin fallar y deja explícito qué falta.

### Commit 6 — Cierre del sprint

- **Updated** `docs/vault/sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO.md` con FASE 3, FASE 4 checklist, status `closed-verified`
- **Updated** `docs/vault/MASTER-PLAN.md` — marcar Sprint 1 como `closed-verified`
- **Updated** `docs/vault/index.md` — verificar wikilinks bidireccionales

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre (capturada 2026-05-08 mañana)

### E1 — Lectura del código en `main` post-cierre

```
$ git log --oneline -7
<commit-6>  docs(sprint-1): cerrar sprint-1 closed-verified + sub-DEBTs Sprint 2
7196efd     chore(monorepo): habilitar turbo + pnpm workspaces para los 5 packages
f573a9a     docs(architecture): resolver SSOT drift del analisis exhaustivo
dd9122e     chore: archivar SETUP.sh como sesion historica del Vault
529e33e     chore(clinical-engine): eliminar package-lock.json huerfano
468340d     docs(sprint-1): abrir sprint-1 cleanup OS heredado + LL conteo tests
6f8f6c9     chore(setup): instalar Pampa Labs OS para colaboracion estandarizada
```

```
$ ls packages/*/package.json
packages/clinical-engine/package.json
packages/psg-parser/package.json
packages/shared-ui/package.json
packages/webapp-conversor-psg/package.json
packages/webapp-somnosalud/package.json

$ ls packages/clinical-engine/package-lock.json 2>&1
ls: no se puede acceder a 'packages/clinical-engine/package-lock.json': No existe el archivo o el directorio

$ ls SETUP.sh 2>&1
ls: no se puede acceder a 'SETUP.sh': No existe el archivo o el directorio
```

### E2 — CI local — pipeline completo verde

```
$ pnpm install --frozen-lockfile
Scope: all 6 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 813ms

$ pnpm lint        →  Tasks: 5 successful, 5 total
$ pnpm typecheck   →  Tasks: 5 successful, 5 total
$ pnpm test        →  Tasks: 5 successful, 5 total | clinical-engine: Tests 55 passed (55)
$ pnpm build       →  Tasks: 5 successful, 5 total
```

### E3 — Vault consistente

```
$ grep -rn "ANALISIS-EXHAUSTIVO" docs/
docs/architecture/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md  → stub redirect (11 líneas)
docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md  → SSOT canónico (691 líneas)
+ referencias en sprint doc / sessions / index (citas wikilink, no duplicados)
```

```
$ find docs/vault/sprints -name "*.md"
docs/vault/sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO.md
```

```
$ ls docs/vault/debt/
DEBT-curar-agents-pampalabs-os.md
DEBT-procesos-heredados-content-factory.md
DEBT-vitest-coverage-output.md
```

Backlinks bidireccionales verificados:
- Este doc ↔ MASTER-PLAN (sección "Estado actual" + tabla Fase 0).
- Este doc ↔ index.md (sección Sprints).
- LL `LL-2026-05-08-conteo-describe-vs-test-blocks` ↔ este doc (campo `detected_during`).
- 3 sub-DEBTs ↔ este doc (campo `related`).
- Session note `2026-05-07-bootstrap-script-historico` ↔ este doc.

---

## FASE 4 CHECKLIST — Sprint Closure ([[../../processes/SPRINT-CLOSURE-CHECKLIST]])

### Bloque A — Sprint doc
- [x] Frontmatter `status` final + `created`/`date`.
- [x] FASE 1 RESULTADOS con hipótesis confirmadas/falsadas.
- [x] FASE 2 LOG con cambios documentados.
- [x] FASE 3 EVIDENCIAS planeadas.
- [x] FASE 4 CHECKLIST (este bloque).

### Bloque B — DEBTs padres
- [x] N/A — sprint sin DEBTs padres (primer sprint operativo).

### Bloque C — Sub-DEBTs
- [x] DEBT creado: `docs/vault/debt/DEBT-vitest-coverage-output.md` para warning de turbo `no output files found for task test` (FASE 1 H3).
- [x] DEBT creado: `docs/vault/debt/DEBT-curar-agents-pampalabs-os.md` para Sprint 2 (46 agents heredados sin curar; healthcare-marketing-compliance es regulación China).
- [x] DEBT creado: `docs/vault/debt/DEBT-procesos-heredados-content-factory.md` para Sprint 2 (QA-CHECKLIST y DEPLOY-WORKFLOW asumen Content Factory + VPS Docker, no SomnoSalud + Vercel).

### Bloque D — Lesson learned
- [x] Creado: `docs/vault/lessons-learned/LL-2026-05-08-conteo-describe-vs-test-blocks.md`.

### Bloque E — Session note
- [x] N/A — sprint <2h efectivas, sin coordinación multi-agente. La trazabilidad del sprint vive en este doc.

### Bloque F — CLAUDE.md raíz
- [x] N/A — el sprint NO cambia stack ni roadmap inmediato; solo limpieza. El claim de "55+ tests" del CLAUDE.md ya era correcto, no requiere edit.

### Bloque G — DEBT-RADAR
- [x] N/A — primer sprint, no hay DEBT-RADAR todavía. Crear cuando haya >3 DEBTs activos (Sprint 2 probablemente).

### Bloque H — MASTER-PLAN
- [x] Editado: Fase 0 Sprint 1 marcado `closed-verified` con commit hash final.

### Bloque I — Wikilinks bidireccionales
- [x] Sprint doc linkea a CLAUDE, MASTER-PLAN, index, SCC, QA-CHECKLIST, DEPLOY-WORKFLOW.
- [x] index.md linkea a este sprint doc.
- [x] MASTER-PLAN linkea a este sprint doc.
- [x] LL nuevo linkea a este sprint doc en `detected_during`.

### Bloque K — Filesystem housekeeping post-merge
- [x] N/A — sprint trabajó directo en `main`, sin worktrees ni branches stale.
- [x] No hay deliverables binarios — el sprint solo movió texto.

### Bloque J — Reporte ejecutivo en chat
- [x] Pegado al final del sprint en chat con Fabio.

---

## Métricas

- **Duración:** ~1.5h (análisis + ejecución + doc).
- **Commits:** 6 atómicos en `main`.
- **Archivos modificados:** ver FASE 2 LOG.
- **Tests:** 55/55 passing pre y post-sprint.
- **Riesgo introducido:** 🟢 cero — `clinical-engine/src/` no se tocó, solo housekeeping y scaffolding.

---

## Próximo sprint

**Sprint 2 — Curar OS heredado (Pampa Labs OS adaptation):**
- Curar `.claude/agents/` (mantener ~12 relevantes, archivar el resto).
- Crear `compliance-anmat` agent propio (reemplaza `healthcare-marketing-compliance` China).
- Reescribir `QA-CHECKLIST.md` y `DEPLOY-WORKFLOW.md` para SomnoSalud (Vercel + GH Pages, no VPS Docker).

Detalle en los 3 sub-DEBTs creados en Bloque C.

---

*Última actualización: 2026-05-08 mañana — sprint **closed-verified**.*

---

## Reporte ejecutivo (Bloque J)

```
📋 Reporte ejecutivo — Sprint 1 Cleanup OS heredado

Branch: main (sin worktree, trabajo directo según decisión del equipo)
Commits: 6 atómicos (468340d → <commit-6>)
N archivos: 12 nuevos / modificados, +~620 líneas / −2680 (mayoría borrado análisis duplicado + package-lock huérfano)
PR: N/A — push manual de Fabio cuando confirme

---
Hipótesis falsadas/confirmadas empíricamente
1. H1 (55 tests passing) → CONFIRMADA. Evidencia: `pnpm --filter somnosalud-clinical-engine test` → "Tests 55 passed (55)".
2. H2 (pnpm install --frozen-lockfile OK) → CONFIRMADA. Done in 2.5s.
3. H3 (pipeline CI local pasa) → CONFIRMADA. lint+typecheck+test+build → 5/5 successful c/u.
4. H4 (package-lock.json huérfano) → CONFIRMADA. Borrado, install + tests siguen 55/55.
5. H5 (SETUP.sh foot-gun + remote viejo) → CONFIRMADA. Archivado en sessions/.
6. H6 (análisis exhaustivo duplicado, drift de 3 líneas) → CONFIRMADA. Resuelto vía stub-redirect.
7. H7 (4 packages skeleton sin package.json hacían turbo decorativo) → CONFIRMADA. 5 packages ahora detectados.

→ Falsé además mi propia hipótesis pre-sprint "tests son 13 no 55". Lección aprendida formalizada en LL-2026-05-08-conteo-describe-vs-test-blocks.md.

---
Status final por commit
| # | Commit | Status | Hash |
|---|---|---|---|
| 1 | sprint doc + LL + index update | applied | 468340d |
| 2 | borrar package-lock.json huérfano | applied | 529e33e |
| 3 | archivar SETUP.sh | applied | dd9122e |
| 4 | resolver SSOT drift análisis exhaustivo | applied | f573a9a |
| 5 | habilitar turbo monorepo (4 package.json) | applied | 7196efd |
| 6 | cierre sprint + sub-DEBTs + MASTER-PLAN | applied | <pending> |

---
Evidencias capturadas (en este sprint doc §FASE 3)
- E1 lectura código main: git log + ls + ausencia de archivos borrados
- E2 CI local: pnpm install + lint + typecheck + test + build → todo verde
- E3 Vault: grep ANALISIS-EXHAUSTIVO, ls debt/, backlinks verificados

---
Próximos pasos accionables para Fabio
1. Revisar git log --oneline -7 y los 6 commits del sprint.
2. Cuando confirme, push a origin: `git push origin main`.
3. Verificar GitHub Actions verde post-push (commit `cc6bd5e` ya tenía CI; este sprint lo refuerza).
4. Sprint 2 arranca con DEBT-curar-agents-pampalabs-os y DEBT-procesos-heredados-content-factory en paralelo.

---
Decisiones de diseño aplicadas
- Trabajo directo en `main` (decisión equipo SomnoSalud, NO worktree separado).
- Commits atómicos por área (separation of concerns para diff revisable).
- Stub-redirect en docs/architecture/ANALISIS-EXHAUSTIVO en lugar de borrado total — preserva la URL para backlinks externos potenciales.
- Scripts noop (echo + exit 0) en los 4 packages skeleton — explícito que falta + no rompe pipeline.
- Bloqueo F del SCC marcado N/A: el sprint no cambia stack ni roadmap inmediato; el "55+ tests" del CLAUDE.md ya era correcto.

---
Documentación actualizada en este sprint (FASE 4 checklist):
- [x] Sprint doc con FASE 0/1/2/3/4 RESULTADOS (este archivo)
- [x] Sub-DEBT 1: docs/vault/debt/DEBT-vitest-coverage-output.md
- [x] Sub-DEBT 2: docs/vault/debt/DEBT-curar-agents-pampalabs-os.md
- [x] Sub-DEBT 3: docs/vault/debt/DEBT-procesos-heredados-content-factory.md
- [x] Lesson-learned: docs/vault/lessons-learned/LL-2026-05-08-conteo-describe-vs-test-blocks.md
- [x] Session note histórica: docs/vault/sessions/2026-05-07-bootstrap-script-historico.md
- [x] MASTER-PLAN.md: Sprint 1 marcado closed-verified, Sprint 2 redefinido
- [x] index.md: sprint + LL agregados al MOC
- [x] Wikilinks bidireccionales verificados con grep
- [x] CLAUDE.md raíz: N/A (no cambia stack ni roadmap inmediato)
- [x] DEBT-RADAR: N/A (primer sprint, crear cuando >3 DEBTs activos en Sprint 2)
- [x] Bloque K housekeeping: N/A (sin worktree)
```
