---
title: Superpowers — Multi-agent Workflow
tags: [process, workflow, superpowers, multi-agent, canonical, pampa-labs]
status: current
owner: jorge
created: 2026-04-19
updated: 2026-04-19
related:
  - "[[GSD-WORKFLOW]]"
  - "[[OBSIDIAN-VAULT-CONVENTIONS]]"
  - "[[LOOP-7-STEPS]]"
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[DEPLOY-WORKFLOW]]"
  - "[[TEMPLATE-DEBT]]"
  - "[[MASTER-PLAN]]"
  - "[[ROADMAP]]"
---

# Superpowers — Multi-agent Workflow

> [!info] Propósito
> Formalizar cómo Pampa Labs orquesta trabajo paralelo con el patrón Superpowers (spawn de subagentes vía Task tool). Define cuándo paralelizar, cuándo serializar, y cómo el agente principal hace fan-in de los outputs. Reusable literal en cada sprint ≥3 archivos.

## ¿Qué es?

Superpowers es el patrón de multi-agent orchestration disponible en Claude Code vía el Task tool. El agente principal (orquestador) puede spawnar subagentes especializados (`general-purpose`, `explore`, `code-analyzer`, etc.), cada uno con **contexto propio aislado** — no ven el historial del principal ni de sus pares, tampoco el contexto de otros subagentes activos en el mismo momento. Cada subagente recibe un prompt self-contained, ejecuta su tarea dentro de sus constraints, y **reporta outputs literales** de vuelta al orquestador vía un mensaje de cierre.

El principal sintetiza los outputs recibidos, verifica con tests agregados (typecheck, build, lint sobre el repo completo), resuelve conflictos entre outputs si los hay, y ejecuta los commits atómicos. Clave: los subagentes **no hacen commits** ni `git push` — esa autoridad pertenece siempre al principal para evitar race conditions sobre el staging de git y preservar la linearidad del historial. El paradigma es fan-out (paralelización) + fan-in (consolidación) — análogo a MapReduce pero sobre trabajo de ingeniería humana-asistida.

## Cuándo usar paralelo vs secuencial

| Paralelo (fan-out) | Secuencial (principal inline) |
|---|---|
| Refactor de N callers independientes (ej. BATCH 3 — 6 readers migrados a `getEcommerceCredentials`) | Migration → deploy → cutover (cada paso necesita el anterior aplicado) |
| Escritura de múltiples docs sin dependencias cruzadas (ej. BATCH 3.5 — 4 canonical workflow docs) | Refactor que cambia API pública de un service seguido por refactor de sus callers |
| Investigación paralela (grep + schema introspection + lectura docs) | Verify empírico entre pasos (deploy no se verifica sin migration aplicada) |
| Tests adaptados sobre archivos distintos | Commits atómicos (siempre los hace el principal) |
| Auditoría read-only de secciones disjuntas | Operaciones transaccionales críticas sobre producción |
| Búsqueda amplia con múltiples heurísticas simultáneas | Validación incremental con señales TS/lint intermedias |

## Patterns canónicos Pampa Labs

**Fan-out** = el principal spawn N subagentes paralelos sobre trabajo independiente (refactor N files, N docs, N investigaciones). Cada subagente opera en su prompt self-contained, sin conocer a los otros. El overhead de spawn se amortiza solo si N ≥ 3 o si cada task es ≥15 min wall-clock.

**Fan-in** = el principal consolida los outputs literales de los N subagentes, ejecuta tests agregados (typecheck, build, lint sobre el repo completo), resuelve conflictos si los hay, y hace los commits atómicos. El fan-in es **siempre secuencial** y **siempre en el principal** — no se delega.

> [!WARNING] Regla no negociable
> Los commits los hace SIEMPRE el agente principal, NUNCA los subagentes. Subagentes escribiendo `git add` / `git commit` en paralelo producen race conditions sobre el index + conflictos imposibles de debuggear. El subagente reporta "archivo X modificado, diff Y" y el principal decide el commit.

Subagentes reportan outputs literales (paths absolutos, hashes, counts, line numbers, exit codes, logs) — no parafraseados. El principal verifica esos outputs contra el criterio de aceptación antes de avanzar.

## Formato del Task tool

```
Task({
  description: "3-5 word task",
  subagent_type: "general-purpose",  // o explore, code-analyzer, etc.
  prompt: "Self-contained prompt con:
           - Contexto mínimo necesario (no asume parent state)
           - Objetivo (verb + objeto + resultado)
           - Criterio de aceptación medible
           - Output esperado declarado (paths, hashes, counts)
           - Constraints (no commits, no push, no destructive ops)
           - Skills a cargar antes de empezar"
})
```

Reglas del prompt:
- El prompt debe ser **self-contained** — el subagente no ve el contexto del principal.
- **Criterio de aceptación explícito** — sin ambigüedad sobre "done".
- **Output format declarado** — el principal necesita poder parsear la respuesta.
- **Scope cerrado** — si el subagente encuentra más trabajo, reporta como finding, no expande.

## Criterios de aceptación por subagente

1. **Objetivo claro en una frase** — verb + objeto + resultado (ej. "Refactor `report-generator.ts` callers para usar `getEcommerceCredentials()` en lugar de `getIntegration()`").
2. **Criterio medible de done** — file creado con N líneas, test passing, grep devuelve X matches, build exit 0.
3. **Output esperado declarado** — qué reporta de vuelta (hash del commit que NO hizo, path absoluto, diff resumen, exit code, logs literales).
4. **Scope cerrado** — el subagente NO decide expansión. Si detecta trabajo adicional, lo reporta como finding + DEBT candidate para el principal.
5. **Recursos requeridos listados** — files a leer, skills a cargar (`obsidian-markdown`, `pampalabs-context`, etc.), MCP tools disponibles.
6. **Constraints declaradas** — no commits, no push, no destructive ops (drops, truncates, force-push), no `INSERT/UPDATE/DELETE` sobre producción.

## Ejemplos empíricos

### BATCH 3 — refactor 6 callers paralelizable

6 readers (`backfill`, `metrics-sync`, `crosssell`, `report-generator`, `dashboard.routes`, `admin.routes`) migrados a `getEcommerceCredentials()` con patterns A/B. Eran **independientes** (cada caller en archivo distinto, sin shared state runtime). Fan-out natural sería: 6 subagentes simultáneos con prompt self-contained cada uno (pattern A o B según el caller).

En la práctica se ejecutó secuencial por el principal porque: (a) los types entre callers se iban refinando incrementalmente — cambios en un reader propagaban señales de inferencia TypeScript a los demás; (b) la validación incremental con typecheck detectó un TS2589 intermedio que hubiera fallado 6 subagentes en paralelo sin contexto compartido de resolución; (c) el ahorro de wall-clock no justificaba el overhead de re-sync de types.

**Lección**: fan-out es óptimo cuando los callers son de verdad independientes en tipos + runtime. Si comparten types que se van ajustando, secuencial en el principal es más eficiente. Ver [[LOG-BATCH-FASE-B-3]].

### Migration + deploy + cutover — secuencial con dependencia

Cada paso necesita el anterior aplicado en producción: (1) migration SQL aplicada a Supabase → (2) deploy refactor que lee el nuevo schema → (3) cutover Lure (credenciales migradas al nuevo store) → (4) verify empírico con query sobre `brand_integrations` + `pb_brand_config`. Paralelizar rompe la dependencia — el deploy sobre un schema no-aplicado falla en runtime; el cutover sin deploy refactor escribe en el lugar equivocado.

**Lección**: cualquier workflow con dependencia causal (A must run before B observes A's effect) es secuencial por definición. No hay fan-out posible sin transacciones distribuidas.

### BATCH 3.5 — 4 concepts paralelizables

Este mismo batch (docs canónicos de workflow: `GSD-WORKFLOW`, `OBSIDIAN-VAULT-CONVENTIONS`, `LOOP-7-STEPS`, `SUPERPOWERS-MULTI-AGENT-WORKFLOW`). 4 docs independientes sin cross-references runtime, sin shared state, sin types compartidos. Fan-out natural: 4 subagentes en paralelo, cada uno con prompt self-contained (objetivo + sections + style reference + output path absoluto + line-count target). El principal hace fan-in: lee los 4 archivos creados, verifica wikilinks cross-referenciados entre ellos, detecta inconsistencias conceptuales si las hay, hace commit atómico del batch entero + push.

**Lección**: docs + refactors sin dependencia de types son el caso ideal para fan-out. Wall-clock reducido ~4×. El único overhead real es el fan-in (leer y validar los 4 outputs), pero se amortiza trivialmente cuando los subagentes corren simultáneos.

## Qué evitar

1. **Subagente haciendo commits** — rompe el staging del principal, produce race conditions, imposibilita verificación centralizada del diff agregado.
2. **Subagente sin criterio de aceptación** — no sabemos si hizo bien el trabajo; el principal no puede verificar sin re-ejecutar.
3. **Prompts de subagente con referencias ambiguas al parent context** — "como discutimos antes" / "el archivo que vimos" — el subagente NO ve el parent context, el prompt falla silenciosamente.
4. **Fan-out sobre trabajo con dependencias** — subagente B espera output de A → serialización forzada + rework → más lento que secuencial nativo.
5. **Spawning subagentes para tareas triviales** — overhead de spawn > beneficio. Default: ≤3 pasos o ≤3 archivos → inline en el principal.
6. **No reportar outputs literales al principal** — parafraseo de "funcionó OK" impide verify + rompe Regla #12 de [[AUDITORIA-METODOLOGIA]] (empirical verification requiere log literal).
7. **Subagentes sin scope cerrado que expanden el trabajo por cuenta propia** — drift del sprint, commits inesperados, files fuera del plan. El subagente reporta findings, no decide.
8. **Fan-out sin fan-in verificado** — lanzar 6 subagentes y asumir que todos tuvieron éxito sin leer los outputs literales + correr typecheck agregado. El fan-in es obligatorio; si el principal no consolida, no hay verificación posible de Regla #12 ([[AUDITORIA-METODOLOGIA]]).
9. **Subagentes tocando producción** — `INSERT/UPDATE/DELETE`, `supabase-cf` con writes, `docker compose up`, `git push`. Cualquier operación con side-effect permanente se queda en el principal. El subagente prepara, el principal ejecuta.

## Integración con el resto del workflow

- `/gsd:plan-phase` del [[GSD-WORKFLOW]] identifica pasos paralelizables y los marca explícitamente con tag `[parallelizable]` en el plan.
- **Paso 1** de [[LOOP-7-STEPS]] (leer skills + detect state) = inline en el principal, nunca delegado — el principal necesita cargar el contexto base.
- **Paso 2** (trabajo independiente: refactor / docs / investigación) = fan-out si `N archivos ≥ 3` y las tareas son independientes en types + runtime + docs.
- **Paso 3-5** (wikilinks cross-referenciados + commits atómicos + push) = secuencial en el principal. Los commits y el push NUNCA se delegan.
- **Paso 6-7** (Jorge review + deploy) = afuera del scope de Claude Code.
- Compatibilidad con [[AUDITORIA-METODOLOGIA]] Regla #4: auditorías de >3 secciones disjuntas usan fan-out con MCP Supabase centralizado en el principal.
- Compatibilidad con [[DEPLOY-WORKFLOW]] §C: el `closed-verified` requiere 3 evidencias trianguladas — esto no se paraleliza, el principal consolida.

> [!NOTE] Heurística operativa rápida
> Si tenés `N ≥ 3` archivos independientes Y cada tarea es ≥15 min wall-clock Y no comparten types/runtime/schema → **fan-out con Task tool**. Si falta cualquiera de esos 3, inline en el principal. Ante la duda, inline — el costo de paralelización mal usada (drift, rework, conflicts) supera el ahorro de wall-clock.

## Changelog

- **v1.0 — 2026-04-19** — Workflow inicial extraído empíricamente de FASE A + B1 + B2 + B3 + 3.5 del sprint-cierre-tiendanube-definitivo. Origen: necesidad de formalizar fan-out vs inline tras observar que BATCH 3 (refactor 6 readers) se ejecutó secuencial por shared-types pero BATCH 3.5 (4 docs) era fan-out natural. Cross-ref: [[LOG-BATCH-FASE-B-3]], [[LOG-BATCH-FASE-A]].

## Relacionados

- [[GSD-WORKFLOW]] — pasos del plan-phase que alimentan fan-out.
- [[OBSIDIAN-VAULT-CONVENTIONS]] — frontmatter + wikilinks que los subagentes deben respetar en cada doc creado.
- [[LOOP-7-STEPS]] — los 7 pasos canónicos y dónde encaja el fan-out.
- [[AUDITORIA-METODOLOGIA]] — Regla #4 (multi-agent obligatorio auditorías) + Regla #12 (empirical verification triangulada, compatible con fan-in).
- [[DEPLOY-WORKFLOW]] — §C closed-verified requiere fan-in de evidencias en el principal.
