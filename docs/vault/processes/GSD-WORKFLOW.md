---
title: GSD — Get Shit Done Workflow
tags: [process, workflow, gsd, superclaude, canonical, pampa-labs]
status: current
owner: jorge
created: 2026-04-19
updated: 2026-04-19
related:
  - "[[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]"
  - "[[OBSIDIAN-VAULT-CONVENTIONS]]"
  - "[[LOOP-7-STEPS]]"
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[DEPLOY-WORKFLOW]]"
  - "[[TEMPLATE-DEBT]]"
  - "[[MASTER-PLAN]]"
  - "[[ROADMAP]]"
---

# GSD — Get Shit Done Workflow

> [!info] Propósito
> Formaliza el set de slash commands (SuperClaude + convenciones Pampa Labs) que Claude Code invoca durante una sesión para no improvisar. Define **cuándo** cargar contexto, **cuándo** planear antes de tocar código, **cuándo** verificar antes de reportar, y — lo más crítico — **cuándo PARAR** ante ambigüedad en vez de adivinar. Aplicable a todo trabajo sobre `pampalabs/core` (sprints hotfix, batches de cierre, auditorías, features nuevas).

## Comandos core

1. **`/sc:load`** — SIEMPRE al arrancar. Carga contexto del proyecto + skills base (`pampalabs-context`, `obsidian-markdown`, relevantes según tarea). Tool: `Skill` (SuperClaude plugin). Sin este paso, Claude Code opera ciego sobre MASTER-PLAN, ROADMAP, DEBTs activos, brand_ids, schema real.
2. **`/gsd:plan-phase`** — tras leer el prompt del batch/sprint. Arma plan explícito con pasos numerados + dependencias + estimación de subagentes paralelos. Output obligatorio: plan numerado + qué pasos son `[paralelizable]` vs `[secuencial]` + criterio de aceptación por paso. El plan se escribe antes de tocar código — nunca después.
3. **`/sc:verify`** — al final del batch, antes del reporte a Jorge. Multi-agent verification del trabajo entregado (code edits + docs vault + commits + smoke tests). Detecta desviaciones silenciadas, asserts inline incompletos, docs sin frontmatter, commits sin rationale.
4. **Comandos complementarios frecuentes:**
   - **`/gsd:execute-phase`** — ejecuta el plan producido por `plan-phase` paso a paso con checkpoints.
   - **`/sc:analyze`** — análisis de bloque de código / flujo cuando `plan-phase` detecta ambigüedad y necesita más evidencia antes de proponer.
   - **`/gsd:research-phase`** — cuando el scope requiere inventario empírico (grep callers, DB schema, integraciones) antes de poder planear.

### Shape del output de `/gsd:plan-phase`

```
Paso 1 [secuencial] — Grep callers de `deprecatedAdapter` en products/content-factory/src/
  Aceptación: lista completa de archivos + línea + contexto
Paso 2 [secuencial, bloquea 3-5] — Decidir estrategia (coexistencia / refactor big-bang / revert)
  Aceptación: decisión de Jorge registrada en LOG
Paso 3 [paralelizable con 4, 5] — Aplicar guard de tipo al adapter
  Aceptación: tsc pasa + tests unit de guard
Paso 4 [paralelizable con 3, 5] — Escribir DEBT `DEBT-adapter-legacy-coexistence`
  Aceptación: doc con frontmatter + 3 signals placeholder
Paso 5 [paralelizable con 3, 4] — Documentar decisión en LOG-BATCH-FASE-B-3
  Aceptación: sección "Decisiones tomadas" + rationale empírico
```

El output explicita **dependencias + qué se paraleliza + criterio de aceptación por paso**. Sin estos 3 campos, el plan no sirve — se re-pide.

## Timing en una sesión

| Paso | Comando | Cuándo | Output |
|------|---------|--------|--------|
| Arranque | `/sc:load` | Primero, antes de leer el prompt del usuario | Context del project (MASTER-PLAN, ROADMAP, DEBTs, brand_ids) + skills disponibles cargadas |
| Post-lectura del prompt | `/gsd:plan-phase` | Después de leer prompt + entender scope, ANTES de tocar código | Plan numerado con pasos `[paralelizable]` / `[secuencial]` + criterio de aceptación por paso |
| Durante ejecución | (ninguno recurrente) | — | Skills específicas leídas on-demand según [[OBSIDIAN-VAULT-CONVENTIONS]] y tarea concreta (UI → premium-ui-engine, DB → supabase-postgres-best-practices, etc.) |
| Pre-reporte | `/sc:verify` | Cuando el trabajo del batch se completó, ANTES del reporte final a Jorge | Multi-agent verification report con desviaciones detectadas + cobertura de docs + checklist QA |

## Interacción con Superpowers

`/gsd:plan-phase` identifica subagentes paralelos en el plan. Cada paso marcado `[paralelizable]` es candidato a fan-out via [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]. El pattern canónico: el orquestador lanza N subagentes con scopes **disjuntos** (ej. "BATCH 1 = refactor adapter A", "BATCH 2 = refactor adapter B", "BATCH 3 = test harness"), cada uno con su LOG propio, y fan-in al final con un `/sc:verify` global del orquestador.

Regla: si `plan-phase` detecta **>3 pasos paralelizables** sobre scopes disjuntos, se invoca Superpowers automáticamente. Fan-out sin plan explícito = prohibido (produce drift de alcance entre subagentes).

> [!warning] Scopes disjuntos ≠ features disjuntas
> Dos subagentes pueden trabajar sobre features distintas y aún así colisionar (ej. ambos editan `package.json`, ambos tocan `brand_integrations` schema). El plan `plan-phase` debe **declarar archivos/tablas tocados por cada subagente** antes del fan-out. Si hay overlap, se serializa o se refactoriza el plan.

## Cuándo PARAR vs proceder autónomo

### PARÁ INMEDIATAMENTE si

- **Ambigüedad irresoluble** con skills cargadas + `pampalabs-context` + vault. Si después de leer docs relevantes sigue habiendo >1 interpretación válida, parar.
- **Schema empírico diverge del asumido** — ej. el código asume columna `X` pero `information_schema` no la tiene, o tipos son `jsonb` vs `text` esperado.
- **Caller identificado out of scope** — ej. grep de un símbolo que el spec dice "deprecar" devuelve callers en módulos no mencionados en el prompt.
- **Cast `as unknown as X`** necesario para que TypeScript compile — señal de que la interface no refleja la realidad runtime; parar y re-diseñar.
- **Grep devuelve más matches de los esperados** — el spec asume N instancias y el repo tiene N+M; las M extra necesitan decisión antes de tocarlas.
- **ORPHAN state detectado** — migration aplicada parcialmente, feature flag en estado inconsistente, commits fuera de `main`, doc referenciado que no existe. Investigar antes de seguir.

Frente a PARÁ, Claude Code reporta a Jorge: **problema empírico + opciones A/B/C con trade-offs + recomendación + espera decisión**. Nunca improvisar "el fix obvio".

### Proceder autónomo si

- **Criterios cubiertos por skills + contexto** — el prompt + `pampalabs-context` + skills específicas dan respuesta unívoca.
- **Decisión tiene 1 alternativa obvia sin trade-offs** — ej. agregar `export` faltante, fix de typo, import de util ya existente.
- **Trabajo es idempotent + reversible** — ej. agregar DEBT doc, actualizar frontmatter, commit en branch feature que todavía no deployó.
- **Evidencia empírica clara** — grep / query / schema introspection confirman la hipótesis; aplica [[AUDITORIA-METODOLOGIA]] Regla #12 triangulación.

## Ejemplos empíricos

### BATCH 3 — Claude Code frenó ante ambigüedad del adapter legacy

El spec del BATCH 3 (FASE B, sprint-cierre-tiendanube-definitivo) decía "deprecar adapter `brand-integrations.service.ts`". Claude Code ejecutó `/gsd:plan-phase` y, antes de tocar código, grepeó callers. Resultado empírico: el adapter lo usan 10+ callers en OAuth flows de Meta, Google, TikTok y Tiendanube — no solo el módulo bajo refactor. **PARÁ** activado: Claude Code reportó a Jorge el inventario de callers + 3 opciones (A: coexistencia con adapter marcado deprecated + guard de tipo; B: refactor big-bang de todos los callers; C: mantener adapter, refactor solo internos). Jorge eligió Opción A (coexistencia). Sin el PARÁ, el fix "obvio" (borrar el adapter) hubiera roto 4 OAuth flows en producción.

Ver [[../sprints/sprint-cierre-tiendanube-definitivo/LOG-BATCH-FASE-B-3]] sección "Cambios de diagnóstico durante el sprint" + "Decisiones tomadas" (Decisión 1 de Jorge sobre coexistencia).

### BATCH 2 — 3 desviaciones aprobadas reportadas explícitamente

BATCH 2 del mismo sprint aplicó el pattern de **desviación reportada con rationale**. Tres decisiones técnicas surgieron durante ejecución que divergían del plan `plan-phase`:

1. **Narrow interface `EcomCredentialsDbClient` vs `SupabaseClient`** — el plan decía "usar `SupabaseClient` genérico", empíricamente se optó por interface estrecha tipada a los métodos realmente usados. Rationale: reduce superficie de mock en tests + acopla menos al SDK.
2. **Real pino con destination capture vs mock Logger** — el plan decía "mock Logger para tests", se usó pino real con destination capturado a buffer. Rationale: cubre el `scope`/`operation`/`err` serialization empírica del logger prod.
3. **`@vitest/coverage-v8` como devDependency** — no estaba instalado en el package; se agregó vs skip coverage. Rationale: QA-CHECKLIST exige coverage report, sin la dep el check fallaba silenciosamente.

Cada desviación se documentó inline como decisión técnica con formato: **problema / alternativas consideradas / decisión / rationale / impacto**. Ver [[../sprints/sprint-cierre-tiendanube-definitivo/LOG-BATCH-FASE-B-2]].

## Origen empírico

Este workflow se formalizó el 2026-04-19 como parte de BATCH 3.5 del sprint-cierre-tiendanube-definitivo, extrayendo el pattern aplicado durante **FASE A + B1 + B2 + B3** de ese mismo sprint. Los PARÁs reales de los LOGs (BATCH 3 adapter legacy, BATCH 2 tres desviaciones) demostraron que sin `plan-phase` explícito, el "fix obvio" es sistemáticamente incorrecto cuando el código tiene >3 callers o >1 responsabilidad. La disciplina `/sc:load` → `/gsd:plan-phase` → execute → `/sc:verify` redujo a **cero** el rework post-deploy durante esos 4 batches.

## Reglas operativas

1. **`/sc:load` SIEMPRE primero** — zero excepciones. Ni siquiera para "tareas chicas" o "ya tengo el contexto de la sesión anterior" (el contexto se pierde entre sesiones; el comando es barato).
2. **`/gsd:plan-phase` SIEMPRE tras leer el prompt** — antes de tocar código, incluso si el prompt parece trivial. El plan forzado expone ambigüedades que "parecían obvias".
3. **Si el plan detecta ambigüedad → PARÁ** antes de improvisar. Reportar a Jorge con opciones A/B/C + recomendación + esperar decisión.
4. **Si el plan detecta pasos paralelizables >3** → invocar subagentes via [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]. Fan-out sin plan explícito = prohibido.
5. **Reportá desviaciones con rationale empírico** (no "me pareció mejor"). Formato: problema / alternativas / decisión / rationale / impacto, documentado inline en el LOG del batch.
6. **`/sc:verify` antes del reporte final** — aplica cuando hubo code edits + docs vault + commits. Para reportes puros (solo lectura / solo doc), opcional.

## Qué evitar

1. **Saltar `/sc:load`** ("ya sé el contexto" — falso; el vault cambió entre sesiones, DEBTs se cerraron, MASTER-PLAN se syncó).
2. **Saltar `/gsd:plan-phase`** y empezar a escribir código directo — las desviaciones no detectadas a priori se vuelven rework silencioso post-deploy.
3. **Proceder sin PARÁ ante ambigüedad** — produce fixes "obvios" que rompen callers no inventariados (caso BATCH 3 adapter legacy).
4. **No reportar desviaciones** — rompe trust con Jorge y destruye la posibilidad de reviewar decisiones técnicas post-hoc.
5. **Subagentes sin plan explícito** — fan-out sin fan-in controlado produce drift de alcance, duplicación de trabajo, conflictos de merge.

## Relacionados

- [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]] — fan-out/fan-in pattern para pasos `[paralelizable]`.
- [[OBSIDIAN-VAULT-CONVENTIONS]] — frontmatter YAML, wikilinks, carpetas canónicas.
- [[LOOP-7-STEPS]] — loop operativo cuando una tarea requiere iteración con checkpoints.
- [[AUDITORIA-METODOLOGIA]] — Regla #12 triangulación 3 signals aplicable al `/sc:verify` pre-reporte.
- [[DEPLOY-WORKFLOW]] — §C hotfix lifecycle + Paso 4.5 schema checkpoint, ejecutados tras `/sc:verify` OK.
