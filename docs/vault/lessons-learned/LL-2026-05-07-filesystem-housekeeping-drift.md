---
title: "Filesystem housekeeping drift — 5 patrones que rompen la regla del Vault como fuente única"
date: 2026-05-07
tags: [lesson-learned, filesystem, housekeeping, vault, worktrees, gitignore, governance, pampalabs-context]
related:
  - "[[../audits/2026-05-07-vault-filesystem-cleanup/00-README]]"
  - "[[../audits/2026-05-07-vault-filesystem-cleanup/02-hallazgos]]"
  - "[[../processes/SPRINT-CLOSURE-CHECKLIST]]"
  - "[[../processes/AUDITORIA-METODOLOGIA]]"
  - "[[../../../CLAUDE]]"
  - "[[LL-2026-05-04-debt-status-drift-cross-brand-leakage-false-alarm]]"
---

# Lesson Learned — Filesystem housekeeping drift

> [!info] Update post-cleanup 2026-05-07 noche tarde
> Las menciones de `PaulFerrero/somnosalud` en evidencia E1 (§Patrón C) son históricas — fue el remote del primer push del bootstrap (errado por confusión inicial). El repo canónico es `https://github.com/itsomnosalud/Somnosalud` (Private). Migración ejecutada el mismo día con `git remote set-url` + `git push --force`. La lección sobre repos externos anidados sigue aplicando: el problema NO era qué remote, sino que el repo vivía adentro de pampalabs/core.

## TL;DR

**Cuando el filesystem se desordena visiblemente, el problema no es el desorden — es que faltan procesos preventivos en N puntos del workflow.** Audit empírico 2026-05-07 detectó 8 carpetas hermanas `Pampa-Labs-Core-76A/B/B1/C/D/E/G` + 17 archivos sueltos en raíz del repo + 2.6 GB de assets binarios crudos contaminando el Vault. La causa raíz NO fue una sola — fueron **5 patrones independientes** que actuaron en paralelo, cada uno con su propio gap de proceso. Mitigación: 5 reglas/procesos preventivos formalizados (4 reglas en `CLAUDE.md` + 1 Bloque K en `SPRINT-CLOSURE-CHECKLIST`). Sin procesos preventivos, el desorden vuelve solo en cuestión de semanas.

## Contexto

Sesión 2026-05-07 ~22:00 ART. Jorge ve desde Finder en home `~/`:

```
Pampa-Labs-Core/
Pampa-Labs-Core-76A/
Pampa-Labs-Core-76B/
Pampa-Labs-Core-76B1/
Pampa-Labs-Core-76C/
Pampa-Labs-Core-76D/
Pampa-Labs-Core-76E/
Pampa-Labs-Core-76G/
```

Y desde adentro del repo principal, `git status --porcelain` mostraba 17 entradas untracked/modified incluyendo deliverables de cliente (.docx Fonseca), un repo separado anidado (somnosalud-platform/, 97 MB), un duplicado de carpeta marketing, y un tarball intermedio.

Su prompt textual: *"hay muchos frentes abiertos. Y estoy empezando a ver documentos de sprints por cualquier lado. Mira a lo que me refiero. Teníamos un Vault dentro de Pampa Labs conectado a Obsidian que hace que sigamos siempre todo en orden y no haya errores o falta de data al momento de trabajar. Pero si el orden se pierde, comienzan los problemas. Podras revisar esto a fondo por favor así podemos continuar trabajando despues de eso con la SAAS?"*

La intuición de Jorge fue correcta: **el Vault no estaba desordenado** (104 sprints, 31 lessons-learned, 155 DEBTs todos en sus carpetas estandarizadas con frontmatter YAML). Lo desordenado era el filesystem alrededor del Vault.

## Hallazgos empíricos triangulados

Cinco patrones distintos, cada uno con su evidencia E1-E3:

### Patrón A — Worktrees git que se crean para sprints paralelos pero nunca se retiran

**Evidencia:**
- E1 (`git worktree list`): los 7 worktrees `-76A/B/B1/C/D/E/G` registrados oficialmente, todos marcados `prunable` por git
- E2 (`git branch --merged main`): 6 de 7 mergeadas a main + 0 commits únicos sobre main
- E3 (76G `git log main..76g --oneline`): 4 commits cerrados como `code-pending-merge` (Sprint 76.G)

**Causa raíz:** Sesión 2026-05-05 abrió 7 worktrees uno por sprint para que cada Claude Code instance trabajara en branch independiente sin contaminar la rama de Cowork. Después del merge a main, **NO se ejecutó `git worktree remove`** para retirar los worktrees. La FASE 4 del [[../processes/SPRINT-CLOSURE-CHECKLIST]] termina en lessons-learned + session notes + CLAUDE.md update, pero NO incluye housekeeping de filesystem post-merge.

**Mitigación (formalizada hoy):** nuevo Bloque K en `SPRINT-CLOSURE-CHECKLIST` con 3 items: `git worktree remove` + `git branch -d` + verificar `git status` limpio. Y regla #9 nueva en `CLAUDE.md` (POST-MERGE-WORKTREE-CLEANUP).

### Patrón B — Outputs de cliente sin home definido viven en raíz del repo

**Evidencia:**
- E1 (`ls *.docx`): `Informe-Hot-Sale-Fonseca-2026-05-07.docx` (12:28 hoy) + `Manual-WhatsApp-Vendedoras-Fonseca-2026-05-06.docx` (01:40 madrugada)
- E2 (`ls -d clients/`): existe pero sin uso (3.7 MB, no tiene subcarpeta `clients/fonseca/`)
- E3 (`grep -i client .gitignore`): vacío — `clients/` no estaba gitignored

**Causa raíz:** cuando Cowork genera un deliverable, el `cwd` por defecto es la raíz del repo. No hay convención clara de dónde guardarlo, así que termina en raíz y nunca se mueve.

**Mitigación:** convención `clients/<brand>/deliverables-YYYY-MM/` + `clients/` agregado al `.gitignore`. Regla #10 nueva en `CLAUDE.md` (DELIVERABLES-CLIENTE-EN-CLIENTS).

### Patrón C — Repos git separados anidados sin gitignore

**Evidencia:**
- E1 (`cd somnosalud-platform/ && git remote -v`): origin = `https://github.com/PaulFerrero/somnosalud.git` (repo separado)
- E2 (`du -sh somnosalud-platform/`): 97 MB, 1.327 archivos
- E3 (`grep somnosalud .gitignore`): vacío

**Causa raíz:** bootstrap del monorepo SOMNOSALUD con `cwd=~/Pampa-Labs-Core/`. El repo se inicializó con su propio `.git/` y se pushed correctamente a `PaulFerrero/somnosalud`, pero quedó anidado dentro de pampalabs/core. Riesgo grave: si alguien hace `git add somnosalud-platform/` por accidente, se duplica el código del repo cliente dentro de pampalabs/core (drift permanente entre repos).

**Mitigación:** `~/Projects/` reservado para repos git de clientes externos. Regla #11 nueva en `CLAUDE.md` (REPOS-EXTERNOS-EN-PROJECTS). Adicional: gitignore defensivo con `*/.git\n!.git`.

### Patrón D — Drift de naming en Vault Obsidian

**Evidencia:**
- E1 (`ls docs/vault/marketing/`): coexisten `Clínica Fonseca/` (espacios + acento) y `fonseca/` (ASCII-safe lowercase)
- E2 (`comm -12 <(ls "Clínica Fonseca") <(ls fonseca)`): 0 archivos comunes (NO son duplicados)
- E3 (timestamps): `Clínica Fonseca/` creada 2026-04-23 sync inicial Drive, `fonseca/` evolucionó con convención ASCII-safe lowercase

**Causa raíz:** primer sync con Drive de Caro preservó el naming nativo (`Clínica Fonseca`). Convención posterior del Vault adoptó ASCII-safe lowercase. Las dos carpetas convivieron sin conflicto de contenido pero la inconsistencia rompe la convención.

**Mitigación:** rename a `fonseca-source-drive/` (después movido a `clients/fonseca/source-drive/` post-cleanup por bloat 2.6 GB). Regla #12 nueva en `CLAUDE.md` (VAULT-NAMING-ASCII-LOWERCASE).

### Patrón E — Branches git stale acumulan en .git

**Evidencia:**
- E1 (`git branch --no-merged main`): 9-10 branches viejas no mergeadas
- E2 (`git branch | grep CONTAMINATED`): 1 branch explícitamente labelada CONTAMINATED (`chore/cc-sprint-75b-CONTAMINATED-with-75a-2026-05-05`)
- E3 (audit history): el patrón naming `*-CONTAMINATED` es el mismo que Jorge usa para carpetas (`somnosalud-platform-OLD-CONTAMINATED/`) — es un marker explícito de "esto se borra" que se olvida

**Causa raíz:** post-merge, las branches locales no se borran automáticamente. GitHub puede borrar la remota pero la local persiste indefinidamente.

**Mitigación:** Bloque K del `SPRINT-CLOSURE-CHECKLIST` incluye `git branch -d`. Adicional: cron mensual que liste branches con `--no-merged main` con +30 días sin commits → notifica para decisión.

## Pattern meta-aprendizaje — el Vault como fuente única requiere disciplina ANTI-DRIFT múltiple

El Vault Obsidian (`docs/vault/`) es la "fuente única de verdad" del proyecto según [[../../../CLAUDE]]. Pero esa propiedad NO es estática — requiere que el filesystem alrededor del Vault también respete las convenciones, sino el Vault deja de ser fuente única en la práctica:

- Si los deliverables están en raíz, `git status` se llena de noise → la "fuente única" del estado del repo se vuelve ilegible.
- Si los repos externos están anidados, hay riesgo de drift entre dos repos (uno trackeable, otro no) → la "fuente única" se duplica involuntariamente.
- Si los worktrees no se retiran, el filesystem muestra 8 versiones del mismo repo → la noción de "qué versión es la actual" se diluye.
- Si el naming es inconsistente, búsquedas y wikilinks fallan silenciosamente → la "fuente única" pierde discoverability.
- Si las branches stale acumulan, `git branch -a` se llena de ruido → la "fuente única" del estado del workflow se vuelve ilegible.

**Conclusión:** preservar el Vault como fuente única requiere **disciplina housekeeping en 5 puntos del filesystem** (worktrees, deliverables, repos externos, naming, branches). Cada punto necesita su propia regla o proceso preventivo. Si algún punto carece de prevención, el drift vuelve solo.

## Aplicabilidad

Esta lección aplica a:

- **Cualquier monorepo con múltiples productos** (Pampa Labs tiene Kelly + Content Factory + Icao4Pilots + Legal Bot + Secretaria + Marketplace n8n + plus sprints paralelos por producto). El número de worktrees, deliverables, repos externos, branches stale escala con la complejidad.
- **Cualquier setup con Vault Obsidian como SSOT** — la pretensión "single source of truth" requiere disciplina filesystem alrededor.
- **Cualquier workflow con múltiples agentes Claude Code paralelos** — cada uno abre worktrees que no siempre se cierran.

NO aplica a:

- Repos monolíticos sin sprints paralelos (1 worktree, 1 cwd, sin disciplina necesaria).
- Setups sin Vault SSOT (la disciplina del filesystem alrededor es opcional).

## Acciones tomadas hoy 2026-05-07

1. **Audit empírico** documentado en [[../audits/2026-05-07-vault-filesystem-cleanup/00-README]] con 4 docs (README + inventario + hallazgos + plan).
2. **Cleanup ejecutado** vía script `CLEANUP-2026-05-07.sh` (commit `95be8e0`). Resultado: 7 worktrees retirados, repo somnosalud-platform mudado a `~/Projects/`, deliverables Fonseca en `clients/fonseca/`, Vault renombrado, 2.6 GB de assets brutos preservados localmente en zona gitignored.
3. **4 reglas nuevas en `CLAUDE.md`** (#9-12): POST-MERGE-WORKTREE-CLEANUP + DELIVERABLES-CLIENTE-EN-CLIENTS + REPOS-EXTERNOS-EN-PROJECTS + VAULT-NAMING-ASCII-LOWERCASE.
4. **Bloque K en `SPRINT-CLOSURE-CHECKLIST`** — filesystem housekeeping post-merge.
5. **Lessons-learned formal** (este doc).

## Cross-links

- [[../audits/2026-05-07-vault-filesystem-cleanup/00-README]] — audit completo
- [[../audits/2026-05-07-vault-filesystem-cleanup/02-hallazgos]] — análisis detallado de los 5 patrones
- [[../audits/2026-05-07-vault-filesystem-cleanup/03-plan-cleanup]] — plan ejecutable que se aplicó
- [[../processes/SPRINT-CLOSURE-CHECKLIST]] — Bloque K nuevo
- [[../processes/AUDITORIA-METODOLOGIA]] — regla #11 sync post-auditoría aplicada acá
- [[../../../CLAUDE]] — reglas #9-12 nuevas
- [[LL-2026-05-04-debt-status-drift-cross-brand-leakage-false-alarm]] — relacionado: drift de status de DEBTs vs realidad. Ambos son patrones de "el documento dice X pero la realidad es Y".
