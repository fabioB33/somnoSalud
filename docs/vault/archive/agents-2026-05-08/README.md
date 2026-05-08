---
title: "Archive — agents heredados Pampa Labs OS no aplicables a SomnoSalud"
date: 2026-05-08
tags: [archive, agents, claude-code, pampalabs-os, governance]
status: archived
related:
  - "[[../../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]"
  - "[[../../debt/DEBT-curar-agents-pampalabs-os]]"
  - "[[../../../../CLAUDE]]"
archived_during: sprint-2-curar-os-heredado
archived_at: 2026-05-08
---

# Archive — agents heredados Pampa Labs OS no aplicables a SomnoSalud

> Esta carpeta preserva los archivos `.md` de `.claude/agents/` que se archivaron durante Sprint 2.A porque **no aplican al contexto SomnoSalud** (stack TS/Next.js/Supabase, dominio clínico AR/ANMAT, fases roadmap 0-3 definidas).
>
> Vienen del commit `6f8f6c9` que importó 46 agents literales del Pampa Labs OS / "The Agency". Ver [[../../debt/DEBT-curar-agents-pampalabs-os]] para el análisis completo.

## Por qué se archivaron en lugar de borrarse

1. **Trazabilidad de la decisión**: si en 6 meses alguien duda "¿por qué no tenemos agente X?", puede leer este README + el sprint doc.
2. **Restauración fácil**: si SomnoSalud expande scope (ej: lanza producto con WeChat mini-program), basta `git mv archive/agents-2026-05-08/<file>.md ../../../.claude/agents/`.
3. **Auditoría regulatoria**: el Vault es SSOT del proyecto (regla #10 CLAUDE.md). Borrar archivos sin trace genera drift entre git history y realidad.

## Cómo restaurar un agent archivado

```bash
git mv docs/vault/archive/agents-2026-05-08/<filename>.md .claude/agents/<filename>.md
git commit -m "chore(agents): restaurar <filename> — <razón>"
```

Antes de restaurar, justificar en sprint doc: ¿qué cambió en el contexto SomnoSalud que ahora hace aplicable este agente?

## Lista de archivos archivados (21 archivos)

### Stack incorrecto (fuera del Next.js/TS/Supabase)

- `engineering-cms-developer.md` — Drupal/WordPress; SomnoSalud no es CMS.
- `engineering-senior-developer.md` — Laravel/Livewire/FluxUI; stack PHP, no aplica.
- `engineering-filament-optimization-specialist.md` — Filament PHP/Laravel admin panels.
- `engineering-mobile-app-builder.md` — iOS/Android nativo; Fase 3 contempla solo PWA.
- `engineering-solidity-smart-contract-engineer.md` — Solidity/Ethereum/DeFi.
- `engineering-embedded-firmware-engineer.md` — ESP32/ARM Cortex-M firmware.

### Mercado / regulación incorrecta (China)

- `healthcare-marketing-compliance.md` — **100% regulación China** (NMPA, Yiliao Guanggao, Hulianwang Guanggao Guanli Banfa). SomnoSalud opera en Argentina (ANMAT, Ley 25.326, Ley 26.529). **Reemplazado por `compliance-anmat.md` propio.**
- `engineering-feishu-integration-developer.md` — Feishu (Lark) chat empresarial chino.
- `engineering-wechat-mini-program-developer.md` — WeChat Mini Program 小程序.

### Fuera del roadmap (Fases 0-3)

- `engineering-voice-ai-integration-engineer.md` — ASR/Whisper; no hay voice features.
- `engineering-email-intelligence-engineer.md` — extracción AI de emails; no aplica.
- `engineering-autonomous-optimization-architect.md` — shadow-tests APIs; sobredimensionado.
- `engineering-ai-data-remediation-engineer.md` — air-gapped SLMs data healing; sobredimensionado.
- `engineering-data-engineer.md` — ETL/Spark/lakehouse; Supabase es suficiente.
- `engineering-threat-detection-engineer.md` — SIEM/MITRE ATT&CK; sobredimensionado para Fase 0-2.
- `automation-governance-architect.md` — n8n-first audit; n8n no es parte del stack actual (Fase 2+ posible).

### Drift conceptual con Pampa Labs OS

- `EXECUTIVE-BRIEF.md` — meta-doc del framework "NEXUS / The Agency" (fases 0-6, modos NEXUS-Full/Sprint/Micro). **Contradice** el workflow operativo del CLAUDE.md (sprints + Vault + GSD + Superpowers + reglas absolutas 1-13).
- `QUICKSTART.md` — meta-doc NEXUS framework, mismo problema.

### Choque de filosofía / redundante

- `engineering-rapid-prototyper.md` — "ultra-fast MVP creation"; choca con disciplina sprint actual + reglas anti-scope-creep + signoff Pablo en clínica.
- `testing-tool-evaluator.md` — assessment tooling genérico; uso ocasional, no continuo.
- `testing-workflow-optimizer.md` — process improvement business genérico; el Vault y procesos del propio repo cumplen este rol.

## Lista de agents activos post-sprint (25 archivos)

Ver `.claude/agents/` directamente. Lista canónica documentada en `CLAUDE.md` sección "Skills obligatorias" actualizada en Sprint 2.A Commit 7.

---

*Archivado durante [[../../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]].*
