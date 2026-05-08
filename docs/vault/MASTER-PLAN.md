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
- ✅ **Fase 0.4 — Sprint 1 closed-verified (2026-05-08):** commit `pnpm-lock.yaml` ya estaba (`6f8f6c9`) + CI verde local triangulado + cleanup OS heredado (package-lock huérfano borrado, SETUP.sh archivado, análisis exhaustivo SSOT resuelto, 4 packages skeleton habilitados con turbo). Detalle: [[sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]. Sub-DEBTs abiertos para Sprint 2: [[debt/DEBT-curar-agents-pampalabs-os]], [[debt/DEBT-procesos-heredados-content-factory]], [[debt/DEBT-vitest-coverage-output]].
- ⏳ **Fase 0.5 — Sprint 2 a iniciar:** curar `.claude/agents/` + reescribir QA-CHECKLIST/DEPLOY-WORKFLOW para SomnoSalud + crear project Supabase + setear `supabase-somnosalud` MCP.

**Próxima sesión sugerida:** Sprint 2.

---

## Fase 0 — Setup repo + ship-it (Semana 1, 5-8 horas)

**Objetivo:** repo limpio con CI verde + ambos productos deployados con dominio profesional.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 0.1 | Bootstrap monorepo + first commit | ✅ closed-verified | 4h ejecutadas |
| 0.2 | Migración remote a itsomnosalud/Somnosalud | ✅ closed-verified | 0.5h |
| 0.3 | Setup Pampa Labs OS en este repo | ✅ closed-verified | 2h |
| 1 | Cleanup OS heredado + CI verde local triangulado | ✅ closed-verified | 1.5h ejecutadas (2026-05-08) |
| 2.A | Curar agents heredados + reescribir procesos heredados + adaptar SCC/TEMPLATE-DEBT | ⏳ in-progress (2026-05-08) | 4-5h |
| 2.B | Crear project Supabase Org Pampa Labs + setear MCP `supabase-somnosalud` (ownership Fabio, requiere credenciales) | ⏳ pending Fabio | 1h |
| 3 | Deploy webapp-somnosalud preview a Vercel + dominio | ⏳ pending | 2h |
| 4 | Deploy webapp-conversor-psg a GitHub Pages | ⏳ pending | 1h |

**Criterio de cierre Fase 0:** ambos productos accesibles públicamente vía URL profesional + CI verde + project Supabase listo para arrancar persistencia.

---

## Fase 1 — Robustez clínica + persistencia (Semanas 2-5, 25-35 horas)

**Objetivo:** SomnoSalud webapp con auth + persistencia + compliance legal mínimo + tests clínicos completos.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 5 | Schema inicial Supabase: users + evaluations + answers + RLS multi-tenant | ⏳ | 4h |
| 6 | Auth Supabase (email + magic link) + protected routes | ⏳ | 3h |
| 7 | Persistencia evaluación (save partial progress + resume) | ⏳ | 4h |
| 8 | T&C + consentimiento informado escrito + verificación edad gate | ⏳ | 3h |
| 9 | Disclaimer médico obligatorio en TODA pantalla resultados + matrícula MN visible | ⏳ | 2h |
| 10 | Responsive mobile-first audit + fixes | ⏳ | 4h |
| 11 | Tests unitarios cobertura 100% `clinical-engine/scoring/` (50+ tests adicionales) | ⏳ | 5h |
| 12 | Sentry + Resend setup (error tracking + welcome email) | ⏳ | 2h |
| 13 | E2E Playwright cobertura básica (happy path 12 steps + safety triggers) | ⏳ | 4h |

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
