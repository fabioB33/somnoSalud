---
title: "TEMPLATE — DEBT file (copiar literal)"
date: 2026-04-19
last_synced_with_vault_reality: 2026-04-19
tags: [proceso, template, debt, auditoria]
status: active
related:
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[DEPLOY-WORKFLOW]]"
---

# TEMPLATE — DEBT file

> [!info] Uso
> Copiar el bloque debajo de "Contenido template" a un archivo nuevo en `docs/vault/debt/DEBT-<nombre-descriptivo>.md`. Rellenar los placeholders `<...>`. El filename usa **kebab-case** y el prefijo `DEBT-` siempre.

## Naming convention

- Archivo: `DEBT-<area>-<gap-descriptivo>.md` (kebab-case).
- Ejemplos reales: `DEBT-tiendanube-granularity-gap.md`, `DEBT-deploy-workflow-env-sanity.md`, `DEBT-quartz-slugify-case.md`, `DEBT-luna-escalation-antipattern.md`.

## Contenido template

```markdown
---
title: "Deuda Técnica — <resumen corto, 5-10 palabras>"
date: YYYY-MM-DD
# updated: YYYY-MM-DD       (agregar cuando el DEBT transitione de status)
tags: [deuda-técnica, <area-1>, <area-2>, <operations|rls|ux|api|schema>, <backlog|scheduled|open>]
status: <backlog | open | fix-in-progress | ready-for-deploy | closed-verified | partial-closed | investigation-in-progress | resolved | dismissed>
priority: <critical | high | medium | low>
scope: <post-sprint-N | fase-2 | immediate | backlog>
detected_during: <audit-phase-a | sprint-N | incident-YYYY-MM-DD | hotfix-YYYY-MM-DD>
# closed_by: <sprint-name-que-cerro-el-debt>   (cuando status = closed-verified)
related:
  - "[[<sección origen del audit>]]"
  - "[[<sprint o plan relacionado>]]"
  - "[[<debts hermanos si hay>]]"
---

# <Título descriptivo>

> [!info] Origen
> <De dónde salió el hallazgo. Ejemplo: "Sección 1 de Auditoría Fase A 2026-04-18 — al revisar integración Tiendanube se detectó que el provider trae órdenes granulares pero el service consumer solo persiste 6 agregados".>

## Contexto

<Explicación del problema con nivel de detalle suficiente para que otro dev (o vos mismo en 3 meses) entienda sin pedir contexto adicional. Incluir:
- Qué función/tabla/endpoint/archivo está involucrado
- Qué debería pasar vs qué pasa hoy
- Impacto concreto (bug silencioso, data loss, UX degradada, cost risk, security risk)>

## Evidencia

<Archivos + líneas + queries + screenshots. Ser específico. Si es código: `path/al/archivo.ts:123`. Si es Supabase: query SQL ejecutada + output. Si es UI: screenshot + ruta.>

## Propuesta

<Resolución a alto nivel. NO implementar — es backlog. Incluir:
- Qué cambios de código/schema/proceso se necesitan
- Dependencias (requiere X antes)
- Estimación gruesa (horas / días / sprint)>

## Scope

<Cuándo se resuelve: este sprint, próximo sprint, Fase 2, sprint de polish, etc.>

## Prioridad

**<critical | high | medium | low>** — <razón del priority. Ejemplo: "critical porque afecta a data de cliente de pago"; "low porque es polish UI".>

## Relacionados

- [[<Sección origen>]] — donde fue detectado
- [[<doc/debt hermano>]]
- [[<sprint o plan>]]
```

## Checklist al crear un DEBT

- [ ] Filename con prefijo `DEBT-` y kebab-case
- [ ] Frontmatter completo (todos los campos requeridos)
- [ ] Sección "Origen" indica de qué auditoría/sprint/incidente salió
- [ ] "Evidencia" con archivos + líneas + queries específicas (nunca genéricas)
- [ ] "Propuesta" es alto nivel, NO implementación
- [ ] Priority justificado en 1 línea
- [ ] Wikilink al doc de sección origen desde "Relacionados"
- [ ] Wikilink inverso: el doc de sección origen linkea a este DEBT en su lista "DEBTs abiertos"

## Checklist al cerrar un DEBT (closed-verified)

Agregado 2026-04-19 basado en los 4 CRITICAL cerrados 2026-04-18/19. Un DEBT solo llega a `closed-verified` con evidencia empírica triangulada (ver [[DEPLOY-WORKFLOW#§C — Hotfix lifecycle + closed-verified pattern]]).

- [ ] Status progression respetada: `open → fix-in-progress → ready-for-deploy → closed-verified`. No saltear estados.
- [ ] Mínimo 3 evidencias triangulas (boot log + smoke test + query MCP o dashboard externo) antes de `closed-verified`.
- [ ] Frontmatter agrega `updated: YYYY-MM-DD` + `closed_by: <sprint-name>` al transicionar.
- [ ] Callout al top del DEBT: `**Status update YYYY-MM-DD — CLOSED-VERIFIED.** <Sprint/commit que lo cerró> aplicó <resumen del fix>. Evidencia: <boot log + smoke + MCP>.`
- [ ] El commit que cierra el DEBT (status `closed-verified`) es DIFERENTE al commit que introdujo el fix (status `ready-for-deploy`). Separación temporal obligatoria para evitar "closed-on-paper".
- [ ] Si el DEBT resuelve parcialmente, usar status `partial-closed` + documentar qué quedó open + estimación del trabajo restante.
- [ ] Si el diagnóstico requiere observación adicional, usar status `investigation-in-progress` + plan de verificación con queries concretas (ej. DEBT-crones-silent-anomalies).

## Ejemplos reales en SomnoSalud (buscar inspiración)

DEBTs creados durante [[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]:

- [[../debt/DEBT-vitest-coverage-output]] — priority low, scope sprint-2 (warning de turbo `outputs` declarados pero no generados).
- [[../debt/DEBT-curar-agents-pampalabs-os]] — priority medium, scope sprint-2 (46 agents heredados, ~21 irrelevantes).
- [[../debt/DEBT-procesos-heredados-content-factory]] — priority medium, scope sprint-2 (QA-CHECKLIST + DEPLOY-WORKFLOW asumían Content Factory + VPS Docker).

A medida que se acumulen DEBTs en SomnoSalud, esta lista se mantiene actualizada como referencia de patrones aplicados al proyecto.

## Changelog

- **v1.0 — 2026-04-18** (heredado Pampa Labs Core) — Template inicial extraído de la convención aplicada en los 8 DEBTs existentes pre-auditoría.
- **v1.1 — 2026-04-19** (heredado Pampa Labs Core) — Agregados status `fix-in-progress`, `ready-for-deploy`, `closed-verified`, `partial-closed`, `investigation-in-progress` + campos opcionales `updated` y `closed_by` en frontmatter + checklist de cierre con triangulación de 3 evidencias. Origen: 4 CRITICAL cerrados 2026-04-18/19 en Pampa Labs Core que definieron el patrón empírico. Ver [[DEPLOY-WORKFLOW#§E — Hotfix lifecycle + closed-verified pattern (UNIVERSAL)]].
- **v1.2 — 2026-05-08** (SomnoSalud) — Reemplazados ejemplos hardcoded de DEBTs cross-product (Tiendanube/Luna/Quartz, vivían en otro Vault) por ejemplos reales de SomnoSalud creados durante Sprint 1. Cleanup parte de [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]].
