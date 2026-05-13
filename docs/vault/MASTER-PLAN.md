---
title: "MASTER-PLAN — SomnoSalud roadmap operativo"
date: 2026-05-07
last_synced_with_vault_reality: 2026-05-07
tags: [master-plan, roadmap, somnosalud, planning, pampalabs-context]
status: active
related:
  - "[[index]]"
  - "[[../../CLAUDE]]"
  - "[[vision/PRODUCT-VISION-SOMNOSALUD]]"
  - "[[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]]"
owner: jorge + pablo-ferrero + cowork
created: 2026-05-07
---

# MASTER-PLAN — SomnoSalud Roadmap Operativo

> Roadmap consolidado de las 3 fases del producto. Cada fase tiene sprints específicos numerados que se documentan en `sprints/sprint-NN-<slug>/`.
>
> Detalle clínico y técnico exhaustivo en [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]].

---

## 📊 Estado actual (2026-05-08 mañana)

- ✅ **Fase 0.1 — Bootstrap monorepo** completado (pnpm workspaces + 5 packages + 25 source files importados + 55/55 tests passing)
- ✅ **Fase 0.2 — Migración remote** a `itsomnosalud/Somnosalud` Private (force-push exitoso, 73 objects)
- ✅ **Fase 0.3 — Setup Pampa Labs OS** (CLAUDE.md + Vault structure + 12 procesos + 6 LLs + 46 agents + .mcp.json + .gitignore extendido)
- ✅ **Fase 0.4 — Sprint 1 closed-verified (2026-05-08):** commit `pnpm-lock.yaml` ya estaba (`6f8f6c9`) + CI verde local triangulado + cleanup OS heredado (package-lock huérfano borrado, SETUP.sh archivado, análisis exhaustivo SSOT resuelto, 4 packages skeleton habilitados con turbo). Detalle: [[sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]].
- ✅ **Fase 0.5 — Sprint 2.A closed-verified (2026-05-08):** curado de 46 agents heredados → 26 activos (25 mantenidos + 1 propio `compliance-anmat` AR/ANMAT) + 22 archivados con README. QA-CHECKLIST y DEPLOY-WORKFLOW reescritos para SomnoSalud (Vercel + GH Pages, sin VPS Docker). SCC Bloque F adaptado, TEMPLATE-DEBT con ejemplos reales SomnoSalud, 5 LLs con disclaimer cross-product. CLAUDE.md "Skills obligatorias" reescrita con lista curada en 10 categorías. Detalle: [[sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]. Cierra DEBT-curar-agents-pampalabs-os y DEBT-procesos-heredados-content-factory.
- ⏳ **Fase 0.6 — Sprint 2.B pending Fabio:** crear project Supabase `somnosalud-platform` en Org Pampa Labs (plan FREE, region São Paulo) + setear MCP `supabase-somnosalud` con project ref real. Runbook listo en [[sprints/sprint-2-curar-os-heredado/SPRINT-2B-RUNBOOK-SUPABASE]]. Ownership: Fabio (requiere credenciales Org Pampa Labs).
- ✅ **Fase 1 arrancada — Sprint 5 closed-verified (2026-05-08):** scaffold completo de `webapp-somnosalud` con Next.js 14 + Tailwind 3.4 + shadcn/ui (Button + Card) + tsconfig extend + workspace dep `somnosalud-clinical-engine` validado empíricamente (`scoreISI` ejecutándose en build-time) + welcome page con paleta SomnoSalud + footer compliance (M.N. Pablo Ferrero 119.783). `pnpm dev` arranca en 2s, `pnpm build` genera prerendered estático. CI cross-monorepo verde (5-6/N tasks successful, clinical-engine 55/55). Decisión equipo Fabio: saltar Sprints 2.B + 3 ya que webapp puede correr 100% client-side hasta S9+. Detalle: [[sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]].
- ✅ **Sprint 5.5 closed-verified (2026-05-08):** documentación completa del Sprint 5 en el Vault. 9 archivos nuevos: 3 ADRs (stack frontend Next 14 + workspace deps clinical-engine + compliance gates 6 capas) + 1 convenciones frontend (10 secciones operativas) + 1 stack inventory snapshot 2026-05-08 + 3 README de dirs nuevas (architecture/adr, concepts, reference) + 1 sprint doc. Plus 2 updates: overview.md con Mermaid actualizado + sequence diagram Fase 1 + webapp-somnosalud/README.md rewrite. Detalle: [[sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]].
- ✅ **Sprint 6 closed-verified (2026-05-08):** capas 1-3 de [[architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]] implementadas en código. Capa 1 middleware (verificada empíricamente con curl: 307 sin cookie, 200 con cookie). Capa 2 `app/eval/layout.tsx` con DisclaimerBanner. Capa 3 verificación edad <18 con UTC handling. 4 pantallas P0 funcionales (/disclaimer, /terms, /eval/profile, /eval/menor-no-permitido). 4 componentes shadcn nuevos (Checkbox, Input, Label, Alert). Estado client-side via sessionStorage (`usePersistEval`) + cookie consent (`useConsent`). Welcome con CTA habilitado. 17 archivos nuevos en webapp-somnosalud, ~1.500 LOC. Detalle: [[sprints/sprint-6-compliance-gates/SPRINT-6-COMPLIANCE-GATES]].
- 🔧 **HOTFIX 2026-05-09 (commit 07f6851):** gradient SomnoSalud no se aplicaba al body porque Tailwind JIT no genera utilities custom referenciadas solo via `@apply` en CSS. Fix: CSS directo en `globals.css`. Detalle: [[hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]] + lección [[lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]].
- ✅ **Sprint 7.A closed-verified (2026-05-09):** Capa 4 ADR-003 implementada (`/eval/safety` con `evaluateAllSafetyRules` + `/eval/derivacion-especialista` para block hard + Alert warning para restrict). Componente genérico `<QuestionnaireForm>` reutilizable extendido para soportar items con `options` propios (ISI-like) + escala global (ESS-like). 3 cuestionarios funcionales: `/eval/isi` (7×5niveles, Bastien 2001), `/eval/ess` (8×4niveles, Johns 1991), `/eval/stopbang` (5 manual + 3 auto desde profile, Chung 2008). 14 archivos nuevos en webapp + 1 sprint doc, ~1.450 LOC. CI verde + 12 routes detectadas. Smoke E2E con curl: 11/11 HTTP 200, middleware bloquea correctamente. Detalle: [[sprints/sprint-7-a-cuestionarios-safety/SPRINT-7-A-CUESTIONARIOS-SAFETY]].
- ✅ **Sprint 7.B closed-verified (2026-05-09):** PHQ-9 (con detección live ítem 9 + `<CrisisHotlineCard>` reusable variant default/reinforced, Decisión E3) + GAD-7 + DASS-21 (21 items intercalados sin agrupar por subscale para no romper validación clínica) + sleep diary form custom (7 campos heterogéneos) + lab opcional (7 parámetros con 3 paths skip) + genetics opcional (5 variantes con sentinel "no lo sé") + placeholder `/eval/results`. **18 routes detectadas en build** (flow completo de evaluación funcional, salvo Capa 5 results). 14 archivos nuevos en webapp + 1 sprint doc, ~1.500 LOC. CI verde + smoke E2E todas las rutas HTTP correcto. Detalle: [[sprints/sprint-7-b-mental-health-sleep-lab-genetics/SPRINT-7-B-MENTAL-HEALTH-SLEEP-LAB-GENETICS]].
- ✅ **Sprint 8 closed-verified (2026-05-09):** `/eval/results` Capa 5 ADR-003 implementada. `lib/results-builder.ts` función pura (testeable, server-side ready) que invoca todos los `score*` + `classifyInsomniaPhenotype` + `assessRisk` + `generateRecommendations` (respeta safety rules: blockedRecommendations excluidos) + `calculatePrecision` + `analyzeLabPanel` + `analyzeGeneticProfile`. `<DisclaimerBanner variant="reinforced">` arriba/abajo + M.N. + footer IFN. Accordion con 6 secciones colapsables. Export PDF via `window.print()` + CSS `@media print` completo (fondo blanco, texto negro, URLs visibles, break-inside-avoid). Botón reset limpia sessionStorage. Panel debug con `?debug=1` (JSON raw para Pablo). PHQ-9 ítem 9 ≥ 1 dispara CrisisHotlineCard reinforced arriba. Risk severe muestra Alert prominente "consultar especialista urgente". Detalle: [[sprints/sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]] + sub-DEBT [[debt/DEBT-sleep-form-fields-faltantes]] (5 campos no capturados, signoff Pablo Sprint 9).
- 🎉 **FASE 1 CLIENT-SIDE CERRADA (2026-05-09):** flow completo de evaluación funcional 100% en sessionStorage, sin Supabase. 13 pantallas reales + 7 capas de compliance + 19 routes prerendered + Middleware. Listo para smoke visual humano + signoff clínico Pablo antes de pasar a persistencia.
- 🚀 **Sprint 8.5 in-progress (2026-05-09):** UX polish del `<QuestionnaireForm>` post-feedback "es un bodrio contestar" — pills horizontales en lugar de stack vertical + number badge prominente con tick cuando respondido + progress sticky interno al form (visible mientras scrolleás) + smooth scroll al siguiente item al responder + highlight item actual + separators DASS-21 "Parte 1/2/3 de 3" sin agrupar por subscale. Sin cambios en lógica clínica ni en otros forms (SafetyForm/ProfileForm/SleepForm). Detalle: [[sprints/sprint-8-5-ux-cuestionario/SPRINT-8-5-UX-CUESTIONARIO]].

**Próxima sesión sugerida:** smoke visual humano del Sprint 8.5 + iterar → Sprint 8.6 (welcome expandida con FAQ + about) o saltar a Sprint 9+ Supabase si Pablo da OK al UX.

---

## Fase 0 — Setup repo + ship-it (Semana 1, 5-8 horas)

**Objetivo:** repo limpio con CI verde + ambos productos deployados con dominio profesional.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 0.1 | Bootstrap monorepo + first commit | ✅ closed-verified | 4h ejecutadas |
| 0.2 | Migración remote a itsomnosalud/Somnosalud | ✅ closed-verified | 0.5h |
| 0.3 | Setup Pampa Labs OS en este repo | ✅ closed-verified | 2h |
| 1 | Cleanup OS heredado + CI verde local triangulado | ✅ closed-verified | 1.5h ejecutadas (2026-05-08) |
| 2.A | Curar agents heredados + reescribir procesos heredados + adaptar SCC/TEMPLATE-DEBT | ✅ closed-verified | ~3h ejecutadas (2026-05-08) |
| 2.B | Crear project Supabase Org Pampa Labs + setear MCP `supabase-somnosalud` (ownership Fabio, requiere credenciales) | ⏳ pending Fabio | 1h |
| 3 | Deploy webapp-somnosalud preview a Vercel + dominio | ⏳ pending | 2h |
| 4 | Deploy webapp-conversor-psg a GitHub Pages | ⏳ pending | 1h |

**Criterio de cierre Fase 0:** ambos productos accesibles públicamente vía URL profesional + CI verde + project Supabase listo para arrancar persistencia.

---

## Fase 1 — Robustez clínica + persistencia (Semanas 2-5, 25-35 horas)

**Objetivo:** SomnoSalud webapp con auth + persistencia + compliance legal mínimo + tests clínicos completos.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| **5** | **Scaffold Next.js 14 webapp-somnosalud + Tailwind + shadcn/ui + workspace dep clinical-engine + welcome page** | ✅ closed-verified | ~2h ejecutadas (2026-05-08) |
| 6 | Pantallas P0 compliance gates: disclaimer + T&C + verificación edad <18 + profile (sin persistencia, sessionStorage) | ⏳ | 3-4h |
| 7 | Pantallas cuestionarios: ISI + STOP-BANG + PHQ-9 (con detección ítem 9) + GAD-7 + DASS-21 + sleep + lab + genetics, scoring real con clinical-engine | ⏳ | 5-6h |
| 8 | Pantalla resultados + recomendaciones + disclaimer obligatorio + MN visible + export PDF | ⏳ | 3-4h |
| 9 | (post Sprint 2.B) Schema inicial Supabase: users + evaluations + answers + RLS multi-tenant | ⏳ | 4h |
| 10 | Auth Supabase (email + magic link) + protected routes | ⏳ | 3h |
| 11 | Persistencia evaluación migrada de sessionStorage → Supabase (save partial progress + resume) | ⏳ | 4h |
| 12 | Responsive mobile-first audit + fixes | ⏳ | 4h |
| 13 | Tests unitarios cobertura 100% `clinical-engine/scoring/` (50+ tests adicionales) | ⏳ | 5h |
| 14 | Sentry + Resend setup (error tracking + welcome email) | ⏳ | 2h |
| 15 | E2E Playwright cobertura básica (happy path 12 steps + safety triggers) | ⏳ | 4h |

**Criterio de cierre Fase 1:** un paciente AR puede crear cuenta + completar evaluación + recibir resultados con compliance legal full + retomar evaluación si abandonó.

---

## Fase 2 — Conversor PSG modular + storage (Semanas 6-9, 25-35 horas)

**Objetivo:** Conversor PSG refactoreado a TypeScript modular + integración con webapp-somnosalud + storage Supabase encrypted.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 14 | Refactor HTML monolítico Conversor PSG a `psg-parser/` modular TypeScript | ⏳ | 6h |
| 15 | Tests con fixtures de PSGs reales anonimizados (7 equipos × 2-3 fixtures cada uno) | ⏳ | 5h |
| 16 | Engine Hipóxico expuesto como API reutilizable | ⏳ | 3h |
| 17 | Storage Supabase para PSGs subidos (encrypted at rest + signed URLs) | ⏳ | 4h |
| 18 | Integración SomnoSalud × Conversor (paciente sube PSG → auto-pobla datos clínicos) | ⏳ | 5h |
| 19 | UI/UX para upload PSG + preview parsed data + edit antes de save | ⏳ | 4h |

**Criterio de cierre Fase 2:** un paciente puede subir su PSG (cualquier de los 7 equipos) y los datos quedan integrados a su evaluación.

---

## Fase 3 — Producto B2B + escalado (Semanas 10-16, 40-60 horas)

**Objetivo:** Multi-tenant white-label para sleep specialists + freemium B2B + accesibilidad full + i18n.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 20-22 | Multi-tenant: cada doctor tiene su instancia con branding propio (logo, colors, dominio custom) | ⏳ | 12h |
| 23-24 | OCR labs (auto-extracción de valores de análisis sangre desde PDFs lab) | ⏳ | 8h |
| 25-26 | Integración wearables Oura/Fitbit/Apple Watch (sleep tracking pasivo) | ⏳ | 10h |
| 27-28 | Stripe billing freemium + tiers FREE / PRO / CLINIC | ⏳ | 8h |
| 29 | PWA install + offline-first | ⏳ | 4h |
| 30-31 | i18n EN + PT (locales + clinical instruments translated by validated source) | ⏳ | 6h |
| 32-33 | Accesibilidad WCAG 2.1 AA completa (audit + fixes) | ⏳ | 8h |
| 34 | Compliance escalado: HIPAA Supabase Enterprise tier + GDPR compliance kit | ⏳ | 6h |

**Criterio de cierre Fase 3:** SomnoSalud es producto SaaS B2B vendible a sleep specialists internacionales con compliance USA + UE.

---

## Decisiones estratégicas pendientes

| Decisión | Quién decide | Cuándo |
|---|---|---|
| ¿Vault SomnoSalud se publica? (vault.somnosalud.com vs solo local) | Jorge + Pablo | Sprint 3 |
| ¿Dominio custom para webapp-somnosalud? (somnosalud.com.ar vs subdominio Pampa Labs) | Pablo | Sprint 3 |
| ¿Pricing B2B Fase 3? (FREE / PRO $X / CLINIC $Y) | Jorge + Pablo + market research | Sprint 27 |
| ¿Validación clínica externa con sleep specialists colegas? | Pablo | Pre-Fase 3 |
| ¿Open-source `clinical-engine`? (estrategia de adopción) | Jorge + Pablo | Pre-Fase 3 |

---

## Riesgos identificados

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Validación regulatoria ANMAT puede requerir clasificación dispositivo médico Clase II | 🟠 Alta | Sprint 5: consultar con experto regulatorio + documentar disclaimer fuerte. Probable Clase I (orientativo). |
| Pablo Ferrero limited bandwidth para signoff clínico cada cambio scoring | 🟡 Media | Async via WhatsApp + reuniones quincenales. Documentar quotes en sprint docs. |
| Costos Supabase escalan en Fase 1 (FREE → Pro $25/mes mínimo) | 🟢 Baja | Justificable contra retainer $2K/mes. |
| HIPAA Fase 3 requiere Supabase Enterprise tier ($$$) | 🟡 Media | Postergar Fase 3 USA hasta validar producto-mercado en AR/LATAM primero. |

---

*Última actualización: 2026-05-07 noche (setup Pampa Labs OS)*
*Próxima revisión: post-Sprint 1 (CI verde)*
