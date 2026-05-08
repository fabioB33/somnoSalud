---
title: "Deuda Técnica — curar 46 agents heredados del Pampa Labs OS"
date: 2026-05-08
tags: [deuda-tecnica, agents, claude-code, pampalabs-os, governance, open]
status: open
priority: medium
scope: sprint-2
detected_during: sprint-1-cleanup-os-heredado
related:
  - "[[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]"
  - "[[../../../CLAUDE]]"
---

# DEBT-curar-agents-pampalabs-os

> [!info] Origen
> Detectado durante el análisis exhaustivo del repo (2026-05-07 noche). El commit `6f8f6c9` instaló 46 agents en `.claude/agents/` heredados de un repo upstream genérico ("The Agency / NEXUS"). Varios no aplican al contexto SomnoSalud y crean ruido / contradicción con el lenguaje del propio CLAUDE.md (sprints + GSD + Superpowers + Vault).

## Contexto

El CLAUDE.md raíz (regla #6 AGENT-FIRST) exige que Cowork invoque agentes especializados antes de proponer recomendaciones. Pero el directorio `.claude/agents/` tiene 46 archivos — muchos irrelevantes para SomnoSalud:

**Agents claramente no-aplicables (ejemplos):**
- `healthcare-marketing-compliance.md` — **regulación China** (NMPA, Yiliao Guanggao, Hulianwang Guanggao Guanli Banfa). El CLAUDE.md lo lista como agente clave para "Fase 3 B2B cuando arranque marketing a sleep specialists" pero el contenido es 100% China — no sirve para AR/ANMAT.
- `engineering-feishu-integration-developer.md` — Feishu (Lark) es chat empresarial chino.
- `engineering-wechat-mini-program-developer.md` — WeChat mini-programs.
- `engineering-solidity-smart-contract-engineer.md` — Solidity / smart contracts (no aplica a stack TS/Next.js de SomnoSalud).
- `engineering-embedded-firmware-engineer.md` — firmware embedded.
- `engineering-voice-ai-integration-engineer.md` — voice AI (fuera de roadmap).
- `engineering-cms-developer.md` — CMS dev (no aplica, SomnoSalud no es un CMS).
- `engineering-filament-optimization-specialist.md` — Filament (lib PHP/Laravel admin panels).

**Agents con drift conceptual:**
- `EXECUTIVE-BRIEF.md` y `QUICKSTART.md` describen un framework "NEXUS / The Agency" con phases/playbooks que **no se cruzan** con el lenguaje del CLAUDE.md (sprints + GSD + Superpowers + Vault). Mantener ambos genera contradicciones cuando Cowork tiene que decidir qué workflow aplicar.

**Agents probablemente útiles (revisar):**
- `engineering-frontend-developer.md`, `engineering-backend-architect.md`, `engineering-code-reviewer.md`, `engineering-senior-developer.md`, `engineering-software-architect.md`, `engineering-technical-writer.md`, `engineering-security-engineer.md`, `engineering-database-optimizer.md`, `engineering-codebase-onboarding-engineer.md`, `engineering-minimal-change-engineer.md`, `engineering-rapid-prototyper.md`, `engineering-git-workflow-master.md`.
- `testing-accessibility-auditor.md`, `testing-api-tester.md`, `testing-evidence-collector.md`, `testing-performance-benchmarker.md`, `testing-reality-checker.md`, `testing-test-results-analyzer.md`, `testing-tool-evaluator.md`, `testing-workflow-optimizer.md`.
- `product-sprint-prioritizer.md`, `agents-orchestrator.md`, `compliance-auditor.md` (este último es SOC 2 / ISO 27001 / HIPAA — útil para Fase 3 USA/UE pero no para AR/ANMAT — ver DEBT hermano).

**Impacto:** la regla #6 AGENT-FIRST se rompe en la práctica porque Cowork no tiene un mapa claro de qué agente aplica a qué tarea. O termina invocando el wrong agent (ej: SOC 2 auditor cuando el contexto es Ley 25.326 Argentina).

## Evidencia

- `ls .claude/agents/*.md | wc -l` → 46 archivos.
- `grep -l "China\|NMPA\|Hulianwang\|Yiliao Guanggao" .claude/agents/*.md` → confirma `healthcare-marketing-compliance.md`.
- `grep -l "Solidity\|Smart contract\|Ethereum" .claude/agents/*.md` → confirma `engineering-solidity-smart-contract-engineer.md`.
- `grep -l "WeChat\|Feishu\|Lark" .claude/agents/*.md` → confirma feishu + wechat.
- `head -10 .claude/agents/EXECUTIVE-BRIEF.md` describe "NEXUS Master Strategy" — distinto al lenguaje del CLAUDE.md.

## Propuesta

Sprint 2 dedicado, ~3-4h:

1. **Audit del set de 46 agents** — clasificar en 3 categorías:
   - 🟢 **Mantener** (aplica directamente al stack TS/Next.js/Supabase/clinical de SomnoSalud) — estimación: 12-15 agents.
   - 🟡 **Adaptar** (aplica conceptualmente pero requiere edits — ej: `compliance-auditor` adaptado a ANMAT/Ley 25.326 Argentina, no SOC 2).
   - 🔴 **Archivar** (no aplica) — mover a `docs/vault/archive/agents-2026-05-08/` con README explicando por qué se archivaron.

2. **Crear agents propios** que faltan:
   - `compliance-anmat` — propio para AR/ANMAT/Ley 25.326+26.529 (reemplaza `healthcare-marketing-compliance` China). Ver DEBT hermano.
   - `clinical-engine-domain-expert` — para tocar `packages/clinical-engine/` con conocimiento DOI/PMID centralizado en `references.ts`. Probable.

3. **Resolver drift NEXUS vs Pampa Labs OS** — decidir si:
   (a) Borrar EXECUTIVE-BRIEF + QUICKSTART (the Agency / NEXUS framework) — el CLAUDE.md ya define el workflow operativo (sprints + Vault + GSD + Superpowers).
   (b) Mantener como referencia opcional con disclaimer "NO usar — el workflow operativo es el del CLAUDE.md raíz".

4. **Actualizar CLAUDE.md sección "Skills obligatorias"** con la lista curada final + reglas concretas de cuándo invocar cada uno.

## Scope

Sprint 2 (siguiente al de cleanup OS heredado).

## Prioridad

**medium** — no bloquea código clínico ni roadmap inmediato (Fase 0.4 → Fase 1 Sprint 5). Pero entre más se acumulen sprints sin curar, más se osifica la regla #6 como letra muerta y más drift se acumula.

## Relacionados

- [[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]] — sprint origen del hallazgo.
- [[DEBT-procesos-heredados-content-factory]] — DEBT hermano (similar drift, en `docs/vault/processes/`).
- [[../../../CLAUDE]] — regla #6 AGENT-FIRST que motiva el cleanup.
