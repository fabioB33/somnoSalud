# SomnoSalud Platform

> **Plataforma médica digital para evaluación, diagnóstico orientativo y seguimiento de trastornos del sueño.**
> Owner clínico: Dr. Pablo Ferrero (IFN — Instituto Ferrero de Neurología y Sueño)
> Partner técnico: Pampa Labs (Cowork + Jorge Leporace)
> Status: Pre-launch · Fase 0 setup

---

## Estructura del monorepo

```
somnosalud-platform/
├── packages/
│   ├── clinical-engine/          # Motor TypeScript independiente del frontend
│   │   ├── src/
│   │   │   ├── scoring/          # ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI
│   │   │   ├── safety/           # SAFE-010 a SAFE-040 (edad, embarazo, anticoagulantes)
│   │   │   ├── engine/           # Phenotype, recommendations, risk-integrator,
│   │   │   │                     # precision, ema, parasomnias, circadian, rls,
│   │   │   │                     # sahos-treatment, sleep-stages, narcolepsy,
│   │   │   │                     # sleep-hygiene
│   │   │   ├── lab/              # parameters (7 labs) + genetics (5 variantes)
│   │   │   └── references.ts     # DOI/PMID centralizados
│   │   ├── tests/                # Vitest, 50+ tests
│   │   └── README.md
│   ├── psg-parser/               # Parser PDF polisomnográficos multi-equipo
│   │   ├── src/
│   │   │   └── parsers/          # philips-sleepware-g3, philips-nightone,
│   │   │                         # brainwave, resmed-diagnostico, resmed-tratamiento,
│   │   │                         # bmc-tratamiento, bmc-poligrafo
│   │   └── tests/fixtures/       # PDFs reales anonimizados (a agregar)
│   ├── webapp-somnosalud/        # Frontend Next.js 14 — app principal
│   ├── webapp-conversor-psg/     # Frontend Vite + React — utility standalone
│   └── shared-ui/                # Design system compartido
├── docs/
│   ├── product/                  # PRD, lista maestra, decisiones de producto
│   ├── architecture/             # ADRs, diagramas, threat model
│   ├── clinical/                 # Compliance ANMAT, Ley 25.326, validación clínica
│   └── operations/               # Runbooks, deploy, incidents
├── infrastructure/
│   └── supabase/                 # Migraciones SQL + seed
├── scripts/                      # Utilities one-shot (migration, codegen)
├── .github/workflows/            # CI/CD — lint + test + typecheck + deploy
├── package.json                  # Root con pnpm workspaces
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md (este archivo)
```

---

## Quick start (developers)

```bash
# Clonar
git clone https://github.com/itsomnosalud/Somnosalud.git somnosalud-platform
cd somnosalud-platform

# Instalar dependencias (todos los packages)
pnpm install

# Build del clinical-engine
pnpm --filter clinical-engine build

# Tests
pnpm --filter clinical-engine test

# Webapp SomnoSalud (dev)
pnpm --filter webapp-somnosalud dev

# Conversor PSG (dev local con server estático)
pnpm --filter webapp-conversor-psg dev
```

---

## Productos

### 1. SomnoSalud (`packages/webapp-somnosalud/`)

App SPA web para evaluación end-to-end de trastornos del sueño en 12 pasos:
1. Welcome
2. Profile (edad, sexo, peso, altura)
3. Safety (embarazo, medicación, anticoagulantes, ideación suicida)
4. ISI / ISQ — Insomnia Severity Index
5. STOP-BANG — riesgo apnea
6. PHQ-9 / GAD-7 / DASS-21 — salud mental
7. Sleep (latencia, despertares, calidad)
8. Lab (opcional, 7 parámetros)
9. Genetics (opcional, 5 variantes)
10. Results + Recommendations

**Stack:** Next.js 14 + Tailwind + Supabase

### 2. Conversor PSG → CSV (`packages/webapp-conversor-psg/`)

Utility client-side para parsear PDFs polisomnográficos de 7 equipos distintos (Philips Sleepware G3, Alice NightOne, BrainWave, ResMed AirView Diagnóstico/Tratamiento, BMC Tratamiento/Poligrafía) y generar CSV en formato long compatible con el informe IFN. Incluye Engine Hipóxico que calcula score 0-100 con 6 componentes clínicos validados.

**Stack:** Vite + React + pdf.js + JSZip (sin backend, 100% local)

### 3. Clinical Engine (`packages/clinical-engine/`)

Motor TypeScript independiente del frontend con scoring, safety rules, motor de decisión clínica y módulos especializados (EMA, parasomnias, circadianos, RLS, narcolepsia, etc.). Cada algoritmo está respaldado por publicaciones científicas peer-reviewed con DOI/PMID verificables.

**Stack:** TypeScript estricto + esbuild + Vitest

### 4. PSG Parser (`packages/psg-parser/`)

Parser modular de PDFs polisomnográficos extraído del Conversor PSG. Reusable desde cualquier app del monorepo (SomnoSalud puede invocarlo cuando un paciente sube su PSG).

**Stack:** TypeScript + pdf.js

---

## Tecnología

| Capa | Tech |
|---|---|
| Lenguaje | TypeScript 5.x estricto |
| Monorepo | pnpm workspaces + turborepo |
| Frontend SomnoSalud | Next.js 14 + Tailwind + shadcn/ui |
| Frontend Conversor PSG | Vite + React |
| Backend / DB / Auth | Supabase (PostgreSQL + RLS multi-tenant + Auth + Storage) |
| Deploy | Vercel (somnosalud) + GitHub Pages (conversor) |
| Tests unitarios | Vitest |
| Tests E2E | Playwright |
| Error tracking | Sentry |
| Email transaccional | Resend |
| Pagos (futuro) | Stripe |
| Analytics | PostHog |
| CI/CD | GitHub Actions |
| Linter | ESLint flat config |

---

## Compliance

**🟢 Operativo en Argentina** (mercado primario, Fase 1)
- Ley 25.326 Protección de Datos Personales (consentimiento, encriptación, derecho acceso/supresión)
- Ley 26.529 Derechos del Paciente (consentimiento informado escrito)
- Disposición ANMAT 18/2017 — software médico (verificar clasificación dispositivo médico digital)
- Disclaimer médico obligatorio en toda pantalla de resultados
- T&C con timestamp registrado en DB
- Verificación de edad formal (gate <18 años)

**🟡 Pendiente Fase 3** (escalado USA + UE)
- HIPAA (USA) — Supabase Enterprise tier
- GDPR (UE) — RGPD compliance kit Supabase

Disclaimer obligatorio en toda pantalla de resultados:
> ⚠️ **Importante:** Esta evaluación es **orientativa** y NO reemplaza la consulta médica. Las recomendaciones deben ser validadas por un profesional de la salud antes de implementarlas.

---

## Roadmap (3 fases)

### Fase 0 — Setup repo + ship-it (Semana 1, 5-8 horas)
Repo limpio con CI verde + ambos productos deployados con dominio profesional.

### Fase 1 — Robustez clínica + persistencia (Semanas 2-5, 25-35 horas)
Auth + Supabase persistencia + compliance legal mínimo + responsive mobile + tests unitarios para todo `clinical-engine/scoring/`.

### Fase 2 — Conversor PSG modular + storage (Semanas 6-9, 25-35 horas)
Refactor del HTML monolítico Conversor PSG a `psg-parser/` modular TypeScript + tests con fixtures + storage Supabase + integración SomnoSalud × Conversor.

### Fase 3 — Producto B2B + escalado (Semanas 10-16, 40-60 horas)
Multi-tenant white-label para sleep specialists + OCR labs + integración wearables + freemium + PWA + i18n + accesibilidad WCAG 2.1 AA.

Detalle completo en ``[Vault Pampa Labs]` docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md`.

---

## Equipo

- **Dr. Pablo Ferrero** (MN 119.783) — Director Sleep Lab IFN, owner clínico
- **Jorge Leporace** — Pampa Labs founder, partner técnico
- **Pampa Labs Cowork (Claude)** — IA assistant técnico

---

## Contacto

- Dr. Pablo Ferrero: pabloferrero@ifn.com.ar
- Jorge Leporace: info@pampalabs.com / jorgeleporace@gmail.com

---

## Licencia

Proprietary — SomnoSalud Team. Todos los derechos reservados.
Revisar al go-live B2B (posible cambio a algún esquema más permisivo según validación clínica externa).

---

*Última actualización: 2026-05-07*
