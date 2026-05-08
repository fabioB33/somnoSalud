# Arquitectura SomnoSalud Platform

> Última actualización: **2026-05-08** post-Sprint 5 (Scaffold webapp-somnosalud).
> Para detalle de decisiones técnicas: [`docs/vault/architecture/adr/`](../vault/architecture/adr/).
> Para convenciones operativas: [`docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md`](../vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md).
> Para stack inventory: [`docs/vault/reference/STACK-INVENTORY-2026-05-08.md`](../vault/reference/STACK-INVENTORY-2026-05-08.md).

## Diagrama de alto nivel — estado real post-Sprint 5

```mermaid
graph TB
    subgraph "Frontend"
        WS["webapp-somnosalud<br/>📦 Next.js 14 App Router<br/>✅ scaffolded Sprint 5<br/>🔨 12 pantallas Sprint 6-8"]
        WC["webapp-conversor-psg<br/>📦 Vite + React (planeado)<br/>🟡 legacy v0 HTML monolítico funcional<br/>🔨 refactor TS Fase 2 / Sprint 14+"]
    end

    subgraph "Logic packages"
        CE["clinical-engine<br/>📦 TypeScript puro<br/>✅ implementado<br/>📊 25 archivos TS, 55 tests, 32 exports"]
        PP["psg-parser<br/>📦 TypeScript (planeado)<br/>🔴 skeleton<br/>🔨 Fase 2 / Sprint 14+"]
        SU["shared-ui<br/>📦 design system (planeado)<br/>🔴 skeleton<br/>🔨 Fase 1 / Sprint 6-8"]
    end

    subgraph "Backend (PENDIENTE)"
        SB[("Supabase<br/>📦 PostgreSQL + Auth + Storage + RLS<br/>🔴 project no creado<br/>🔨 Sprint 2.B (Fabio)")]
    end

    subgraph "Services (PENDIENTES Fase 1+)"
        VC["Vercel<br/>🔴 deploy webapp-somnosalud<br/>Sprint 3 / post-S5"]
        GP["GitHub Pages<br/>🔴 deploy webapp-conversor-psg<br/>Sprint 4 / post-S14"]
        SE["Sentry<br/>🔴 error tracking<br/>Sprint 14"]
        RE["Resend<br/>🔴 email transaccional<br/>Sprint 14"]
        ST["Stripe<br/>🔴 billing B2B<br/>Fase 3"]
        PH["PostHog<br/>🔴 analytics<br/>Fase 3"]
    end

    %% Workspace deps reales (verificadas Sprint 5)
    WS -->|workspace:* + transpile<br/>ADR-002| CE
    WS -.->|workspace:* futuro| PP
    WS -.->|workspace:* futuro| SU
    WC -.->|workspace:* futuro| PP
    WC -.->|workspace:* futuro| CE
    WC -.->|workspace:* futuro| SU

    %% Backend conexión (futura)
    WS -.->|@supabase/ssr<br/>Sprint 9-11| SB

    %% Deploys (futuros)
    WS -.->|deploy| VC
    WC -.->|deploy| GP

    %% Services (futuros)
    WS -.-> SE
    WS -.-> RE
    WS -.-> ST
    WS -.-> PH

    %% Estilos
    classDef done fill:#1e3a8a,stroke:#3b82f6,color:#fff
    classDef inProgress fill:#9a3412,stroke:#f59e0b,color:#fff
    classDef pending fill:#1f2937,stroke:#6b7280,color:#9ca3af,stroke-dasharray: 5 5

    class CE,WS done
    class WC inProgress
    class PP,SU,SB,VC,GP,SE,RE,ST,PH pending
```

## Estado por package (verificado empíricamente 2026-05-08)

| Package | Status | LOC reales | Tests | Build | Deploy |
|---|---|---|---|---|---|
| `clinical-engine` | ✅ implementado | ~5.300 TS (25 archivos `src/`) | 55/55 passing | tsc → `dist/` | npm-style (workspace) |
| `webapp-somnosalud` | ✅ scaffolded (Sprint 5) | ~250 (page+layout+config+ui) | E2E pendiente Sprint 13 | `next build` static prerender | Vercel pendiente Sprint 3 |
| `webapp-conversor-psg` | 🟡 legacy funcional | 1.887 HTML monolítico | 0 | sin build | manual |
| `psg-parser` | 🔴 skeleton | 0 | 0 | noop | N/A library |
| `shared-ui` | 🔴 skeleton | 0 | 0 | noop | N/A library |

## Principios arquitecturales

1. **Logic separada de UI** — `clinical-engine` y `psg-parser` no dependen de framework visual. Pueden ser consumidos por Next.js, Vite + React, Node backend, etc.
2. **TypeScript estricto en todo el monorepo** — zero `any` sin justificación documentada inline (regla #6 del CLAUDE.md).
3. **Compliance médico desde día 1** — disclaimer + T&C + consentimiento auditable. 6 capas concéntricas según [[../vault/architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]].
4. **Tests obligatorios** para todo módulo del clinical-engine antes de merge (ver [[../vault/processes/QA-CHECKLIST|QA-CHECKLIST]] §A).
5. **Referencias científicas verificables** (DOI/PMID) para cada recomendación clínica — single source of truth en `clinical-engine/src/references.ts`.
6. **Workspace deps via `workspace:*` + transpile** ([[../vault/architecture/adr/ADR-002-workspace-dependency-clinical-engine|ADR-002]]) — hot-reload + sourcemaps + type safety end-to-end.
7. **RSC default** ([[../vault/architecture/adr/ADR-001-stack-frontend-webapp-somnosalud|ADR-001]]) — bundle mínimo, `'use client'` solo donde haga falta.
8. **Privacidad clínica primer principio** — `webapp-conversor-psg` corre 100% client-side por diseño (cero envío de PSGs al server). NO romper esa garantía.

## Flujo de datos previstos (Fase 1 completa, post-Sprint 13)

```mermaid
sequenceDiagram
    actor U as Usuario AR
    participant W as webapp-somnosalud
    participant CE as clinical-engine
    participant SB as Supabase
    participant R as Resend
    participant S as Sentry

    U->>W: Visita /
    W-->>U: Welcome (RSC, prerendered)

    U->>W: Click "Empezar evaluación"
    W->>W: Middleware verifica consent (Capa 1 ADR-003)
    W-->>U: Redirige /terms si no hay consent

    U->>W: Acepta T&C + consentimiento
    W->>SB: INSERT evaluations (consent_given_at, consent_version)
    Note over W,SB: Sprint 11+. Hasta entonces sessionStorage.

    U->>W: Completa /eval/profile (DOB)
    W->>W: calcularEdad(dob); if <18 → /eval/menor-no-permitido (Capa 3 ADR-003)

    U->>W: Completa /eval/safety
    W->>CE: evaluateAllSafetyRules(inputs)
    CE-->>W: { triggered: false } o derivación

    loop Por cada cuestionario (ISI, STOP-BANG, PHQ-9, GAD-7, DASS-21, sleep, lab, genetics)
        U->>W: Responde
        W->>CE: scoreXXX(responses)
        CE-->>W: Resultado con severity + reference
        W->>SB: UPDATE eval_responses
    end

    W->>CE: classifyInsomniaPhenotype + assessRisk + generateRecommendations
    CE-->>W: Phenotype + riskLevel + recommendations
    W->>SB: INSERT eval_results
    W->>R: Email con resultados PDF
    W-->>U: /eval/results con disclaimer reforzado + M.N. (Capa 5 ADR-003)

    Note over W,S: Errores van a Sentry con contexto anonimizado.
```

## Roadmap por capa

Ver detalle en [[../vault/MASTER-PLAN|MASTER-PLAN]]. Resumen:

- **Fase 0** (ejecutado 2026-05-07/08): bootstrap monorepo + Pampa Labs OS + scaffold webapp-somnosalud.
- **Fase 1** (Sprints 5-15, 25-35h): pantallas P0-P5 + Supabase + auth + persistencia + tests + E2E.
- **Fase 2** (Sprints 14-19, 25-35h): refactor conversor PSG modular + storage Supabase + integración cross-app.
- **Fase 3** (Sprints 20-34, 40-60h): multi-tenant white-label B2B + OCR + wearables + Stripe + i18n + WCAG 2.1 AA + HIPAA/GDPR.

---

*Diagrama y estado verificado empíricamente. Si algo acá no coincide con realidad del repo, abrir DEBT siguiendo [[../vault/processes/TEMPLATE-DEBT|TEMPLATE-DEBT]].*
