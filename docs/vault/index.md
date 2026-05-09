---
title: "SomnoSalud Vault — Map of Content (MOC)"
date: 2026-05-07
last_synced_with_vault_reality: 2026-05-07
tags: [moc, index, vault, somnosalud, pampalabs-context]
status: active
related:
  - "[[../../CLAUDE]]"
  - "[[MASTER-PLAN]]"
  - "[[vision/PRODUCT-VISION-SOMNOSALUD]]"
  - "[[clinical/COMPLIANCE-ARGENTINA]]"
owner: jorge + pablo-ferrero + cowork
created: 2026-05-07
---

# SomnoSalud Vault — Map of Content

> Punto de entrada del Vault Obsidian del proyecto SomnoSalud.
> Todo doc empieza acá o se vincula desde acá. Si un doc no es alcanzable desde este MOC vía wikilinks, está huérfano.

---

## 🎯 Documentos canónicos (leer primero)

- [[../../CLAUDE]] — el CLAUDE.md raíz del repo, define quiénes somos + reglas + stack + roadmap
- [[MASTER-PLAN]] — roadmap de las 3 fases con entregables por sprint
- [[vision/PRODUCT-VISION-SOMNOSALUD]] — visión del producto + tesis + targets B2C/B2B
- [[clinical/COMPLIANCE-ARGENTINA]] — compliance regulatorio Ley 25.326 + 26.529 + ANMAT
- [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] — análisis pre-bootstrap (Drive Pablo + plan de migración del bundle compilado al source TypeScript + decisiones técnicas + 3 fases roadmap detallado)

---

## 📐 Procesos universales (heredados de Pampa Labs OS)

Los procesos viven en `processes/` y son **reutilizables cross-product**. Cualquier sprint debe seguirlos:

- [[processes/AUDITORIA-METODOLOGIA]] — metodología de auditoría Fase A trimestral
- [[processes/DEPLOY-WORKFLOW]] — proceso de deploy + triangulación 3 evidencias
- [[processes/QA-CHECKLIST]] — checklist técnico pre-merge
- [[processes/SPRINT-CLOSURE-CHECKLIST]] — FASE 4 obligatoria + Bloque K filesystem housekeeping
- [[processes/TEMPLATE-DEBT]] — template para crear DEBTs
- [[processes/OBSIDIAN-VAULT-CONVENTIONS]] — convenciones del Vault
- [[processes/LOOP-7-STEPS]] — loop iterativo de desarrollo
- [[processes/VERIFICATION-QUERY-SCHEMA]] — schema para queries de verificación de DEBTs
- [[processes/GSD-WORKFLOW]] — workflow `/gsd:plan-phase` y `/gsd:execute-phase`
- [[processes/SUPERPOWERS-MULTI-AGENT-WORKFLOW]] — paralelización de patches independientes
- [[processes/VAULT-PUBLISH]] — proceso de publicación del Vault (cuando aplique)
- [[processes/GOOGLE-OAUTH-VERIFICATION-SUBMISSION]] — submit OAuth verification a Google (relevante Fase 3 si hacemos OAuth Google)

---

## 🧠 Lessons learned (heredados Pampa Labs OS + nuevos del proyecto)

- [[lessons-learned/LL-2026-05-04-debt-status-drift-cross-brand-leakage-false-alarm]] — el DEBT status puede dar drift cross-brand con cross-leakage; verificar con triangulación 3 evidencias antes de proponer fix
- [[lessons-learned/LL-2026-05-05-empirical-vps-logs-revealed-schema-drift]] — smoke E2E con cuenta FRESH es evidencia obligatoria para flows self-service, no solo logs/sentry
- [[lessons-learned/LL-2026-05-06-listAccessibleCustomers-pattern]] — pattern reutilizable para auto-discovery customer_id post-OAuth (aplicable a Meta/TikTok/LinkedIn/Stripe Connect)
- [[lessons-learned/LL-2026-05-06-oauth-flows-tienen-4-capas-de-gotchas]] — refinamiento regla #8 EMPIRICAL-FIRST: OAuth flows requieren 5 evidencias E1-E5 (callback param naming + frontend rendering SSOT + customer_id auto-discovery + developer token / API access + smoke E2E)
- [[lessons-learned/LL-2026-05-06-rpc-validar-name-no-solo-slug]] — al validar uniqueness en RPC, validar `name` no solo `slug` (caso Lure brand fantasma)
- [[lessons-learned/LL-2026-05-07-filesystem-housekeeping-drift]] — 5 patrones que rompen la regla del Vault como fuente única (worktrees, deliverables, repos externos, naming, branches stale) + mitigaciones formalizadas
- [[lessons-learned/LL-2026-05-08-conteo-describe-vs-test-blocks]] — contar tests con grep de `describe(` da número falso; siempre correr el test runner para conteo real (vitest/jest reportan línea `Tests N passed`)
- [[lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]] — Tailwind JIT NO genera utility custom referenciada solo via `@apply` en CSS; usar CSS directo o `safelist`. Detectado en HOTFIX-2026-05-09 (gradient SomnoSalud ausente del body)

---

## 🏥 Clínico

- [[clinical/COMPLIANCE-ARGENTINA]] — compliance regulatorio AR
- [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] — análisis pre-bootstrap

> **A medida que se validan algoritmos clínicos con Pablo, agregar acá:** carpeta `clinical/scoring-validation/` con un doc por instrumento (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21) documentando: fuente DOI/PMID, casos edge, signoff conceptual de Pablo (quote WhatsApp + fecha).

---

## 🚀 Sprints

- [[sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]] — cleanup del OS heredado tras commit `6f8f6c9`: package-lock huérfano, SETUP.sh foot-gun, análisis exhaustivo duplicado, packages skeleton sin package.json. Cierra Fase 0.4 del MASTER-PLAN. Status: closed-verified.
- [[sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]] — Sprint 2.A curar 46 agents heredados → 26 activos (25 mantenidos + 1 propio `compliance-anmat`) + 22 archivados con README. Reescritura QA-CHECKLIST + DEPLOY-WORKFLOW para SomnoSalud. Adaptación SCC + TEMPLATE-DEBT + disclaimer 5 LLs. CLAUDE.md "Skills obligatorias" reescrita. Cierra DEBT-curar-agents-pampalabs-os y DEBT-procesos-heredados-content-factory. Status: closed-verified.
- [[sprints/sprint-2-curar-os-heredado/SPRINT-2B-RUNBOOK-SUPABASE]] — Sprint 2.B runbook listo para Fabio (crear project Supabase Org Pampa Labs FREE São Paulo + setear MCP supabase-somnosalud con project ref real). Status: pending-fabio.
- [[sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]] — Sprint 5 scaffold inicial webapp-somnosalud (Next.js 14 App Router + Tailwind + shadcn/ui + tsconfig + workspace dep clinical-engine + welcome page con smoke test scoreISI en build-time). Salta Sprint 2.B y 3 por decisión equipo (no bloquean webapp client-side). Status: closed-verified.
- [[sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]] — Sprint 5.5 complementario captura en Vault las decisiones técnicas + convenciones + stack inventory post-Sprint 5. 9 docs nuevos en Vault + 2 updates (overview.md + README webapp). 3 nuevos directorios (architecture/adr, concepts, reference) con README index. Status: closed-verified.
- [[sprints/sprint-6-compliance-gates/SPRINT-6-COMPLIANCE-GATES]] — Sprint 6 implementa capas 1-3 de ADR-003 (middleware Capa 1 verificada con curl, layout Capa 2 DisclaimerBanner, profile Capa 3 verificación edad <18 UTC) + 4 pantallas P0 + 4 componentes shadcn nuevos (Checkbox, Input, Label, Alert) + estado client-side (sessionStorage + cookie consent). 17 archivos nuevos en webapp. Status: closed-verified.
- [[sprints/sprint-7-a-cuestionarios-safety/SPRINT-7-A-CUESTIONARIOS-SAFETY]] — Sprint 7.A implementa Capa 4 ADR-003 (`/eval/safety` con `evaluateAllSafetyRules` + `/eval/derivacion-especialista` para block hard + restrict warning) + componente genérico `<QuestionnaireForm>` reutilizable (extendido para `item.options` ISI-like) + 3 cuestionarios (ISI 7×5niveles, ESS 8×4niveles uniformes, STOP-BANG 5manual+3auto). 14 archivos nuevos, 12 routes detectadas, smoke E2E 11/11 HTTP 200. Status: closed-verified.
- [[sprints/sprint-7-b-mental-health-sleep-lab-genetics/SPRINT-7-B-MENTAL-HEALTH-SLEEP-LAB-GENETICS]] — Sprint 7.B implementa PHQ-9 (con detección live ítem 9 ideación suicida + recurso emergencia 0800-999-0091 visible siempre) + GAD-7 + DASS-21 (21 items con separators por subscale) + sleep diary form custom + lab opcional (7 parámetros con skip) + genetics opcional (5 variantes con skip) + placeholder /eval/results. Status: in-progress.

Cada sprint vive en `sprints/sprint-NN-<slug>/SPRINT-NN-<SLUG>.md`. Convención de naming: ASCII-safe lowercase con guiones-medios (regla #12 CLAUDE.md).

---

## 🏛️ Architecture Decision Records (ADRs)

Cada ADR documenta **una decisión arquitectural** del proyecto con contexto, alternativas, consecuencias. Son inmutables — si algo cambia, se crea ADR nueva con `supersedes: ADR-NNN`.

- [[architecture/adr/README|ADRs index]] — listado canónico + template + cuándo escribir uno.
- [[architecture/adr/ADR-001-stack-frontend-webapp-somnosalud|ADR-001]] — Stack frontend webapp-somnosalud (Next 14 + App Router + Tailwind 3 + RSC).
- [[architecture/adr/ADR-002-workspace-dependency-clinical-engine|ADR-002]] — Workspace dependency strategy para `somnosalud-clinical-engine`.
- [[architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]] — Compliance gates en código (disclaimer + consent + edad + safety).

## 📐 Concepts (guías vivas)

Convenciones operativas día a día y patrones reutilizables. Distinto a ADRs — son guías que pueden actualizarse sin superseding.

- [[concepts/README|Concepts index]].
- [[concepts/CONVENCIONES-FRONTEND-WEBAPP|Convenciones frontend webapp-somnosalud]] — RSC vs client, naming, paths, accesibilidad mínima, cómo agregar pantalla nueva.

## 📚 Reference (snapshots frozen-in-time)

Stack inventories, snapshots de versiones, glosarios. Versionados con fecha en suffix.

- [[reference/README|Reference index]].
- [[reference/STACK-INVENTORY-2026-05-08|Stack inventory 2026-05-08]] — versiones reales instaladas post-Sprint 5.

---

## 💰 DEBTs (technical debt)

> Vacío al inicio del proyecto. Cada DEBT detectado durante un sprint se agrega siguiendo [[processes/TEMPLATE-DEBT]]. NO usar GitHub Issues — el Vault es SSOT.

---

## 🚨 Hotfixes

Hotfixes urgentes detectados post-cierre de sprint que requieren fix inmediato. Cada hotfix documenta detección + diagnóstico triangulado + fix + verificación empírica.

- [[hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]] — gradient SomnoSalud ausente del body por Tailwind JIT no generando utility custom referenciada solo desde `@apply` en CSS. Fix: CSS directo en lugar de `@apply` para reglas globales. Lección: [[lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]].

---

## 🔍 Audits

> Vacío al inicio. Auditoría Fase A trimestral según [[processes/AUDITORIA-METODOLOGIA]] (~próxima 2026-08-07 o post major release).

---

## 📅 Sessions

> Notes de sesiones de trabajo. Cada sesión mayor (>2 horas o decisión arquitectural significativa) se documenta en `sessions/YYYY-MM-DD-<slug>.md`.

---

## 🌐 Cross-references al Vault Pampa Labs

Algunos contextos están en el Vault de Pampa Labs (`~/Pampa-Labs-Core/docs/vault/`) y NO se duplican acá por SSOT discipline:

- **Audit filesystem cleanup 2026-05-07** que motivó este setup OS: `~/Pampa-Labs-Core/docs/vault/audits/2026-05-07-vault-filesystem-cleanup/`
- **CLAUDE.md de Pampa Labs core** (referencia para reglas universales y patrón mental): `~/Pampa-Labs-Core/CLAUDE.md`
- **Análisis exhaustivo SomnoSalud** versión original: `~/Pampa-Labs-Core/docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md` (copia local en este Vault: [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]])

---

*Última actualización: 2026-05-07 noche (setup Pampa Labs OS)*
