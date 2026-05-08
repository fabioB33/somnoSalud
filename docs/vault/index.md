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

---

## 🏥 Clínico

- [[clinical/COMPLIANCE-ARGENTINA]] — compliance regulatorio AR
- [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] — análisis pre-bootstrap

> **A medida que se validan algoritmos clínicos con Pablo, agregar acá:** carpeta `clinical/scoring-validation/` con un doc por instrumento (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21) documentando: fuente DOI/PMID, casos edge, signoff conceptual de Pablo (quote WhatsApp + fecha).

---

## 🚀 Sprints

- [[sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]] — cleanup del OS heredado tras commit `6f8f6c9`: package-lock huérfano, SETUP.sh foot-gun, análisis exhaustivo duplicado, packages skeleton sin package.json. Cierra Fase 0.4 del MASTER-PLAN.

Cada sprint vive en `sprints/sprint-NN-<slug>/SPRINT-NN-<SLUG>.md`. Convención de naming: ASCII-safe lowercase con guiones-medios (regla #12 CLAUDE.md).

---

## 💰 DEBTs (technical debt)

> Vacío al inicio del proyecto. Cada DEBT detectado durante un sprint se agrega siguiendo [[processes/TEMPLATE-DEBT]]. NO usar GitHub Issues — el Vault es SSOT.

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
