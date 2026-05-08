# SomnoSalud Platform — Project OS

> Este archivo es el cerebro central del repositorio `itsomnosalud/Somnosalud`.
> Todo agente, desarrollador o herramienta de IA que opere en este repo
> debe leer este archivo primero. Define quiénes somos, qué construimos,
> cómo trabajamos y hacia dónde vamos.
>
> **Heredado del Pampa Labs OS (`pampalabs/core` `CLAUDE.md`) — formalizado 2026-05-07 noche.**
> Las 13 reglas absolutas de Pampa Labs son universales y se aplican tal cual a este repo.
> El contenido específico de productos, stack, MCPs y roadmap es propio de SomnoSalud.

---

## ⚠️ REGLA ABSOLUTA — ANTES DE CUALQUIER TAREA

1. **Leer este archivo `CLAUDE.md`** completo antes de cualquier acción.
2. **Para frontend/UI:** cargar las skills relevantes (`obsidian-markdown` para docs, design system del proyecto cuando exista, etc.).
3. **Para 5+ archivos:** activar `/superpowers:*` con agentes paralelos — SIEMPRE.
4. **Documentar en `docs/vault/`** — SIEMPRE, con frontmatter YAML + `[[wikilinks]]`.
5. **Sin atajos, sin workarounds, sin provisorio.** Si el fix correcto tarda más, hacelo igual.

Si no se siguen estas reglas, la tarea está **MAL HECHA** aunque el código funcione.

Ver también: [[docs/vault/processes/QA-CHECKLIST]] · [[docs/vault/processes/DEPLOY-WORKFLOW]] · [[docs/vault/processes/SPRINT-CLOSURE-CHECKLIST]] · [[docs/vault/processes/AUDITORIA-METODOLOGIA]].

---

## Skills obligatorias — USAR SIEMPRE

**LEER SIEMPRE PRIMERO: este `CLAUDE.md` completo + el del Vault Pampa Labs si hay drift conceptual entre proyectos.**

En CADA tarea, sin excepción, cargá las skills relevantes ANTES de escribir código.

### Siempre (en toda tarea):

- **obsidian-markdown** — Documentar CADA cambio en `docs/vault/`
- **GSD** — `/gsd:plan-phase`, `/gsd:execute-phase` para planificación
- **SuperClaude** — `/sc:` commands para análisis y planning
- **Superpowers** — `/superpowers:*` para tareas grandes, multi-agente (hasta 60 agentes paralelos)

### Clínico / médico (cuando toques scoring, safety, recommendations):

- **clinical-engine domain knowledge** — leer `packages/clinical-engine/src/references.ts` (DOI/PMID centralizados) ANTES de modificar lógica de scoring o safety. Cada algoritmo debe estar respaldado por publicación peer-reviewed.
- **compliance-auditor** (.claude/agents/) — para validar cualquier cambio que afecte ANMAT / Ley 25.326 / Ley 26.529.
- **healthcare-marketing-compliance** (.claude/agents/) — para Fase 3 B2B cuando arranque marketing a sleep specialists (regulación dispositivo médico digital).

### Frontend (cuando toques cualquier componente):

- **engineering-frontend-developer** (.claude/agents/) — patrón canónico Next.js 14 App Router + Tailwind + shadcn/ui
- **design-ui-designer + design-ux-architect** — accesibilidad WCAG 2.1 AA target Fase 3
- **testing-accessibility-auditor** — antes de cualquier merge frontend

### Backend / DB:

- **engineering-backend-architect** (.claude/agents/) — Next.js Server Actions + Supabase patterns
- **engineering-database-optimizer** — RLS multi-tenant policies
- **supabase-postgres-best-practices** (cuando esté instalado) — schema + queries + migrations

### MCP Servers disponibles:

- **github** — Repo management (PRs, issues, releases)
- **supabase-somnosalud** — DB del proyecto (PENDIENTE crear project Org Pampa Labs Fase 0)

### REGLAS ABSOLUTAS:

1. **Frontend sin design system + accesibilidad → PARÁ y cargá los agents correspondientes (design-ui-designer + testing-accessibility-auditor).**
2. **Cambio sin documentar en Obsidian → PARÁ y documentalo.**
3. **Tarea grande (5+ archivos) → usá Superpowers multi-agente.**
4. **Cambio clínico (scoring, safety, recommendations, lab interpretation) → cargá compliance-auditor + verificá DOI/PMID en `packages/clinical-engine/src/references.ts` ANTES de tocar.**
5. **Análisis / decisiones de producto → invocá `product-sprint-prioritizer` + `agents-orchestrator` desde `.claude/agents/` PRIMERO.**
6. **REGLA AGENT-FIRST (heredada de Pampa Labs OS, formalizada 2026-04-30):** ANTES de dar cualquier recomendación, análisis, plan, brief, audit o estrategia, Cowork DEBE:
   (a) Identificar qué agente(s) en `.claude/agents/` y qué MCP(s) en `.mcp.json` son relevantes para la tarea.
   (b) Invocar ese o esos agentes/MCPs para obtener data empírica + lente especializada.
   (c) Recién entonces sintetizar la recomendación final.
   No hay excepciones cuando hay un agente o MCP que aplica. Si Cowork no encuentra agente/MCP relevante, debe declararlo explícitamente antes de responder.
   Esta regla existe para EVITAR el patrón "Cowork da consejo desde memoria" cuando podría usar (a) data real via MCP, (b) lente especializada de un subagente.
7. **REGLA INTERNAL-ONLY (heredada de Pampa Labs OS, formalizada 2026-05-03):** PROHIBIDO proponer contratar freelancers, agencias, terceros o cualquier recurso humano externo para resolver tareas. Todas las soluciones operativas, de desarrollo, análisis, QA, compliance y entregables salen del equipo interno: **Jorge + Cowork** (+ Pablo Ferrero como owner clínico, NO ejecutor) y los agentes/MCPs/skills disponibles. Sin excepciones.
   Si una tarea parece requerir capacidad externa, Cowork debe (a) descomponerla en subtareas que el equipo interno pueda absorber, (b) proponer automatización vía agentes/skills/MCPs, (c) aceptar trade-offs de tiempo si la solución interna es más lenta. Esta ley existe porque Pampa Labs es una software factory que convierte conocimiento en agentes y automatización, no en headcount.
8. **REGLA EMPIRICAL-FIRST-BEFORE-PLAN (heredada de Pampa Labs OS, formalizada 2026-05-04):** ANTES de proponer cualquier plan de fix, refactor, sprint, merge o deploy que tome **>30 minutos** de trabajo, Cowork DEBE triangular **3 evidencias empíricas** independientes y mostrarlas al usuario:
   - **E1 — Lectura del código actual en `main`:** `Read` o `Grep` del archivo/función relevante en la rama deployada (NO inferir desde diffs, branch viejos, o documentación). Confirmar que el bug propuesto efectivamente existe en el código que está en prod hoy.
   - **E2 — Query DB / API prod:** consulta empírica al sistema en vivo vía MCP (`supabase-somnosalud` cuando exista / curl al endpoint deployado / network tab del browser) que confirme el síntoma.
   - **E3 — Smoke visual / log de prod:** screenshot vía Chrome MCP del comportamiento real, o log de Sentry / docker logs que muestre el bug ocurriendo. Si el DEBT tiene un `verification_query` ([[docs/vault/processes/VERIFICATION-QUERY-SCHEMA]]), correrlo y reportar `last_result`.
   Si las 3 evidencias confirman el bug → proceder con el plan. Si **alguna** dice "bug-absent" → STOP, declarar que el bug ya está resuelto, actualizar el DEBT a `closed-verified` con la evidencia recogida, y pedir nueva instrucción al usuario.
   Excepción única: tareas <30 min triviales (typo fix, cambio de copy, ajuste de padding) NO requieren triangulación.
9. **REGLA POST-MERGE-WORKTREE-CLEANUP (heredada de Pampa Labs OS, formalizada 2026-05-07):** después de cada merge a `main` de un sprint que usó worktree git separado, retirar el worktree con `git worktree remove --force <path>` + `git branch -d <branch>`. Es Bloque K obligatorio del [[docs/vault/processes/SPRINT-CLOSURE-CHECKLIST]]. Sin esto, los worktrees se acumulan en home indefinidamente.
10. **REGLA DELIVERABLES-CLIENTE-EN-CLIENTS (heredada de Pampa Labs OS, formalizada 2026-05-07):** todo output entregable a stakeholders / Pablo Ferrero / equipo IFN (.docx, .pdf, decks, reportes clínicos) va a `clients/ifn/deliverables-YYYY-MM/`. Esta carpeta está gitignored. NUNCA dejar deliverables en raíz del repo. Si el sprint generó assets binarios pesados (>10 MB cumulado), ir a `clients/ifn/source-<origen>/` (también gitignored) o setear Git LFS — NO commitear ZIPs/.mov/.png crudos al repo.
11. **REGLA REPOS-EXTERNOS-EN-PROJECTS (heredada de Pampa Labs OS, formalizada 2026-05-07):** repos git externos (no SomnoSalud) viven en `~/Projects/<nombre>/`, NO anidados dentro de este repo. Si por urgencia se bootstrappea uno desde `cwd=somnosalud-platform`, **moverlo inmediatamente post-push** a `~/Projects/`. Riesgo grave: si alguien hace `git add` accidental sobre el repo anidado, se duplica el código del repo cliente dentro de SomnoSalud, creando drift permanente entre los dos repos.
12. **REGLA VAULT-NAMING-ASCII-LOWERCASE (heredada de Pampa Labs OS, formalizada 2026-05-07):** todas las carpetas dentro de `docs/vault/` deben ser ASCII-safe lowercase con guiones-medios. **NO** espacios, **NO** acentos, **NO** uppercase a menos que sea acrónimo establecido (ANMAT, RLS, OAuth, ISI, ESS, STOP-BANG, PHQ, GAD, DASS, BMI, PSG, AHI, etc.). Cuando se importan assets desde Drive con naming nativo, renombrar al copiar.
13. NO HAY EXCEPCIONES.

---

## 🏢 Quiénes somos

**SomnoSalud** es una plataforma médica digital para evaluación, diagnóstico orientativo y seguimiento de trastornos del sueño en grandes poblaciones.

- **Owner clínico:** Dr. Pablo Ferrero (M.N. 119.783) — Director Sleep Lab IFN (Instituto Ferrero de Neurología y Sueño)
- **Partner técnico:** Pampa Labs (Cowork + Jorge Leporace + Fabio cuando aplique)
- **Repo:** [github.com/itsomnosalud/Somnosalud](https://github.com/itsomnosalud/Somnosalud) (Private)
- **Status:** Pre-launch · Fase 0 setup
- **Modelo comercial inicial:** $2.000/mes retainer Pampa Labs (activo desde 2026-05-04)

### Contexto

SomnoSalud nació como evolución del trabajo del Dr. Ferrero en su sleep lab IFN — donde diariamente atiende pacientes con insomnio, apnea del sueño (SAHOS), narcolepsia, parasomnias, RLS y trastornos circadianos. La hipótesis del producto es que la mayoría de estos pacientes podrían ser pre-evaluados, screened y educados a escala mediante un motor digital basado en evidencia clínica (DOI/PMID verificables), reservando la consulta presencial solo para casos que requieren PSG completo o tratamiento médico activo.

El proyecto NO reemplaza al especialista — lo amplifica. Toda recomendación es **orientativa** y debe ser validada por un profesional de la salud antes de implementarse. Disclaimer obligatorio en toda pantalla de resultados.

---

## 🚀 Productos del monorepo

### 1. SomnoSalud webapp (`packages/webapp-somnosalud/`)

App SPA web para evaluación end-to-end de trastornos del sueño en 12 pasos:

1. Welcome
2. Profile (edad, sexo, peso, altura)
3. Safety (embarazo, medicación, anticoagulantes, ideación suicida)
4. ISI / ISQ — Insomnia Severity Index
5. STOP-BANG — riesgo apnea (AHI screening)
6. PHQ-9 / GAD-7 / DASS-21 — salud mental (depresión, ansiedad, estrés)
7. Sleep diary (latencia, despertares, calidad, eficiencia)
8. Lab opcional (7 parámetros: ferritina, vit D, TSH, etc.)
9. Genetics opcional (5 variantes: BDNF, COMT, PER3, etc.)
10. Results + Recommendations integrados con safety rules (SAFE-010 a SAFE-040)

**Stack:** Next.js 14 (App Router) + Tailwind + shadcn/ui + Supabase (auth + persistence + RLS multi-tenant)

### 2. Conversor PSG → CSV (`packages/webapp-conversor-psg/`)

Utility client-side para parsear PDFs polisomnográficos de **7 equipos distintos** y generar CSV en formato long compatible con el informe IFN:

- Philips Sleepware G3
- Philips Alice NightOne
- BrainWave
- ResMed AirView Diagnóstico
- ResMed AirView Tratamiento
- BMC Tratamiento
- BMC Poligrafía

Incluye **Engine Hipóxico** que calcula score 0-100 con 6 componentes clínicos validados (basado en Azarbarzin 2019 hypoxic burden + variantes IFN).

**Stack:** Vite + React + pdf.js + JSZip (sin backend, 100% local — cero envío de datos clínicos al servidor para esta utility)

### 3. Clinical Engine (`packages/clinical-engine/`)

Motor TypeScript independiente del frontend con scoring, safety rules, motor de decisión clínica y módulos especializados (EMA, parasomnias, circadianos, RLS, narcolepsia, sleep stages, sleep hygiene, sahos-treatment). **Cada algoritmo respaldado por publicaciones científicas peer-reviewed con DOI/PMID verificables en `references.ts` centralizado.**

Carpetas internas:
- `scoring/` — ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI
- `safety/` — SAFE-010 (edad), SAFE-020 (embarazo), SAFE-021 (lactancia), SAFE-040 (anticoagulantes)
- `engine/` — phenotype, recommendations, risk-integrator, precision, ema, parasomnias, circadian, rls, sahos-treatment, sleep-stages, narcolepsy, sleep-hygiene
- `lab/` — parameters (7 labs) + genetics (5 variantes)
- `references.ts` — DOI/PMID centralizados (single source of truth de evidencia)

**Stack:** TypeScript 5 estricto + esbuild + Vitest. **55+ tests pasando empíricamente verificados 2026-05-07 bootstrap.**

### 4. PSG Parser (`packages/psg-parser/`)

Parser modular de PDFs polisomnográficos extraído del Conversor PSG. Reusable desde cualquier app del monorepo (SomnoSalud webapp puede invocarlo cuando un paciente sube su PSG para auto-poblar datos clínicos).

**Stack:** TypeScript + pdf.js. Tests con fixtures de PSGs reales anonimizados (a agregar Fase 2).

### 5. Shared UI (`packages/shared-ui/`)

Design system compartido entre webapp-somnosalud y webapp-conversor-psg. Componentes Radix-based + Tailwind + tokens del proyecto. Pendiente formalizar Fase 1.

---

## 🛠 Tech Stack

| Capa | Tech | Comentario |
|---|---|---|
| Lenguaje | TypeScript 5.x estricto | Ningún `any`, ningún `@ts-ignore` sin justificación documentada |
| Monorepo | pnpm workspaces + turborepo | Setup verificado 2026-05-07 bootstrap |
| Frontend SomnoSalud | Next.js 14 (App Router) + Tailwind + shadcn/ui | Server Actions para mutations, RSC default |
| Frontend Conversor PSG | Vite + React + pdf.js + JSZip | Cero backend — 100% client-side por privacidad clínica |
| Backend / DB / Auth | Supabase (PostgreSQL + RLS multi-tenant + Auth + Storage) | Project a crear Fase 0 |
| Deploy | Vercel (somnosalud webapp) + GitHub Pages (conversor PSG) | A configurar Fase 0 |
| Tests unitarios | Vitest | 55+ tests del clinical-engine ya pasando |
| Tests E2E | Playwright | Pendiente Fase 1 |
| Error tracking | Sentry | Pendiente Fase 1 |
| Email transaccional | Resend | Pendiente Fase 1 (cuando arranque persistencia + cuentas) |
| Pagos | Stripe | Pendiente Fase 3 (B2B freemium para sleep specialists) |
| Analytics | PostHog | Pendiente Fase 1 (consentimiento explícito + zero PII tracking) |
| CI/CD | GitHub Actions | Workflow básico ya en `.github/workflows/ci.yml` (lint + test + typecheck + build) — falla actualmente por falta de pnpm-lock.yaml en main, fix pendiente Sprint 1 |
| Linter | ESLint flat config + Prettier | Configuración a setear Sprint 1 |

---

## 🔌 MCP Servers configurados

### Project MCPs (`.mcp.json` en raíz del repo)

> **IMPORTANTE 2026-05-07:** estos MCPs son específicos del proyecto SomnoSalud. NO confundir con los MCPs de Pampa Labs Core (supabase-cf, meta-ads-pipeboard, n8n-lure, etc.) que NO aplican acá.

#### `github` — Repo management
- **Tipo:** stdio (npx)
- **Paquete:** `@modelcontextprotocol/server-github`
- **Auth:** Fine-grained Personal Access Token (variable: `GITHUB_PERSONAL_ACCESS_TOKEN`)
- **Permisos:** Contents R/W, Issues R/W, Pull Requests R/W, Metadata R sobre `itsomnosalud/Somnosalud`
- **Uso:** crear PRs, gestionar issues, releases, code review

#### `supabase-somnosalud` — Project DB
- **Tipo:** stdio (npx)
- **Paquete:** `@supabase/mcp-server-supabase@latest`
- **Proyecto:** **PENDIENTE crear** — `somnosalud-platform` Org Pampa Labs (plan FREE Fase 0, scale a Pro Fase 1)
- **Auth:** `SUPABASE_ACCESS_TOKEN` del Org Pampa Labs
- **Uso futuro:** queries sobre tablas clínicas, RLS policies, migrations

### MCPs pendientes de setup

| MCP | Cuándo agregar |
|---|---|
| `sentry` | Fase 1 al configurar error tracking |
| `n8n-somnosalud` | Fase 2+ si se usan workflows automation |
| `stripe` | Fase 3 al activar billing freemium B2B |

### MCPs explícitamente NO aplicables (excluidos del Pampa Labs OS)

- `supabase-cf` — del Content Factory project, no aplica
- `meta-ads-pipeboard` — marketing ads de otros clientes, no aplica
- `n8n-lure` — workflows del cliente Lure, no aplica

---

## 📁 Estructura del monorepo

```
somnosalud-platform/
├── CLAUDE.md                        ← este archivo (leer siempre primero)
├── README.md                        ← documentación pública del repo
├── COMPLIANCE.md                    ← compliance ANMAT + Ley 25.326 + Ley 26.529
├── SETUP.sh                         ← script de bootstrap (histórico, ya ejecutado)
├── .mcp.json                        ← configuración MCP servers
├── .gitignore                       ← incluye reglas Pampa Labs OS (clients/, .obsidian/, lockfiles, etc.)
├── .editorconfig                    ← convención editor cross-platform
├── .github/workflows/ci.yml         ← CI/CD: lint + typecheck + test + build
├── .claude/
│   └── agents/                      ← 46 agents universales heredados de Pampa Labs OS
├── .obsidian/                       ← config Obsidian local (workspace.json, graph.json en gitignore)
├── package.json                     ← root con pnpm workspaces
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json
├── pnpm-lock.yaml                   ← UNTRACKED actualmente, fix Sprint 1
│
├── packages/
│   ├── clinical-engine/             # Motor TypeScript independiente del frontend
│   │   ├── src/
│   │   │   ├── scoring/             # ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI
│   │   │   ├── safety/              # SAFE-010 a SAFE-040
│   │   │   ├── engine/              # Phenotype, recommendations, risk-integrator,
│   │   │   │                        # precision, ema, parasomnias, circadian, rls,
│   │   │   │                        # sahos-treatment, sleep-stages, narcolepsy, sleep-hygiene
│   │   │   ├── lab/                 # parameters (7 labs) + genetics (5 variantes)
│   │   │   └── references.ts        # DOI/PMID centralizados (SSOT evidencia)
│   │   ├── tests/                   # Vitest, 55+ tests
│   │   └── README.md
│   ├── psg-parser/                  # Parser PDF polisomnográficos multi-equipo
│   │   ├── src/
│   │   │   └── parsers/             # philips-sleepware-g3, philips-nightone,
│   │   │                            # brainwave, resmed-diagnostico, resmed-tratamiento,
│   │   │                            # bmc-tratamiento, bmc-poligrafo
│   │   └── tests/fixtures/          # PDFs reales anonimizados (a agregar Fase 2)
│   ├── webapp-somnosalud/           # Frontend Next.js 14 — app principal
│   ├── webapp-conversor-psg/        # Frontend Vite + React — utility standalone
│   └── shared-ui/                   # Design system compartido
│
├── docs/
│   ├── vault/                       ← Vault Obsidian (fuente única de verdad)
│   │   ├── architecture/            # ADRs, diagramas, threat model
│   │   ├── audits/                  # Auditorías Fase A periódicas
│   │   ├── clinical/                # Compliance ANMAT, Ley 25.326, validación clínica
│   │   │   └── somnosalud/          # ANALISIS-EXHAUSTIVO + estudios clínicos
│   │   ├── concepts/                # Conceptos fundacionales del dominio
│   │   ├── debt/                    # Technical debt tracker
│   │   ├── hotfixes/                # Hotfixes con triangulación 3 evidencias
│   │   ├── lessons-learned/         # 6 LLs heredados Pampa Labs OS + nuevos
│   │   ├── operations/              # Runbooks operativos
│   │   ├── patterns/                # Patrones reutilizables
│   │   ├── playbook/                # Instrumentation patterns
│   │   ├── processes/               # 12 procesos universales heredados Pampa Labs OS
│   │   ├── reference/               # Material de referencia
│   │   ├── research/                # Clinical evidence, papers, DOI/PMID notes
│   │   ├── runbooks/                # Operational runbooks
│   │   ├── sessions/                # Notes de sesiones de trabajo
│   │   ├── site/                    # Deployment, infra
│   │   ├── sprint-hardening/        # Hardening cross-sprint
│   │   ├── sprints/                 # Sprint docs (Sprint 1 a empezar)
│   │   └── vision/                  # Product vision
│   └── architecture/                # Docs de arquitectura técnica (Mermaid diagrams)
│
├── infrastructure/
│   └── supabase/                    # Migraciones SQL + seed (a crear Fase 0)
│
├── scripts/                         # Utilities one-shot (migration, codegen)
│
└── clients/                         # Deliverables IFN (gitignored)
    └── ifn/
        └── deliverables-YYYY-MM/    # .docx, .pdf, reportes clínicos para Pablo
```

---

## 🎯 Roadmap (3 fases)

### Fase 0 — Setup repo + ship-it (Semana 1, 5-8 horas)

Repo limpio con CI verde + ambos productos deployados con dominio profesional.

**Entregables:**
- ✅ Repo monorepo bootstrapeado (2026-05-07)
- ✅ Pampa Labs OS instalado (2026-05-07 noche)
- ⏳ Sprint 1: pnpm-lock commiteado + CI verde
- ⏳ Sprint 2: Crear project Supabase + setear MCP `supabase-somnosalud`
- ⏳ Sprint 3: Deploy webapp-somnosalud a Vercel + dominio (preview)
- ⏳ Sprint 4: Deploy webapp-conversor-psg a GitHub Pages

### Fase 1 — Robustez clínica + persistencia (Semanas 2-5, 25-35 horas)

- Auth Supabase + persistencia de evaluaciones por usuario
- RLS multi-tenant policies
- Compliance legal mínimo: T&C con timestamp + verificación edad + consentimiento informado escrito + disclaimer médico obligatorio
- Responsive mobile-first
- Tests unitarios para todo `clinical-engine/scoring/` (50+ tests adicionales)
- Sentry + Resend setup
- E2E Playwright cobertura básica

### Fase 2 — Conversor PSG modular + storage (Semanas 6-9, 25-35 horas)

- Refactor del HTML monolítico Conversor PSG a `psg-parser/` modular TypeScript con tests + fixtures de PSGs reales anonimizados
- Storage Supabase para PSGs subidos (encrypted at rest)
- Integración SomnoSalud × Conversor (paciente sube PSG → auto-pobla datos clínicos en webapp)
- Engine Hipóxico expuesto como API reutilizable

### Fase 3 — Producto B2B + escalado (Semanas 10-16, 40-60 horas)

- Multi-tenant white-label para sleep specialists (cada doctor su instancia con su branding)
- OCR labs (auto-extracción de valores de análisis de sangre desde PDFs lab)
- Integración wearables (Oura, Fitbit, Apple Watch) para sleep tracking pasivo
- Freemium B2B + Stripe billing
- PWA install
- i18n (EN, PT)
- Accesibilidad WCAG 2.1 AA completa
- Compliance escalado: HIPAA (USA, requiere Supabase Enterprise tier) + GDPR (UE, RGPD compliance kit Supabase)

**Detalle completo del análisis pre-bootstrap:** [[docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] — incluye inventario de assets Drive, hipótesis empíricas, decisiones técnicas, plan migración del bundle compilado al source TypeScript, y referencias clínicas DOI/PMID.

---

## ⚖️ Compliance

### 🟢 Operativo en Argentina (mercado primario, Fase 1)

- **Ley 25.326 — Protección de Datos Personales:** consentimiento explícito, encriptación at rest + in transit, derecho de acceso/rectificación/supresión implementado.
- **Ley 26.529 — Derechos del Paciente:** consentimiento informado escrito antes de cualquier evaluación clínica, registro de timestamp en DB.
- **Disposición ANMAT 18/2017 — software médico:** verificar clasificación dispositivo médico digital. Probable categoría Clase I (orientativo, no diagnóstico) — pendiente confirmación regulatoria.
- **Disclaimer médico obligatorio en TODA pantalla de resultados:**
  > ⚠️ **Importante:** Esta evaluación es **orientativa** y NO reemplaza la consulta médica. Las recomendaciones deben ser validadas por un profesional de la salud antes de implementarlas.
- **T&C con timestamp registrado en DB** + checkbox explícito (no pre-marcado).
- **Verificación de edad formal** (gate <18 años: redirige a contacto con especialista, NO permite evaluación auto-administrada).
- **Matrícula del director médico visible:** Dr. Pablo Ferrero M.N. 119.783 en footer + en disclaimer.

### 🟡 Pendiente Fase 3 (escalado USA + UE)

- **HIPAA (USA):** requiere Supabase Enterprise tier + BAA (Business Associate Agreement) firmado.
- **GDPR (UE):** RGPD compliance kit Supabase + Data Processing Addendum + DPO designado.

Ver: [[docs/vault/clinical/COMPLIANCE-ARGENTINA]] (a crear Sprint 1).

---

## 📐 Convenciones de desarrollo

### Código

- TypeScript estricto en todo proyecto Node.js/Next.js. Ningún `any` sin justificación documentada inline.
- Nombres de archivos: `kebab-case`
- Nombres de componentes React: `PascalCase`
- Variables y funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Comentarios en español (el equipo es hispanohablante)
- Docstrings en inglés (compatibilidad herramientas externas)
- **Toda función de scoring/safety debe tener:** (a) docstring con DOI/PMID de la fuente, (b) test unitario con casos edge incluidos, (c) referencia en `references.ts`.

### Git

- Branches: `feature/nombre-feature`, `fix/nombre-bug`, `chore/tarea`, `clinical/scoring-update-X`
- Commits: convención conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `clinical:`)
- PR obligatorio para mergear a `main`
- Al menos 1 review (Cowork o Jorge) antes de merge
- **Cualquier cambio en `clinical-engine/scoring/` o `safety/` requiere review explícita + signoff conceptual de Pablo Ferrero** (puede ser mensaje de WhatsApp confirmando, NO requiere commit signature suya).

### Sprints

- Cada sprint vive en `docs/vault/sprints/sprint-NN-<slug>/SPRINT-NN-<SLUG>.md`
- Frontmatter YAML obligatorio: status, parent_debts, related, FASES 1/2/3/4 documentadas
- Bloque K [[docs/vault/processes/SPRINT-CLOSURE-CHECKLIST]] obligatorio: post-merge worktree cleanup
- Triangulación 3 evidencias antes de `closed-verified` ([[docs/vault/processes/DEPLOY-WORKFLOW]] §C)

### Variables de entorno

- `.env.example` siempre actualizado en cada package
- Nunca commitear `.env` real
- Nombres descriptivos: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SENTRY_DSN`, etc.

---

## 🔐 Variables de entorno globales

```bash
# Supabase (Org Pampa Labs, project somnosalud-platform PENDIENTE crear)
SUPABASE_URL=                     # https://<ref>.supabase.co
SUPABASE_ANON_KEY=                # JWT publico para client
SUPABASE_SERVICE_KEY=             # JWT privado para server (NO exponer al client)
SUPABASE_ACCESS_TOKEN=            # PAT del Org Pampa Labs para MCP

# GitHub MCP
GITHUB_PERSONAL_ACCESS_TOKEN=     # Fine-grained PAT scopes Contents+Issues+PR R/W

# Error tracking (Fase 1)
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Email transaccional (Fase 1)
RESEND_API_KEY=

# Analytics (Fase 1)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com

# Pagos (Fase 3 B2B)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 👥 Equipo

- **Dr. Pablo Ferrero** (M.N. 119.783) — Director Sleep Lab IFN, **owner clínico** (decisiones de scoring, safety, recommendations, validación clínica). NO ejecuta código.
- **Jorge Enrique Leporace** — Pampa Labs founder, **partner técnico** (estrategia producto, IA, integración con stack Pampa Labs).
- **Cowork (Claude)** — IA assistant técnico. Ejecuta sprints, escribe código, mantiene Vault, propone arquitectura.
- **Fabio (futuro)** — incorporación posible Fase 1+ desde el lado Pampa Labs si el ritmo lo justifica.

### Cómo trabajamos

- **Comunicación con Pablo:** WhatsApp + reuniones esporádicas presenciales en IFN. Decisiones clínicas se documentan en `docs/vault/sprints/...` con quote del mensaje + fecha.
- **Comunicación interna Pampa Labs (Jorge ↔ Cowork):** sesiones live + Vault Obsidian como SSOT.
- **Gestión de tareas:** GTD + TodoList del Cowork + sprints documentados.
- **Cadencia:** 1-2 sprints por semana inicialmente, escalar según ritmo y complejidad.

---

## 🧠 Instrucciones para Claude Code

Cuando trabajes en este repo:

1. **Siempre leer este `CLAUDE.md` completo** antes de tocar código. Si el sprint es clínico (scoring/safety/recommendations), también leer [[docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] + `packages/clinical-engine/src/references.ts`.
2. **El modelo a usar siempre es** `claude-sonnet-4-20250514` salvo indicación contraria.
3. **No crear nuevos servicios externos** sin antes verificar si ya existe uno en el stack definido arriba. Si proponés agregar uno nuevo (ej: nuevo email provider, nuevo monitoring), justificar en el sprint doc por qué no alcanza el stack actual.
4. **Los prompts de agentes** siempre van en `.claude/agents/` (heredados de Pampa Labs OS). Si necesitás uno nuevo no presente, crearlo siguiendo el template de los existentes + documentar en sprint doc.
5. **Ante la duda sobre arquitectura**, consultar antes de implementar — es un repo cliente con responsabilidad clínica + regulatoria, no hay margen para shortcuts.
6. **Idioma del código:** TypeScript/JavaScript. Comentarios en español. Commits en español (convention: `feat:`, `fix:`, `clinical:`, `docs:`, `refactor:`, `chore:`).
7. **Si encontrás deuda técnica** mientras trabajás en algo, crear DEBT en `docs/vault/debt/` siguiendo [[docs/vault/processes/TEMPLATE-DEBT]] + seguir con tu tarea. NO abrir issue en GitHub — el vault es fuente de verdad de deudas.
8. **MCP Supabase:** usar siempre `supabase-somnosalud` (cuando exista). NO usar el de Pampa Labs (`supabase-cf`, `supabase-db`) — son projects distintos con data distinta.
9. **Procesos obligatorios:**
   - [[docs/vault/processes/QA-CHECKLIST]] §A hotfix backend (7 items core)
   - [[docs/vault/processes/DEPLOY-WORKFLOW]] §C hotfix lifecycle (triangulación 3 evidencias antes de `closed-verified`)
   - [[docs/vault/processes/SPRINT-CLOSURE-CHECKLIST]] FASE 4 obligatoria + Bloque K filesystem housekeeping post-merge
   - [[docs/vault/processes/AUDITORIA-METODOLOGIA]] auditoría trimestral o post-major release
10. **Vault Obsidian es fuente de verdad** del contexto del producto. Post-auditoría con drift >5 claims, sync pass obligatorio (regla #11 de [[docs/vault/processes/AUDITORIA-METODOLOGIA]]).
11. **Cambios clínicos requieren signoff Pablo Ferrero.** Cowork puede proponer + implementar pero NO mergear sin OK explícito de Pablo (vía WhatsApp o reunión documentada).
12. **Privacidad clínica primer principio:** ningún dato de paciente sale del entorno controlado sin encriptación + consentimiento explícito. El Conversor PSG corre 100% client-side por diseño — no romper esa garantía.

---

## 📅 Última sesión mayor — 2026-05-07 noche

**Bootstrap monorepo + setup Pampa Labs OS + migración remote + cleanup filesystem.**

### Sucedido

1. **Bootstrap del monorepo SomnoSalud** — análisis exhaustivo del Drive de Pablo + ZIP source TypeScript + creación de la estructura `packages/clinical-engine + psg-parser + webapp-somnosalud + webapp-conversor-psg + shared-ui` + 25 source files importados + 55/55 tests passing + first commit.
2. **Migración del remote** — primer push fue por error a `PaulFerrero/somnosalud` (confusión inicial). Mismo día tarde, Jorge aclaró que el repo canónico es `https://github.com/itsomnosalud/Somnosalud` (Private). Migración con `git remote set-url` + `git push --force` reemplazó el initial commit boilerplate del nuevo repo con la historia completa del bootstrap (3 commits, 73 objects, 205 KB).
3. **Cleanup filesystem masivo** ejecutado en `pampalabs/core` ([[../Pampa-Labs-Core/docs/vault/audits/2026-05-07-vault-filesystem-cleanup/00-README]]) — 7 worktrees retirados, somnosalud-platform movido a `~/Projects/`, 2.6 GB de assets brutos Fonseca movidos a `clients/fonseca/source-drive/`, 4 reglas housekeeping nuevas formalizadas en CLAUDE.md de Pampa Labs (#9-12).
4. **Setup Pampa Labs OS en este repo** — copiado del Vault structure + 12 procesos universales + 6 lessons-learned reutilizables + 46 agents del `.claude/agents/` + `.mcp.json` + `.gitignore` extendido + este `CLAUDE.md`. Objetivo: trabajar en SomnoSalud con la misma disciplina y estándares que en Pampa Labs core.

### Lecciones aplicadas

- **Confirmar remote canónico con cliente ANTES del primer push** ([[docs/vault/lessons-learned/LL-2026-05-07-filesystem-housekeeping-drift]]).
- **Repos externos viven en `~/Projects/`** (regla #11), NO anidados dentro de otros repos.
- **Vault como SSOT** requiere disciplina ANTI-DRIFT en 5 puntos del filesystem (worktrees, deliverables, repos externos, naming, branches stale).

### Próxima sesión

**Sprint 1 — pnpm-lock + CI verde:**
- `git add pnpm-lock.yaml && git commit -m 'chore: commit pnpm-lock.yaml para CI determinístico'` y verificar que GitHub Actions pasa verde.
- Decidir si Vault de SomnoSalud se publica (Vault Pampa Labs publica a `vault.pampalabs.com` — SomnoSalud podría tener `vault.somnosalud.com` o similar Fase 3, decisión a tomar con Pablo).

---

## Contacto

- **Dr. Pablo Ferrero:** pabloferrero@ifn.com.ar
- **Jorge Leporace:** info@pampalabs.com / jorgeleporace@gmail.com

---

## Licencia

Proprietary — SomnoSalud Team. Todos los derechos reservados.
Revisar al go-live B2B (posible cambio a algún esquema más permisivo según validación clínica externa).

---

*Última actualización: 7 Mayo 2026 (setup Pampa Labs OS)*
*last_synced_with_vault_reality: 2026-05-07*
*Próxima revisión: post-Sprint 1 (CI verde + project Supabase creado)*
