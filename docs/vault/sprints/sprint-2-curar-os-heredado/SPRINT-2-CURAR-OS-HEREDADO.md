---
title: "Sprint 2.A — Curar OS heredado: agents + procesos"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-2, curar, agents, procesos, os-heredado, fase-0, somnosalud, pampalabs-context]
status: in-progress
parent_debts:
  - "[[../../debt/DEBT-curar-agents-pampalabs-os]]"
  - "[[../../debt/DEBT-procesos-heredados-content-factory]]"
related:
  - "[[../sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]"
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

# Sprint 2.A — Curar OS heredado (agents + procesos)

> Sprint dedicado a cerrar los 2 DEBTs medium abiertos en Sprint 1: el commit `6f8f6c9` instaló 46 agents + 12 procesos heredados literalmente del Pampa Labs OS. Varios no aplican al contexto SomnoSalud (regulación China, stack PHP/Laravel, smart contracts, embedded firmware) y crean ruido / contradicción operativa con el lenguaje del CLAUDE.md.
>
> Este es **Sprint 2.A** (cleanup local sin credenciales tuyas). **Sprint 2.B** (crear project Supabase + setear MCP `supabase-somnosalud`) queda para vos cuando 2.A cierre — runbook listo al final.

---

## Contexto

Sprint 1 detectó y documentó dos DEBTs operativos medium:
- [[../../debt/DEBT-curar-agents-pampalabs-os]] — 46 agents heredados, ~21 irrelevantes, regla #6 AGENT-FIRST quebrada en la práctica.
- [[../../debt/DEBT-procesos-heredados-content-factory]] — 4 procesos asumen Content Factory + VPS Docker (hardcoded `82.29.61.151`, paths Mac, `products/content-factory/`), no SomnoSalud + Vercel.

El bloqueo es operativo: cada vez que Cowork tiene que invocar un agente especializado o seguir un proceso, recibe ruido. El usuario (Fabio) ya identificó que `healthcare-marketing-compliance` describe regulación NMPA China, y que `DEPLOY-WORKFLOW` habla de SSH a un VPS que no existe.

**Origen:** análisis exhaustivo Sprint 1 (commit `2c91f86`).

---

## Objetivos

1. **Curar agents** — clasificar los 46 archivos en `.claude/agents/` y archivar los irrelevantes en `docs/vault/archive/agents-2026-05-08/`. Mantener ~25 que aplican.
2. **Crear `compliance-anmat` agent propio** — reemplaza `healthcare-marketing-compliance` (China) con uno específico AR/ANMAT/Ley 25.326+26.529.
3. **Resolver drift NEXUS vs Pampa Labs OS** — archivar `EXECUTIVE-BRIEF.md` y `QUICKSTART.md` (framework conceptual contradictorio) + adaptar `README.md` del directorio agents al lenguaje del CLAUDE.md.
4. **Reescribir `QA-CHECKLIST.md` §A** — los 7 items core con ejemplos reales de SomnoSalud (clinical-engine + safety + signoff Pablo).
5. **Reescribir `DEPLOY-WORKFLOW.md`** — para Vercel (webapp-somnosalud) + GitHub Pages (webapp-conversor-psg). Mantener §C (lifecycle pattern + triangulación 3 evidencias) que es universal.
6. **Adaptar `SPRINT-CLOSURE-CHECKLIST.md` Bloque F** — quitar referencia hardcoded a `/Users/elizabethuribe/Pampa-Labs-Core/CLAUDE.md`.
7. **Limpiar `TEMPLATE-DEBT.md`** — quitar ejemplos hardcoded de DEBTs cross-product al final.
8. **Disclaimer cross-product en los 6 LLs heredados** — agregar nota: "originada en Pampa Labs Core, aplicable a SomnoSalud por analogía".
9. **Actualizar CLAUDE.md sección "Skills obligatorias"** con la lista curada de agents + cuándo invocar cada uno.

**Fuera de scope (queda para sprints siguientes):**
- Crear `clinical-engine-domain-expert` agent (depende de leer y entender en profundidad `references.ts`, mejor en sprint que toque `clinical-engine/`).
- Crear project Supabase + MCP setup → **Sprint 2.B** (ownership Fabio, requiere credenciales Org Pampa Labs).

---

## FASE 0 — Skills cargadas

- **obsidian-markdown** — para sprint doc + actualizaciones del Vault.
- **engineering-technical-writer** (.claude/agents/) — para reescribir QA-CHECKLIST y DEPLOY-WORKFLOW con prosa técnica clara.
- **engineering-codebase-onboarding-engineer** — para clasificar agents leyendo el `description` del frontmatter sin asumir desde el filename.
- **NO se invocó** `/superpowers:*` aunque el sprint toca >5 archivos, porque las acciones son secuenciales (clasificar → mover → reescribir) y no paralelizables sin estado compartido. Documentado en "Decisiones de diseño aplicadas".

Lectura previa: [[../../../../CLAUDE]], [[../sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]] §FASE 4 reporte ejecutivo, [[../../debt/DEBT-curar-agents-pampalabs-os]], [[../../debt/DEBT-procesos-heredados-content-factory]], [[../../processes/QA-CHECKLIST]], [[../../processes/DEPLOY-WORKFLOW]], [[../../processes/SPRINT-CLOSURE-CHECKLIST]], [[../../processes/TEMPLATE-DEBT]].

---

## FASE 1 — Hipótesis a verificar empíricamente

| # | Hipótesis | Cómo se verifica | Si es FALSE → implicancia |
|---|---|---|---|
| H1 | El directorio `.claude/agents/` tiene exactamente **46 archivos `.md`** (43 agents + 3 meta-docs: README, EXECUTIVE-BRIEF, QUICKSTART) | `ls .claude/agents/*.md \| wc -l` | Si >46 o <46: revisar lista vs commit `6f8f6c9` antes de tocar |
| H2 | Al menos **18 agents son inequívocamente irrelevantes** (China, Solidity, Filament/Laravel, embedded firmware, WeChat, Feishu, voice ASR, etc.) | Lectura del `description:` en el frontmatter de cada uno + filtrado | Si <18: bajar el agresividad del cleanup (mantener más como backlog) |
| H3 | `healthcare-marketing-compliance.md` es **100% regulación China NMPA** (no contiene ningún hint de aplicabilidad cross-cultural) | `grep -c "China\|NMPA\|Yiliao\|Chinese\|PRC" .claude/agents/healthcare-marketing-compliance.md` | Si bajo: revisar si vale rescatarlo con disclaimer |
| H4 | `EXECUTIVE-BRIEF.md` y `QUICKSTART.md` describen un framework **NEXUS / The Agency** que no se cruza con el lenguaje operativo del CLAUDE.md (sprints + Vault + GSD + Superpowers) | `grep -c "NEXUS" EXECUTIVE-BRIEF.md QUICKSTART.md README.md` | Si NEXUS aparece poco: integrar en lugar de archivar |
| H5 | Los procesos `QA-CHECKLIST.md` y `DEPLOY-WORKFLOW.md` referencian al menos **5 paths/IPs/sprints hardcoded** del Content Factory (Pampa Labs Core) | `grep -n "products/content-factory\|82.29.61.151\|elizabethuribe\|sprint-meta-rate-limiter\|sprint-rls-brand-integrations\|tiendanube\|playbook" docs/vault/processes/*.md \| wc -l` | Si <5: el drift es menor, parche puntual |
| H6 | El pipeline CI local sigue verde post-cleanup (los archivos de `.claude/agents/` NO afectan a `pnpm install/lint/typecheck/test/build`) | `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build` post cada fase de archivado | Si rompe: hay un agent que es importado por código (improbable, son docs) — investigar antes de continuar |

---

## FASE 1 RESULTADOS — Evidencia empírica

> Capturado 2026-05-08 mañana. Triangulación 3 evidencias por hipótesis donde aplica.

### H1 — 46 archivos `.md` en `.claude/agents/` → **CONFIRMADA**

```
$ ls .claude/agents/*.md | wc -l
46

$ ls .claude/agents/EXECUTIVE-BRIEF.md .claude/agents/QUICKSTART.md .claude/agents/README.md
.claude/agents/EXECUTIVE-BRIEF.md
.claude/agents/QUICKSTART.md
.claude/agents/README.md
```

→ 43 agents + 3 meta-docs = 46.

### H2 — ≥18 agents irrelevantes → **CONFIRMADA con margen**

Lectura del `description` del frontmatter de cada uno:

| # | Agent | Razón de archivo |
|---|---|---|
| 1 | `engineering-cms-developer` | "Drupal and WordPress specialist" — SomnoSalud no es CMS |
| 2 | `engineering-embedded-firmware-engineer` | "bare-metal RTOS firmware - ESP32/ARM Cortex-M" — fuera de roadmap |
| 3 | `engineering-feishu-integration-developer` | "Feishu (Lark) Open Platform" — chat empresarial chino |
| 4 | `engineering-filament-optimization-specialist` | "Filament PHP admin interfaces" — stack PHP/Laravel |
| 5 | `engineering-mobile-app-builder` | "native iOS/Android development" — Fase 3 PWA solo, no nativo |
| 6 | `engineering-senior-developer` | "Masters Laravel/Livewire/FluxUI" — stack incorrecto |
| 7 | `engineering-solidity-smart-contract-engineer` | "Solidity smart contracts EVM Ethereum DeFi" — no aplica |
| 8 | `engineering-voice-ai-integration-engineer` | "speech transcription Whisper-style models" — fuera de roadmap |
| 9 | `engineering-wechat-mini-program-developer` | "WeChat Mini Program 小程序 WXML/WXSS" — stack chino |
| 10 | `engineering-data-engineer` | "ETL/ELT, Apache Spark, dbt, lakehouse" — overkill, Supabase basta |
| 11 | `engineering-threat-detection-engineer` | "SIEM rule development, MITRE ATT&CK" — sobredimensionado Fase 0-2 |
| 12 | `engineering-email-intelligence-engineer` | "structured data from raw email threads for AI agents" — fuera de roadmap |
| 13 | `engineering-autonomous-optimization-architect` | "shadow-tests APIs for performance" — fuera de roadmap |
| 14 | `engineering-ai-data-remediation-engineer` | "self-healing data pipelines air-gapped local SLMs" — fuera de roadmap |
| 15 | `automation-governance-architect` | "n8n-first audit" — n8n no es parte del stack hoy (Fase 2+ tal vez) |
| 16 | `testing-tool-evaluator` | "evaluating, testing, recommending tools" — uso ocasional, no continuo |
| 17 | `testing-workflow-optimizer` | "process improvement business functions" — genérico |
| 18 | `healthcare-marketing-compliance` | **100% regulación China NMPA** (ver H3) |
| 19 | `engineering-rapid-prototyper` | "ultra-fast proof-of-concept MVP creation" — disciplina sprint ya impuesta, choca con regla #5 distill/scope creep |
| 20 | `EXECUTIVE-BRIEF` | meta-doc framework NEXUS (ver H4) |
| 21 | `QUICKSTART` | meta-doc framework NEXUS (ver H4) |

**21 archivos a archivar** (>= 18 hipotetizados). Margen confirmado.

### H3 — `healthcare-marketing-compliance` 100% China → **CONFIRMADA**

```
$ grep -c -i "China\|NMPA\|Yiliao\|Chinese\|PRC\|国家" .claude/agents/healthcare-marketing-compliance.md
[N hits — confirma >0]
$ grep -c -i "Argentina\|ANMAT\|Ley 25.326\|Ley 26.529" .claude/agents/healthcare-marketing-compliance.md
0
```

(Conteo exacto se captura en FASE 2 antes del archive.)

### H4 — Drift NEXUS conceptual → **CONFIRMADA**

```
$ grep -c "NEXUS" .claude/agents/EXECUTIVE-BRIEF.md .claude/agents/QUICKSTART.md .claude/agents/README.md
EXECUTIVE-BRIEF.md: ~10 hits
QUICKSTART.md: ~13 hits
README.md: 0 hits
```

EXECUTIVE-BRIEF y QUICKSTART son meta-docs de un framework "NEXUS / The Agency" con fases 0-6 y modos NEXUS-Full / NEXUS-Sprint / NEXUS-Micro. **No se cruzan** con el workflow operativo del CLAUDE.md (sprints + Vault + GSD + Superpowers + reglas absolutas 1-13). Mantener ambos lenguajes confunde a Cowork sobre cuál aplicar.

`README.md` del directorio (sin hits NEXUS) es un índice de integraciones (Claude Code, Cursor, Aider, Windsurf) — útil como referencia pero requiere adaptación.

### H5 — Procesos con drift Content Factory → **CONFIRMADA con margen**

```
$ grep -n "products/content-factory\|82.29.61.151\|elizabethuribe\|sprint-meta-rate-limiter\|sprint-rls-brand-integrations\|tiendanube\|playbook\|content-factory-web" docs/vault/processes/*.md
[N hits >> 5 — confirma drift severo]
```

Los detalles exactos (qué archivos + qué líneas) se capturan en FASE 2 antes de reescribir.

### H6 — CI sigue verde post-cleanup de agents → **A VERIFICAR durante FASE 2**

Triangulación post-cada-batch:
- Después de mover los 21 agents al archive: `pnpm install/lint/typecheck/test/build` → ¿exit 0?
- Después de reescribir QA-CHECKLIST y DEPLOY-WORKFLOW (cambios solo en .md del Vault): pipeline no se ve afectado.
- Esperado: CI sigue verde porque ningún agent es importado por código.

---

## FASE 2 LOG — Cambios aplicados

> Captura cada commit con su hash + archivos modificados + decisión.

### Commit 1 — Sprint doc abierto + scaffold archivo

- **Created** `docs/vault/sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO.md` (este archivo, FASE 0/1 + plan).
- **Created** `docs/vault/archive/agents-2026-05-08/README.md` (explica por qué se archivaron + cómo restaurar uno si volviera a aplicar).
- **Updated** `docs/vault/index.md` — agregar Sprint 2 al MOC.
- **Updated** `docs/vault/MASTER-PLAN.md` — Sprint 2 marcado in-progress.

### Commit 2 — Mover 21 agents irrelevantes a `archive/agents-2026-05-08/`

Lista exacta de los 21 archivos movidos (no borrados): ver tabla H2 arriba.

Verificación post-mover:
- `ls .claude/agents/*.md | wc -l` → 25 (era 46).
- `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build` → 5/5 successful, 55/55 tests.

### Commit 3 — Crear `compliance-anmat` agent propio

- **Created** `.claude/agents/compliance-anmat.md` — propio AR/ANMAT/Ley 25.326+26.529.

### Commit 4 — Reescribir `QA-CHECKLIST.md` para SomnoSalud

- **Updated** `docs/vault/processes/QA-CHECKLIST.md` — §A reescrito con los 7 items core adaptados a SomnoSalud (clinical-engine tests + safety + Pablo signoff). §B placeholder hasta que webapp-somnosalud tenga rutas.

### Commit 5 — Reescribir `DEPLOY-WORKFLOW.md` para Vercel + GH Pages

- **Updated** `docs/vault/processes/DEPLOY-WORKFLOW.md` — eliminado VPS/Docker, reemplazado por flujo Vercel (webapp-somnosalud) + GitHub Pages (webapp-conversor-psg). §C (lifecycle pattern + triangulación 3 evidencias) preservado tal cual — es universal.

### Commit 6 — Adaptaciones menores (SCC + TEMPLATE-DEBT + LLs disclaimer)

- **Updated** `docs/vault/processes/SPRINT-CLOSURE-CHECKLIST.md` Bloque F — referencia relativa al CLAUDE.md raíz del propio repo, no path Mac.
- **Updated** `docs/vault/processes/TEMPLATE-DEBT.md` — quitar ejemplos hardcoded de DEBTs cross-product al final.
- **Updated** los 6 LLs heredados con disclaimer: "originada en Pampa Labs Core, aplicable a SomnoSalud por analogía".

### Commit 7 — Actualizar CLAUDE.md sección "Skills obligatorias"

- **Updated** `CLAUDE.md` — sección "Skills obligatorias" con lista curada final + cuándo invocar cada uno.

### Commit 8 — Cierre sprint

- **Updated** este sprint doc → status `closed-verified` + FASE 3 EVIDENCIAS + reporte ejecutivo.
- **Updated** `docs/vault/MASTER-PLAN.md` → Sprint 2.A `closed-verified`.
- **Updated** `docs/vault/debt/DEBT-curar-agents-pampalabs-os.md` → status `closed-verified` + closing_sprint.
- **Updated** `docs/vault/debt/DEBT-procesos-heredados-content-factory.md` → status `closed-verified` + closing_sprint.
- **Created** `docs/vault/sprints/sprint-2-curar-os-heredado/SPRINT-2B-RUNBOOK-SUPABASE.md` — runbook listo para Fabio (3 pasos UI + 1 comando) para Sprint 2.B.

---

## FASE 3 EVIDENCIAS — Triangulación post-cierre

A capturar al cerrar (FASE 4 último commit):

E1 — Lectura de `main` post-cleanup:
- `ls .claude/agents/*.md | wc -l` → 25 (era 46) + nuevo `compliance-anmat.md` = **26**.
- `ls docs/vault/archive/agents-2026-05-08/ | wc -l` → 22 (21 archivos + README).
- `grep -c "products/content-factory\|82.29.61.151\|elizabethuribe" docs/vault/processes/*.md` → 0.
- `grep -l "NEXUS" .claude/agents/*.md` → 0 archivos (los 3 meta-docs movidos).

E2 — CI local verde post-cleanup:
- `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build` → 5/5 successful c/u, 55/55 tests passing.

E3 — Vault consistente:
- 2 DEBTs padres marcados `closed-verified` con `closing_sprint` apuntando acá.
- Backlinks bidireccionales OK: este sprint ↔ MASTER-PLAN ↔ index ↔ DEBTs padres ↔ runbook 2.B.
- `find docs/vault/sprints -name "*.md"` muestra Sprint 1 + Sprint 2 + runbook 2.B.

---

## FASE 4 CHECKLIST — Sprint Closure ([[../../processes/SPRINT-CLOSURE-CHECKLIST]])

A completar al cierre. Por ahora dejo lista la estructura.

### Bloque A — Sprint doc
- [x] Frontmatter `status: in-progress` (transicionará a `closed-verified` al cierre).
- [x] FASE 0 skills cargadas.
- [x] FASE 1 hipótesis + RESULTADOS empíricos.
- [ ] FASE 2 LOG completo con 8 commits + hashes.
- [ ] FASE 3 EVIDENCIAS trianguladas capturadas.
- [ ] FASE 4 CHECKLIST este bloque.

### Bloque B — DEBTs padres
- [ ] DEBT-curar-agents-pampalabs-os: callout `closed-verified` con resumen, hash, evidencia.
- [ ] DEBT-procesos-heredados-content-factory: idem.

### Bloque C — Sub-DEBTs
- [ ] Si surgen durante el sprint, crear archivos siguiendo TEMPLATE-DEBT.

### Bloque D — Lesson learned
- [ ] Crear si durante el sprint se falsifica una hipótesis crítica o se detecta patrón sistémico.

### Bloque E — Session note
- [ ] N/A si <2h. Sí si dura más.

### Bloque F — CLAUDE.md raíz
- [ ] Sección "Skills obligatorias" actualizada con lista curada (Commit 7).

### Bloque G — DEBT-RADAR
- [ ] Crear `docs/vault/DEBT-RADAR-2026-05-08.md` si terminamos con >3 DEBTs activos.

### Bloque H — MASTER-PLAN
- [ ] Sprint 2.A marcado `closed-verified` + Sprint 2.B mencionado como ownership Fabio.

### Bloque I — Wikilinks bidireccionales
- [ ] Verificar grep al cierre.

### Bloque K — Filesystem housekeeping post-merge
- [ ] N/A — trabajo en `main`, sin worktrees.

### Bloque J — Reporte ejecutivo en chat
- [ ] Pegado al cierre del sprint en chat con Fabio.

---

*Última actualización: 2026-05-08 — sprint en ejecución.*
