---
title: "Architecture Decision Records (ADRs) — index"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [adr, architecture, index, somnosalud]
status: active
related:
  - "[[../../index]]"
  - "[[../../../../CLAUDE]]"
---

# Architecture Decision Records — SomnoSalud

> Cada ADR documenta **una decisión arquitectural significativa** del proyecto con: contexto, decisión, alternativas consideradas, consecuencias, status. Las ADRs son **inmutables** una vez aceptadas — si una decisión cambia, se crea ADR nueva con `supersedes: ADR-NNN` en frontmatter.
>
> Convención: filename `ADR-NNN-<slug-corto>.md` (NNN con padding 0 si <100), kebab-case ASCII (regla #12 CLAUDE.md).

## Cuándo escribir una ADR

- Una decisión técnica que **afecta a >1 sprint** o **>1 package**.
- Una decisión que **alguien podría cuestionar en 6 meses** ("¿por qué hicimos X?").
- Una decisión que tiene **alternativas válidas** y se eligió una.
- Una decisión que **otra persona del equipo necesitaría conocer** para no tomar la opuesta.

NO escribir ADR para:
- Decisiones triviales (naming de variable local, indentación).
- Decisiones forzadas por la herramienta (versión X de Y porque Y solo soporta X).
- Decisiones reversibles en <30 min (cambiar un padding, mover un archivo).

## ADRs activas

| # | Título | Status | Sprint origen |
|---|---|---|---|
| [[ADR-001-stack-frontend-webapp-somnosalud\|ADR-001]] | Stack frontend webapp-somnosalud (Next 14 + App Router + Tailwind 3 + RSC) | accepted | Sprint 5 |
| [[ADR-002-workspace-dependency-clinical-engine\|ADR-002]] | Workspace dependency strategy para `somnosalud-clinical-engine` | accepted | Sprint 5 |
| [[ADR-003-compliance-gates-en-codigo\|ADR-003]] | Compliance gates en código (disclaimer + consent + edad + safety) | accepted | Sprint 5.5 |

## Template

Para crear una ADR nueva, copiar:

```markdown
---
title: "ADR-NNN — <título corto>"
date: YYYY-MM-DD
last_synced_with_vault_reality: YYYY-MM-DD
tags: [adr, architecture, <area-1>, somnosalud]
status: <draft | proposed | accepted | superseded | deprecated>
supersedes: <ADR-MMM si aplica>
related:
  - "[[../../sprints/sprint-N-<slug>/SPRINT-N-<SLUG>]]"
  - "[[../../../../CLAUDE]]"
deciders: [fabio, cowork, pablo-ferrero (si aplica)]
created: YYYY-MM-DD
---

# ADR-NNN — <título>

## Status

<draft | proposed | accepted | superseded | deprecated>

## Contexto

<Qué problema o decisión enfrentamos. Background mínimo necesario.>

## Decisión

<Lo que se decidió, en una oración. Después detalle.>

## Alternativas consideradas

### Alternativa 1 — <nombre>

- **Pros:** <bullets>
- **Contras:** <bullets>
- **Por qué no:** <razón>

### Alternativa 2 — <nombre>

(idem)

## Consecuencias

### Positivas
- <qué ganamos>

### Negativas
- <qué perdemos / qué deuda creamos>

### Neutras
- <implicaciones que no son ni pro ni contra>

## Cómo revertir / cambiar

<Si en el futuro hay que cambiar, qué pasos requiere. Si la decisión es difícil de revertir, decirlo explícito.>

## Referencias

- <links a docs externas, RFCs, papers>
- <links a sprint doc origen>
```

---

*Última actualización: 2026-05-08 — directorio creado durante [[../../sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]].*
