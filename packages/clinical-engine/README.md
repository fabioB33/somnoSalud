# `@somnosalud/clinical-engine`

Motor TypeScript de lógica clínica verificable para evaluación integral de trastornos del sueño.

> **Imported from Drive (2026-05-07).** Source TS by Dr. Pablo Ferrero (con asistencia de Claude Cowork). README original preservado en `README-original.md`.

## Quick start

```bash
cd packages/clinical-engine
pnpm install
pnpm build
pnpm test
```

## Exports principales

```typescript
import {
  // Scoring
  scoreISI, scoreESS, scoreSTOPBANG, scorePHQ9, scoreGAD7, scoreDASS21, calculateBMI,

  // Safety
  evaluateAllSafetyRules,
  safe010_ageMinimum, safe020_pregnancy, safe040_melatoninAnticoagulant,

  // Engine core
  classifyInsomniaPhenotype, generateRecommendations, assessRisk, calculatePrecision,

  // Specialized diagnosis modules
  emaAlgorithm,                // Despertar precoz (7-step differential)
  screenParasomnias, getRBDRisk,
  classifyCircadianDisorder, differentiateInsomniaVsCircadian,
  screenRLS, assessIronStatus, assessAugmentationRisk,
  getSAHOSTreatmentLadder, recommendSAHOSTreatment,
  getSleepStageInfo, getSleepStageModulators,
  screenNarcolepsy, getNarcolepsyNonPharmRecommendations,
  getSleepHygieneRecommendations, assessSleepHygieneCompliance,

  // Lab
  analyzeLabValue, analyzeLabPanel, LAB_PARAMETERS,
  analyzeVariant, analyzeGeneticProfile, VARIANT_DEFS,

  // References
  REFERENCES, getReference, validateReferences,
} from '@somnosalud/clinical-engine';
```

## Estructura de módulos

| Módulo | Responsabilidad |
|---|---|
| `src/scoring/` | 7 instrumentos validados (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI) |
| `src/safety/` | Reglas SAFE-010 a SAFE-040 (edad, embarazo, anticoagulantes) |
| `src/engine/phenotype.ts` | Clasificación fenotipo insomnio (ICSD-3) |
| `src/engine/recommendations.ts` | Motor de recomendaciones con evidencia A/B/C |
| `src/engine/risk-integrator.ts` | 9 banderas de riesgo + clasificación severe/intermediate/low |
| `src/engine/precision.ts` | Calculador confianza 0-100% en 5 dimensiones |
| `src/engine/ema.ts` | Early Morning Awakening — 7-step differential diagnosis |
| `src/engine/parasomnias.ts` | Sonambulismo, terrores nocturnos, RBD (alfa-sinucleinopatía screening) |
| `src/engine/circadian-disorders.ts` | ASWPD, DSWPD, No-24h, ISWRD + protocolos de luz |
| `src/engine/rls.ts` | Síndrome piernas inquietas + iron status + augmentation risk |
| `src/engine/sahos-treatment.ts` | Escalera terapéutica SAHOS (8 modalidades) |
| `src/engine/sleep-stages.ts` | Optimización N1/N2/N3/REM con potenciadores |
| `src/engine/narcolepsy.ts` | Screening narcolepsia tipo 1/2 + intervenciones no-farm |
| `src/engine/sleep-hygiene.ts` | 13 intervenciones EBM (evidence-based medicine) |
| `src/lab/parameters.ts` | 7 parámetros (Vit D, B12, hierro, ferritina, magnesio, TSH, glucosa) |
| `src/lab/genetics.ts` | 5 variantes (CLOCK, PER2, ADORA2A, COMT, MTHFR) |
| `src/references.ts` | DB centralizada de referencias DOI/PMID con validación |

## Niveles de evidencia

- **A** — Meta-análisis o revisión sistemática con RCTs
- **B** — RCT individual o estudios de cohorte grandes
- **C** — Estudios observacionales o consenso de expertos

## Tests

55+ tests unitarios cubriendo todos los módulos:
- Scoring: ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI
- Safety: SAFE-010, SAFE-020, SAFE-040
- Engine: phenotype, recommendations, risk-integrator, precision
- Specialized: ema, parasomnias, circadian-disorders, rls, sahos-treatment, sleep-stages, narcolepsy, sleep-hygiene
- Lab: parameters, genetics

```bash
pnpm test           # run once
pnpm test:watch     # watch mode
pnpm typecheck      # tipos sin emitir
```

## Principio de diseño

100% **independiente del front-end**. Puede ser consumido por Lovable, Next.js, React Native, Vue, Node backend, etc. No contiene UI, no depende de framework visual, expone funciones puras con tipos estrictos TypeScript.

## Licencia

Proprietary — SomnoSalud Team. Todos los derechos reservados.
