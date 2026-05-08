---
title: Loop de 7 Pasos — Criterios de Cierre de Batch
tags: [process, workflow, loop, batch-closure, canonical, pampa-labs]
status: current
owner: jorge
created: 2026-04-19
updated: 2026-04-19
related:
  - "[[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]"
  - "[[GSD-WORKFLOW]]"
  - "[[OBSIDIAN-VAULT-CONVENTIONS]]"
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[DEPLOY-WORKFLOW]]"
  - "[[VAULT-PUBLISH]]"
  - "[[MASTER-PLAN]]"
  - "[[ROADMAP]]"
---

# Loop de 7 Pasos — Criterios de Cierre de Batch

> [!info] Propósito
> Todo batch cierra con los 7 pasos. Si uno falta, el batch **no está cerrado** — no importa cuánto código se escribió. Este doc formaliza el workflow canónico de Jorge: Claude Code ejecuta pasos 1-5 en Mac local, Jorge ejecuta pasos 6-7 en VPS + verify empírico desde Claude web. Origen empírico: sprint-cierre-tiendanube-definitivo (FASE A + FASE B BATCH 1/2/3, 2026-04-19).

## Los 7 pasos

| # | Paso | Quién ejecuta | Output esperado | Herramientas |
|---|------|---------------|-----------------|--------------|
| 1 | Código/edits local | Claude Code | Archivos modificados (structural subtyping, narrow interfaces, zero antipatterns introducidos) | Edit, Write, MultiEdit |
| 2 | Verify gates (tests + coverage + build + typecheck + grep residual + grep antipatterns) | Claude Code | TODOS limpios. Outputs literales guardados a `/tmp/batchN-*.log` | Bash (`npm test`, `npm run build`, `npm run typecheck`, Grep) |
| 3 | Docs Obsidian completos | Claude Code | LOG-BATCH (11 secciones según [[OBSIDIAN-VAULT-CONVENTIONS]]) + concepts + updates bidireccionales + ROADMAP + sprint README | Write, Edit (`docs/vault/`) |
| 4 | Commits atómicos | Claude Code | Mínimo 1 commit, máximo 7 por batch. Staging explícito (NUNCA `git add -A`). Messages imperativos multi-línea | Bash (`git add`, `git commit`) |
| 5 | `git push origin main` DESDE MAC | Claude Code | Output con hashes `<prev>..<new>  main -> main` | Bash (`git push`) |
| 6 | Rebuild vault VPS + rsync | **Jorge** | Quartz parses N files + rsync OK | SSH (Claude Code no tiene SSH) |
| 7 | Verify empírico fetch URLs nuevas + grep | **Jorge** | Todas 200 + substrings esperados | `curl` + `grep` desde Claude web |

## Criterio "batch cerrado"

> [!SUCCESS] Condición de cierre (exacta, no negociable)
> Los **7 pasos** completados **+** Jorge confirma explícitamente **GO al siguiente batch**. Hasta que no suceda la confirmación explícita de Jorge post-paso 7, el batch queda en `ready-for-verify` — nunca en `closed-verified`.

Este criterio alinea con [[AUDITORIA-METODOLOGIA]] **Regla #12** (triangulación de 3 signals antes de tags `closed`): paso 2 provee Signal 1 (log literal de tests + build + typecheck), paso 7 provee Signal 2 (query empírica vía `curl` + `grep` contra el vault publicado), y la confirmación explícita de Jorge provee Signal 3 (firma humana del estado del sistema). Sin los 3, el batch NO cierra.

## Criterios "PARÁ"

1. Cualquier paso 1-5 falla (tests rojos, build fail, typecheck errors, grep residual no-vacío, grep antipatterns introducidos, push rechazado).
2. Verify empírico de Jorge detecta inconsistencia (URL 404, substring faltante, wikilink roto en el vault publicado).
3. Ambigüedad irresoluble con skills + `pampalabs-context` + contexto del prompt.
4. Hallazgo empírico que cambia el diagnóstico del batch (ej: adapter legacy en BATCH 3 resultó ser canónico OAuth — ver [[LOG-BATCH-FASE-B-3]] section "Cambios de diagnóstico durante el sprint").
5. Migration SQL encuentra duplicados inesperados en pre-flight check.
6. Caller externo al monorepo identificado via grep (out of scope).
7. ORPHAN state en inventario dual-state (requiere decisión manual).

## Loop roto — qué pasó históricamente

### FASE A — push desde VPS devolvió "Everything up-to-date"

Los commits existían solo en Mac local. `ssh root@VPS && git push origin main` retornó `Everything up-to-date` porque el VPS veía **sus propios commits sincronizados**, no los locales del Mac. El loop quedó silenciosamente roto — no había error, pero el remote nunca recibió los commits nuevos.

**Fix:** regla permanente "push SIEMPRE desde Mac, nunca desde VPS". El VPS solo hace `git pull origin main` (paso 6). Ver [[LOG-BATCH-FASE-A]] section "Obstáculos encontrados y cómo se resolvieron".

### FASE B BATCH 3 — `as unknown as` detectado pre-existente post-grep

El grep antipatterns del Paso 6.F detectó 4 casts `as unknown as` en archivos tocados. Verificación via `git diff HEAD` confirmó que **ninguno fue introducido por BATCH 3** (pre-existen a los 5 commits del batch: `brand-integrations.service.ts:214`, `crosssell.service.ts:251`, `admin.routes.ts:12`, `admin.routes.ts:343`).

En vez de hacer "TODO después" (antipattern), se creó [[DEBT-preexisting-as-unknown-as-casts]] con scope empírico COMPLETO (paths + líneas + rationale per archivo). El batch cerró limpio. Ver [[LOG-BATCH-FASE-B-3]] section "Grep antipatterns".

### FASE B BATCH 3 — Claude Code frenó ante ambigüedad del adapter legacy

La spec original decía "deprecar adapter `brand-integrations.service.ts::getIntegration()`". Claude Code grepeó callers, encontró que el adapter es **canónico OAuth multi-plataforma** con 10+ callers (Meta, Google, TikTok, Tiendanube) — no legacy. PARÁ + reportó 3 opciones A/B/C a Jorge antes de improvisar:

1. Deprecar adapter completo (spec literal) — fuera de scope
2. Deprecar solo path tiendanube — innecesario
3. **Coexistencia formal** (elegida) — adapter = OAuth genérico, service nuevo = ecom-specific

Jorge eligió Opción A (coexistencia). Zero DEBT adicional. Ver [[LOG-BATCH-FASE-B-3]] section "Cambios de diagnóstico durante el sprint".

### FASE B BATCH 2 — 3 desviaciones aprobadas antes del commit

BATCH 2 (`getEcommerceCredentials` service) encontró 3 desviaciones del plan original que requerían decisión antes de proceder: narrow interface `EcomCredentialsDbClient` con structural subtyping (vs doble cast banned), real pino logger con destination capture en tests (vs `mockLogger as Logger` banned), e instalación de `@vitest/coverage-v8` como devDep legítima (no estaba instalado — enabler del requisito 100% coverage, no workaround). Cada desviación se documentó con Problema + Alternativas evaluadas + Decisión + Rationale en el LOG-BATCH **antes** del commit. Ver [[LOG-BATCH-FASE-B-2]] section "Decisiones tomadas". Ese patrón (desviación documentada antes del commit, no después) es el estándar — no "pedir perdón en el LOG retroactivo".

## Pasos 6 y 7 — Jorge ejecuta

### Paso 6 — Rebuild VPS

Comando literal canónico (una sola línea SSH):

```bash
ssh root@82.29.61.151 'cd /root/vault-site && rm -rf public && git -C /root/Pampa-Labs-Core pull origin main && npx quartz build 2>&1 | tail -5 && rsync -av --delete /root/vault-site/public/ /var/www/vault.pampalabs.com/ | tail -3'
```

**Expected output:**
- `git pull` lista los commits nuevos pusheados en paso 5
- Quartz build exit 0 + línea final `Parsed N files`
- rsync OK (últimas 3 líneas sin errors)

### Paso 7 — Verify empírico

Jorge ejecuta fetch + grep desde Claude web. Por cada URL nueva publicada en el batch:

```bash
VAULT_USER="claude"
curl -s -u "$VAULT_USER:$VAULT_PASS" https://vault.pampalabs.com/<slug> | grep -c "<substring-esperado>"
```

**Criterio:** ≥1 match por URL. Si ≥1 URL falla → **PARÁ** (loop roto). Si todas OK → **GO siguiente batch** (Jorge confirma explícitamente).

Ejemplo real de FASE A:

```bash
curl -s -u "$VAULT_USER:$VAULT_PASS" https://vault.pampalabs.com/processes/AUDITORIA-METODOLOGIA | grep -c "Regla #12"
# Output: 1
```

Ver [[LOG-BATCH-FASE-A]] section "Evidencia empírica" para el set completo de 5 fetches que cerraron FASE A.

## Integración con Superpowers

Distribución de pasos cuando se paraleliza con [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]:

- **Paso 1 (código):** paralelizable via fan-out si >3 archivos independientes. Ver [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]] para el pattern de subagent dispatch.
- **Paso 2 (verify gates):** **secuencial** (outputs dependientes — typecheck tras build, coverage tras tests).
- **Paso 3 (docs):** paralelizable para concepts nuevos (un subagente por concept). LOG-BATCH + ROADMAP + sprint README secuencial (reflejan estado post fan-in — los concepts tienen que existir primero).
- **Paso 4 (commits):** **SECUENCIAL SIEMPRE**. Un solo agente principal hace staging + commit. Subagentes NUNCA commitean — su output se integra a la working tree del orquestador.
- **Paso 5 (push):** secuencial tras commit final.
- **Pasos 6-7:** fuera del scope de Claude Code (Jorge ejecuta SSH + fetch).

## Reglas operativas

1. **`git add -A` BANNED.** Puede incluir `.env`, credentials, `.obsidian/workspace.json` heredado. Siempre staging explícito por archivo/carpeta tocada por el batch.
2. **Commits mensajes imperativos multi-línea** (header + body con bullets). Nunca mensaje single-line para batches — el reader del historial necesita contexto para entender el scope.
3. **Paso 3 (docs) NO es opcional.** El batch no cierra sin documentación completa. LOG-BATCH con las 11 secciones canónicas, concepts con frontmatter YAML + wikilinks bidireccionales, ROADMAP actualizado, sprint README refleja estado post-batch.
4. **Paso 7 (verify empírico) es FIRMA de Jorge — no se reinterpreta.** Si Jorge dice "fallo en X", el batch queda `ready-for-verify` hasta fix + re-verify. Claude Code no decide si el batch está cerrado — Jorge sí.

## Qué evitar

1. **Decir "batch cerrado" antes del paso 7 de Jorge.** Incluso con pasos 1-5 limpios + paso 6 ejecutado, el batch es `ready-for-verify` hasta que Jorge confirme explícitamente.
2. **Mezclar batches en un commit.** Commits atómicos por tarea lógica — si BATCH 3 toca service + migration + tests, son 3 commits mínimo (o 1 por scope coherente según tamaño).
3. **Reportar sin outputs literales.** Jorge no verifica narrativas ("los tests pasaron OK"), verifica outputs (`Tests  99 passed (99)` literal + exit code).
4. **Paso 4 incluyendo archivos no tocados por el batch.** El `.obsidian/workspace.json` heredado es un caso común — excluir explícitamente del staging. Usar `git status` + `git diff --stat` antes del `git add` para ver qué se va a commitear.
5. **`git push` desde VPS** — histórico roto en FASE A (Everything up-to-date silencioso). Push SIEMPRE desde Mac.

## Origen empírico

Este doc formaliza empíricamente el workflow aplicado en el sprint-cierre-tiendanube-definitivo (2026-04-19), que produjo 4 batches (FASE A + FASE B BATCH 1/2/3) con el mismo loop. Cada batch dejó su LOG-BATCH como fuente de verdad del estado + decisiones + desviaciones + evidencia empírica. Antes de este doc el loop era tácito — vivía en la memoria de Jorge y en los LOG-BATCH post-hoc. La formalización aquí hace explícitas las reglas que ya se venían aplicando para que nuevos agentes (humanos o Claude Code) puedan reproducirlas sin reinventar criterios.

## Relacionados

- [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]] — fan-out/fan-in de subagentes para pasos 1 y 3
- [[GSD-WORKFLOW]] — planificación de batches y milestones
- [[OBSIDIAN-VAULT-CONVENTIONS]] — 11 secciones canónicas del LOG-BATCH + frontmatter YAML
- [[AUDITORIA-METODOLOGIA]] — Regla #12 (empirical verification triangulada — aplicable al paso 7)
- [[DEPLOY-WORKFLOW]] — §C hotfix lifecycle + Paso 4.5 schema checkpoint (análogo empírico para deploy)
- [[VAULT-PUBLISH]] — mecánica de publicación Quartz + rsync (paso 6)
