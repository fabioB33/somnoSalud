---
title: Obsidian Vault Conventions — Pampa Labs
tags: [process, vault, obsidian, conventions, canonical, ssot, pampa-labs]
status: current
owner: jorge
created: 2026-04-19
updated: 2026-04-19
related:
  - "[[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]"
  - "[[GSD-WORKFLOW]]"
  - "[[LOOP-7-STEPS]]"
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[DEPLOY-WORKFLOW]]"
  - "[[TEMPLATE-DEBT]]"
  - "[[MASTER-PLAN]]"
  - "[[ROADMAP]]"
---

# Obsidian Vault Conventions — Pampa Labs

> [!info] Propósito
> Este doc es el **SSoT canónico** de cómo se escribe en el vault `docs/vault/` de Pampa Labs (publicado en `vault.pampalabs.com` via Quartz 4). Toda doc nueva cumple estas reglas. Todo prompt futuro referencia este doc en lugar de repetir convenciones. Si una regla acá contradice instrucciones puntuales de un sprint, gana esta doc salvo override explícito de Jorge.

## Estructura del vault

| Carpeta | Contenido | Ejemplos | Naming |
|---|---|---|---|
| `docs/vault/` (raíz) | Docs canónicos fundacionales del vault + MOCs globales. | `MASTER-PLAN.md`, `ROADMAP.md`, `PRODUCT-VISION.md`, `index.md`, `PAMPALABS-CONTEXT-SKILL.md` | **UPPERCASE** (excepto `index.md` por convención Quartz). |
| `docs/vault/sprints/<slug>/` | Carpetas por sprint con `README.md` + `LOG-BATCH-*.md` + docs auxiliares. | `sprint-cierre-tiendanube-definitivo/`, `sprint-observability-pattern-1-complete/`, `sprint-tiendanube-granularity-fix/` | Slug `sprint-<descriptivo>` en kebab-case. |
| `docs/vault/concepts/` | Patterns reusables, servicios, algoritmos, decisiones arquitecturales transversales. | `[[ecommerce-credentials-service]]`, `[[PATTERN-2-DUAL-STORES-LEGACY-CUTOVER]]`, `[[external-api-rate-limiting-pattern]]` | kebab-case descriptivo, sin prefijo. UPPERCASE solo si el pattern tiene nombre propio tipo "PATTERN-N-X". |
| `docs/vault/processes/` | Workflows recurrentes, reglas operativas, metodologías. | `AUDITORIA-METODOLOGIA.md`, `DEPLOY-WORKFLOW.md`, `QA-CHECKLIST.md`, `TEMPLATE-DEBT.md`, este archivo. | **UPPERCASE** para docs canónicos. |
| `docs/vault/reference/` | Schemas empíricos, fixtures, tablas de referencia estática. | `SCHEMA-EMPIRICAL-2026-04-19.md`, `CALLERS-ECOM-CREDENTIALS.md` | UPPERCASE para snapshots temporales, kebab-case para catálogos vivos. |
| `docs/vault/audits/<YYYY-MM-DD>-<slug>/` | Auditorías sistemáticas con fecha en carpeta. | `2026-04-18-AUDITORIA-FASE-A/`, `2026-04-19-INVENTARIO-DUAL-STATE/` | Fecha ISO + slug UPPERCASE. |
| `docs/vault/debt/` | Deuda técnica. Siempre prefijo `DEBT-`. | `DEBT-tiendanube-granularity-gap.md`, `DEBT-meta-legacy-dual-write.md`, `DEBT-preexisting-as-unknown-as-casts.md` | `DEBT-<area>-<gap>.md` kebab-case. |
| `docs/vault/brands/` | Client data (brand configs, playbooks cliente-específicos, onboarding). | `brands/lure/`, `brands/fonseca/`, `brands/boken/` | kebab-case por brand. |
| `docs/vault/hotfixes/` | Fixes operativos ad-hoc que no ameritan sprint completo pero necesitan traza. | `hotfix-20260417-rls-recursion.md` | `hotfix-<YYYYMMDD>-<slug>.md`. |

## Frontmatter YAML obligatorio

Todo `.md` bajo `docs/vault/` **DEBE** abrir con frontmatter YAML. Sin frontmatter Quartz no renderiza título ni tags ni backlinks.

```yaml
---
title: <título legible humano — no el filename>
tags: [jerárquico-amplio, más-específico, category, topic]
status: <current|in-progress|ready-for-verify|closed-verified|archived|open|closed|deprecated>
priority: <critical|high|medium|low>  # solo DEBTs
created: YYYY-MM-DD
updated: YYYY-MM-DD
scope: <free-form>                     # cuando aplica (ej: typesafety, observability, post-sprint-N)
owner: <jorge>                         # cuando aplica
sprint: "[[sprint-<slug>]]"            # en LOG-BATCH o docs dentro de sprint
batch: "FASE B BATCH 3"                # en LOG-BATCH
commits: ["<hash>", "<hash>"]          # en LOG-BATCH cuando está cerrado
related:
  - "[[wikilink-slug-1]]"
  - "[[wikilink-slug-2]]"
---
```

**Semántica por campo:**

- `title` — humano legible. **NO** repite el filename en kebab-case. Ejemplo: filename `ecommerce-credentials-service.md` → title `"Concepto — getEcommerceCredentials Service (dual-read pattern)"`.
- `tags` — jerárquico **amplio → específico**. Primer tag = tipo de doc. Ver [[#Tagging jerárquico]].
- `status` — según tipo de doc. `current` para concepts vivos, `in-progress`/`closed` para sprints y LOG-BATCH, `open`/`ready-for-verify`/`closed-verified` para DEBTs. Ver [[TEMPLATE-DEBT#Checklist al cerrar un DEBT (closed-verified)]] para transiciones DEBT.
- `priority` — **SOLO** en DEBTs. `critical` = stopper launch, `high` = lanzable con workaround, `medium` = fix eventual, `low` = polish. Calibrado exacto en [[AUDITORIA-METODOLOGIA#Criterios de severity]].
- `created` / `updated` — ISO `YYYY-MM-DD`. Hoy `2026-04-19` es válido. `updated` se bumpea en cada edit sustantivo, no en typos.
- `related` — **bidireccional obligatorio**. Ver [[#Wikilinks bidireccionales]].

## Naming conventions

**Filenames de contenido regular** — kebab-case:
- `ecommerce-credentials-service.md`
- `config-put-ecom-interceptor.md`
- `oauth-vs-ecom-credentials-services-coexistence.md`

**UPPERCASE** — docs canónicos de raíz o con nombre propio:
- `MASTER-PLAN.md`, `ROADMAP.md`, `PRODUCT-VISION.md`, `CLAUDE.md` (root), `AUDITORIA-METODOLOGIA.md`, `DEPLOY-WORKFLOW.md`, `TEMPLATE-DEBT.md`, `PATTERN-2-DUAL-STORES-LEGACY-CUTOVER.md`, `SCHEMA-EMPIRICAL-2026-04-19.md`.

**Prefijos obligatorios:**
- `DEBT-<slug>.md` — toda deuda técnica. Nunca archivos de debt sin el prefijo.
- `LOG-BATCH-<FASE>-<N>.md` — logs de batch dentro de `sprint-*/`. Ejemplo: `LOG-BATCH-FASE-B-3.md`.
- `sprint-<slug>/` — carpeta sprint. Ejemplo: `sprint-cierre-tiendanube-definitivo/`.
- `hotfix-<YYYYMMDD>-<slug>.md` — hotfix operativo.

**Fechas en nombres** — ISO `YYYY-MM-DD`:
- Audits: `audits/2026-04-19-INVENTARIO-DUAL-STATE/`
- Snapshots schema: `SCHEMA-EMPIRICAL-2026-04-19.md`
- Audits puntuales: `audit-dual-write-platforms-2026-04-19.md`

**Concepts** — kebab-case descriptivo, sin prefix salvo que sea un pattern numerado (`PATTERN-2-*`).

## Tagging jerárquico

Regla de oro: **amplio → específico**. Cada doc tiene 3-7 tags.

1. **Primer tag** = tipo de doc: `sprint`, `debt`, `concept`, `process`, `audit`, `log`, `reference`, `hotfix`.
2. **Segundo tag** = category transversal: `critical`, `typesafety`, `observability`, `rls`, `security`, `schema`, `structural-cleanup`, `dual-state`, `cutover`.
3. **Tercero+** = topic específico del dominio: `tiendanube`, `ecom`, `meta-ads`, `rate-limiting`, `rls-recursion`, `cohort-analysis`.
4. **Flags de estado** (opcionales, van al final): `canonical`, `ssot`, `empirical`, `drift`, `resolved-structural`, `antipattern`.

**Ejemplos reales del vault actual:**

- LOG-BATCH sprint-cierre: `[log, batch-log, sprint-cierre-tiendanube-definitivo, fase-b-batch-3]`
- Concept service canónico: `[concept, service, ecom-credentials, dual-read, sprint-cierre-tiendanube-definitivo, patron-2, fase-b-batch-2]`
- DEBT housekeeping: `[debt, typesafety, antipattern, housekeeping]`
- DEBT crítico auditoría: `[deuda-técnica, tiendanube, ecommerce, granularity, cohort-analysis, ltv, critical, audit-fase-a, ready-for-verify]`
- Este doc: `[process, vault, obsidian, conventions, canonical, ssot, pampa-labs]`

> [!WARNING] No inventar tags ad-hoc
> Antes de agregar un tag nuevo, `grep -r "tags:" docs/vault/` para ver si ya existe uno equivalente. El vault tiene ~40 tags canónicos — mantener consistencia evita fragmentación del grafo Quartz.

## Callouts por tipo de evidencia

Quartz 4 renderiza callouts con syntax `> [!TYPE]`. Usamos 6 tipos semánticos. Todo callout va con título explícito después del tipo o en la primera línea del bloque.

| Callout | Semántica | Cuándo usarlo | Ejemplo |
|---|---|---|---|
| `> [!SUCCESS]` | Comando / operación OK + **output literal**. | Test run passing, coverage report, `curl 200`, boot log clean, migration aplicada. | Ver [[LOG-BATCH-FASE-B-3#Evidencia empírica]] — callout "Full test suite post-BATCH 3" con output `Test Files 13 passed (13) / Tests 99 passed (99)`. |
| `> [!FAILURE]` | Comando que falló + **hipótesis + fix aplicado**. | Build rojo, TS error, test fallando, deploy con rollback. | TS2589 deep instantiation documentado en [[LOG-BATCH-FASE-B-3#Obstáculo 1 — TS2589 deep instantiation al pasar supabase a service]]. |
| `> [!NOTE]` | **Decisión técnica**. Formato obligatorio: Problema / Alternativas / Decisión / Rationale empírico. | Pivot arquitectural, trade-off entre 2+ caminos, decisión firmada por Jorge. | [[LOG-BATCH-FASE-B-3#Adapter legacy — coexistencia, NO deprecación]] — 3 alternativas evaluadas + rationale empírico. |
| `> [!WARNING]` | Riesgo conocido + **mitigación aplicada o pendiente**. | Alerting post-cutover, path no-op temporal, backfill con watermark, race-condition con fix defensivo. | [[ecommerce-credentials-service#Fallback — pb_brand_config (legacy, pre-cutover)]] — warning sobre `log.warn count>0` post-cutover como regresión. |
| `> [!INFO]` | Contexto adicional, propósito, disclaimer. | Top de procesos, uso de templates, scope limit del doc. | Top de [[AUDITORIA-METODOLOGIA#Propósito]] + top de este doc. |
| `> [!EXAMPLE]` | Ejemplo de uso de API / pattern / invocación. | Código de ejemplo de service, request/response canónico, invocación de helper. | Invocaciones `reportCronRun(...)` en [[sprint-observability-pattern-1-complete]]. |

Cada callout SUCCESS/FAILURE DEBE incluir el output literal en bloque code-fence. No "el test pasó" — el string literal con counts y timestamps.

## Wikilinks bidireccionales

Regla de oro: **si A linkea a B en su `related`, B DEBE linkear a A en su `related`**. Quartz construye el grafo a partir de ambos — si un link es unidireccional, el backlink aparece pero el grafo queda asimétrico.

### Verificación pre-commit

Antes de commitear docs nuevas, verificar:

1. Todos los `[[wikilinks]]` del body resuelven a docs existentes.
2. Todo `related:` tiene back-link recíproco en el doc referenciado.
3. Si un wikilink apunta a un doc aún no creado, usar placeholder explícito y trackearlo como deuda en el LOG-BATCH correspondiente (nunca committear "dead wikilink" silencioso).

### Formato canónico

- `[[slug-sin-extensión]]` — wikilink simple. Quartz normaliza el filename como slug.
- `[[carpeta/slug]]` — cuando el slug colisiona entre carpetas. Ejemplo: `[[sprint-cierre-tiendanube-definitivo/README]]` desde fuera del sprint, `[[README]]` dentro del sprint.
- `[[slug#Heading]]` — link a sección específica. Quartz resuelve el hash contra los H2/H3 del doc.
- `[[slug|Texto custom]]` — alias opcional. Usar **solo** cuando el slug es críptico y el lector necesita contexto. Evitar alias innecesarios.
- **Nunca** `[slug](./slug.md)` (markdown link relativo) — Quartz no lo trata como wikilink, no aparece en backlinks.
- **Nunca** `[[slug.md]]` — la extensión rompe la resolución.

### Quartz slug normalization

Quartz normaliza case-insensitive. `[[SPRINT-TIENDANUBE-GRANULARITY-FIX]]` y `[[sprint-tiendanube-granularity-fix]]` resuelven al mismo doc **siempre que no haya colisión**. Ver [[DEBT-quartz-slugify-case]] — bug conocido con filenames camelCase.

### Placeholders de wikilinks a docs no creados

```md
Ver [[PLACEHOLDER-sprint-name]] (doc aún no creado — tracked en LOG-BATCH-FASE-X).
```

Cada placeholder se captura como línea en la sección "Next actions" del LOG-BATCH que lo introdujo. No dejar `[[foo-bar]]` apuntando a vacío sin marca explícita.

## Headings

- **H1 único** = `title` del frontmatter. Quartz lo renderiza como `<h1>`. **NO** H1 en medio del doc.
- **H2** para secciones principales del doc. Son los anchors navegables del TOC automático.
- **H3** para subsecciones dentro de H2.
- **H4+** esporádico. Si una H4 existe, considerar si debería ser un doc aparte.

Los headings son anclas de wikilinks — cambiar un H2 rompe `[[slug#Heading]]` externos. Cambios de H2 requieren grep + update de inbound links.

## Secciones obligatorias por tipo de doc

Cada tipo de doc tiene un esqueleto canónico. El esqueleto NO es rígido en orden pero SÍ en presencia: si una sección falta, la doc está incompleta.

### Concept (9 secciones)

Ejemplo canónico: [[ecommerce-credentials-service]] (100% coverage empirical evidence, 9 secciones cumplidas).

1. **Propósito** — qué problema resuelve en 2-3 frases.
2. **Ubicación** (si es código) — `path/al/archivo.ts` + ref al sprint que lo creó.
3. **API / Interfaz** — types exportados + función principal con signature TS.
4. **Comportamiento** — flujo con diagrama ASCII si aplica. Paths happy + fallback + error.
5. **Garantías** — security / invariantes / postconditions verificados con callout `> [!SUCCESS]`.
6. **Tests** — archivo del test + lista de scenarios + coverage empírico.
7. **Evidencia empírica** — coverage report output literal + full suite regression count.
8. **Alerting / Monitoreo** (si el concept tiene signals observables) — qué query / log / dashboard detecta regresión.
9. **Referencias cruzadas** — wikilinks bidireccionales al sprint, schema, DEBTs resueltos, callers.

### LOG-BATCH (11 secciones)

Ejemplo canónico: [[LOG-BATCH-FASE-B-3]] (11 secciones + callouts completos + 99/99 tests evidencia).

1. **Objetivo del batch** — bullet list corta de los deliverables.
2. **Plan ejecutado** — checklist `✅/❌` del plan original.
3. **Decisiones tomadas** — callouts `> [!NOTE]` con Problema/Alternativas/Decisión/Rationale.
4. **Desviaciones del plan original** — qué cambió respecto al plan y por qué.
5. **Obstáculos encontrados + cómo se resolvieron** — TS errors, mocks rotos, deps faltantes, etc.
6. **Hallazgos descubiertos** — cosas no planificadas que aparecieron durante ejecución.
7. **Evidencia empírica** — callouts `> [!SUCCESS]` / `> [!FAILURE]` con outputs LITERALES (tests, coverage, build, grep residual, queries MCP).
8. **Artefactos producidos** — tablas con código nuevo/modificado + docs vault + commits con hash.
9. **Wikilinks bidireccionales verificados** — checklist `↔ ✅` de cada link bidireccional.
10. **Next actions** — qué queda para el próximo batch + dependencias.
11. **Relacionados** — wikilinks a sprint parent, MASTER-PLAN, ROADMAP, LOG-BATCHes hermanos.

### DEBT (8 secciones)

Ejemplo canónico: [[DEBT-tiendanube-granularity-gap]] — 8 secciones + Signal 1+2+3 trianguladas + callout drift FASE A 2026-04-19 que detonó Regla #12.

1. **Origen** — callout `> [!info]` con sección de audit / sprint / incidente + **timestamp empírico**.
2. **Contexto** — qué está involucrado + qué debería pasar vs qué pasa hoy + impacto concreto.
3. **Evidencia** — queries, `path:línea`, **outputs literales**. Nunca "ver tal archivo" sin línea concreta.
4. **Propuesta** — resolución a alto nivel. NO implementar (es backlog).
5. **Scope** — cuándo se resuelve (este sprint, sprint dedicado, Fase 2, polish).
6. **Prioridad** — `critical|high|medium|low` + razón de 1 línea.
7. **Por qué no se fixea ahora** — rationale empírico **específico**. Formato aceptable: "Requiere sprint dedicado de X horas porque hay 17 readers en 17 archivos que necesitan refactor coordinado — ver [[audit-dual-write-platforms-2026-04-19]]". **NUNCA** "ver después" / "a revisar" / "TBD".
8. **Relacionados** — wikilinks bidireccionales.

Además, la transición a `closed-verified` sigue [[TEMPLATE-DEBT#Checklist al cerrar un DEBT (closed-verified)]] con 3 evidencias trianguladas (ver también [[AUDITORIA-METODOLOGIA#Reglas de ejecución (no negociables)]] Regla #12).

### Process (6 secciones)

Docs canónicos como este, [[AUDITORIA-METODOLOGIA]], [[DEPLOY-WORKFLOW]].

1. **Propósito** — callout `> [!info]` al top. 2-3 frases.
2. **Cuándo aplica** — triggers concretos que activan el proceso.
3. **Reglas** — lista numerada no-negociable.
4. **Enforcement** — cómo se verifica compliance (comandos empíricos + CI check si aplica).
5. **Ejemplos** — wikilinks a docs que ya aplicaron el proceso correctamente.
6. **Relacionados** — cross-links a procesos hermanos.

### Sprint README (5 secciones)

Ejemplo: [[sprint-cierre-tiendanube-definitivo]] README.

1. **¿Por qué este sprint existe?** — 2-3 párrafos de contexto + detonante (DEBT, incidente, oportunidad).
2. **Fases + estado de cada BATCH** — tabla con `FASE A | BATCH 1 | closed-verified | [[LOG-BATCH-FASE-A]]`.
3. **Artefactos producidos** — código modificado + docs vault creadas/actualizadas.
4. **Criterio de cierre** — qué debe cumplirse antes de marcar sprint `closed-verified`. Incluye schema checkpoint (ver [[DEPLOY-WORKFLOW#Paso 4.5 — Schema checkpoint post-deploy]]).
5. **Relacionados** — MASTER-PLAN, ROADMAP, DEBTs involucrados, sprints hermanos.

## Regla "no dejamos pendientes"

Empíricamente, el vault acumula deuda cuando se permite "ver después". Estas 4 sub-reglas son el contrato mínimo:

### 1. Toda decisión → callout `> [!NOTE]` con 4 campos

Formato fijo: **Problema / Alternativas / Decisión / Rationale empírico**. Si alguna de las 4 falta, la decisión no está documentada.

Ejemplo empírico: [[LOG-BATCH-FASE-B-3#Adapter legacy — coexistencia, NO deprecación]] — 3 alternativas evaluadas + decisión + rationale empírico de por qué unificar services rompería semántica.

### 2. Toda evidencia → output LITERAL (no resumido, no parafraseado)

Bloque code-fence con:
- El comando ejecutado.
- El output completo (o los primeros/últimos N chars si es muy largo — nunca parafraseado).
- Exit code cuando aplique.

Ejemplo empírico: [[LOG-BATCH-FASE-B-3#Build + Typecheck]] — `tsc` + `tsc --noEmit` con `---exit:0---` literal, no "build OK".

### 3. Todo DEBT → scope empírico COMPLETO

Paths + líneas + outputs. **NUNCA** "ver después" / "revisar cuando haya tiempo" / "TBD".

Ejemplo empírico: [[DEBT-tiendanube-granularity-gap]] — 5 fases del sprint documentadas inline + signal 1+2+3 trianguladas + drift FASE A 2026-04-19 explicado con query empírica de la re-ejecución (2985 orders / 7754 items / 147 días vs 127/341/7 documentados).

### 4. Todo wikilink → bidireccional al momento del commit

Pre-commit grep verifica back-links. Si A → B sin B → A, se agrega B → A **antes** del commit, no "en el próximo PR".

Comando de verificación:
```bash
grep -l "\[\[target-slug\]\]" docs/vault/**/*.md  # inbound links a target-slug
```

Si el count esperado no coincide con el actual, se documenta el delta en el LOG-BATCH antes del commit.

## Ejemplos canónicos

Los 3 casos de referencia que toda doc nueva debería imitar en estructura:

### 1. Concept canónico — `[[ecommerce-credentials-service]]`

9 secciones cumplidas (Propósito, Ubicación, API, Comportamiento dual-read, Garantías security, Tests 8 scenarios, Evidencia empírica coverage 100%, Alerting post-cutover, Referencias). Incluye diagrama ASCII de flujo + callout `> [!SUCCESS]` con coverage output literal + callout `> [!WARNING]` alerting post-cutover + callout `> [!NOTE]` decisiones de diseño. Tags jerárquicos: `[concept, service, ecom-credentials, dual-read, sprint-cierre-tiendanube-definitivo, patron-2, fase-b-batch-2]`.

### 2. LOG-BATCH canónico — `[[LOG-BATCH-FASE-B-3]]`

11 secciones completas con callouts `> [!NOTE]` × 3 (decisiones adapter coexistencia, migration path `sql/017`, dual-write auditoría obligatoria) + callouts `> [!SUCCESS]` × 4 (tests 99/99, coverage, build/typecheck, grep residual vacío) + callout `> [!NOTE]` antipatterns pre-existing. Tabla de artefactos con 14 archivos código + 13 docs vault. Checklist bidireccional de 7 links ↔ ✅. Next actions BATCH 4-6 con comandos concretos.

### 3. DEBT canónico — `[[DEBT-tiendanube-granularity-gap]]`

8 secciones + Status update callout + FASE A drift correction callout + Signal 1 (log backfill), Signal 2 (query `pb_ecom_orders` count + max-min), Signal 3 (schema introspection `information_schema`) trianguladas inline. Priority `critical` justificado + scope `post-sprint-1-sprint-dedicado-ecommerce-granular` empírico. 5 fases del sprint documentadas + migraciones aplicadas con refs (013, 014, 015, 016). Es el DEBT que detonó la Regla #12 de [[AUDITORIA-METODOLOGIA]] — por eso es el ejemplo canónico de "scope empírico COMPLETO".

## Enforcement

Compliance se verifica empíricamente con estos comandos. Correrlos **antes** de cada commit de docs nuevas y **después** del push para verificar publicación correcta en `vault.pampalabs.com`.

### Frontmatter presente en toda doc

```bash
# Toda doc tiene frontmatter
grep -L "^---$" docs/vault/**/*.md
# Output esperado: vacío (si alguna línea sale, falta frontmatter en ese archivo)
```

### Campo `related:` presente

```bash
# Docs sin related (excluyendo MOCs puros que no linkean a nada)
find docs/vault -name "*.md" | xargs grep -L "^related:"
```

Docs listados sin `related:` deben justificar la omisión o agregarla.

### Wikilinks resuelven (sin dead links)

```bash
# Extraer todos los targets de wikilinks + verificar existencia
grep -rhoE "\[\[[^]]+\]\]" docs/vault/ | \
  sed 's/\[\[//g; s/\]\]//g; s/|.*$//; s/#.*$//' | \
  sort -u | \
  while read slug; do
    [ -z "$slug" ] && continue
    find docs/vault -iname "${slug}.md" -quit | grep -q . || echo "DEAD: $slug"
  done
```

### Publicación en vault.pampalabs.com (post-push)

```bash
# Verificar que el doc nuevo aparece renderizado con su H1 + substring único
curl -s -u claude:<pass> https://vault.pampalabs.com/processes/OBSIDIAN-VAULT-CONVENTIONS | \
  grep -c "SSoT canónico"
# Output esperado: ≥ 1
```

Si la verificación post-publish falla, typicamente es cache Quartz (esperar 2-5 min y re-verificar) o build fail de Quartz (ver logs GitHub Actions del repo que hostea Quartz).

### Tags sin fragmentación

```bash
# Listar tags únicos ordenados por frecuencia
grep -rhoE "^tags: \[.*\]" docs/vault/ | \
  grep -oE "[a-z-]+" | sort | uniq -c | sort -rn | head -50
```

Si aparece un tag con count 1-2 que tiene equivalente con count >10, consolidar antes de permitir fragmentación.

## Relacionados

- [[SUPERPOWERS-MULTI-AGENT-WORKFLOW]] — workflow para tareas que tocan >5 archivos (gran parte de las docs del vault se producen en batches multi-agente).
- [[GSD-WORKFLOW]] — planning con `/gsd:plan-phase` + `/gsd:execute-phase` que alimenta LOG-BATCHes.
- [[LOOP-7-STEPS]] — los 7 pasos de cierre de sprint que incluyen "documentar en vault" como paso no-skippeable.
- [[AUDITORIA-METODOLOGIA]] — metodología que genera audits + sync pass (Regla #11) + empirical verification (Regla #12).
- [[DEPLOY-WORKFLOW]] — schema checkpoint post-deploy (Paso 4.5) + hotfix lifecycle §C que alimentan `evidencia empírica` de DEBTs.
- [[TEMPLATE-DEBT]] — template literal reusable para nuevos DEBTs + checklist de cierre.
- [[MASTER-PLAN]] — doc raíz que indexa sprints + DEBTs activos, re-sincronizado post-auditoría con Regla #11.
- [[ROADMAP]] — roadmap operativo por sprint, consume este doc como SSoT de naming.

---

*Última actualización: 2026-04-19. Canonical SSoT de convenciones Obsidian del vault Pampa Labs.*
