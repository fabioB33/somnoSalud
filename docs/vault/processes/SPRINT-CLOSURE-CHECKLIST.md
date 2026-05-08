---
title: "Proceso — Sprint Closure Checklist (FASE 4 obligatoria al cerrar cualquier sprint)"
date: 2026-04-29
last_synced_with_vault_reality: 2026-04-29
tags: [proceso, sprint, closure, documentation, checklist, obsidian-vault, governance, pampalabs-context]
status: active
related:
  - "[[QA-CHECKLIST]]"
  - "[[DEPLOY-WORKFLOW]]"
  - "[[TEMPLATE-DEBT]]"
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[LOOP-7-STEPS]]"
  - "[[OBSIDIAN-VAULT-CONVENTIONS]]"
  - "[[GSD-WORKFLOW]]"
  - "[[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]"
owner: jorge + claude-code + cowork
created: 2026-04-29
---

# Sprint Closure Checklist — FASE 4 obligatoria

> [!info] Por qué existe este proceso
> Audit empírico 2026-04-29 sobre Sprints 73.C, 73.D, 73.E confirmó gaps repetidos: lessons-learned NO creados pese a falsificar 3 hipótesis críticas (snake_case, onboarding_progress, Resend DNS), session notes ausentes, CLAUDE.md raíz desactualizado, DEBT-RADAR desincronizado post-merge. La causa raíz: el prompt template a Claude Code/Cowork pedía "documentar inline" pero NO definía qué archivos crear/actualizar como bloqueante para cerrar el sprint. Este proceso lo formaliza.

## Cuándo aplica

A **CADA sprint** que entrega código, doc, o decisión estratégica significativa. Tanto sprints ejecutados por Claude Code como por Cowork como por Jorge directo. Sin excepciones.

## Regla absoluta

**Un sprint NO está cerrado hasta que TODOS los items del checklist aplicables estén ticados.** El commit final + push + reporte ejecutivo en chat NO se hacen antes. Si algún item falla, el sprint queda en `closure-pending-docs` hasta que se cierre.

## Checklist obligatorio

### Bloque A — Sprint doc (siempre)

- [ ] Frontmatter actualizado: `status` cambiado a estado final (`code-pending-merge`, `closed-verified`, `code-pending-merge-p1-blocked`, etc.) + `updated: YYYY-MM-DD` agregado.
- [ ] Sección `## FASE 1 RESULTADOS` agregada al final del sprint doc con output empírico de cada hipótesis falsada/confirmada (formato: `H1 → CONFIRMADA / FALSADA. Evidencia: <comando + output>. Implicancia: <qué cambia en el plan>`).
- [ ] Sección `## FASE 2 LOG` agregada con qué se cambió en cada archivo (path + líneas + decisión tomada). Decisiones de diseño documentadas inline.
- [ ] Sección `## FASE 3 EVIDENCIAS PLANEADAS` con E1-E3 por DEBT padre listas para que Jorge las capture post-deploy. Comando exacto + resultado esperado.
- [ ] Sección `## FASE 4 CHECKLIST` con este checklist ticado item por item.

### Bloque B — DEBTs padres (siempre)

Por cada DEBT en `parent_debts` del frontmatter:

- [ ] Frontmatter actualizado con `updated: YYYY-MM-DD` + `status` movido al estado final + `closing_sprint: "[[../sprints/<sprint-slug>/<sprint-doc>]]"` agregado.
- [ ] Callout `> [!success] Status update YYYY-MM-DD — <NUEVO_STATUS>` insertado al inicio del body con:
  - Resumen de qué se shippó (1-3 oraciones)
  - Hipótesis del DEBT que fueron falsadas empíricamente (si las hubo)
  - Branch + commit hash
  - Triangulación 3 evidencias (si está pre-deploy: planeadas; si post-deploy: capturadas)
- [ ] Tags del frontmatter incluyen el sprint number (ej `sprint-73e`).

### Bloque C — Sub-DEBTs (cuando aplique)

Por cada side-finding o gap que NO se cierra en este sprint pero sí merece tracking:

- [ ] Archivo creado en `docs/vault/debt/DEBT-<area>-<gap-descriptivo>.md` siguiendo [[TEMPLATE-DEBT]].
- [ ] Verificado con `ls docs/vault/debt/DEBT-<filename>.md` que el archivo EXISTE en disco (no solo wikilink fantasma).
- [ ] Wikilinks bidireccionales: el sub-DEBT linkea al sprint origen, el sprint doc linkea al sub-DEBT en `followup_debts`.
- [ ] Inventario detallado: cada sub-DEBT tiene evidencia + propuesta + estimación + prioridad.

### Bloque D — Lesson-learned (cuando aplique)

**Crear `docs/vault/lessons-learned/LL-YYYY-MM-DD-<resumen-corto>.md` SI durante el sprint:**

- Falsificaste empíricamente una hipótesis crítica del DEBT padre (ej: "snake_case false → causa real era blanket middleware").
- Detectaste un patrón sistémico que afecta otros sprints (ej: "vault desincronizado con realidad post-merge").
- Encontraste deuda de governance (ej: "migration aplicada en DB sin versionar").
- Tomaste decisión arquitectural reusable (ej: "fallback silencioso → null + telemetry, NO valor default").

Frontmatter mínimo:
```yaml
---
title: "<Lección reusable, en imperativo: 'Falsificar hipótesis del DEBT antes de codear'>"
date: YYYY-MM-DD
tags: [lesson-learned, <area>, <pattern>]
detected_during: <sprint-slug>
applies_to: [<sprints futuros donde aplica>]
---
```

Cuerpo: contexto (3 líneas) + qué pasó (5 líneas) + qué aprendimos (regla concreta) + cómo aplicar a futuros sprints (acción específica).

### Bloque E — Session note (cuando aplique)

**Crear `docs/vault/sessions/YYYY-MM-DD-<resumen-corto>.md` SI:**

- El sprint duró >2h efectivas (o se cerraron 2+ DEBTs en una sesión).
- Hubo coordinación con otros agentes (Cowork + Claude Code paralelo + Jorge).
- Hubo decisión estratégica que afecta roadmap.

Frontmatter:
```yaml
---
title: "Sesión YYYY-MM-DD — <resumen 5-10 palabras>"
tags: [session, <sprint-slugs>, <agentes-involucrados>]
date: YYYY-MM-DD
participants: [jorge, claude-cowork, claude-code]
duration: "~Xh (HH:MM a HH:MM ART)"
---
```

Cuerpo: cronología por hito + qué se shippó + decisiones tomadas (numeradas) + pendientes para próxima sesión + compliance check.

### Bloque F — CLAUDE.md raíz (cuando aplique)

**Editar `/Users/elizabethuribe/Pampa-Labs-Core/CLAUDE.md` SI el sprint cambia:**

- Status de un servicio externo (ej: Resend `PENDIENTE` → `code-pending-merge`).
- Stack del producto principal (ej: nueva dependencia crítica).
- Roadmap inmediato (sección "Próximas 4 semanas").
- DEBTs CRITICAL abiertos/cerrados.
- Productos en producción (estado, tracción, modelos comerciales).
- Procesos obligatorios (sección "Instrucciones para Claude Code").

Buscar líneas relevantes con `grep -n "<keyword>" CLAUDE.md` antes de editar. Actualizar `Última actualización: <fecha>` al final si fue cambio significativo.

### Bloque G — DEBT-RADAR (siempre)

Editar `docs/vault/DEBT-RADAR-<fecha>.md`:

- [ ] Fila del sprint actual cambiada a status final.
- [ ] DEBTs padres del sprint movidos de "Tier 1/2 abiertos" a "DEBTs cerrados o transitados" si pasaron a `code-pending-merge` o `closed-verified`.
- [ ] Sub-DEBTs nuevos agregados a la sección apropiada (Tier 1/2/3 según prioridad).
- [ ] Si aparecen >3 cambios al RADAR, considerar versionar a `DEBT-RADAR-<fecha-nueva>.md` con frontmatter `previous_radar` apuntando al anterior.

### Bloque H — MASTER-PLAN (cuando aplique)

**Editar `docs/vault/MASTER-PLAN.md` SI el sprint:**

- Cierra/abre una Fase major del roadmap (Fase A/B/C).
- Cambia el target del launch self-service.
- Agrega/quita un producto de la prioridad inmediata.

Si solo es un sprint hotfix o lote pequeño, NO tocar MASTER-PLAN.

### Bloque I — Wikilinks bidireccionales (siempre)

- [ ] Cada nuevo doc creado tiene wikilink a su parent (sprint padre, DEBT padre, audit, lesson-learned).
- [ ] El parent tiene wikilink al nuevo doc agregado en `related:` o `followup_debts:`.
- [ ] Verificar con `grep -rn "<filename-sin-extension>" docs/vault/` que aparece referenciado.

### Bloque K — Filesystem housekeeping post-merge (formalizado 2026-05-07)

> [!info] Por qué existe este bloque
> Audit 2026-05-07 ([[../audits/2026-05-07-vault-filesystem-cleanup/00-README]]) detectó 7 worktrees git huérfanos en home + 9 branches stale + 1 carpeta CONTAMINATED nunca borrada + drift naming en Vault. Causa raíz: la FASE 4 cubría docs y commit pero no incluía housekeeping de filesystem post-merge. Lesson learned: [[../lessons-learned/LL-2026-05-07-filesystem-housekeeping-drift]].

Aplica únicamente cuando el sprint usó **worktrees git separados** o creó **branches** que ya están mergeadas/abandonadas. NO aplica si el sprint corrió en la branch principal.

- [ ] **Retirar worktree del sprint:** `git worktree remove --force <path>` (ej: `git worktree remove --force ~/Pampa-Labs-Core-76G`).
- [ ] **Borrar branch local mergeada:** `git branch -d <branch>` (usar `-d` con safety check, NO `-D` forzado a menos que sea squash-merge).
- [ ] **Verificar housekeeping limpio:**
  ```bash
  git worktree list           # solo el principal + worktrees activos justificados
  git branch | grep <sprint>  # branches del sprint borradas
  git status --porcelain | head    # raíz limpia, sin deliverables sueltos
  ```
- [ ] **Si el sprint generó deliverables de cliente** (.docx, .pdf, banners, decks): mover a `clients/<brand>/deliverables-YYYY-MM/` antes de cerrar el sprint. Esa carpeta es gitignored — NO commitear deliverables.
- [ ] **Si el sprint creó assets binarios pesados** (>10 MB cumulado): mover a `clients/<brand>/source-<origen>/` (gitignored) o setear Git LFS. NO commitear ZIPs/.mov/.png crudos al repo.

### Bloque J — Reporte ejecutivo en chat (siempre)

Pegar en el chat del agente que entrega:

```
📋 Reporte ejecutivo — Sprint XX.X <Nombre>

Branch: <branch-name>
Commit: <hash> — <commit-subject>
N archivos, +M líneas / −K
PR a crear: <github-compare-url>

---
Hipótesis falsadas empíricamente (lección Sprint 73.C/D/E)
1. H1: <claim original> → CONFIRMADA / FALSADA. Evidencia: <comando + output>.
2. H2: ...

---
Status final por patch
| Patch | Status | DEBT |
|---|---|---|
| P1 | code-pending-merge | <link-debt> |
| P2 | ... | ... |

---
Evidencias capturadas (pre-merge)
- Backend: tsc + tests + build
- Frontend: lint + tsc + tests + build
- DB (si aplica): query MCP supabase-cf result

---
Próximos pasos accionables para Jorge
1. Crear PR desde URL de arriba.
2. Mergear a main vía GitHub UI cuando <dependencia> haya cerrado.
3. Deploy <backend|frontend> al VPS con <comando exacto>.
4. Triangulación 3 evidencias post-deploy: <E1, E2, E3>.
5. Smoke <patch> post-deploy: <comando + esperado>.

---
Decisiones de diseño aplicadas
- <regla universal aplicada>
- <decisión arquitectural>

---
Documentación actualizada en este sprint (FASE 4 checklist):
- [x] Sprint doc con FASE 1/2/3/4 RESULTADOS
- [x] DEBT padre 1: callout success + status code-pending-merge
- [x] DEBT padre 2: idem
- [x] Sub-DEBT NEW: <link>
- [x] Lesson-learned: <link> (porque falsificó H<n>)
- [x] Session note: <link>
- [x] CLAUDE.md raíz línea <N> actualizada (Resend status)
- [x] DEBT-RADAR fila Sprint XX.X actualizada a code-pending-merge
- [x] Wikilinks bidireccionales verificados con grep
- [ ] MASTER-PLAN N/A (sprint pequeño, no afecta roadmap)
```

## Skills usage verificable (mandatorio)

Antes de empezar el sprint, ejecutar Y pegar output en el sprint doc bajo `## FASE 0 — Skills cargadas`:

1. **`/find-skills`** o equivalente — listar skills disponibles en este repo. Pegar primeras 10 líneas del output.
2. **`/gsd:plan-phase`** (si el sprint tiene >2 patches o >5 archivos) — invocar el GSD para planificar. Pegar el plan resultante.
3. **`/superpowers:*`** (si el sprint tiene 2+ patches independientes paralelizables) — invocar Superpowers para paralelización. Pegar la asignación de subagentes.
4. **Skill específica del dominio** — `obsidian-markdown` para docs, `supabase-postgres-best-practices` para migrations, `premium-ui-engine` para frontend, etc. Listar cuáles cargaste.

Si no usaste un slash command que correspondía (ej: 2 patches paralelizables sin Superpowers), justificar en el reporte ejecutivo bajo "Decisiones de diseño aplicadas".

## Falla del checklist

Si al cerrar el sprint detectás que un item NO se puede cerrar (ej: "lesson-learned aplicaría pero no tengo claridad de qué generalizar"), **escribir explícitamente en el reporte**:

```
- [ ] Lesson-learned: NO CREADO. Razón: <razón concreta>. Sub-DEBT abierto para retomar: <link>.
```

NO ignorar items silenciosamente. Documentación incompleta es deuda nueva.

## Referencias del repo

- Audit empírico que motivó este proceso: sesión 2026-04-29 tarde, Sprint 73.C/D/E entregados sin lessons-learned ni session notes ni CLAUDE.md raíz updates.
- 3 hipótesis falsadas en 3 sprints sin lesson-learned: (1) snake_case en `/sessions/disconnect` era falso; (2) consultar `onboarding_progress` era falso; (3) Resend bloqueado por DNS era falso.
- Patrón sistémico detectado: vault desincronizado con realidad post-merge, sub-DEBTs declarados pero no creados, CLAUDE.md raíz arrastra docs viejos.

## Cross-links

- [[QA-CHECKLIST]] — checklist técnico pre-merge (B.9 lint passing, etc.).
- [[DEPLOY-WORKFLOW]] — proceso de deploy + smoke triangulación 3 evidencias.
- [[TEMPLATE-DEBT]] — template para crear sub-DEBTs.
- [[AUDITORIA-METODOLOGIA]] — proceso de auditoría que detecta drift doc vs realidad.
- [[LOOP-7-STEPS]] — loop iterativo de desarrollo que enmarca este checklist.
- [[GSD-WORKFLOW]] — proceso GSD invocable como `/gsd:plan-phase` y `/gsd:execute-phase`.
- [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]] — proceso para paralelizar patches independientes.
- [[OBSIDIAN-VAULT-CONVENTIONS]] — convenciones del vault Obsidian.
